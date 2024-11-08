import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export class ConfigManager {

    private static config = null;

    public static refreshConfig() {
        jsonFetchWrapper(`${BACKEND_BASE_URI}/api/v1/misc/base-config-default`, FetchType.GET, r => {
            ConfigManager.config = r;
        });
    }

    public static getConfigValue(key: string, subKey: string = null): string | any {
        const value = ConfigManager.config[key];
        if (!subKey) return value;
        return ConfigManager.config[key][subKey]
    }

    public static isInit(): boolean {
        return ConfigManager.config;
    }

}
