import { selectProjectId } from "@/src/reduxStore/states/project";
import React, { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { extendAllLookupLists, selectAllLookupLists, selectCheckedLookupLists, setAllLookupLists, setCheckedLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { Tooltip } from "@nextui-org/react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery, useMutation } from "@apollo/client";
import { LOOKUP_LISTS_BY_PROJECT_ID } from "@/src/services/gql/queries/lookup-lists";
import { CREATE_LOOKUP_LIST } from "@/src/services/gql/mutations/lookup-lists";
import { LookupList } from "@/src/types/components/projects/projectId/lookup-lists";
import { LookupListCard } from "./LookupListCard";
import style from '@/src/styles/components/projects/projectId/lookup-lists.module.css';
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useRouter } from "next/router";
import { ACTIONS_DROPDOWN_OPTIONS } from "@/src/util/components/projects/projectId/lookup-lists-helper";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { selectAllUsers, setComments } from "@/src/reduxStore/states/general";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";
import DeleteLookupListsModal from "./DeleteLookupListsModal";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";


export default function LookupListsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_LOOKUP_LIST));
    const allUsers = useSelector(selectAllUsers);
    const lookupLists = useSelector(selectAllLookupLists);
    const checkedLookupLists = useSelector(selectCheckedLookupLists);

    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);

    const [refetchLookupLists] = useLazyQuery(LOOKUP_LISTS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [createLookupListMut] = useMutation(CREATE_LOOKUP_LIST);
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });


    useEffect(() => {
        prepareSelectionList();
    }, [modalDelete]);

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.LOOKUP_LISTS_OVERVIEW, CurrentPage.LOOKUP_LISTS_DETAILS, CurrentPage.COMMENTS], projectId), []);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.KNOWLEDGE_BASE, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.LOOKUP_LISTS_OVERVIEW);
        CommentDataManager.registerCommentRequests(CurrentPage.LOOKUP_LISTS_OVERVIEW, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    useEffect(() => {
        if (!projectId) return;
        refetchLookupLists({ variables: { projectId: projectId } }).then((res) => {
            dispatch(setAllLookupLists(res.data["knowledgeBasesByProjectId"]));
        });
        WebSocketsService.subscribeToNotification(CurrentPage.LOOKUP_LISTS_OVERVIEW, {
            projectId: projectId,
            whitelist: ['knowledge_base_updated', 'knowledge_base_deleted', 'knowledge_base_created'],
            func: handleWebsocketNotification
        });
    }, [projectId]);

    function createLookupList() {
        createLookupListMut({ variables: { projectId: projectId } }).then((res) => {
            const lookupList = res.data?.createKnowledgeBase["knowledgeBase"];
            dispatch(extendAllLookupLists(lookupList));
            router.push(`/projects/${projectId}/lookup-lists/${lookupList.id}`);
        });
    }

    function executeOption(option: string) {
        switch (option) {
            case 'Select all':
                selectLookupLists(true);
                break;
            case 'Deselect all':
                selectLookupLists(false);
                break;
            case 'Delete selected':
                prepareSelectionList();
                dispatch(openModal(ModalEnum.DELETE_LOOKUP_LIST));
                break;
        }
    }

    function selectLookupLists(checked: boolean) {
        dispatch(setCheckedLookupLists(Array(checkedLookupLists.length).fill(checked)));
        prepareSelectionList();
    }

    function prepareSelectionList() {
        let selectionListFinal = '';
        let countSelected = 0;
        checkedLookupLists.forEach((checked, index) => {
            if (checked) {
                selectionListFinal += lookupLists[index].name;
                selectionListFinal += '\n';
                countSelected++;
            }
        });
        setCountSelected(countSelected)
        setSelectionList(selectionListFinal);
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['knowledge_base_updated', 'knowledge_base_deleted', 'knowledge_base_created'].includes(msgParts[1])) {
            refetchLookupLists({ variables: { projectId: projectId } }).then((res) => {
                dispatch(setAllLookupLists(res.data["knowledgeBasesByProjectId"]));
            });
        }
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.LOOKUP_LISTS_OVERVIEW, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);


    return (
        projectId ? (
            <div className="p-4 h-screen bg-gray-100 flex-1 flex flex-col">
                <div className="w-full ">
                    <div className="flex-shrink-0 block sm:flex justify-between items-center">
                        <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
                            Lookup lists
                        </div>
                        <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center">
                            {lookupLists && lookupLists.length > 0 ? (
                                // <Dropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, checkedLookupLists.every((checked) => !checked)]}
                                //     selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                                //     iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']} />
                                <Dropdown2 options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, checkedLookupLists.every((checked) => !checked)]}
                                    selectedOption={(option: any) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                                    iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']} />
                            ) : (
                                <Tooltip placement="left" content={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.ENABLE_ACTIONS} color="invert">
                                    <button type="button" disabled={true}
                                        className="mr-3 inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-1.5 bg-white text-xs font-medium text-gray-700 opacity-50 cursor-not-allowed focus:ring-offset-2 focus:ring-offset-gray-400"
                                        id="menu-button" aria-expanded="true" aria-haspopup="true">
                                        Actions
                                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                            fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            )}

                            <div className="flex justify-center overflow-visible">
                                <Tooltip placement="left" content={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.CREATE_LOOKUP_LIST} color="invert">
                                    <button onClick={createLookupList}
                                        className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        New list
                                    </button>
                                </Tooltip>

                            </div>

                            <div className="flex justify-center overflow-visible">
                                <Tooltip placement="left" content={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.NAVIGATE_HEURISTICS} color="invert">
                                    <button onClick={() => {
                                        router.push(`/projects/${projectId}/heuristics`)
                                    }} className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Heuristics
                                    </button>
                                </Tooltip>
                            </div>

                            <div className="flex justify-center overflow-visible">
                                <Tooltip placement="left" content={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.NAVIGATE_MODEL_CALLBACKS} color="invert">
                                    <button onClick={() => {
                                        router.push(`/projects/${projectId}/model-callbacks`)
                                    }} className=" bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Model callbacks
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    {lookupLists && lookupLists.length == 0 ? (
                        <div>
                            <div className="text-gray-500 font-normal mt-8">
                                <p className="text-xl leading-7">Seems like your project has no lookup list yet.</p>
                                <p className="text-base mt-3 leading-6">You can create one from the button New list in the bar above.
                                    Also, we got some quicklinks from our <a href="https://docs.kern.ai/" target="_blank"><span
                                        className="underline cursor-pointer">documentation</span></a>, if you want to dive deeper.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                                <div>
                                    <div className="text-gray-900 text-xl leading-7 font-semibold">Automatically building lookup lists
                                    </div>
                                    <div className="text-gray-500 text-base leading-6 font-normal mt-3">When you label for an extraction
                                        task, we automatically generate a lookup list with that label name. Also, each labeled span
                                        is going to be stored in that list. That way, you can just label your data, and we collect
                                        your entities.</div>
                                    <div
                                        className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                        <a href="https://docs.kern.ai/docs/building-labeling-functions#lookup-lists-for-distant-supervision"
                                            target="_blank">Read about lookup lists</a>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-900 text-xl leading-7 font-semibold">Building labeling functions using
                                        lookup lists</div>
                                    <div className="text-gray-500 text-base leading-6 font-normal mt-3">Labeling functions can be
                                        implemented to look up these lists, such that you don&apos;t need to maintain the function code,
                                        but can instead cover the lookup list. There are plenty other template functions, which you
                                        can check out in our public GitHub repository.</div>
                                    <div
                                        className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                        <a href="https://github.com/code-kern-ai/template-functions" target="_blank">Read about
                                            template functions</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (

                        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                            {lookupLists?.map((lookupList: LookupList, index: number) => (
                                <LookupListCard key={lookupList.id} lookupList={lookupList} index={index} />
                            ))}
                        </div>
                    )}
                    <DeleteLookupListsModal countSelected={countSelected} selectionList={selectionList} />
                </div>

            </div>
        ) : (<></>)
    )
}