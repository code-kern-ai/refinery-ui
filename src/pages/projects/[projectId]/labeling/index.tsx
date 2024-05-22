import LabelingMainComponent from "@/src/components/projects/projectId/labeling/sessionId/main-component/LabelingMainComponent";
import { selectUser, setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/web-sockets-helper";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { DUMMY_HUDDLE_ID, guessLinkType } from "@/src/util/components/projects/projectId/labeling/labeling-main-component-helper";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LabelingRoutingPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.LABELING));
        dispatch(setDisplayIconComments(true));
    }, []);

    useEffect(() => {
        if (!projectId) return;
        if (!user) return;
        if (!SessionManager.labelingLinkData) {
            const type = guessLinkType(user.role);
            router.push(`/projects/${projectId}/labeling/${DUMMY_HUDDLE_ID}?pos=0&type=${type}`);
        } else {
            router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.labelingLinkData.requestedPos}&type=${SessionManager.labelingLinkData.linkType}`);
        }
    }, [projectId, user]);

    return (
        <LabelingMainComponent />
    )
}