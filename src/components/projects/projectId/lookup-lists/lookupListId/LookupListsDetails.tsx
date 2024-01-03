import { updateLookupListState } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { UPDATE_KNOWLEDGE_BASE } from "@/src/services/gql/mutations/lookup-lists";
import { LOOKUP_LIST_BY_LOOKUP_LIST_ID, TERMS_BY_KNOWLEDGE_BASE_ID } from "@/src/services/gql/queries/lookup-lists";
import { LookupList, LookupListProperty, Term } from "@/src/types/components/projects/projectId/lookup-lists";
import { postProcessLookupList, postProcessTerms } from "@/src/util/components/projects/projectId/lookup-lists-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import LookupListOperations from "./LookupListOperations";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import Terms from "./Terms";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { selectAllUsers, setComments } from "@/src/reduxStore/states/general";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";

export default function LookupListsDetails() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const allUsers = useSelector(selectAllUsers);

    const [lookupList, setLookupList] = useState<LookupList | null>(null);
    const [terms, setTerms] = useState<Term[]>([]);
    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [finalSize, setFinalSize] = useState(0);

    const [refetchCurrentLookupList] = useLazyQuery(LOOKUP_LIST_BY_LOOKUP_LIST_ID, { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });
    const [refetchTermsLookupList] = useLazyQuery(TERMS_BY_KNOWLEDGE_BASE_ID, { fetchPolicy: 'cache-and-network' });
    const [updateLookupListMut] = useMutation(UPDATE_KNOWLEDGE_BASE);
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.LOOKUP_LISTS_DETAILS]), []);

    useEffect(() => {
        if (!projectId) return;
        refetchCurrentLookupList({ variables: { projectId: projectId, knowledgeBaseId: router.query.lookupListId } }).then((res) => {
            setLookupList(postProcessLookupList(res.data['knowledgeBaseByKnowledgeBaseId']));
        });
        refetchTerms();
        refetchWS();
    }, [projectId, router.query.lookupListId]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.KNOWLEDGE_BASE, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.LOOKUP_LISTS_DETAILS);
        CommentDataManager.registerCommentRequests(CurrentPage.LOOKUP_LISTS_DETAILS, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchWS() {
        WebSocketsService.subscribeToNotification(CurrentPage.LOOKUP_LISTS_DETAILS, {
            projectId: projectId,
            whitelist: ['knowledge_base_updated', 'knowledge_base_deleted', 'knowledge_base_term_updated'],
            func: handleWebsocketNotification
        });
    }

    function refetchTerms() {
        refetchTermsLookupList({ variables: { projectId: projectId, knowledgeBaseId: router.query.lookupListId } }).then((res) => {
            setFinalSize(res.data['termsByKnowledgeBaseId'].length);
            setTerms(postProcessTerms(res.data['termsByKnowledgeBaseId']));
        });
    }

    function onScrollEvent(event: any) {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }

    function saveLookupList() {
        updateLookupListMut({
            variables: { projectId: projectId, knowledgeBaseId: lookupList.id, name: lookupList.name, description: lookupList.description }
        }).then((res) => {
            dispatch(updateLookupListState(lookupList.id, { name: lookupList.name, description: lookupList.description }))
        });
    }

    function openProperty(open: boolean, property: string) {
        if (property == LookupListProperty.NAME) setIsNameOpen(open);
        if (property == LookupListProperty.DESCRIPTION) setIsDescriptionOpen(open);
        if (!open) {
            saveLookupList();
        }
    }

    function changeLookupList(name: string, property: string) {
        const lookupListCopy = { ...lookupList };
        lookupListCopy[property] = name;
        setLookupList(lookupListCopy);
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (msgParts[2] == router.query.lookupListId) {
            if (msgParts[1] == 'knowledge_base_updated') {
                refetchCurrentLookupList({ variables: { projectId: projectId, knowledgeBaseId: router.query.lookupListId } }).then((res) => {
                    setLookupList(postProcessLookupList(res.data['knowledgeBaseByKnowledgeBaseId']));
                });
            } else if (msgParts[1] == 'knowledge_base_deleted') {
                alert('Lookup list was deleted');
                router.push(`/projects/${projectId}/lookup-lists`);
            } else if (msgParts[1] == 'knowledge_base_term_updated') {
                refetchTerms();
            }
        }
    }

    return (projectId && <div className="bg-white p-4 pb-16 overflow-y-auto h-screen" onScroll={(e: any) => onScrollEvent(e)}>
        {lookupList && <div>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <button onClick={() => router.push(`/projects/${projectId}/lookup-lists`)}
                            className="text-green-800 text-sm font-medium">
                            <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </button>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{lookupList.name}</div>}
                    </div>
                </div>
            </div>

            <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {isHeaderNormal && <div className="flex items-center mt-2">
                    <Tooltip color="invert" placement="bottom" content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.EDIT_NAME}>
                        <button onClick={() => openProperty(true, LookupListProperty.NAME)}
                            className="flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Edit name
                        </button>
                    </Tooltip>
                    <div className="inline-block" onDoubleClick={() => openProperty(true, LookupListProperty.NAME)}>
                        {isNameOpen
                            ? (<input type="text" value={lookupList.name} onInput={(e: any) => changeLookupList(e.target.value, LookupListProperty.NAME)}
                                onBlur={() => openProperty(false, LookupListProperty.NAME)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, LookupListProperty.NAME) }}
                                className="h-8 border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                            : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{lookupList.name}</div>)}
                    </div>
                </div>}
                {isHeaderNormal && <div className="flex items-center mt-2">
                    <Tooltip color="invert" placement="bottom" content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.EDIT_DESCRIPTION}>
                        <button onClick={() => openProperty(true, LookupListProperty.DESCRIPTION)}
                            className="flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Edit description
                        </button>
                    </Tooltip>
                    <div className="inline-block" onDoubleClick={() => openProperty(true, LookupListProperty.DESCRIPTION)}>
                        {isDescriptionOpen
                            ? (<input type="text" value={lookupList.description} onInput={(e: any) => changeLookupList(e.target.value, LookupListProperty.DESCRIPTION)}
                                onBlur={() => openProperty(false, LookupListProperty.DESCRIPTION)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, LookupListProperty.DESCRIPTION) }}
                                className="h-8 border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                            : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{lookupList.description}</div>)}
                    </div>
                </div>}
            </div>
            <div className="flex rounded-md mt-4 w-full">
                <Tooltip content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.PYTHON_VARIABLE} color="invert" placement="right" className="cursor-auto">
                    <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-xs">
                        Python variable
                    </span>
                </Tooltip>
                <Tooltip content={TOOLTIPS_DICT.GENERAL.IMPORT_STATEMENT} color="invert" placement="top">
                    <span onClick={() => copyToClipboard("from knowledge import " + lookupList.pythonVariable)}
                        className="font-dmMono px-4 py-2 rounded-none rounded-r-md border border-gray-300 text-gray-500 sm:text-sm bg-gray-100 cursor-pointer">
                        {lookupList.pythonVariable}</span>
                </Tooltip>
                <LookupListOperations refetchWS={refetchWS} />
            </div>
            <Terms terms={terms} finalSize={finalSize} refetchTerms={refetchTerms} setTerms={(terms: Term[]) => setTerms(terms)} />
            <DangerZone elementType={DangerZoneEnum.LOOKUP_LIST} name={lookupList.name} id={lookupList.id} />
        </div>}
    </div>)
}