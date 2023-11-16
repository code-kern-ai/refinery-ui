import Modal from "@/src/components/shared/modal/Modal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectConfiguration, updateConfigurationState } from "@/src/reduxStore/states/pages/data-browser";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";

export default function ConfigurationModal() {
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);

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

    function toggleSeparator() {
        if (configuration.separator === ',') {
            dispatch(updateConfigurationState('separator', '-'));
            dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));

        } else {
            dispatch(updateConfigurationState('separator', ','));
            dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }));

        }
    }

    return (<Modal modalName={ModalEnum.CONFIGURATION}>
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
            <div className="mt-3 text-sm text-gray-900 text-left">Select which separator you want to use for the IN operator</div>
            <div className="flex flex-row items-start mt-2 text-left">
                <input type="radio" checked={configuration.separator == ','} onChange={toggleSeparator} name="comma" id="comma"
                    className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                <label htmlFor="comma" className="ml-1 block text-sm font-medium text-gray-700 cursor-pointer">Comma(,)</label>
            </div>
            <div className="flex flex-row items-start mt-2 text-left">
                <input type="radio" checked={configuration.separator == '-'} onChange={toggleSeparator} name="dash" id="dash"
                    className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                <label htmlFor="dash" className="ml-1 block text-sm font-medium text-gray-700 cursor-pointer">Dash(-)</label>
            </div>
        </div >
    </Modal >
    )
}