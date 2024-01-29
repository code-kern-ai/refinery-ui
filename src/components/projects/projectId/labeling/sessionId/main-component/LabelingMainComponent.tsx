import { selectAllUsers, selectUser, setBricksIntegrator, setComments } from "@/src/reduxStore/states/general";
import { setAvailableLinks, updateRecordRequests, setSelectedLink, selectRecordRequestsRla, updateUsers, setSettings, selectSettings, setUserDisplayId, selectRecordRequestsRecord, initOnLabelPageDestruction, selectUserDisplayId } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { AVAILABLE_LABELING_LINKS, GET_RECORD_LABEL_ASSOCIATIONS, GET_TOKENIZED_RECORD, REQUEST_HUDDLE_DATA } from "@/src/services/gql/queries/labeling";
import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { UserRole } from "@/src/types/shared/sidebar";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { UserManager } from "@/src/util/classes/labeling/user-manager";
import { DUMMY_HUDDLE_ID, getDefaultLabelingSuiteSettings, parseLabelingLink } from "@/src/util/components/projects/projectId/labeling/labeling-main-component-helper";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/src/styles/components/projects/projectId/labeling.module.css";
import NavigationBarTop from "./NavigationBarTop";
import NavigationBarBottom from "./NavigationBarBottom";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID, GET_RECORD_BY_RECORD_ID } from "@/src/services/gql/queries/project-setting";
import { combineLatest } from "rxjs";
import LabelingSuiteTaskHeader from "../sub-components/LabelingSuiteTaskHeader";
import { transferNestedDict } from "@/submodules/javascript-functions/general";
import LabelingSuiteOverviewTable from "../sub-components/LabelingSuiteOverviewTable";
import LabelingSuiteLabeling from "../sub-components/LabelingSuiteLabeling";
import { setAllAttributes, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { CommentDataManager } from "@/src/util/classes/comments";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { CommentType } from "@/src/types/shared/comments";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { getEmptyBricksIntegratorConfig } from "@/src/util/shared/bricks-integrator-helper";

const LOCAL_STORAGE_KEY = 'labelingSuiteSettings';

export default function LabelingMainComponent() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);
    const rlas = useSelector(selectRecordRequestsRla);
    const users = useSelector(selectAllUsers);
    const settings = useSelector(selectSettings);
    const record = useSelector(selectRecordRequestsRecord);
    const allUsers = useSelector(selectAllUsers);
    const userDisplayId = useSelector(selectUserDisplayId);

    const [huddleData, setHuddleData] = useState(null);

    const [refetchHuddleData] = useLazyQuery(REQUEST_HUDDLE_DATA, { fetchPolicy: 'no-cache' });
    const [refetchAvailableLinks] = useLazyQuery(AVAILABLE_LABELING_LINKS, { fetchPolicy: 'no-cache' });
    const [refetchTokenizedRecord] = useLazyQuery(GET_TOKENIZED_RECORD, { fetchPolicy: 'no-cache' });
    const [refetchRecordByRecordId] = useLazyQuery(GET_RECORD_BY_RECORD_ID, { fetchPolicy: 'no-cache' });
    const [refetchRla] = useLazyQuery(GET_RECORD_LABEL_ASSOCIATIONS, { fetchPolicy: 'network-only' });
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.LABELING]), []);

    useEffect(() => {
        if (!projectId) return;
        let settingsCopy = { ...settings };
        settingsCopy = getDefaultLabelingSuiteSettings();
        let tmp = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (tmp) {
            const tmpSettings = JSON.parse(tmp);
            //to ensure new setting values exist and old ones are loaded if matching name
            transferNestedDict(tmpSettings, settingsCopy);
            if (tmpSettings.task) {
                transferNestedDict(tmpSettings.task, settingsCopy.task, false);
            }
        }
        if (!settingsCopy.task[projectId]) settingsCopy.task[projectId] = {};
        for (let key in settingsCopy.task) {
            if (key != projectId && key != 'show' && key != 'isCollapsed' && key != 'alwaysShowQuickButtons') delete settingsCopy.task[key];
        }
        dispatch(setSettings(settingsCopy));
        dispatch(setBricksIntegrator(getEmptyBricksIntegratorConfig()));
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.LABELING, {
            projectId: projectId,
            whitelist: ['attributes_updated', 'calculate_attribute', 'payload_finished', 'weak_supervision_finished', 'record_deleted', 'rla_created', 'rla_deleted', 'access_link_changed', 'access_link_removed', 'label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created'],
            func: handleWebsocketNotification
        });
    }, [projectId]);

    //destructor
    useEffect(() => () => {
        SessionManager.initMeOnDestruction();
        dispatch(initOnLabelPageDestruction());
    }, [])

    useEffect(() => {
        if (!projectId) return;
        if (!router.query.sessionId) return;
        SessionManager.labelingLinkData = parseLabelingLink(router);
        const huddleData = (SessionManager.readHuddleDataFromLocal());
        if (!huddleData) requestHuddleData(router.query.sessionId as string); //nothing stored in local storage or outdated
        else {
            SessionManager.jumpToPosition(huddleData.linkData.requestedPos);
            setHuddleData(huddleData);
        }
    }, [projectId, router.query.sessionId]);

    useEffect(() => {
        if (!projectId) return;
        const handleKeyUp = (event) => {
            if (event.key == 'ArrowRight') {
                nextRecord();
            } else if (event.key == 'ArrowLeft') {
                previousRecord();
            }
        };

        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [projectId]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0 || !router.query.sessionId) return;
        if (router.query.sessionId == DUMMY_HUDDLE_ID) return;
        if (!SessionManager.currentRecordId) return;
        if (SessionManager.currentRecordId == "deleted") return;
        setUpCommentsRequestsAndFetch();
    }, [allUsers, projectId, router.query.sessionId, SessionManager.currentRecordId]);

    useEffect(() => {
        if (!SessionManager.currentRecordId) return;
        if (SessionManager.currentRecordId == "deleted") return;
        combineLatest([
            refetchTokenizedRecord({ variables: { recordId: SessionManager.currentRecordId } }),
            refetchRecordByRecordId({ variables: { projectId, recordId: SessionManager.currentRecordId } }),
            refetchRla({ variables: { projectId, recordId: SessionManager.currentRecordId } })
        ]).subscribe(([tokenized, record, rla]) => {
            dispatch(updateRecordRequests('token', tokenized.data.tokenizeRecord));
            dispatch(updateRecordRequests('record', record.data.recordByRecordId));
            dispatch(updateRecordRequests('rla', rla?.data?.recordByRecordId?.recordLabelAssociations));
        });
    }, [SessionManager.currentRecordId]);

    useEffect(() => {
        if (!rlas || !user) return;
        const [usersIcons, showUsersIcons] = UserManager.prepareUserIcons(rlas, user, users);
        dispatch(updateUsers('userIcons', usersIcons));
        dispatch(updateUsers('showUserIcons', showUsersIcons));
        if (!userDisplayId) {
            dispatch(setUserDisplayId(user.id));
        }
    }, [rlas]);

    function setUpCommentsRequestsAndFetch() {
        const requests = [];
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABEL, projectId: projectId });
        requests.push({ commentType: CommentType.HEURISTIC, projectId: projectId });
        requests.push({ commentType: CommentType.RECORD, projectId: projectId, commentKey: SessionManager.currentRecordId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.LABELING);
        CommentDataManager.registerCommentRequests(CurrentPage.LABELING, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function previousRecord() {
        SessionManager.previousRecord();
        SessionManager.currentRecordId = SessionManager.huddleData.recordIds[SessionManager.huddleData.linkData.requestedPos - 1];
        CommentDataManager.unregisterCommentRequests(CurrentPage.LABELING);
        CommentDataManager.registerCommentRequests(CurrentPage.LABELING, [{ commentType: CommentType.RECORD, projectId: projectId, commentKey: SessionManager.currentRecordId }]);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function nextRecord() {
        SessionManager.nextRecord();
        SessionManager.currentRecordId = SessionManager.huddleData.recordIds[SessionManager.huddleData.linkData.requestedPos - 1];
        CommentDataManager.unregisterCommentRequests(CurrentPage.LABELING);
        CommentDataManager.registerCommentRequests(CurrentPage.LABELING, [{ commentType: CommentType.RECORD, projectId: projectId, commentKey: SessionManager.currentRecordId }]);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function requestHuddleData(huddleId: string) {
        refetchHuddleData({ variables: { projectId: projectId, huddleId: huddleId, huddleType: SessionManager.labelingLinkData.linkType } }).then((result) => {
            const huddleData = result['data']['requestHuddleData'];
            if (huddleId == DUMMY_HUDDLE_ID) {
                SessionManager.labelingLinkData.huddleId = huddleData.huddleId;
            }
            collectAvailableLinks();
            if (!huddleData.huddleId) {
                //nothing was found (no slice / heuristic available)        
                LabelingSuiteManager.somethingLoading = false;
                if (SessionManager.labelingLinkData) SessionManager.changeLinkLockState(true);
                return;
            }
            if (huddleData.startPos != -1) SessionManager.labelingLinkData.requestedPos = huddleData.startPos;
            SessionManager.huddleData = {
                recordIds: huddleData.recordIds ? huddleData.recordIds as string[] : [],
                partial: false,
                linkData: SessionManager.labelingLinkData,
                allowedTask: huddleData.allowedTask,
                canEdit: huddleData.canEdit,
                checkedAt: SessionManager.parseCheckedAt(huddleData.checkedAt)
            }

            localStorage.setItem('huddleData', JSON.stringify(SessionManager.huddleData));
            let pos = SessionManager.labelingLinkData.requestedPos;
            if (huddleData.startPos != -1) pos++; //zero based in backend
            SessionManager.jumpToPosition(pos);
            router.push(`/projects/${projectId}/labeling/${SessionManager.huddleData.linkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
        });
    }

    function collectAvailableLinks() {
        if (user?.role == UserRole.ENGINEER) return;
        const heuristicId = SessionManager.labelingLinkData.linkType == LabelingLinkType.HEURISTIC ? SessionManager.labelingLinkData.huddleId : null;
        refetchAvailableLinks({ variables: { projectId: projectId, assumedRole: user?.role, assumedHeuristicId: heuristicId } }).then((result) => {
            const availableLinks = result['data']['availableLinks'];
            dispatch(setAvailableLinks(availableLinks));
            const linkRoute = router.asPath.split("?")[0];
            dispatch(setSelectedLink(availableLinks.find(link => link.link.split("?")[0] == linkRoute)));
        });
    }

    function refetchAttributesAndProcess() {
        refetchAttributes({ variables: { projectId: projectId, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(res.data['attributesByProjectId']));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!record) return;
        if (msgParts[1] == 'attributes_updated' || (msgParts[1] == 'calculate_attribute' && ['created', 'updated'].includes(msgParts[2]))) {
            refetchAttributesAndProcess();
        } else if (msgParts[1] == 'record_deleted') {
            if (msgParts[2] == record.id) {
                SessionManager.setCurrentRecordDeleted();
                router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
                dispatch(updateRecordRequests('token', null));
                dispatch(updateRecordRequests('record', null));
                dispatch(updateRecordRequests('rla', null));
            }
        } else if (['payload_finished', 'weak_supervision_finished', 'rla_created', 'rla_deleted'].includes(msgParts[1])) {
            refetchRla({ variables: { projectId, recordId: SessionManager.currentRecordId } }).then((result) => {
                dispatch(updateRecordRequests('rla', result?.data?.recordByRecordId?.recordLabelAssociations));
            });
        } else if (['access_link_changed', 'access_link_removed'].includes(msgParts[1])) {
            if (router.pathname.includes(msgParts[3]) && SessionManager.labelingLinkData) {
                //python "True" string
                SessionManager.labelingLinkData.linkLocked = !msgParts[4] || msgParts[4] === 'True';
                location.reload();
            }
        } else if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else {
            console.log("unknown message in labeling suite task manager" + msgParts);
        }
    }, [record]);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.LABELING, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (<div className={`h-full bg-white flex flex-col ${LabelingSuiteManager.somethingLoading ? style.wait : ''}`}>
        {LabelingSuiteManager.absoluteWarning && <div className="absolute left-0 right-0 flex items-center justify-center pointer-events-none top-4 z-100">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">{LabelingSuiteManager.absoluteWarning}</span>
        </div>}
        <NavigationBarTop />
        <div className="flex-grow overflow-y-auto" style={{ height: 'calc(100vh - 194px)' }}>
            {settings.task.show && <LabelingSuiteTaskHeader />}
            <LabelingSuiteLabeling />
            {settings.overviewTable.show && SessionManager.currentRecordId !== "deleted" && <LabelingSuiteOverviewTable />}
        </div>
        <NavigationBarBottom />
    </div>)
}
