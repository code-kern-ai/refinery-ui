import { Tooltip } from "@nextui-org/react";
import CommentsMainSection from "./CommentsMainSection";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { IconNotes } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import { selectAllUsers, setAllUsers, setComments } from "@/src/reduxStore/states/general";
import { CurrentPage, CurrentPageSubKey } from "@/src/types/shared/general";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentRequest, CommentType } from "@/src/types/shared/comments";
import { commentRequestToKey } from "@/src/util/shared/comments-helper";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { useLazyQuery } from "@apollo/client";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useRouter } from "next/router";
import { GET_ORGANIZATION_USERS } from "@/src/services/gql/queries/organizations";
import { useWebsocket } from "@/src/services/base/web-sockets/useWebsocket";

export default function Comments() {
    const dispatch = useDispatch();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const projectId = useSelector(selectProjectId);
    const allUsers = useSelector(selectAllUsers);

    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });
    const [refetchOrganizationUsers] = useLazyQuery(GET_ORGANIZATION_USERS, { fetchPolicy: 'no-cache' });

    const handleWebsocketNotificationGlobal = useCallback((msgParts: string[]) => {
        //messages will be GLOBAL:{messageType}:{projectId}:{additionalInfo}
        let somethingToRerequest = false;
        if (msgParts[1] == "comment_deleted") {
            somethingToRerequest = CommentDataManager.removeCommentFromCache(msgParts[3]);
        } else if (msgParts[1] == "comment_updated") {
            somethingToRerequest = CommentDataManager.removeCommentFromCache(msgParts[3]);
            somethingToRerequest = somethingToRerequest || CommentDataManager.isCommentUpdateInterestingForMe(msgParts);
            if (somethingToRerequest) {
                //create helper addon
                const backRequest: CommentRequest = { commentType: msgParts[4] as CommentType, projectId: msgParts[2], commentKey: msgParts[5], commentId: msgParts[3] };
                const key = commentRequestToKey(backRequest);
                CommentDataManager.addCommentRequests[key] = backRequest;
            }
        } else if (msgParts[1] == "comment_created") {
            somethingToRerequest = true;
            //create helper addon
            const backRequest: CommentRequest = { commentType: msgParts[3] as CommentType, projectId: msgParts[2], commentKey: msgParts[4], commentId: msgParts[5] };
            const key = commentRequestToKey(backRequest);
            CommentDataManager.addCommentRequests[key] = backRequest;
        }
        if (somethingToRerequest) {
            const requestJsonString = CommentDataManager.buildRequestJSON();
            refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
                CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
                if (allUsers.length == 0) {
                    refetchOrganizationUsers().then((res) => {
                        dispatch(setAllUsers(res.data["allUsers"]));
                        CommentDataManager.parseToCurrentData(res.data["allUsers"]);
                    });
                } else {
                    CommentDataManager.parseToCurrentData(allUsers);
                }
                dispatch(setComments(CommentDataManager.currentDataOrder));
            });
        }
    }, [allUsers]);

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        let somethingToRerequest = false;
        if (['label_created', 'label_deleted'].includes(msgParts[1])) {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.LABEL, msgParts[0], msgParts[2], msgParts[1] == 'label_created');
        } else if (msgParts[1] == 'attributes_updated') {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.ATTRIBUTE, msgParts[0], null, true);
        } else if (msgParts[1] == 'calculate_attribute') {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.ATTRIBUTE, msgParts[0], msgParts[3], msgParts[2] == 'created');
        } else if (msgParts[1] == 'embedding_deleted') {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.EMBEDDING, msgParts[0], msgParts[2], false);
        } else if (msgParts[1] == 'embedding' && msgParts[3] == 'state' && msgParts[4] == 'INITIALIZING') {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.EMBEDDING, msgParts[0], msgParts[2], true);
        } else if (['labeling_task_updated', 'labeling_task_deleted', 'labeling_task_created'].includes(msgParts[1])) {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.LABELING_TASK, msgParts[0], msgParts[2], msgParts[1] != 'labeling_task_deleted');
        } else if (['data_slice_created', 'data_slice_updated', 'data_slice_deleted'].includes(msgParts[1])) {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.DATA_SLICE, msgParts[0], msgParts[2], msgParts[1] != 'data_slice_deleted');
        } else if (['information_source_created', 'information_source_updated', 'information_source_deleted'].includes(msgParts[1])) {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.HEURISTIC, msgParts[0], msgParts[2] == "all" ? null : msgParts[2], msgParts[1] != 'information_source_deleted');
        } else if (['knowledge_base_created', 'knowledge_base_updated', 'knowledge_base_deleted'].includes(msgParts[1])) {
            somethingToRerequest = CommentDataManager.modifyCacheFor(CommentType.KNOWLEDGE_BASE, msgParts[0], msgParts[2], msgParts[1] != 'knowledge_base_deleted');
        }
        if (somethingToRerequest) {
            const requestJsonString = CommentDataManager.buildRequestJSON();
            refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
                CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
                CommentDataManager.parseToCurrentData(allUsers);
                dispatch(setComments(CommentDataManager.currentDataOrder));
            });
        }
    }, [projectId, allUsers]);

    const toggleModal = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    useWebsocket(CurrentPage.COMMENTS, handleWebsocketNotificationGlobal, CurrentPageSubKey.GLOBAL);
    useWebsocket(CurrentPage.COMMENTS, handleWebsocketNotification, projectId);

    return (<>
        <button className="cursor-pointer inline-block mr-6" onClick={toggleModal}>
            <Tooltip content={TOOLTIPS_DICT.GENERAL.COMMENTS} color="invert" placement="bottom">
                <IconNotes className="w-6 h-6" />
            </Tooltip>
        </button>
        <CommentsMainSection open={sidebarOpen} toggleOpen={(toggleModal)} />
    </>)
}