import { CurrentLabel, LabelColors, RenameLabelData } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { timer } from "rxjs";
import { COLOR_OPTIONS } from "../constants";

export class LabelHelper {
    private static ALLOWED_KEYS = "abcdefghijklmnopqrstuvwxyzöäüß<>|,.;:-_#'\"~+*?\\{}[]()=/&%$§!@^°€";

    public static labelColorOptions = [];
    public static labelingTaskColors: Map<string, string[]> = new Map<string, string[]>(); //still needed?
    public static labelHotkeyError: string;
    public static labelMap: Map<string, string[]> = new Map<string, string[]>();

    public static renameLabelData: RenameLabelData;

    public static setLabelColorOptions() {
        if (LabelHelper.labelColorOptions.length > 0) return;
        COLOR_OPTIONS.forEach(color => LabelHelper.labelColorOptions.push(LabelHelper.getColorStruct(color)));
    }

    public static addLabel(
        taskId: string,
        labelName: string,
    ): string {
        if (!labelName) return;
        if (!LabelHelper.isLabelNameUnique(taskId, labelName)) return;
        let labelColor = "yellow"
        let colorsInTask = this.labelingTaskColors.get(taskId);
        if (colorsInTask.length > 0) {
            const availableColors = COLOR_OPTIONS.filter(x => !colorsInTask.includes(x));
            if (availableColors.length > 0) {
                labelColor = availableColors[0]
                colorsInTask.push(labelColor);
                this.labelingTaskColors.set(taskId, colorsInTask);
            }
        } else {
            this.labelingTaskColors.set(taskId, [labelColor])
        }
        return labelColor;
    }

    public static extendLabelForColor(label: any): any {
        if (label.color) label.color = this.getColorStruct(label.color);
        return label;
    }

    private static getColorStruct(color: string): LabelColors {
        return {
            name: color,
            backgroundColor: LabelHelper.getBackgroundColor(color),
            textColor: LabelHelper.getTextColor(color),
            borderColor: LabelHelper.getBorderColor(color),
            hoverColor: LabelHelper.getHoverColor(color)
        }
    }

    public static openRenameLabel() {
        if (!LabelHelper.renameLabelData) {
            LabelHelper.renameLabelData = {
                checkResults: null,
                newLabelName: '',
                canCheck: false
            };
        }
    }

    public static checkInputRenameLabel(event: InputEvent, currentLabel: any) {
        const input = event.target as HTMLInputElement;
        this.renameLabelData.checkResults = null;
        this.renameLabelData.canCheck = this.isValidNewName(input.value);
        if (this.renameLabelData.canCheck && !this.isLabelNameUnique(currentLabel.taskId, input.value)) {
            this.renameLabelData.canCheck = false;
            this.renameLabelData.checkResults = { "errors": [{ "msg": "Label with name already exists" }], "warnings": [], "infos": [] };
        }
        this.renameLabelData.newLabelName = input.value;
    }
    private static isValidNewName(name: string): boolean {
        if (!name) return false;
        if (name.trim() == '') return false;
        return true;
    }

    public static updateLabelColor(labelingTaskId: string, oldLabelColor: string, newLabelColor: any) {
        let colorsInTask = this.labelingTaskColors.get(labelingTaskId);
        const index = colorsInTask.indexOf(oldLabelColor);
        if (index > -1) {
            colorsInTask.splice(index, 1); // 2nd parameter means remove one item only
        }
        colorsInTask.push(newLabelColor.name);
        this.labelingTaskColors.set(labelingTaskId, colorsInTask);
    }

    public static checkAndSetLabelHotkey(event: KeyboardEvent, currentLabel: any) {
        this.labelHotkeyError = null;
        const key = event.key.toLowerCase();
        if (key == currentLabel.hotkey) return;
        const usedHotkeys = this.getUsedHotkey();
        if (key == 'ArrowRight' || key == 'ArrowLeft') {
            this.labelHotkeyError = "Key " + key + " is used to navigate between records."
            return;
        } else if (usedHotkeys.includes(key)) {
            this.labelHotkeyError = "Key " + key + " is already in use."
            return;
        } else if ('123456789'.includes(key)) {
            this.labelHotkeyError = "Key " + key + " is used to switch between users."
            return;
        } else if (!this.isValidKey(key)) {
            this.labelHotkeyError = "Key " + key + " not in whitelist."
            return;
        }
        const currentLabelCopy = jsonCopy(currentLabel);
        currentLabelCopy.hotkey = this.labelHotkeyError ? "" : key;
        return currentLabelCopy;

    }

    public static isLabelNameUnique(taskId: string, name: string): boolean {
        if (name == '' || !taskId) return true;
        const trimmedName = name.trim();
        for (let label of this.labelMap.get(taskId)) {
            if (label['name'] == trimmedName) return false;
        }
        return true;
    }

    public static removeLabel(taskId: string, labelColor: string) {
        let colorsInTask = this.labelingTaskColors.get(taskId);

        const index = colorsInTask.indexOf(labelColor);
        if (index > -1) {
            colorsInTask.splice(index, 1); // 2nd parameter means remove one item only
        }
        this.labelingTaskColors.set(taskId, colorsInTask);
    }

    public static prepareSourceCode(sourceCode: string, function_name: string): string {
        return sourceCode.replace(
            'def lf(record):',
            'def ' + function_name + '(record):'
        );
    }

    private static isValidKey(key: string): boolean {
        return LabelHelper.ALLOWED_KEYS.includes(key.toLowerCase());
    }

    private static getUsedHotkey(): string[] {
        let usedHotkeys = [];
        this.labelMap.forEach((value, key) => {
            value.forEach((v: any) => {
                if (v.hotkey) usedHotkeys.push(v.hotkey);
            })
        })
        return usedHotkeys
    }

    private static getBackgroundColor(color: string): string {
        return `bg-${color}-100`
    }

    private static getTextColor(color: string): string {
        return `text-${color}-700`
    }

    private static getBorderColor(color: string): string {
        return `border-${color}-400`
    }

    private static getHoverColor(color: string): string {
        return `hover:bg-${color}-200`
    }
}