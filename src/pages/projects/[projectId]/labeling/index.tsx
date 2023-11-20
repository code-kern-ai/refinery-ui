import LabelingMainComponent from "@/src/components/projects/projectId/labeling/sessionId/LabelingMainComponent";
import { selectUser, setCurrentPage } from "@/src/reduxStore/states/general";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CurrentPage } from "@/src/types/shared/general";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { DUMMY_HUDDLE_ID, guessLinkType } from "@/src/util/components/projects/projectId/labeling/labeling-general-helper";
import { useRouter } from "next/router";
import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LabelingRoutingPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.LABELING))
    }, []);

    useEffect(() => {
        if (!projectId) return;
        if (!user) return;
        if (!SessionManager.labelingLinkData) {
            const type = guessLinkType(user.role);
            router.push(`/projects/${projectId}/labeling/${DUMMY_HUDDLE_ID}?pos=0&type=${type}`);
        }
    }, [projectId, user]);

    return (
        <LabelingMainComponent />
    )
}