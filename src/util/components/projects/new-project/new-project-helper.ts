import { ConfigManager } from "@/src/services/base/config";

export function checkWhitelistTokenizer(tokenizer: any[], isManaged: boolean) {
    tokenizer = Array.from(tokenizer);
    const allowedConfigs = ConfigManager.getConfigValue("spacy_downloads");
    for (let i = 0; i < tokenizer.length; i++) {
        tokenizer[i] = { ...tokenizer[i] };
        tokenizer[i].disabled = !allowedConfigs.includes(tokenizer[i].configString);
    }
    tokenizer.sort((a, b) => (+a.disabled) - (+b.disabled) || a.configString.localeCompare(b.configString));

    let firstNotAvailable = true;
    let insertPos = -1;
    for (let i = 0; i < tokenizer.length; i++) {
        const t = tokenizer[i];
        if (t.disabled) {
            if (firstNotAvailable) {
                insertPos = i;
                firstNotAvailable = false;
            }
        } else t.disabled = false;
    }

    if (insertPos != -1) {
        tokenizer.splice(insertPos, 0, { disabled: true, name: "-----------------------------------------" });
        if (isManaged) {
            tokenizer.splice(insertPos, 0, { disabled: true, name: "if you need the options below feel free to contact us", configString: "email" });
        } else {
            tokenizer.splice(insertPos, 0, { disabled: true, name: "add further options on config page" });
        }
        tokenizer.splice(insertPos, 0, { disabled: true, name: "-----------------------------------------" });
    }

    return tokenizer
}