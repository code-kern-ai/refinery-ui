import { selectUser } from "@/src/reduxStore/states/general";
import { setAvailableLinks, setSelectedLink } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { AVAILABLE_LABELING_LINKS, REQUEST_HUDDLE_DATA } from "@/src/services/gql/queries/labeling";
import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-general";
import { UserRole } from "@/src/types/shared/sidebar";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { UserManager } from "@/src/util/classes/labeling/user-manager";
import { DUMMY_HUDDLE_ID, parseLabelingLink } from "@/src/util/components/projects/projectId/labeling/labeling-general-helper";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/src/styles/components/projects/projectId/labeling.module.css";
import NavigationBarTop from "./NavigationBarTop";
import NavigationBarBottom from "./NavigationBarBottom";

export default function LabelingMainComponent() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);

    const [refetchHuddleData] = useLazyQuery(REQUEST_HUDDLE_DATA, { fetchPolicy: 'no-cache' });
    const [refetchAvailableLinks] = useLazyQuery(AVAILABLE_LABELING_LINKS, { fetchPolicy: 'no-cache' });

    useEffect(() => {
        if (!projectId) return;
        if (!router.query.sessionId) return;
        SessionManager.labelingLinkData = parseLabelingLink(router);
        SessionManager.readHuddleDataFromLocal();
        const huddleId = SessionManager.prepareLabelingSession(projectId);
        if (huddleId && SessionManager.huddleData) {
            SessionManager.jumpToPosition(SessionManager.labelingLinkData.requestedPos);
            router.push(`/projects/${projectId}/labeling/${huddleId}?pos=${SessionManager.labelingLinkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
        }
        if (huddleId == DUMMY_HUDDLE_ID) requestHuddleData(huddleId);
        else {
            SessionManager.jumpToPosition(SessionManager.labelingLinkData.requestedPos);
            router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
        }
    }, [projectId, router.query.sessionId]);

    useEffect(() => {
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
    }, []);

    function previousRecord() {
        SessionManager.previousRecord();
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function nextRecord() {
        SessionManager.nextRecord();
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function requestHuddleData(huddleId: string) {
        if (huddleId != SessionManager.labelingLinkData.huddleId) {
            console.log("something wrong with session/huddle integration");
            return
        }
        refetchHuddleData({ variables: { projectId: projectId, huddleId: huddleId, huddleType: SessionManager.labelingLinkData.linkType } }).then((result) => {
            const huddleData = result['data']['requestHuddleData'];
            if (huddleId == DUMMY_HUDDLE_ID) {
                SessionManager.labelingLinkData.huddleId = huddleData.huddleId;
                collectAvailableLinks();
            }
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
        if (user.role == UserRole.ENGINEER) return;
        const heuristicId = SessionManager.labelingLinkData.linkType == LabelingLinkType.HEURISTIC ? SessionManager.labelingLinkData.huddleId : null;
        const assumedRole = UserManager.currentRole != UserManager.mainUser.data.role ? UserManager.currentRole : null;
        refetchAvailableLinks({ variables: { projectId: projectId, assumedRole: assumedRole, assumedHeuristicId: heuristicId } }).then((result) => {
            const availableLinks = result['data']['availableLinks'];
            dispatch(setAvailableLinks(availableLinks));
            const linkRoute = router.asPath.split("?")[0];
            dispatch(setSelectedLink(availableLinks.find(link => link.link.split("?")[0] == linkRoute)));
        });
    }

    return (<div className={`h-full bg-white flex flex-col ${!LabelingSuiteManager.somethingLoading ? style.wait : ''}`}>
        {LabelingSuiteManager.absoluteWarning && <div className="absolute left-0 right-0 flex items-center justify-center pointer-events-none top-4 z-100">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">{LabelingSuiteManager.absoluteWarning}</span>
        </div>}
        <NavigationBarTop />
        <div className="flex-grow overflow-y-auto" style={{ maxHeight: 'calc(80vh - 190px)' }}>
        </div>
        <NavigationBarBottom />
    </div>)
}