import { CommentRequest, CommentType } from "@/src/types/shared/comments";
import { commentRequestToKey, commentTypeOrder, commentTypeToString, getUserNameFromId, parseKey } from "../shared/comments-helper";
import { CurrentPage, User } from "@/src/types/shared/general";
import { timer } from "rxjs";
import { getUserAvatarUri } from "@/submodules/javascript-functions/general";

export class CommentDataManager {
    public static canCommentOnPage: boolean = false;
    public static commentRequests: Map<Object, CommentRequest[]> = new Map<CurrentPage, CommentRequest[]>();
    public static addCommentRequests: {} = {};
    private static globalProjectId: string = "GLOBAL";
    private static data: {} = {};
    private static addInfo: {} = {};
    private static lastRecordInfo: any;
    public static currentData: {};
    private static currentDataRequested: boolean = false;
    public static currentDataOrder: any[];
    public static currentCommentTypeOptions: any[];

    public static registerCommentRequests(currentPage: CurrentPage, requests: CommentRequest[]) {
        let comments = [...requests];
        if (this.commentRequests.has(currentPage)) comments.push(...this.commentRequests.get(currentPage));
        this.commentRequests.set(currentPage, comments);
        this.buildCommentTypeOptions();
    }

    public static unregisterCommentRequests(currentPage: CurrentPage) {
        this.commentRequests = new Map<CurrentPage, CommentRequest[]>([]);
    }

    public static checkCanCommentOnPage() {
        this.canCommentOnPage = CommentDataManager.commentRequests.size > 0;
    }

    public static buildRequestJSON(): string {
        let requestJSON = {};
        CommentDataManager.commentRequests.forEach((value, key) => {
            value.forEach((commentRequest) => {
                const key = commentRequestToKey(commentRequest);
                if ((!(key in requestJSON)) || commentRequest.commentType == CommentType.RECORD) {
                    requestJSON[key] = this.buildJsonEntryFromCommentRequest(commentRequest);
                }
            });
        });
        for (const key in this.addCommentRequests) {
            if (!(key in requestJSON)) {
                const commentRequest = this.addCommentRequests[key];
                requestJSON[key] = this.buildJsonEntryFromCommentRequest(commentRequest);
            }
        }
        this.addCommentRequests = {};
        if (Object.keys(requestJSON).length == 0) return null;
        return JSON.stringify(requestJSON);
    }

    private static buildJsonEntryFromCommentRequest(commentRequest: CommentRequest) {
        const entry: any = { xftype: commentRequest.commentType };
        if (commentRequest.projectId) entry.pId = commentRequest.projectId;
        if (commentRequest.commentKey) entry.xfkey = commentRequest.commentKey;
        if (commentRequest.commentId) entry.commentId = commentRequest.commentId;
        if (this.shouldRequestAddInfo(commentRequest)) entry.includeAddInfo = true;
        return entry;
    }

    private static shouldRequestAddInfo(commentRequest: CommentRequest): boolean {
        const projectId = commentRequest.projectId ? commentRequest.projectId : CommentDataManager.globalProjectId;
        const addInfoKey = commentRequest.commentType + "@" + projectId;
        if (!this.addInfo[addInfoKey] || commentRequest.commentType == CommentType.RECORD) return true;
        if (this.addInfo[addInfoKey]) {
            const arr = this.addInfo[addInfoKey].values
            let index = arr.findIndex(c => c.markedForDeletion);
            if (index >= 0) return true;
            if (commentRequest.commentKey) {
                index = arr.findIndex(c => c.id == commentRequest.commentKey);
                if (index == -1) return true;
            }
        }
        return false;
    }

