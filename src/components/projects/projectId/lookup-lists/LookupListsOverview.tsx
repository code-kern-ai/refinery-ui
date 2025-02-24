import { selectProjectId } from "@/src/reduxStore/states/project";
import React, { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { extendAllLookupLists, selectAllLookupLists, selectCheckedLookupLists, setAllLookupLists, setCheckedLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { Tooltip } from "@nextui-org/react";
import { LookupList } from "@/src/types/components/projects/projectId/lookup-lists";
import { LookupListCard } from "./LookupListCard";
import style from '@/src/styles/components/projects/projectId/lookup-lists.module.css';
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useRouter } from "next/router";
import { ACTIONS_DROPDOWN_OPTIONS } from "@/src/util/components/projects/projectId/lookup-lists-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { selectAllUsers, selectOrganizationId, setComments } from "@/src/reduxStore/states/general";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";
import DeleteLookupListsModal from "./DeleteLookupListsModal";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getAllComments } from "@/src/services/base/comment";
import { createKnowledgeBase, getLookupListsByProjectId } from "@/src/services/base/lookup-lists";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { ChevronDownIcon } from "@heroicons/react/20/solid";


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

    useEffect(() => {
        prepareSelectionList();
    }, [modalDelete]);

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
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    useEffect(() => {
        if (!projectId) return;
        getLookupListsByProjectId(projectId, (res) => {
            dispatch(setAllLookupLists(res));
        });
    }, [projectId]);

    function createLookupList() {
        createKnowledgeBase(projectId, (res) => {
            dispatch(extendAllLookupLists(res));
            router.push(`/projects/${projectId}/lookup-lists/${res?.id}`);
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
            getLookupListsByProjectId(projectId, (res) => {
                dispatch(setAllLookupLists(res));
            });
        }
    }, [projectId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.LOOKUP_LISTS_OVERVIEW, handleWebsocketNotification, projectId);

    return (
        projectId ? (
            <div className="p-4 h-full bg-gray-100 flex-1 flex flex-col">
                <div className="w-full ">
                    <div className="flex-shrink-0 block sm:flex justify-between items-center">
                        <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
                            Lookup lists
                        </div>
                        <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center">
                            {lookupLists && lookupLists.length > 0 ? (
                                <KernDropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, checkedLookupLists.every((checked) => !checked)]}
                                    selectedOption={(option: any) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                                    iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']} />
                            ) : (
                                <KernButton
                                    onClick={() => { }}
                                    className="mr-3"
                                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.ENABLE_ACTIONS}
                                    disabled={true}
                                    text="Actions"
                                    tooltipPlacement="top"
                                    icon={ChevronDownIcon}
                                />
                            )}

                            <div className="flex justify-center overflow-visible">
                                <KernButton
                                    text="New list"
                                    onClick={createLookupList}
                                    className="mr-3"
                                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.CREATE_LOOKUP_LIST}
                                    tooltipPlacement="left"
                                />
                            </div>

                            <div className="flex justify-center overflow-visible">
                                <KernButton
                                    text="Heuristics"
                                    onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${projectId}/heuristics`) }}
                                    className="mr-3"
                                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_OVERVIEW.NAVIGATE_HEURISTICS}
                                    tooltipPlacement="left"
                                />
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