import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-general";
import { UserRole } from "@/src/types/shared/sidebar";

export const ONE_DAY = 86400000; // 24 * 60 * 60 * 1000;
export const DUMMY_HUDDLE_ID = "00000000-0000-0000-0000-000000000000";

export function parseLabelingLink(router: any) {
    const projectId = router.query.projectId;
    const id = router.query.sessionId;
    const requestedPosStr = router.query.requestedPos;
    const isPosNumber = !Number.isNaN(Number(requestedPosStr));
    const type = linkTypeFromStr(router.query.type);

    return {
        projectId: projectId,
        huddleId: id,
        requestedPos: isPosNumber ? Number(requestedPosStr) : 0,
        linkType: type,
    };
}

function linkTypeFromStr(str: string): LabelingLinkType {
    if (!str) return LabelingLinkType.SESSION;
    switch (str.toUpperCase()) {
        case 'DATA_SLICE':
            return LabelingLinkType.DATA_SLICE;
        case 'HEURISTIC':
            return LabelingLinkType.HEURISTIC;
        case 'SESSION':
        default:
            return LabelingLinkType.SESSION;
    }
}

export function guessLinkType(userRole: string): string {
    switch (userRole) {
        case UserRole.EXPERT:
            return LabelingLinkType.DATA_SLICE;
        case UserRole.ANNOTATOR:
            return LabelingLinkType.HEURISTIC;
        case UserRole.ENGINEER:
        default:
            return LabelingLinkType.SESSION;
    }
}