    public static parseCommentData(data) {
        //only remove flagged data once the new data is there to prevent flickering
        this.removeCommentsFlaggedForDeletion();
        for (const key in data) {
            const keyParts = parseKey(key);
            // add structure
            if (!(keyParts.commentType in this.data)) this.data[keyParts.commentType] = {};
            const projectId = keyParts.projectId ? keyParts.projectId : CommentDataManager.globalProjectId;
            if (!(projectId in this.data[keyParts.commentType])) this.data[keyParts.commentType][projectId] = {};
            if (keyParts.commentKey && !(keyParts.commentKey in this.data[keyParts.commentType][projectId])) {
                this.data[keyParts.commentType][projectId][keyParts.commentKey] = [];
            }
            // add data to structure
            if (data[key].add_info) {
                const addInfoKey = keyParts.commentType + "@" + projectId;
                if (keyParts.commentType == CommentType.RECORD) {
                    this.lastRecordInfo = data[key].add_info[0];
                }
                if (!this.addInfo[addInfoKey]) this.addInfo[addInfoKey] = { values: data[key].add_info };
                else {
                    for (const addInfo of data[key].add_info) {
                        if (!this.addInfo[addInfoKey].values.find(i => i.id == addInfo.id)) this.addInfo[addInfoKey].values.push(addInfo);
                    }
                }
            }
            if (data[key].data) {
                data[key].data.forEach(e => {
                    if (!(e.xfkey in this.data[e.xftype][projectId])) this.data[e.xftype][projectId][e.xfkey] = [];
                    if (!this.data[e.xftype][projectId][e.xfkey].find(c => c.id == e.id)) this.data[e.xftype][projectId][e.xfkey].push(e);
                });
            }
        }
    }

    private static removeCommentsFlaggedForDeletion() {
        let removedSomething = false;
        for (const key in this.data) {
            for (const projectId in this.data[key]) {
                for (const commentKey in this.data[key][projectId]) {
                    const arr = this.data[key][projectId][commentKey];
                    const index = arr.findIndex(c => c.markedForDeletion);
                    if (index >= 0) {
                        this.data[key][projectId][commentKey] = arr.filter(c => !c.markedForDeletion);
                        removedSomething = true;
                        if (removedSomething && this.data[key][projectId][commentKey] == 0) delete this.data[key][projectId][commentKey];
                    }
                }
                if (removedSomething && Object.keys(this.data[key][projectId]).length == 0) delete this.data[key][projectId];
            }
            if (removedSomething && Object.keys(this.data[key]).length == 0) delete this.data[key];
        }
        for (const key in this.addInfo) {
            const arr = this.addInfo[key].values;
            const index = arr.findIndex(c => c.markedForDeletion);
            if (index >= 0) {
                this.addInfo[key].values = arr.filter(c => !c.markedForDeletion);
            }
        }
    }

    public static parseToCurrentData(allUsers: User[], isLooped: boolean = false) {
        if (!allUsers) {
            if (this.currentDataRequested && !isLooped) return;
            this.currentDataRequested = true;
            timer(250).subscribe(() => this.parseToCurrentData(allUsers, true));
            return;
        }
        this.currentData = {};
        CommentDataManager.commentRequests.forEach((value, key) => {
            value.forEach((commentRequest) => {
                if (this.data[commentRequest.commentType]) {
                    const projectId = commentRequest.projectId ? commentRequest.projectId : CommentDataManager.globalProjectId;
                    if (this.data[commentRequest.commentType][projectId]) {
                        if (commentRequest.commentKey && this.data[commentRequest.commentType][projectId][commentRequest.commentKey]) {
                            this.addCommentArrToCurrent(this.data[commentRequest.commentType][projectId][commentRequest.commentKey]);
                        }
                        if (!commentRequest.commentKey) {
                            const keys = Object.keys(this.data[commentRequest.commentType][projectId]);
                            keys.forEach(key => this.addCommentArrToCurrent(this.data[commentRequest.commentType][projectId][key]));
                        }
                    }
                }
            });
        });
        this.extendCurrentDataWithAddInfo(allUsers);
        this.buildCurrentDataOrder(allUsers);
        this.currentDataRequested = false;
    }

    private static addCommentArrToCurrent(arr: any[]) {
        for (const c of arr) this.currentData[c.id] = c;
    }

    private static extendCurrentDataWithAddInfo(allUsers: User[]) {
        for (const key in this.currentData) {
            let commentData = this.currentData[key];
            if (!commentData.creationUser) {
                commentData.creationUser = getUserNameFromId(commentData.created_by, allUsers);
            }
            if (!commentData.xfkeyAdd) {
                commentData.xfkeyAddName = this.getAddFromId(commentData.xfkey, commentData.xftype, commentData.project_id);
                commentData.xfkeyAdd = commentTypeToString(commentData.xftype as CommentType, true) + ": " + commentData.xfkeyAddName;
            }
        }
    }

    private static getAddFromId(xfkey: string, xftype: string, projectId: string): string {
        if (!this.addInfo) return "";
        if (!projectId) projectId = CommentDataManager.globalProjectId;
        const addInfoKey = xftype + "@" + projectId;
        const list = this.addInfo[addInfoKey].values;
        if (!list) return "";
        const item = list.find(i => i.id == xfkey);
        if (!item) return "";
        return item.name;
    }

