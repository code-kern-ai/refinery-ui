import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { selectBricksIntegrator, setBricksIntegrator } from "@/src/reduxStore/states/general";
import { useEffect, useState } from "react";
import { selectModal } from "@/src/reduxStore/states/modal";
import { BricksIntegratorModalProps, IntegratorPage } from "@/src/types/shared/bricks-integrator";
import { IconRefresh } from "@tabler/icons-react";
import PageSearch from "./PageSearch";
import PageOverview from "./PageOverview";
import PageInputExample from "./PageInputExample";
import PageIntegration from "./PageIntegration";

const ACCEPT_BUTTON = { buttonCaption: '', useButton: true, disabled: false, closeAfterClick: false };

export default function BricksIntegratorModal(props: BricksIntegratorModalProps) {
    const dispatch = useDispatch();

    const config = useSelector(selectBricksIntegrator);
    const modalBricks = useSelector(selectModal(ModalEnum.BRICKS_INTEGRATOR));

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        if (!config || !modalBricks.open) return;
        setAcceptButton({
            ...acceptButton,
            useButton: config.page !== IntegratorPage.SEARCH,
            buttonCaption: config.page == IntegratorPage.INTEGRATION ? 'Finish up' : 'Proceed',
            disabled: !config.canAccept,
            emitFunction: props.optionClicked
        });
    }, [config, modalBricks]);

    function toggleLocation(remote: boolean) {
        const configCopy = { ...config };
        configCopy.querySourceSelectionRemote = remote;
        dispatch(setBricksIntegrator(configCopy));
    }

    function updateFieldConfig(e: any, field: string) {
        const configCopy = { ...config };
        configCopy[field] = e.target.value;
        dispatch(setBricksIntegrator(configCopy));
    }

    return (<Modal modalName={ModalEnum.BRICKS_INTEGRATOR} acceptButton={acceptButton}>
        {config && <>
            <div className="flex flex-row items-center justify-center gap-x-2">
                <span className="text-lg leading-6 text-gray-900 font-medium" onDoubleClick={() => {
                    const configCopy = { ...config };
                    configCopy.querySourceSelectionOpen = !configCopy.querySourceSelectionOpen;
                    dispatch(setBricksIntegrator(configCopy));
                }}>Bricks Integrator</span>
                {config.querySourceSelectionOpen && config.page == IntegratorPage.SEARCH && <div className="flex cursor-pointer items-center" onClick={props.requestSearch}>
                    <IconRefresh className="w-4 h-4" />
                </div>}
            </div>
            {config.querySourceSelectionOpen && config.page == IntegratorPage.SEARCH && <>
                <div className="flex flex-row flex-wrap justify-center w-full gap-x-2 gap-y-2">
                    <div className="flex flex-row items-start mt-2 text-left">
                        <input type="radio" checked={config.querySourceSelectionRemote} onChange={() => toggleLocation(true)} name="lineBreaks" id="remote"
                            className="focus:ring-blue-500 h-5 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                        <label htmlFor="remote" className="text-sm font-bold text-gray-900 cursor-pointer ml-2">Remote</label>
                    </div>
                    <div className="flex flex-row items-start mt-2 text-left">
                        <input type="radio" checked={!config.querySourceSelectionRemote} onChange={() => toggleLocation(false)} name="lineBreaks" id="local"
                            className="focus:ring-blue-500 h-5 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                        <label htmlFor="local" className="text-sm font-bold text-gray-900 cursor-pointer ml-2">Local</label>
                    </div>
                </div>
                {!config.querySourceSelectionRemote && <>
                    <div className="flex flex-row flex-wrap justify-center w-full gap-x-2 gap-y-2 my-1">
                        <div className="flex flex-row gap-x-2 items-center">
                            <label className="text-sm font-bold text-gray-900">Strapi Port</label>
                            <input type="number" step="1" style={{ outline: 'none', boxShadow: 'none' }}
                                className="h-9 w-16 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                value={config.querySourceSelectionLocalStrapiPort} autoComplete="off"
                                onInput={(e) => updateFieldConfig(e, 'querySourceSelectionLocalStrapiPort')} />
                        </div>
                        <div className="flex flex-row gap-x-2 items-center">
                            <label className="text-sm font-bold text-gray-900">Bricks Port</label>
                            <input type="number" step="1" style={{ outline: 'none', boxShadow: 'none' }}
                                className="h-9 w-20 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                value={config.querySourceSelectionLocalBricksPort} autoComplete="off"
                                onInput={(e) => updateFieldConfig(e, 'querySourceSelectionLocalBricksPort')} />
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-2 items-center mx-4">
                        <label className="text-sm font-bold text-gray-900 whitespace-nowrap">Strapi Token</label>
                        <input type="text" style={{ outline: 'none', boxShadow: 'none' }}
                            className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            value={config.querySourceSelectionLocalStrapiToken} autoComplete="off"
                            onChange={(e) => updateFieldConfig(e, 'querySourceSelectionLocalStrapiToken')}
                            onBlur={(e) => updateFieldConfig(e, 'querySourceSelectionLocalStrapiToken')} />
                    </div>
                </>}
            </>}
            <div className="flex justify-center">
                <div className="sm:block">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => props.switchToPage(IntegratorPage.SEARCH)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${config.page == IntegratorPage.SEARCH ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Search</button>
                            <button onClick={() => props.switchToPage(IntegratorPage.OVERVIEW)} disabled={!(config.api.requesting || config.api.data)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${config.page == IntegratorPage.OVERVIEW ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} disabled:cursor-not-allowed`}>Overview</button>
                            {props.executionTypeFilter != 'activeLearner' &&
                                <button onClick={() => props.switchToPage(IntegratorPage.INPUT_EXAMPLE)} disabled={!((config.api.requesting || config.api.data) && config.api.moduleId != -1)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${config.page == IntegratorPage.INPUT_EXAMPLE ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} disabled:cursor-not-allowed`}>Input example</button>}
                            <button onClick={() => props.switchToPage(IntegratorPage.INTEGRATION)} disabled={!(config.api.requesting || config.api.data)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${config.page == IntegratorPage.INTEGRATION ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} disabled:cursor-not-allowed`}>Integration</button>
                        </nav>
                    </div>
                </div>
            </div>
            <PageSearch
                requestSearchDebounce={(value) => props.requestSearchDebounce(value)}
                setGroupActive={(key: string) => props.setGroupActive(key)}
                selectSearchResult={(id: number) => props.selectSearchResult(id)} />
            <PageOverview
                setCodeTester={(code: string) => props.setCodeTester(code)} />
            <PageInputExample requestExample={props.requestExample} />
            <PageIntegration
                functionType={props.functionType}
                executionTypeFilter={props.executionTypeFilter}
                forIde={props.forIde}
                labelingTaskId={props.labelingTaskId}
                nameLookups={props.nameLookups}
                checkCanAccept={(configCopy) => props.checkCanAccept(configCopy)}
                selectDifferentTask={(taskId: string) => props.selectDifferentTask(taskId)} />
        </>}
    </Modal >
    )
}