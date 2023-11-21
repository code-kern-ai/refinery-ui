import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ComponentType, LabelingSuiteSettings, LabelingSuiteTaskHeaderLabelSettings } from "@/src/types/components/projects/projectId/labeling/settings";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { enumToArray, transferNestedDict } from "@/submodules/javascript-functions/general";

export class SettingManager {
    static localStorageKey = "labelingSuiteSettings";
    public static settings: LabelingSuiteSettings;

    public hoverColorOptions;
    public hoverColorClassArray;

    public static loadSettings(projectId: string) {
        this.settings = this.getDefaultLabelingSuiteSettings();
        let tmp = localStorage.getItem(SettingManager.localStorageKey);
        if (tmp) {
            const tmpSettings = JSON.parse(tmp);
            //to ensure new setting values exist and old ones are loaded if matching name
            transferNestedDict(tmpSettings, this.settings);
            if (tmpSettings.task) {
                transferNestedDict(tmpSettings.task, this.settings.task, false);
            }
        }
        if (!this.settings.task[projectId]) this.settings.task[projectId] = {};
        this.settings.main.lineBreaks = this.getLineBreakValue();
    }

    private static getLineBreakValue(): LineBreaksType {
        // Special case - line breaks get synchronized with the data browser
        let lineBreaks = localStorage.getItem("lineBreaks");
        if (lineBreaks) return JSON.parse(lineBreaks);
        else return LineBreaksType.NORMAL;
    }

    public static saveSettings() {
        localStorage.setItem(SettingManager.localStorageKey, JSON.stringify(this.settings));
        localStorage.setItem("lineBreaks", JSON.stringify(this.settings.main.lineBreaks));
    }

    public static setDefaultSettings(projectId: string) {
        const tmpSettings = this.getDefaultLabelingSuiteSettings();
        transferNestedDict(tmpSettings, this.settings);
        for (let taskId in this.settings.task[projectId]) {
            for (let labelId in this.settings.task[projectId][taskId]) {
                this.settings.task[projectId][taskId][labelId] = this.getDefaultTaskOverviewLabelSettings();
            }
        }
    }

    public static changeSetting(componentType: ComponentType, settingsPath: string, value?: any) {
        let settings;
        switch (componentType) {
            case ComponentType.MAIN:
                settings = this.settings.main;
                break;
            case ComponentType.OVERVIEW_TABLE:
                settings = this.settings.overviewTable;
                break;
            case ComponentType.LABELING:
                settings = this.settings.labeling;
                break;
            case ComponentType.TASK_HEADER:
                settings = this.settings.task;
                break;
        }
        if (!settings) return;
        const keyParts = settingsPath.split('.');
        const lastKey = keyParts.pop();
        for (const key of keyParts) {
            if (!settings[key]) return;
            settings = settings[key];
        }

        const currentValue = settings[lastKey];
        if (currentValue != value) {
            if (value === undefined) {
                if (typeof currentValue === "boolean") value = !currentValue;
                else throw Error("something isn't right")
            }
            settings[lastKey] = value;
        }
        this.saveSettings();
    }


    private static getDefaultLabelingSuiteSettings(): LabelingSuiteSettings {
        return {
            main: {
                autoNextRecord: false,
                hoverGroupBackgroundColor: "green",
                hoverGroupBackgroundColorClass: "bg-green-100",
                lineBreaks: this.getLineBreakValue()
            },
            overviewTable: {
                show: true,
                showHeuristics: true,
                includeLabelDisplaySettings: true,
            },
            task: {
                show: true,
                isCollapsed: false,
                alwaysShowQuickButtons: true,
            },
            labeling: {
                showNLabelButton: 5,
                showTaskNames: true,
                showHeuristicConfidence: false,
                compactClassificationLabelDisplay: true,
                swimLaneExtractionDisplay: false,
                closeLabelBoxAfterLabel: true,
            }
        }
    }

    public static getDefaultTaskOverviewLabelSettings(): LabelingSuiteTaskHeaderLabelSettings {
        return {
            showManual: true,
            showWeakSupervision: true,
            showModel: false,
            showHeuristics: false,
        }
    }
}