    private static buildCurrentDataOrder(allUsers: User[]) {
        this.currentDataOrder = [];
        for (var key in this.currentData) {
            const findCurrentUser = allUsers.find(u => u.id == this.currentData[key].created_by);
            this.currentData[key] = { ...this.currentData[key], avatarUri: getUserAvatarUri(findCurrentUser) };
            const e = this.currentData[key];
            this.currentDataOrder.push(e);
        }
        this.currentDataOrder.sort((a, b) =>
            commentTypeOrder(a.xftype) - commentTypeOrder(b.xftype) ||
            a.xfkeyAddName.localeCompare(b.xfkeyAddName) ||
            a.order_key - b.order_key);
    }

    private static buildCommentTypeOptions() {
        // first as dict to ensure uniqueness
        const dict = {};
        CommentDataManager.commentRequests.forEach((value, key) => {
            value.forEach((commentRequest) => {
                dict[commentRequest.commentType.toString()] = { name: commentTypeToString(commentRequest.commentType), order: commentTypeOrder(commentRequest.commentType) };
            });
        });

        const types = [];

        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                types.push({ key: key, name: dict[key].name, order: dict[key].order });
            }
        }
        types.sort((a, b) => a.order - b.order);
        this.currentCommentTypeOptions = types;
    }

    public static getCommentKeyOptions(key: string, projectId: string): any[] {
        key += "@" + projectId;
        const list = this.addInfo?.[key]?.values
        if (!list) {
            console.log("Can't find addInfo for key", key);
            return [];
        }
        return list;
    }

    public static removeCommentFromCache(commentId: string): boolean {
        return this.removeCommentFromData(commentId, true);
    }

    public static removeCommentFromData(commentId: string, onlyFlag: boolean = false): boolean {
        let removedSomething = false;
        let markedSomething = false;
        for (const key in this.data) {
            for (const projectId in this.data[key]) {
                for (const commentKey in this.data[key][projectId]) {
                    const arr = this.data[key][projectId][commentKey];
                    const index = arr.findIndex(c => c.id == commentId);
                    if (onlyFlag && index >= 0) {
                        arr[index].markedForDeletion = true;
                        markedSomething = true;
                    } else {
                        if (index >= 0) {
                            arr.splice(index, 1);
                            removedSomething = true;
                        }
                        if (removedSomething && arr.length == 0) delete this.data[key][projectId][commentKey];
                    }
                }
                if (removedSomething && Object.keys(this.data[key][projectId]).length == 0) delete this.data[key][projectId];
            }
            if (removedSomething && Object.keys(this.data[key]).length == 0) delete this.data[key];
        }
        return removedSomething || markedSomething;
    }

    public static isCommentUpdateInterestingForMe(msgParts: string[]): boolean {
        const commentType = msgParts[4] as CommentType;
        const projectId = msgParts[2];
        const interestingForMe = !!this.data[commentType]?.[projectId];
        return interestingForMe;
    }

    public static getLastRecordInfo() {
        return this.lastRecordInfo;
    }

    public static modifyCacheFor(commentType: string, projectId: string, xfkey: string, reReQuest: boolean): boolean {
        const addInfoKey = commentType + "@" + projectId;
        if (addInfoKey in this.addInfo) {
            if (reReQuest) {
                let backRequest: CommentRequest;
                if (xfkey) {
                    const item = this.addInfo[addInfoKey].values.find(v => v.id == xfkey);
                    if (item) item.markedForDeletion = true;
                    backRequest = { commentType: commentType as CommentType, projectId: projectId, commentKey: xfkey };
                } else {
                    this.addInfo[addInfoKey].values.forEach(v => v.markedForDeletion = true);
                    backRequest = { commentType: commentType as CommentType, projectId: projectId };
                }
                const key = commentRequestToKey(backRequest);
                this.addCommentRequests[key] = backRequest;
            } else {
                if (xfkey) {
                    const arr = this.addInfo[addInfoKey].values
                    const index = arr.findIndex(c => c.id == xfkey);
                    if (index >= 0) {
                        arr.splice(index, 1);
                    }
                } else {
                    this.addInfo[addInfoKey].values = [];
                }
                //no need to refetch since everything is up to date with the delete 
                return false;
            }
            return true;
        }
        return false;
    }

}