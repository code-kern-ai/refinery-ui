import { selectProject } from "@/src/reduxStore/states/project";
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { extendAllLookupLists, selectAllLookupLists, selectCheckedLookupLists, setAllLookupLists, setCheckedLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { Tooltip } from "@nextui-org/react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import Modal from "@/src/components/shared/modal/Modal";
import { useLazyQuery, useMutation } from "@apollo/client";
import { LOOKUP_LISTS_BY_PROJECT_ID } from "@/src/services/gql/queries/lookup-lists";
import { CREATE_LOOKUP_LIST, DELETE_LOOKUP_LIST } from "@/src/services/gql/mutations/lookup-lists";
import { LookupListBE } from "@/src/types/components/projects/projectId/lookup-lists/lookup-lists";
import { LookupListCard } from "./LookupListCard";
import style from '../../../../styles/lookup-lists.module.css'
import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";

export const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];

export default function LookupListsOverview() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const lookupLists = useSelector(selectAllLookupLists);
    const checkedLookupLists = useSelector(selectCheckedLookupLists);

    const [getLookupLists] = useLazyQuery(LOOKUP_LISTS_BY_PROJECT_ID);
    const [createLookupListMut] = useMutation(CREATE_LOOKUP_LIST);
    const [deleteLookupListMut] = useMutation(DELETE_LOOKUP_LIST);

    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);
    const [abortButton, setAbortButton] = useState({
        useButton: true, buttonCaption: "Delete", disabled: false, closeAfterClick: true, emitFunction: () => { deleteLookupLists() }
    });

    useEffect(() => {
        if (!project) return;
        getLookupLists({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setAllLookupLists(res.data["knowledgeBasesByProjectId"]));
        });
    }, [project]);

    function createLookupList() {
        createLookupListMut({ variables: { projectId: project.id } }).then((res) => {
            const lookupList = res.data?.createKnowledgeBase["knowledgeBase"];
            dispatch(extendAllLookupLists(lookupList));
            const newURL = `http://localhost:4455/refinery/projects/${project.id}/lookup-lists/${lookupList.id}`
            window.parent.postMessage({ newURL }, `http://localhost:4455/refinery/projects/${project.id}/lookup-lists`);
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

    function deleteLookupLists() {
        checkedLookupLists.forEach((checked, index) => {
            if (checked) {
                const lookupList = lookupLists[index];
                deleteLookupListMut({
                    variables: {
                        projectId: project?.id,
                        lookupListId: lookupList.id
                    }
                }).then((res) => {

                });
            }
        });
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

    return (
        project?.id ? (
            <div className="p-4 h-screen bg-gray-100 flex-1 flex flex-col">
                <div className="w-full ">
                    <div className="flex-shrink-0 block sm:flex justify-between items-center">
                        <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
                            Lookup lists
                        </div>
                        <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center">
                            {lookupLists && lookupLists.length > 0 ? (
                                <Dropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, checkedLookupLists.every((checked) => !checked)]}
                                    selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} />
                            ) : (
                                <Tooltip placement="left" content="At least one lookup list is needed to enable actions" color="invert">
                                    <button type="button"
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
                                <Tooltip placement="left" content="Create a new lookup list" color="invert">
                                    <button onClick={createLookupList}
                                        className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        New list
                                    </button>
                                </Tooltip>

                            </div>

                            <div className="flex justify-center overflow-visible">
                                <Tooltip placement="left" content="Go to heuristics overview" color="invert">
                                    <button onClick={() => {
                                        const newURL = `http://localhost:4455/refinery/projects/${project.id}/heuristics`
                                        window.parent.postMessage({ newURL }, `http://localhost:4455/refinery/projects/${project.id}/lookup-lists`);
                                    }} className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Heuristics
                                    </button>
                                </Tooltip>
                            </div>

                            <div className="flex justify-center overflow-visible">
                                <Tooltip placement="left" content="Go to the model callbacks" color="invert">
                                    <button onClick={() => {
                                        const newURL = `http://localhost:4455/refinery/projects/${project.id}/model-callbacks`
                                        window.parent.postMessage({ newURL }, `http://localhost:4455/refinery/projects/${project.id}/lookup-lists`);
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
                            {lookupLists?.map((lookupList: LookupListBE, index: number) => (
                                <LookupListCard key={lookupList.id} lookupList={lookupList} index={index} />
                            ))}
                        </div>
                    )}
                    <Modal modalName={ModalEnum.DELETE_LOOKUP_LIST} abortButton={abortButton}>
                        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
                        <div className="text-sm text-gray-500 my-2 flex flex-col">
                            <span>Are you sure you want to delete selected lookup {countSelected <= 1 ? 'list' : 'lists'}?</span>
                            <span>Currently selected {countSelected <= 1 ? 'is' : 'are'}:</span>
                            <span className="whitespace-pre-line font-bold">{selectionList}</span>
                        </div>
                    </Modal>
                </div>

            </div>
        ) : (<></>)
    )
}