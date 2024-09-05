import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";
import { selectOrganization, setOrganization } from "@/src/reduxStore/states/general";
import { ConfigManager } from "@/src/services/base/config";
import { Configuration, LocalConfig } from "@/src/types/components/config/config"
import { snakeCaseToCamelCase } from "@/submodules/javascript-functions/case-types-parser";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux";
import { changeOrganization, getOrganization, updateConfig } from "@/src/services/base/organization";

export default function Config() {
    const dispatch = useDispatch();
    const organization = useSelector(selectOrganization);
    const tokenizerValues = useSelector(selectCachedValue(CacheEnum.TOKENIZER_VALUES));

    const [localConfig, setLocalConfig] = useState<LocalConfig>(null);
    const [configuration, setConfiguration] = useState<Configuration>(null);
    const [prepareTokenizedValues, setPrepareTokenizedValues] = useState<any[]>([]);
    const [preparedOptions, setPreparedOptions] = useState<any[]>([]);

    useEffect(() => {
        if (!ConfigManager.isInit()) return;
        setLocalConfig({
            allowDataTracking: ConfigManager.getConfigValue("allow_data_tracking"),
            limitChecks: ConfigManager.getConfigValue("limit_checks"),
            spacyDownloads: Array.from(ConfigManager.getConfigValue("spacy_downloads")),
        });
    }, [ConfigManager.isInit()]);

    useEffect(() => {
        if (!organization) return;
        setConfiguration({
            maxRows: organization.maxRows,
            maxCols: organization.maxCols,
            maxCharCount: organization.maxCharCount,
        });
    }, [organization]);

    useEffect(() => {
        if (!tokenizerValues || !localConfig) return;
        const tokenizerValuesDisplay = [...tokenizerValues];
        tokenizerValuesDisplay.forEach((tokenizer: any, index: number) => {
            const tokenizerNameContainsBrackets = tokenizer.name.includes('(') && tokenizer.name.includes(')');
            const tokenizerCopy = { ...tokenizer };
            tokenizerCopy.name = tokenizer.name + (tokenizer.configString != undefined && !tokenizerNameContainsBrackets ? ` (${tokenizer.configString})` : '');
            tokenizerValuesDisplay[index] = tokenizerCopy;
        });
        const filtered = tokenizerValuesDisplay.filter((tokenizer: any) => tokenizer.configString);
        setPrepareTokenizedValues(filtered);
        const removeDuplicates = filtered.filter((tokenizer: any) => !localConfig?.spacyDownloads.includes(tokenizer.configString));
        setPreparedOptions(removeDuplicates);
    }, [tokenizerValues, localConfig]);

    useEffect(() => {
        return () => {
            ConfigManager.refreshConfig();
        }
    }, []);

    function checkAndSaveValue(value: any, key: string, subkey: string = null) {
        if (key == "limit_checks") {
            if (Number(value) == organization[snakeCaseToCamelCase(subkey)]) return;
        } else if (ConfigManager.getConfigValue(key, subkey) == value) return;

        const updateDict: any = {};
        if (subkey) {
            updateDict[key] = {};
            if (key == "limit_checks") updateDict[key][subkey] = Number(value);
            else updateDict[key][subkey] = value;
        } else {
            updateDict[key] = value;
        }
        if (subkey == 'max_rows' || subkey == 'max_cols' || subkey == 'max_char_count') {
            changeOrganization(organization.id, JSON.stringify(updateDict.limit_checks), (res) => {
                if (!res?.data?.changeOrganization) {
                    window.alert('something went wrong with the update');
                } else {
                    getOrganization((res) => {
                        if (res.data["userOrganization"]) {
                            dispatch(setOrganization(res.data["userOrganization"]));
                        }
                    });
                }
            });
        } else {
            updateConfig(JSON.stringify(updateDict), (res) => {
                if (!res?.data?.updateConfig) {
                    window.alert('something went wrong with the update');
                }
            });
        }
    }

    function removeSpacyTokenizer(valueToRemove: string) {
        const localConfigCopy = { ...localConfig };
        localConfigCopy.spacyDownloads = localConfig.spacyDownloads.filter(i => i != valueToRemove);
        setLocalConfig(localConfigCopy);
        checkAndSaveValue(localConfigCopy.spacyDownloads, "spacy_downloads");

    }

    function changeConfigString(value: any, index: number) {
        const localConfigCopy = { ...localConfig };
        localConfigCopy.spacyDownloads[index] = value.name.split('(')[1].split(')')[0];
        setLocalConfig(localConfigCopy);
        checkAndSaveValue(localConfigCopy.spacyDownloads, "spacy_downloads");
    }

    function addSpacyConfig() {
        const existingConfigs = localConfig.spacyDownloads;
        for (const tok of preparedOptions) {
            if (!existingConfigs.includes(tok.configString)) {
                existingConfigs.push(tok.configString);
                checkAndSaveValue(existingConfigs, "spacy_downloads");
                const preparedOptionsCopy = [...preparedOptions];
                const index = preparedOptionsCopy.findIndex((tokenizer: any) => tokenizer.configString == tok.configString);
                preparedOptionsCopy.splice(index, 1);
                setPreparedOptions(preparedOptionsCopy);
                break;
            }
        }
    }

    function updateConfiguration(value: number, field: string) {
        const configurationCopy = { ...configuration };
        configurationCopy[field] = value;
        setConfiguration(configurationCopy);
    }

    return (<div className="h-screen bg-white py-6 px-4 space-y-6 sm:p-6">
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">Here, you can change application settings for your self-hosted version.</p>
        </div>
        {localConfig && <div className="grid grid-cols-2 gap-6 items-center" style={{ gridTemplateColumns: 'max-content min-content' }}>
            <div className="text-sm">
                <label className="font-medium text-gray-700">Max rows</label>
                <p className="text-gray-500">Maximum number of records per project.</p>
            </div>
            <input type="number" value={configuration.maxRows}
                className="h-8 w-32 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                onChange={(e) => {
                    checkAndSaveValue(e.target.value, 'limit_checks', 'max_rows');
                    updateConfiguration(Number(e.target.value), 'maxRows');
                }} />

            <div className="text-sm">
                <label className="font-medium text-gray-700">Max attributes</label>
                <p className="text-gray-500">Maximum number of attributes per project.</p>
            </div>
            <input type="number" value={configuration.maxCols}
                className="h-8 w-32 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                onChange={(e) => {
                    checkAndSaveValue(e.target.value, 'limit_checks', 'max_cols');
                    updateConfiguration(Number(e.target.value), 'maxCols');
                }} />

            <div className="text-sm">
                <label className="font-medium text-gray-700">Max characters</label>
                <p className="text-gray-500">Maximum number of characters per record.</p>
            </div>
            <input type="number" value={configuration.maxCharCount}
                className="h-8 w-32 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                onChange={(e) => {
                    checkAndSaveValue(e.target.value, 'limit_checks', 'max_char_count');
                    updateConfiguration(Number(e.target.value), 'maxCharCount');
                }} />

            <div className="h-full text-sm">
                <label htmlFor="candidates" className="font-medium text-gray-700">Available <span
                    className="font-dmMono">spaCy</span> language models</label>
                <p className="text-gray-500">Availability of spaCy language models. You can add new options.</p>
            </div>
            {localConfig.spacyDownloads && <div className="flex flex-col gap-y-2">
                {localConfig.spacyDownloads.map((myConfig, index) => <div key={myConfig} className="flex flex-row flex-nowrap gap-x-2 items-center">
                    <KernDropdown
                        options={preparedOptions}
                        buttonName={prepareTokenizedValues.find((tokenizer: any) => tokenizer.configString == myConfig)?.name}
                        selectedOption={(option) => changeConfigString(option, index)}
                        dropdownItemsClasses="max-h-80 overflow-y-auto"
                        buttonClasses="whitespace-nowrap"
                        dropdownWidth="w-72"
                        disabled={index < 2}
                    />
                    {index > 1 && <button className="px-1 inline-flex items-center">
                        <IconTrash onClick={() => removeSpacyTokenizer(myConfig)} className="h-6 w-6 text-red-700" />
                    </button>}
                </div>)}
                <div className="self-center relative" style={{ left: '-1.5rem' }}>
                    {tokenizerValues && localConfig.spacyDownloads.length < tokenizerValues.length &&
                        <button onClick={addSpacyConfig}
                            className="self-center inline-flex items-center px-0.5 py-0.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-700 bg-white focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                            <IconPlus className="h-5 w-5 text-gray-500" />
                        </button>
                    }
                </div>
            </div>}
        </div>}
    </div >)
}