import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";

export class ConfigManager {

    private static config = null;

    public static refreshConfig() {
        jsonFetchWrapper('/config/base_config', FetchType.GET, r => {
            ConfigManager.config = r;
        });
    }

    public static getConfigValue(key: string, subKey: string = null): string | any {
        const value = ConfigManager.config[key];
        if (!subKey) return value;
        return ConfigManager.config[key][subKey]
    }

}
