import Modal from "@/src/components/shared/modal/Modal";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { removeFromAllDataSlicesById, selectConfiguration, updateConfigurationState } from "@/src/reduxStore/states/pages/data-browser";
import { selectProject } from "@/src/reduxStore/states/project";
import { DELETE_DATA_SLICE } from "@/src/services/gql/mutations/data-browser";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { parseLinkFromText } from "@/src/util/shared/link-parser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DataBrowserModals() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const isManaged = useSelector(selectIsManaged);
    const modalSliceInfo = useSelector(selectModal(ModalEnum.DATA_SLICE_INFO));
    const modalDeleteSlice = useSelector(selectModal(ModalEnum.DELETE_SLICE));
    const modalUserInfo = useSelector(selectModal(ModalEnum.USER_INFO));
    const configuration = useSelector(selectConfiguration);

    const [deleteDataSliceMut] = useMutation(DELETE_DATA_SLICE);

    const deleteDataSlice = useCallback(() => {
        deleteDataSliceMut({ variables: { projectId: project.id, dataSliceId: modalDeleteSlice.sliceId } }).then((res) => {
            dispatch(removeFromAllDataSlicesById(modalDeleteSlice.sliceId));
        });
    }, [modalDeleteSlice.sliceId]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteDataSlice });
    }, [deleteDataSlice]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    function testLink(link) {
        const linkData = parseLinkFromText(link);
        router.push(linkData.route, { query: linkData.queryParams });
    }

    function toggleConfigurationOption(field: string) {
        dispatch(updateConfigurationState(field, !configuration[field]));
        dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));
    }

    function toggleLineBreaks() {
        if (configuration.lineBreaks == LineBreaksType.IS_PRE_WRAP || configuration.lineBreaks == LineBreaksType.IS_PRE_LINE) {
            dispatch(updateConfigurationState('lineBreaks', LineBreaksType.NORMAL));
            dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));

        } else {
            dispatch(updateConfigurationState('lineBreaks', LineBreaksType.IS_PRE_WRAP));
            dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));

        }
    }

    function toggleLineBreaksPreWrap() {
        if (configuration.lineBreaks === LineBreaksType.IS_PRE_WRAP) {
            dispatch(updateConfigurationState('lineBreaks', LineBreaksType.IS_PRE_LINE));
            dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));

        } else if (configuration.lineBreaks === LineBreaksType.IS_PRE_LINE) {
            dispatch(updateConfigurationState('lineBreaks', LineBreaksType.IS_PRE_WRAP));
            dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));

        }
    }

    return (<>
        <Modal modalName={ModalEnum.DELETE_SLICE} abortButton={abortButton}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">Warning</h1>
            <div className="text-sm text-gray-500 my-2 text-center">
                Are you sure you want to delete this data slice?
            </div>
        </Modal>

        <Modal modalName={ModalEnum.DATA_SLICE_INFO}>
            <div className="flex flex-grow justify-center mb-4 font-bold">Slice information</div>
            {modalSliceInfo.sliceInfo && Object.entries(modalSliceInfo.sliceInfo).map(([key, value]: any) => (
                <Fragment key={key}>
                    {key == "Link" ? (<div>
                        <div className="mt-3 flex rounded-md">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">{value.startsWith("https") ? 'https://' : 'http://'}</span>
                            <Tooltip content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top">
                                <span onClick={() => copyToClipboard(value + '?pos=1&type=DATA_SLICE')}
                                    className="cursor-pointer tooltip border rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    {value.substring(value.startsWith("https") ? 8 : 7)}</span>
                            </Tooltip>
                        </div>
                        <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.ONLY_MANAGED} color="invert" placement="right">
                            <button onClick={() => testLink(value + '?pos=1&type=DATA_SLICE')} disabled={!isManaged}
                                className="mt-3 opacity-100 w-40 bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                View as expert
                            </button>
                        </Tooltip>
                    </div>) : (<div className="flex flex-grow justify-between gap-8">
                        <p>{key}</p>
                        <p>{value}</p>
                    </div>)}
                </Fragment>
            ))}
        </Modal>

        <Modal modalName={ModalEnum.USER_INFO}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">Info</h1>
            {modalUserInfo && modalUserInfo.userInfo && <div className="flex-grow items-center flex flex-col mb-2">
                <div className="mb-4">{modalUserInfo.userInfo.mail}</div>
                {!modalUserInfo.userInfo.countSum && <div className="text-gray-500 italic"> No labels associated with this user.</div>}
                <div className="grid gap-x-4 gap-y-2" style={{ gridTemplateColumns: 'max-content max-content' }}>
                    {modalUserInfo.userInfo.counts && modalUserInfo.userInfo.counts.map((pair) => (<div key={pair.source} className="contents">
                        <div className="text-base text-gray-900 font-semibold">{pair.source}</div>
                        <div className="text-base text-gray-500 font-normal">{pair.count + ' record' + (pair.count > 1 ? 's' : '')}</div>
                    </div>))}
                    {modalUserInfo.userInfo.counts > 1 && <div className="contents">
                        <div className="text-base text-gray-900 font-semibold mt-2">Sum</div>
                        <div className="text-base text-gray-500 font-normal mt-2">{modalUserInfo.userInfo.countSum + ' record' + (modalUserInfo.userInfo.countSum > 1 ? 's' : '')}</div>
                    </div>}
                </div>
            </div>}
        </Modal>

        <Modal modalName={ModalEnum.CONFIGURATION}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">View configuration </div>
            <div className="mb-2 flex flex-grow justify-center text-sm">Change the content that is displayed in the browser.</div>
            <div className="mb-2">
                <fieldset className="space-y-5">
                    <div className="relative flex items-start text-left">
                        <div className="flex items-center h-5">
                            <input id="comments" type="checkbox" onChange={(e) => {
                                toggleConfigurationOption('highlightText');
                            }} checked={configuration.highlightText}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
                        </div>
                        <div className="ml-3 text-sm cursor-pointer">
                            <label className="font-medium text-gray-700 cursor-pointer">Highlight text</label>
                            <p id="comments-description" className="text-gray-500">During search, you can remove the text highlighting. This makes the search a bit faster.</p>
                        </div>
                    </div>
                    <div className="relative flex items-start text-left">
                        <div className="flex items-center h-5">
                            <input id="comments" type="checkbox" onChange={() => toggleConfigurationOption('weakSupervisionRelated')} checked={configuration.weakSupervisionRelated}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
                        </div>
                        <div className="ml-3 text-sm cursor-pointer" >
                            <label className="font-medium text-gray-700 cursor-pointer">Only show weakly supervised-related</label>
                            <p id="comments-description" className="text-gray-500">If checked, the data-browser will only show you heuristics that affect the weak supervision.</p>
                        </div>
                    </div>
                    <div className="relative flex items-start text-left">
                        <div className="flex items-center h-5">
                            <input id="comments" type="checkbox" onChange={toggleLineBreaks} checked={configuration.lineBreaks != LineBreaksType.NORMAL}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
                        </div>
                        <div className="ml-3 text-sm cursor-pointer">
                            <label className="font-medium text-gray-700 cursor-pointer">Visible line breaks</label>
                            <p className="text-gray-500">If checked, the attributes in the data-browser and labeling page will be shown with line breaks</p>
                        </div>
                    </div>
                    {configuration.lineBreaks != LineBreaksType.NORMAL && <div className="px-10">
                        <div className="flex flex-row items-start mt-2 text-left">
                            <input type="radio" checked={configuration.lineBreaks == LineBreaksType.IS_PRE_WRAP} onChange={toggleLineBreaksPreWrap} name="lineBreaks" id="preWrap"
                                className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                            <label htmlFor="preWrap" className="ml-1 block text-sm font-medium text-gray-700 cursor-pointer">
                                <span>Pre-wrap</span>
                                <p className="text-gray-500 text-sm cursor-pointer">Preserves whitespace and line breaks </p>
                            </label>
                        </div>
                        <div className="flex flex-row items-start mt-2 text-left">
                            <input type="radio" checked={configuration.lineBreaks == LineBreaksType.IS_PRE_LINE} onChange={toggleLineBreaksPreWrap} name="lineBreaks" id="preLine"
                                className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                            <label htmlFor="preLine" className="ml-1 block text-sm font-medium text-gray-700 cursor-pointer">
                                <span>Pre-line</span>
                                <p className="text-gray-500 text-sm cursor-pointer">Collapses multiple whitespaces and line breaks into a single space </p>
                            </label>
                        </div>
                    </div>}
                </fieldset>
            </div >
        </Modal >

        <Modal modalName={ModalEnum.RECORD_COMMENTS}></Modal>
    </>)
}