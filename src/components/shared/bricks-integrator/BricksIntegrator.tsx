import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Modal, Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import BricksIntegratorModal from "./BricksIntegratorModal";
import { useEffect, useState } from "react";
import { BricksIntegratorProps, BricksSearchData, IntegratorPage } from "@/src/types/shared/bricks-integrator";
import { useDefaults } from "@/submodules/react-components/hooks/useDefaults";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { selectBricksIntegrator, selectIsAdmin, selectUser, setBricksIntegrator } from "@/src/reduxStore/states/general";
import { buildSearchUrl, filterMinVersion, getEmptyBricksIntegratorConfig, getGroupName } from "@/src/util/shared/bricks-integrator-helper";
import { PASS_ME, caesarCipher } from "@/src/util/components/projects/projectId/record-ide/record-ide-helper";
import { isStringTrue, jsonCopy, removeArrayFromArray } from "@/submodules/javascript-functions/general";
import { BricksCodeParser } from "@/src/util/classes/bricks-integrator/bricks-integrator";
import { GROUPS_TO_REMOVE, extendDummyElements } from "@/src/util/classes/bricks-integrator/dummy-nodes";
import { getBricksIntegrator } from "@/src/services/base/data-fetch";

const DEFAULTS = { forIde: false };

export default function BricksIntegrator(_props: BricksIntegratorProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);
    const isAdmin = useSelector(selectIsAdmin);
    const config = useSelector(selectBricksIntegrator);

    const [props] = useDefaults<BricksIntegratorProps>(_props, DEFAULTS);

    useEffect(() => {
        if (!projectId) return;
        if (typeof props.forIde === 'string') props.forIde = isStringTrue(props.forIde);
        initConfig();
    }, [projectId, props.forIde]);

    useEffect(() => {
        if (!config) return;
        requestSearch();
    }, [config?.querySourceSelectionRemote]);

    useEffect(() => {
        if (!config) return;
        checkCanAccept();
    }, [config?.page]);

    function openBricksIntegrator() {
        dispatch(openModal(ModalEnum.BRICKS_INTEGRATOR));
        checkCanAccept();
        requestSearch();
    }

    function initConfig() {
        dispatch(setBricksIntegrator(getEmptyBricksIntegratorConfig()));
        const localStrapiConfig = localStorage.getItem("localStrapiConfig");
        if (localStrapiConfig) {
            const unCiphered = JSON.parse(caesarCipher(localStrapiConfig, PASS_ME, true))
            const configCopy = { ...config };
            configCopy.querySourceSelectionLocalStrapiPort = unCiphered.strapiPort;
            configCopy.querySourceSelectionLocalBricksPort = unCiphered.bricksPort;
            configCopy.querySourceSelectionLocalStrapiToken = unCiphered.token;
        }
    }

    function checkCanAccept() {
        const configCopy = { ...config };
        switch (configCopy.page) {
            case IntegratorPage.SEARCH:
                configCopy.canAccept = configCopy.api.moduleId != null;
                break;
            case IntegratorPage.OVERVIEW:
            case IntegratorPage.INPUT_EXAMPLE:
                if (configCopy.api.moduleId == -1) configCopy.canAccept = !!configCopy.api.data.data.attributes.sourceCode;
                else configCopy.canAccept = !!configCopy.api.data;
                break;
            case IntegratorPage.INTEGRATION:
                configCopy.canAccept = configCopy.codeFullyPrepared && !BricksCodeParser.nameTaken && BricksCodeParser.functionName != "";
                break;
        }
    }

    function requestSearch() {
        const configCopy = jsonCopy(config);
        configCopy.search.requesting = true;
        configCopy.search.lastRequestUrl = buildSearchUrl(configCopy, props.moduleTypeFilter, props.executionTypeFilter);
        if (configCopy.search.currentRequest) configCopy.search.currentRequest.unsubscribe();

        let options = undefined;

        if (!configCopy.querySourceSelectionRemote) {
            options = {
                headers: {
                    "Authorization": `Bearer ${configCopy.querySourceSelectionLocalStrapiToken}`
                }
            };
            saveLocalConfig();
        }
        getBricksIntegrator(configCopy.search.lastRequestUrl, options?.headers, (data) => {
            if (!data) return;
            configCopy.extendedIntegrator = data.data.some(e => e.attributes.partOfGroup); //new field in integrator
            configCopy.search.requesting = false;
            configCopy.search.currentRequest = null;
            let finalData;
            if (configCopy.extendedIntegrator) {
                finalData = data.data.map(integratorData => {
                    const integratorDataCopy = jsonCopy(integratorData);
                    if (integratorData.attributes.partOfGroup) {
                        integratorDataCopy.attributes.partOfGroup = JSON.parse(integratorDataCopy.attributes.partOfGroup);
                        integratorDataCopy.attributes.partOfGroup = removeArrayFromArray(integratorDataCopy.attributes.partOfGroup, GROUPS_TO_REMOVE);
                    }
                    if (integratorData.attributes.availableFor) integratorDataCopy.attributes.availableFor = JSON.parse(integratorDataCopy.attributes.availableFor);
                    if (integratorData.attributes.integratorInputs) integratorDataCopy.attributes.integratorInputs = JSON.parse(integratorDataCopy.attributes.integratorInputs);
                    return integratorDataCopy;
                });
            } else finalData = data.data;
            if (props.executionTypeFilter) {
                const toFilter = props.executionTypeFilter.split(",");
                finalData = finalData.filter(e => toFilter.includes(e.attributes.executionType));
            }
            finalData = filterMinVersion(finalData);
            extendDummyElements(finalData, configCopy.extendedIntegrator, user, isAdmin);
            finalData = filterForExtendedIntegrator(finalData);
            configCopy.search.results = finalData;
            filterGroup();
            dispatch(setBricksIntegrator(configCopy));
        }, (error) => {
            console.log("error in search request", error);
            configCopy.search.requesting = false;
            configCopy.search.currentRequest = null;
        });
    }

    function saveLocalConfig() {
        const configCopy = { ...config }
        const localStrapiConfig = {
            querySourceSelectionRemote: configCopy.querySourceSelectionRemote,
            strapiPort: configCopy.querySourceSelectionLocalStrapiPort,
            bricksPort: configCopy.querySourceSelectionLocalBricksPort,
            token: configCopy.querySourceSelectionLocalStrapiToken
        };
        const ciphered = caesarCipher(JSON.stringify(localStrapiConfig), PASS_ME)
        localStorage.setItem("localStrapiConfig", ciphered);
    }

    function filterForExtendedIntegrator(data: any[]): any[] {
        addFilterPartOfGroup("all");
        for (let e of data) {
            if (!e.attributes.partOfGroup) continue;
            if (e.attributes.executionType && e.attributes.executionType != "activeLearner") e.attributes.partOfGroup.push(e.attributes.executionType);
            e.attributes.partOfGroup.forEach(group => addFilterPartOfGroup(group));
        }
        if (Object.keys(config.groupFilterOptions.filterValues).length < 2) return data;

        return data.filter(e => e.attributes.availableFor ? e.attributes.availableFor.includes("refinery") : true)

    }

    function addFilterPartOfGroup(key: string, forceNew: boolean = false) {
        const configCopy = jsonCopy(config);
        if (configCopy.groupFilterOptions.filterValues[key] && !forceNew) return;
        const name = getGroupName(key);
        configCopy.groupFilterOptions.filterValues[key] = { key: key, name: name, active: key == "all", countInGroup: -1 }
    }

    function filterGroup() {
        const configCopy = jsonCopy(config);
        configCopy.search.results.forEach(e => e.groupVisible = filterForGroup(e));
        requestSearchDebounce(configCopy.search.searchValue);
    }

    function filterForGroup(e: BricksSearchData): boolean {
        if (!config.extendedIntegrator) return true;
        const gRef = config.groupFilterOptions;
        const activeGroups = [];
        Object.keys(gRef.filterValues).forEach((x) => {
            if (gRef.filterValues[x].active) activeGroups.push(x);
        });
        if (!gRef.filterValues["all"]) return false;
        if (gRef.filterValues["all"].active) return true;
        if (!e.attributes.partOfGroup) return false;
        return activeGroups.every(group => e.attributes.partOfGroup.includes(group));
    }

    function requestSearchDebounce(value: string) {
        const configCopy = jsonCopy(config);
        //local search without requery
        if (!value) value = "";
        const searchFor = value.toLowerCase();
        configCopy.search.searchValue = searchFor;
        configCopy.search.results.forEach(e =>
            e.searchVisible = e.id.toString().startsWith(searchFor) ||
            e.attributes.name.toLowerCase().includes(searchFor) ||
            e.attributes.description.toLowerCase().includes(searchFor));
        configCopy.search.nothingMatches = !configCopy.search.results.find(e => e.searchVisible && e.groupVisible)
        countGroupEntries();
        //once real search is enabled change BricksIntegratorComponent.httpBaseLinkFilter & remove return
        return;
    }

    function countGroupEntries() {
        const configCopy = jsonCopy(config);
        const data = configCopy.groupFilterOptions.filterValues;
        for (const key in data) data[key].countInGroup = 0;

        for (let e of configCopy.search.results) {
            if (!e.attributes.partOfGroup) continue;
            if (!e.searchVisible) continue;
            e.attributes.partOfGroup.forEach(group => data[group].countInGroup++);
            data["all"].countInGroup++
        }
        configCopy.groupFilterOptions.filterValuesArray = []
        for (const key in data) if (data[key].countInGroup > 0 || data[key].active) configCopy.groupFilterOptions.filterValuesArray.push(data[key]);
        configCopy.groupFilterOptions.filterValuesArray.sort((a, b) => b.countInGroup - a.countInGroup || a.name.localeCompare(b.name));
    }

    function switchToPage(page: IntegratorPage) {
        const configCopy = jsonCopy(config);
        if (page == IntegratorPage.SEARCH || (config.api.requesting || config.api.data)) {
            configCopy.page = page;
            dispatch(setBricksIntegrator(configCopy));
        }
    }

    return (
        <div className="flex items-center">
            <Tooltip content={TOOLTIPS_DICT.GENERAL.OPEN_BRICKS_INTEGRATOR} placement="left" color="invert">
                <button onClick={openBricksIntegrator} id="bricks-integrator-open-button"
                    className="cursor-pointer bg-white text-gray-700 text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                    Search in bricks
                </button>
            </Tooltip>
            <BricksIntegratorModal
                requestSearch={requestSearch}
                switchToPage={(page: IntegratorPage) => switchToPage(page)}
                executionTypeFilter={props.executionTypeFilter} />
        </div>
    )
}
