import BricksIntegrator from "@/src/components/shared/bricks-integrator/BricksIntegrator";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import MultilineTooltip from "@/src/components/shared/multilines-tooltip/MultilineTooltip";
import { selectAllUsers, setComments } from "@/src/reduxStore/states/general";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { getAllComments } from "@/src/services/base/comment";
import { getRecordIDE } from "@/src/services/base/record-ide";
import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { CommentType } from "@/src/types/shared/comments";
import { CurrentPage } from "@/src/types/shared/general";
import { CommentDataManager } from "@/src/util/classes/comments";
import { DEFAULT_CODE, PASS_ME, caesarCipher } from "@/src/util/components/projects/projectId/record-ide/record-ide-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { tryParseJSON } from "@/submodules/javascript-functions/general";
import { Editor } from "@monaco-editor/react";
import { Tooltip } from "@nextui-org/react";
import { IconArrowBack, IconArrowBigUp, IconBorderHorizontal, IconBorderVertical } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { timer } from "rxjs";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python' };

export default function RecordIDE() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const allUsers = useSelector(selectAllUsers);

    const [vertical, setVertical] = useState(true);
    const [canLoadFromLocalStorage, setCanLoadFromLocalStorage] = useState(false);
    const [code, setCode] = useState(DEFAULT_CODE);
    const [screenHeight, setScreenHeight] = useState("");
    const [position, setPosition] = useState(0);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);

    const huddleData = JSON.parse(localStorage.getItem("huddleData"));

    useEffect(() => {
        if (!projectId) return;
        const horizontal = JSON.parse(localStorage.getItem("ideHorizontal"));
        if (horizontal) {
            setVertical(!horizontal);
        }
        setCanLoadFromLocalStorage(!!localStorage.getItem("ideCode"));
        setPosition(parseInt(router.query.pos as string));
    }, [projectId]);

    useEffect(() => {
        if (!position) return;
        runRecordIde();
    }, [position]);

    useEffect(() => {
        changeScreenSize();
        window.addEventListener("resize", changeScreenSize);
        return () => window.removeEventListener("resize", changeScreenSize);
    }, [vertical]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    useEffect(() => {
        if (!projectId || !huddleData || !code) return;
        const shortcutRunIde = (event) => {
            if (event.shiftKey && event.key === "Enter") {
                event.preventDefault();
                runRecordIde();
            }
        };

        document.addEventListener('keydown', shortcutRunIde);
        return () => {
            document.removeEventListener('keydown', shortcutRunIde);
        };
    }, [projectId, huddleData, code]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.KNOWLEDGE_BASE, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.RECORD_IDE);
        CommentDataManager.registerCommentRequests(CurrentPage.RECORD_IDE, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function goToLabelingPage() {
        const sessionId = router.query.sessionId as string;
        const pos = router.query.pos as string;
        router.push(`/projects/${projectId}/labeling/${sessionId}?pos=${pos}&type=${LabelingLinkType.SESSION}`);
    }

    function loadCodeFromLocalStorage() {
        const existingCode = localStorage.getItem("ideCode");
        if (existingCode) {
            let code = tryParseJSON(existingCode);
            if (!code || !code.code) {
                code = existingCode; // old code
            } else {
                code = caesarCipher(code.code, PASS_ME, true);
            }
            setCode(code);
        }
        runRecordIde();
    }

    function saveCodeToLocalStorage() {
        const toSave = { code: caesarCipher(code, PASS_ME) };
        localStorage.setItem("ideCode", JSON.stringify(toSave));
    }

    function switchView() {
        localStorage.setItem("ideHorizontal", JSON.stringify(vertical));
        setVertical(!vertical);
    }

    const runRecordIde = useCallback(() => {
        if (!projectId) return;
        setLoading(true);
        const recordId = huddleData.recordIds[position - 1];
        if (debounceTimer) debounceTimer.unsubscribe();
        const timerSave = timer(400).subscribe(() => {
            getRecordIDE(projectId, recordId, code, (res) => {
                if (!res.data || res.data["runRecordIde"] == null) {
                    setOutput("");
                    setLoading(false);
                    return;
                }
                setOutput(res.data["runRecordIde"]);
                setLoading(false);
            });
        });
        setDebounceTimer(timerSave);
    }, [position, code, projectId, debounceTimer]);

    function changeScreenSize() {
        const baseSize = (window.innerHeight - 125);
        if (vertical) {
            setScreenHeight(baseSize + "px");
        }
        else {
            setScreenHeight((baseSize / 2) + "px");
        }
    }

    function prevRecord() {
        const sessionId = router.query.sessionId as string;
        router.push(`/projects/${projectId}/record-ide/${sessionId}?pos=${position - 1}`);
        setPosition(position - 1);
        runRecordIde();
    }

    function nextRecord() {
        const sessionId = router.query.sessionId as string;
        router.push(`/projects/${projectId}/record-ide/${sessionId}?pos=${position + 1}`);
        setPosition(position + 1);
        runRecordIde();
    }

    function clearIde() {
        setOutput("");
    }

    return (<>
        {projectId && <div className={`bg-white grid overflow-hidden min-h-full h-[calc(100vh-4rem)] ${vertical ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="h-full">
                <div className="m-3 flex items-center">
                    <span className="mr-4">Editor</span>
                    <Tooltip content={TOOLTIPS_DICT.RECORD_IDE.GO_TO_LABELING} color="invert" placement="right">
                        <button onClick={goToLabelingPage}
                            className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white text-gray-700 font-semibold text-xs mr-2 px-4 py-2 rounded-md border border-gray-300">
                            <span>View labeling</span>
                        </button>
                    </Tooltip>
                    <Tooltip content={TOOLTIPS_DICT.RECORD_IDE.LOAD_STORAGE} color="invert" placement="right">
                        <button onClick={loadCodeFromLocalStorage} disabled={!canLoadFromLocalStorage}
                            className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white text-gray-700 font-semibold text-xs mr-2 px-4 py-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span>Load</span>
                        </button>
                    </Tooltip>
                    <Tooltip content={TOOLTIPS_DICT.RECORD_IDE.SAVE_STORAGE} color="invert" placement="right">
                        <button onClick={saveCodeToLocalStorage}
                            className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white text-gray-700 font-semibold text-xs mr-2 px-4 py-2 rounded-md border border-gray-300">
                            <span>Save</span>
                        </button>
                    </Tooltip>
                    <span className="float-right flex flex-row flex-nowrap items-center ml-auto">
                        <Tooltip content={vertical ? TOOLTIPS_DICT.RECORD_IDE.SWITCH_TO_HORIZONTAL : TOOLTIPS_DICT.RECORD_IDE.SWITCH_TO_VERTICAL} color="invert" placement="left">
                            <button onClick={switchView}
                                className="bg-white mr-3 p-1 rounded-md border border-gray-300 whitespace-nowrap hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                {vertical ? <IconBorderHorizontal size={20} /> : <IconBorderVertical size={20} />}
                            </button>
                        </Tooltip>
                        <button onClick={prevRecord} disabled={position == 1}
                            className={`bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 whitespace-nowrap hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}>Back
                        </button>
                        <button onClick={nextRecord} disabled={position == huddleData?.recordIds.length}
                            className={`bg-indigo-700 text-white text-xs font-semibold mr-3 px-4 py-2 rounded-md cursor-pointer whitespace-nowrap hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}>Next
                        </button>
                        <Tooltip content={TOOLTIPS_DICT.RECORD_IDE.IDX_SESSION} color="invert" placement="left" className="cursor-auto">
                            <span className="border border-gray-200 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">{position}</span>
                        </Tooltip>
                    </span>
                </div>
                <Editor
                    className="h-full w-full"
                    defaultLanguage={'python'}
                    options={EDITOR_OPTIONS}
                    value={code}
                    height={screenHeight}
                    onChange={(val) => setCode(val)} />
            </div>
            <div className={`h-full border-gray-300 ${vertical ? 'border-l' : 'border-t'}`}>
                <div className="flex flex-row m-3 items-center">
                    <span className="mr-4">Shell</span>
                    <Tooltip content={<MultilineTooltip tooltipLines={['Press Shift + Enter in the editor', 'to run the code']} />} color="invert" placement="bottom">
                        <button onClick={runRecordIde} className="whitespace-break-spaces">
                            <div className="items-center flex mr-2 px-4 py-2 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                                <span>Run</span>
                                <kbd className="h-4 ml-2 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-1 text-sm font-sans font-medium text-gray-400">
                                    <IconArrowBigUp size={16} />
                                    <IconArrowBack size={16} />
                                </kbd>
                            </div>
                        </button>
                    </Tooltip>
                    <Tooltip content={TOOLTIPS_DICT.RECORD_IDE.CLEAR_SHELL} color="invert" placement="bottom">
                        <button onClick={clearIde}
                            className="hover:bg-gray-50 bg-white text-gray-700 font-semibold text-xs mr-2 px-4 py-2 rounded-md border border-gray-300">
                            Clear
                        </button>
                    </Tooltip>
                    <BricksIntegrator
                        functionType="Function"
                        forIde="X"
                        preparedCode={(code) => {
                            setCode(code);
                        }}
                    />

                    <a href="https://github.com/code-kern-ai/refinery-record-ide-env/blob/dev/requirements.txt"
                        target="_blank"
                        className="hover:bg-gray-50 bg-white text-gray-700 font-semibold text-xs mx-2 px-4 py-2 rounded-md border border-gray-300">
                        See installed libraries
                    </a>
                </div>
                {!loading && <div className="ml-2 font-dmMono text-xs whitespace-pre-line overflow-y-auto" style={{ 'height': vertical ? 'calc(100vh - 150px)' : 'calc(50vh - 150px)' }}>
                    <code>{output}</code>
                </div>}
                {loading && <div className="items-center" style={{ 'height': vertical ? 'calc(100vh - 150px)' : 'calc(50vh - 150px)' }}>
                    <LoadingIcon size="lg" />
                </div>}
            </div>
        </div>}
    </>)
}