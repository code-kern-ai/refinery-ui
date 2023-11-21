import { LabelingHuddle, LabelingLinkData } from "@/src/types/components/projects/projectId/labeling/labeling-general";
import { DUMMY_HUDDLE_ID, ONE_DAY } from "../../components/projects/projectId/labeling/labeling-general-helper";
import { LabelingSuiteManager } from "./manager";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { timer } from "rxjs";
import { RecordManager } from "./record-manager";

export class SessionManager {

    public static labelingLinkData: LabelingLinkData;
    public static huddleData: LabelingHuddle;
    public static absoluteWarning: string;
    public static nextDisabled: boolean = true;
    public static prevDisabled: boolean = true;
    public static positionString: string = "/ records in";
    public static availableLinks: any[];
    public static availableLinksLookup: {};
    public static selectedLink: any;
    public static currentRecordId: string;


    public static readHuddleDataFromLocal() {
        this.huddleData = JSON.parse(localStorage.getItem("huddleData"));
        if (!this.huddleData) return;
        if (typeof this.huddleData.checkedAt.db == 'string') {
            this.huddleData.checkedAt.db = new Date(this.huddleData.checkedAt.db);
        }
        if (typeof this.huddleData.checkedAt.local == 'string') {
            this.huddleData.checkedAt.local = new Date(this.huddleData.checkedAt.local);
        }
        if (this.huddleData.linkData.requestedPos != this.labelingLinkData.requestedPos) {
            //url manual changed
            this.huddleData.linkData.requestedPos = this.labelingLinkData.requestedPos;
        }
        if (this.huddleOutdated()) {
            localStorage.removeItem("huddleData");
            this.huddleData = null;
        }
    }

    private static huddleOutdated(): boolean {
        if (!this.huddleData) return true;
        for (const key in this.labelingLinkData) {
            if (key == 'linkLocked') continue;
            if (this.labelingLinkData[key] != this.huddleData.linkData[key]) return true;
        }
        if (this.huddleData.checkedAt?.local) {
            if ((new Date().getTime() - this.huddleData.checkedAt.local.getTime()) > ONE_DAY) return true;
        }
        return false;
    }


    public static prepareLabelingSession(projectId: string) {
        let huddleId = this.labelingLinkData.huddleId;
        let pos = this.labelingLinkData.requestedPos;
        if (pos == null && this.huddleData?.linkData.requestedPos) pos = this.huddleData.linkData.requestedPos;
        if (pos == null) pos = 0;
        if (huddleId == DUMMY_HUDDLE_ID && this.huddleData?.linkData.huddleId) huddleId = this.huddleData.linkData.huddleId;

        if (!this.huddleData || this.huddleData.linkData.huddleId != huddleId || this.huddleData.linkData.projectId != projectId) {
            // no/old session data --> refetch
            this.huddleData = null;
            localStorage.removeItem("huddleData");
            return huddleId;
        } else if (this.huddleData.partial) {
            //collect remaining
            return huddleId;
        }
    }

    public static changeLinkLockState(state: boolean) {
        if (!this.labelingLinkData) return;
        this.labelingLinkData.linkLocked = state;
        this.absoluteWarning = state ? 'his link is locked, contact your supervisor to request access' : null;
        LabelingSuiteManager.checkAbsoluteWarning();
    }

    public static parseCheckedAt(checkedAt: string): { local: Date, db: Date } {
        return {
            local: dateAsUTCDate(new Date(checkedAt)),
            db: new Date(checkedAt)
        }
    }

    public static jumpToPosition(pos: number) {
        if (!this.huddleData || !this.huddleData.recordIds) return;
        if (pos % 1 != 0) pos = parseInt("" + pos);
        let jumpPos = String(pos).length == 0 ? 1 : pos;
        if (jumpPos <= 0) jumpPos = 1;
        else if (jumpPos > this.huddleData.recordIds.length) jumpPos = this.huddleData.recordIds.length;

        this.huddleData.linkData.requestedPos = jumpPos;
        localStorage.setItem('huddleData', JSON.stringify(this.huddleData));

        const jumpIdx = jumpPos - 1;
        this.currentRecordId = this.huddleData.recordIds[jumpIdx];
        this.nextDisabled = !this.huddleData || jumpPos == this.huddleData.recordIds.length;
        this.prevDisabled = !this.huddleData || jumpIdx == 0;
        this.positionString = jumpPos + " / " + this.huddleData.recordIds.length + " records in";
    }

    public static nextRecord() {
        this.huddleData.linkData.requestedPos++;
        this.jumpToPosition(this.huddleData.linkData.requestedPos);
    }

    public static previousRecord() {
        this.huddleData.linkData.requestedPos--;
        this.jumpToPosition(this.huddleData.linkData.requestedPos);
    }

    public static setCurrentRecordDeleted() {
        this.huddleData.recordIds[this.huddleData.linkData.requestedPos - 1] = "deleted";
    }
}