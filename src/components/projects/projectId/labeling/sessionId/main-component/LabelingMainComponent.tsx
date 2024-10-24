import { selectAllUsers, selectOrganizationId, selectUser, setBricksIntegrator, setComments } from "@/src/reduxStore/states/general";
import { setAvailableLinks, updateRecordRequests, setSelectedLink, selectRecordRequestsRla, updateUsers, setSettings, selectSettings, setUserDisplayId, selectRecordRequestsRecord, initOnLabelPageDestruction, selectUserDisplayId, selectDisplayUserRole, setDisplayUserRole } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { UserRole } from "@/src/types/shared/sidebar";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { UserManager } from "@/src/util/classes/labeling/user-manager";
import { DUMMY_HUDDLE_ID, getDefaultLabelingSuiteSettings, parseLabelingLink, prepareRLADataForRole } from "@/src/util/components/projects/projectId/labeling/labeling-main-component-helper";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/src/styles/components/projects/projectId/labeling.module.css";
import NavigationBarTop from "./NavigationBarTop";
import NavigationBarBottom from "./NavigationBarBottom";

import LabelingSuiteTaskHeader from "../sub-components/LabelingSuiteTaskHeader";
import LabelingSuiteOverviewTable from "../sub-components/LabelingSuiteOverviewTable";
import LabelingSuiteLabeling from "../sub-components/LabelingSuiteLabeling";
import { setAllAttributes, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";
import { getEmptyBricksIntegratorConfig } from "@/src/util/shared/bricks-integrator-helper";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getAllComments } from "@/src/services/base/comment";
import { getAttributes } from "@/src/services/base/attribute";
import { getLabelingTasksByProjectId } from "@/src/services/base/project";
import { getAvailableLinks, getHuddleData, getLinkLocked, getRecordLabelAssociations, getTokenizedRecord } from "@/src/services/base/labeling";
import { getRecordByRecordId } from "@/src/services/base/project-setting";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

