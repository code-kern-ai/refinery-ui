import Statuses from "@/src/components/shared/statuses/Statuses";
import { selectAllLookupLists, setAllLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectAttributes, selectVisibleAttributeAC, setAllAttributes, setLabelingTasksAll, updateAttributeById } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { Attribute, AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { DataTypeEnum } from "@/src/types/shared/general";
import { postProcessCurrentAttribute } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { ATTRIBUTES_VISIBILITY_STATES, DATA_TYPES, getTooltipVisibilityState } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { Editor } from "@monaco-editor/react";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowLeft, IconCircleCheckFilled } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import ExecutionContainer from "./ExecutionContainer";
import { getPythonFunctionRegExMatch, toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import ContainerLogs from "@/src/components/shared/logs/ContainerLogs";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { debounceTime, distinctUntilChanged, fromEvent, timer } from "rxjs";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { selectAllUsers, selectOrganizationId, setComments } from "@/src/reduxStore/states/general";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";
import { AttributeCodeLookup } from "@/src/util/classes/attribute-calculation";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { getAllComments } from "@/src/services/base/comment";
import { getAttributes } from "@/src/services/base/attribute";
import { getLookupListsByProjectId } from "@/src/services/base/lookup-lists";
import { getLabelingTasksByProjectId, getProjectTokenization } from "@/src/services/base/project";
import { getAttributeByAttributeId, updateAttribute } from "@/src/services/base/project-setting";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { VisitBricksButton } from "@/src/components/shared/bricks/VisitBricksButton";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };

export default function QuestionPlayground() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);





    return (projectId && <div className={`bg-white p-4 overflow-y-auto min-h-full h-[calc(100vh-4rem)]`}>
        Test
    </div >)
}