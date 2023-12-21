import { Tooltip } from "@nextui-org/react";
import CommentsMainSection from "./CommentsMainSection";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { IconNotes } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useCallback, useEffect } from "react";
import { selectAllUsers, setComments } from "@/src/reduxStore/states/general";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentRequest, CommentType } from "@/src/types/shared/comments";
import { commentRequestToKey } from "@/src/util/shared/comments-helper";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { useLazyQuery } from "@apollo/client";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { useRouter } from "next/router";

export default function Comments() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const commentsSideBar = useSelector(selectModal(ModalEnum.COMMENTS_SECTION));
    const allUsers = useSelector(selectAllUsers);
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.COMMENTS]), []);

    useEffect(() => {
        WebSocketsService.subscribeToNotification(CurrentPage.COMMENTS, {
            whitelist: ['comment_created', 'comment_updated', 'comment_deleted', 'project_created', 'project_deleted'],
            func: handleWebsocketNotificationGlobal
        });
    }, []);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.subscribeToNotification(CurrentPage.COMMENTS, {
            projectId: projectId,
            whitelist: ['label_created', 'label_deleted', 'attributes_updated', 'calculate_attribute', 'embedding_deleted', 'embedding', 'labeling_task_updated', 'labeling_task_deleted', 'labeling_task_created', 'data_slice_created', 'data_slice_updated', 'data_slice_deleted', 'information_source_created', 'information_source_updated', 'information_source_deleted', 'knowledge_base_created', 'knowledge_base_updated', 'knowledge_base_deleted'],
            func: handleWebsocketNotification
        });
    }, [projectId]);

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
                CommentDataManager.parseToCurrentData(allUsers);
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

    useEffect(() => {
        WebSocketsService.updateFunctionPointer(null, CurrentPage.COMMENTS, handleWebsocketNotificationGlobal)
    }, [handleWebsocketNotificationGlobal]);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.COMMENTS, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    const toggleModal = useCallback(() => {
        dispatch(setModalStates(ModalEnum.COMMENTS_SECTION, { open: !commentsSideBar.open }));
    }, [commentsSideBar]);

    return (<>
        <Tooltip content={TOOLTIPS_DICT.GENERAL.COMMENTS} color="invert" placement="left">
            <button className="cursor-pointer inline-block mr-6" onClick={toggleModal}>
                <IconNotes className="w-6 h-6" />
            </button>
        </Tooltip>
        <CommentsMainSection open={commentsSideBar.open} toggleOpen={(toggleModal)} />
    </>)
}