const SETTINGS_KEY = 'labelingSettings';

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
    const userDisplayRole = useSelector(selectDisplayUserRole);

    const [huddleData, setHuddleData] = useState(null);
    const [absoluteWarning, setAbsoluteWarning] = useState(null);
    const [lockedLink, setLockedLink] = useState(false);

    const hasRequestedHuddleData = useRef(false);

    useEffect(() => {
        if (!projectId || !router.query) return;
        let tmp = localStorage.getItem(SETTINGS_KEY);
        if (tmp) {
            dispatch(setSettings(JSON.parse(tmp)));
        } else {
            let settingsCopy = { ...settings };
            settingsCopy = getDefaultLabelingSuiteSettings();
            if (!settingsCopy.task[projectId]) settingsCopy.task[projectId] = {};
            for (let key in settingsCopy.task) {
                if (key != projectId && key != 'show' && key != 'isCollapsed' && key != 'alwaysShowQuickButtons') delete settingsCopy.task[key];
            }
            dispatch(setSettings(settingsCopy));
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsCopy));
        }

        dispatch(setBricksIntegrator(getEmptyBricksIntegratorConfig()));
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
    }, [projectId, router.query]);

    //destructor
    useEffect(() => () => {
        SessionManager.initMeOnDestruction();
        dispatch(initOnLabelPageDestruction());
    }, []);

    useEffect(() => {
        if (!router.query.sessionId || !user || !projectId) return;
        if (router.query.type == LabelingLinkType.SESSION) {
            dispatch(setDisplayUserRole(user.role));
            return;
        }
        getLinkLocked(projectId, { linkRoute: router.asPath }, (result) => {
            const lockedLink = result['data']['linkLocked'];
            if (lockedLink) {
                setAbsoluteWarning('This link is locked, contact your supervisor to request access');
                if (router.query.type == LabelingLinkType.HEURISTIC) {
                    dispatch(setDisplayUserRole(UserRole.ANNOTATOR));
                }
            } else {
                if (router.query.type == LabelingLinkType.HEURISTIC) {
                    dispatch(setDisplayUserRole(UserRole.ANNOTATOR));
                    setAbsoluteWarning(user?.role == UserRole.ENGINEER ? 'You are viewing this page as ' + UserRole.ANNOTATOR + ' you are not able to edit' : null);
                } else if (router.query.type == LabelingLinkType.DATA_SLICE) {
                    dispatch(setDisplayUserRole(UserRole.EXPERT));
                    setAbsoluteWarning(user?.role == UserRole.ENGINEER ? 'You are viewing this page as ' + UserRole.EXPERT + ' you are not able to edit' : null);
                } else {
                    dispatch(setDisplayUserRole(user.role));
                }
            }
            setLockedLink(lockedLink);
        });
    }, [router.query, user, projectId]);

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
        if (!projectId || allUsers.length == 0 || !router.query.sessionId || !user) return;
        if (router.query.sessionId == DUMMY_HUDDLE_ID) return;
        if (!SessionManager.currentRecordId) return;
        if (SessionManager.currentRecordId == "deleted") return;
        setUpCommentsRequestsAndFetch();
    }, [allUsers, projectId, router.query.sessionId, SessionManager.currentRecordId]);

    useEffect(() => {
        if (!SessionManager.currentRecordId) return;
        if (SessionManager.currentRecordId == "deleted") {
            dispatch(updateRecordRequests('record', null));
            dispatch(updateRecordRequests('token', null));
            dispatch(updateRecordRequests('rla', null));
            return;
        }
        if (SessionManager.currentRecordId !== null) {
            setTimeout(() => {
                getTokenizedRecord({ recordId: SessionManager.currentRecordId }, (res) => {
                    dispatch(updateRecordRequests('token', res.data.tokenizeRecord));
                });
                getRecordByRecordId(projectId, SessionManager.currentRecordId, (res) => {
                    dispatch(updateRecordRequests('record', res.data.recordByRecordId));
                });
                getRecordLabelAssociations(projectId, SessionManager.currentRecordId, (rla) => {
                    const rlas = rla['data']?.['recordByRecordId']?.['recordLabelAssociations']['edges'].map(e => e.node);
                    dispatch(updateRecordRequests('rla', prepareRLADataForRole(rlas, user, userDisplayId, userDisplayRole)));
                });
            }, 100);
        }
    }, [SessionManager.currentRecordId, user]);

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
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
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
        if (SessionManager.currentRecordId == "deleted") {
            router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
            return;
        }
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
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
        if (SessionManager.currentRecordId == "deleted") {
            router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
            return;
        }
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function requestHuddleData(huddleId: string) {
        if (hasRequestedHuddleData.current === true) return;
        hasRequestedHuddleData.current = true;
        getHuddleData(projectId, { huddleId: huddleId, huddleType: SessionManager.labelingLinkData.linkType }, (result) => {
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
            if (huddleData.startPos != -1) {
                if (userDisplayRole != UserRole.ENGINEER) SessionManager.labelingLinkData.requestedPos = 0;
                else SessionManager.labelingLinkData.requestedPos = huddleData.startPos;
            }
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
            dispatch(setDisplayUserRole(user.role));
            router.push(`/projects/${projectId}/labeling/${SessionManager.huddleData.linkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
            hasRequestedHuddleData.current = false;
        });
    }

    function collectAvailableLinks() {
        if (userDisplayRole?.role == UserRole.ENGINEER) return;
        const heuristicId = SessionManager.labelingLinkData.linkType == LabelingLinkType.HEURISTIC ? SessionManager.labelingLinkData.huddleId : null;
        getAvailableLinks(projectId, user?.role, heuristicId, (result) => {
            const availableLinks = result['data']['availableLinks'];
            dispatch(setAvailableLinks(availableLinks));
            const linkRoute = router.asPath.split("?")[0];
            dispatch(setSelectedLink(availableLinks.find(link => link.link.split("?")[0] == linkRoute)));
        });
    }

    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res.data['attributesByProjectId']));
        });
    }

    function refetchLabelingTasksAndProcess() {
        getLabelingTasksByProjectId(projectId, (res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            const labelingTasksProcessed = postProcessLabelingTasksSchema(labelingTasks);
            dispatch(setLabelingTasksAll(prepareTasksForRole(labelingTasksProcessed, userDisplayRole)));
        });
    }

    function prepareTasksForRole(taskData: LabelingTask[], userDisplayRole): LabelingTask[] {
        if (user?.role != UserRole.ANNOTATOR && userDisplayRole != UserRole.ANNOTATOR) return taskData;
        let taskId;
        if (userDisplayRole != UserRole.ENGINEER) {
            taskId = JSON.parse(localStorage.getItem('huddleData'))?.allowedTask;
        } else {
            taskId = JSON.parse(localStorage.getItem('huddleData')).allowedTask;
        }
        if (!taskId) return null;
        else return taskData.filter(t => t.id == taskId);
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
            const recordId = SessionManager.currentRecordId ?? record.id;
            if (msgParts[2] == recordId) {
                getRecordLabelAssociations(projectId, recordId, (rla) => {
                    const rlas = rla['data']?.['recordByRecordId']?.['recordLabelAssociations']['edges'].map(e => e.node);
                    dispatch(updateRecordRequests('rla', prepareRLADataForRole(rlas, user, userDisplayId, userDisplayRole)));
                });
            }
        } else if (['access_link_changed', 'access_link_removed'].includes(msgParts[1])) {
            if (router.pathname.includes(msgParts[3]) && SessionManager.labelingLinkData) {
                //python "True" string
                SessionManager.labelingLinkData.linkLocked = !msgParts[4] || msgParts[4] === 'True';
                location.reload();
            }
        } else if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        }
    }, [record, SessionManager.currentRecordId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.LABELING, handleWebsocketNotification, projectId);

    return (<div className={`h-full bg-white flex flex-col ${LabelingSuiteManager.somethingLoading ? style.wait : ''}`}>
        <NavigationBarTop absoluteWarning={absoluteWarning} lockedLink={lockedLink} />
        <div className="flex-grow overflow-y-auto" style={{ height: 'calc(100vh - 194px)' }}>
            {!lockedLink && <>
                {settings.task.show && (user?.role != UserRole.ANNOTATOR && userDisplayRole != UserRole.ANNOTATOR) && <LabelingSuiteTaskHeader />}
                <LabelingSuiteLabeling />
                {settings.overviewTable.show && SessionManager.currentRecordId !== "deleted" && <LabelingSuiteOverviewTable />}</>}
        </div>
        {!lockedLink ? <NavigationBarBottom /> : <div className="relative flex-shrink-0 bg-white shadow-sm flex justify-between items-center h-16"></div>}
    </div>)
}
