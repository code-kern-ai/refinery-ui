
//currently included python types are: int, float, str, bool, list

import { BricksExpectedLabels, BricksIntegratorConfig, BricksVariable, BricksVariableType, IntegratorInput, RefineryDataType, SelectionType, StringBoolean } from "@/src/types/shared/bricks-integrator";
import { capitalizeFirst, capitalizeFirstForClassName } from "@/submodules/javascript-functions/case-types-parser";
import { getPythonClassName, getPythonFunctionName, toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import { bricksVariableNeedsTaskId, canHaveDefaultValue, getChoiceType, getEmptyBricksExpectedLabels, getEmptyBricksVariable } from "../../shared/bricks-integrator-helper";
import { DummyNodes, getAddInfo, getSelectionType } from "./dummy-nodes";
import { isStringTrue } from "@/submodules/javascript-functions/general";
import { BricksVariableComment, isCommentTrue } from "./comment-lookup";

export class BricksCodeParser {
    public static errors: string[] = [];
    public static variables: BricksVariable[] = [];
    public static globalComments: string[];
    public static baseCode: string;
    public static functionName: string;
    public static filterTypes: string[];
    public static labelingTaskName: string;

    public static labelingTasks: any[];
    public static expected: BricksExpectedLabels = getEmptyBricksExpectedLabels();
    public static nameTaken: boolean = false;

    public static integratorInputRef: IntegratorInput;// undefined if old bricks version


    // constructor(private base: BricksIntegratorComponent) {
    //     this.filterTypes = enumToArray(BricksVariableType).filter(x => x != BricksVariableType.UNKNOWN && !x.startsWith("GENERIC"));
    // }

    public static prepareCode(config: BricksIntegratorConfig, executionTypeFilter: string, nameLookups: string[], labelingTaskId: string, forIde: boolean = false) {
        this.errors = [];
        this.expected = getEmptyBricksExpectedLabels();
        if (!config.api.data) return;
        this.integratorInputRef = config.api.data.data.attributes.integratorInputs;
        if (this.integratorInputRef) this.baseCode = config.api.data.data.attributes.sourceCodeRefinery;
        else this.baseCode = config.api.data.data.attributes.sourceCode;

        this.globalComments = this.collectGlobalComment();
        this.functionName = this.getFunctionName(executionTypeFilter);
        this.checkFunctionNameAndSet(this.functionName, config, executionTypeFilter, nameLookups, labelingTaskId, forIde);
        this.checkVariableLines(config, executionTypeFilter, labelingTaskId, forIde);
        // if (this.base.labelingTaskId) {
        //     this.labelingTaskName = this.base.dataRequestor.getLabelingTaskAttribute(this.base.labelingTaskId, 'name');
        //     const taskType = this.base.dataRequestor.getLabelingTaskAttribute(this.base.labelingTaskId, 'taskType');
        //     this.labelingTasks = this.base.dataRequestor.getLabelingTasks(taskType);
        // }
        if (config.api.data.data.id == DummyNodes.CODE_PARSER) this.parseJsonCode(config, labelingTaskId);
    }

    private static checkVariableLines(config: BricksIntegratorConfig, executionTypeFilter: string, labelingTaskId: string, forIde: boolean = false) {
        const variableLines = this.collectVariableLinesFromCode(config);

        if (variableLines.length == 0) {
            config.preparedCode = this.baseCode;
            config.codeFullyPrepared = true;
        }
        try {
            this.variables = this.parseVariableLines(variableLines);
            this.checkAndMatchVariables(forIde);
            this.replaceVariables(config, executionTypeFilter, labelingTaskId, forIde);
        } catch (error: any) {
            this.errors.push(error);
            console.log("couldn't parse code", error);
        }
    }

    private static checkAndMatchVariables(forIde: boolean = false) {
        if (!this.integratorInputRef) return;

        if (this.variables.length != Object.keys(this.integratorInputRef.variables).length) {
            this.errors.push("different number of variable lines in code and integrator input detected");
        }
        if (this.integratorInputRef.outputs) {
            // if (this.base.labelingTaskId) {

            //     this.expected.expectedTaskLabels = [];
            //     const existingLabels = this.base.dataRequestor.getLabels(this.base.labelingTaskId);
            //     for (const label of this.integratorInputRef.outputs) {
            //         const existingLabel = existingLabels.find(x => x.name == label);
            //         this.expected.expectedTaskLabels.push({
            //             label: label,
            //             exists: !!existingLabel,
            //             backgroundColor: 'bg-' + (existingLabel ? existingLabel.color : 'gray') + '-100',
            //             textColor: 'text-' + (existingLabel ? existingLabel.color : 'gray') + '-700',
            //             borderColor: 'border-' + (existingLabel ? existingLabel.color : 'gray') + '-400'
            //         });
            //     }
            //     this.expected.expectedTaskLabels.sort((a, b) => (-a.exists) - (-b.exists) || a.label.localeCompare(b.label));
            //     this.expected.labelsToBeCreated = this.expected.expectedTaskLabels.filter(x => !x.exists).length;
            //     this.expected.labelWarning = !this.expected.expectedTaskLabels[this.expected.expectedTaskLabels.length - 1].exists;
            //     this.expected.canCreateTask = this.base.dataRequestor.getLabelingTaskAttribute(this.base.labelingTaskId, 'taskType') == 'MULTICLASS_CLASSIFICATION';
            // } else {
            //     if (!this.globalComments.some(x => x.startsWith("Will return"))) {
            //         this.globalComments.push("Will return: [\"" + this.integratorInputRef.outputs.join("\", \"") + "\"]");
            //     }
            // }
        }

        for (const variable of this.variables) {
            if (!(variable.baseName in this.integratorInputRef.variables)) {
                this.errors.push(`Variable ${variable.baseName} in code is not defined in integrator input`);
                continue;
            }
            const inputV = this.integratorInputRef.variables[variable.baseName];
            if (inputV.description) variable.comment = inputV.description;
            if (inputV.optional) variable.optional = isStringTrue(inputV.optional);
            if (inputV.acceptsMultiple) variable.canMultipleValues = isStringTrue(inputV.acceptsMultiple);
            if (inputV.defaultValue && inputV.addInfo) {
                if (!inputV.addInfo.some(x => !canHaveDefaultValue(x.toUpperCase() as BricksVariableType)) && canHaveDefaultValue(variable.type)) {
                    variable.values[0] = inputV.defaultValue;
                }
            }

            //setting to choice afterwards, because it is not in addInfo & values need to be prepared
            if (inputV.selectionType == SelectionType.CHOICE) {
                const newType = getChoiceType(inputV.selectionType, inputV.addInfo);
                if (newType != BricksVariableType.UNKNOWN && newType != variable.type) {
                    if (newType == BricksVariableType.GENERIC_CHOICE) {
                        if (!inputV.allowedValues) {
                            this.errors.push(`Variable ${variable.baseName} in code is of type choice, but allowed values are not provided`);
                        } else {
                            variable.type = newType;
                            variable.allowedValues = inputV.allowedValues;
                        }
                    } else {
                        if (newType == BricksVariableType.LABEL && forIde) {
                            variable.type = BricksVariableType.GENERIC_STRING;
                            variable.values[0] = inputV.defaultValue;
                        } else {
                            variable.type = newType;
                            variable.allowedValues = this.getAllowedValues(variable.type, variable.comment);
                        }
                    }
                }
            } else if (inputV.selectionType == SelectionType.RANGE) {
                if (!inputV.allowedValueRange || inputV.allowedValueRange.length != 2) {
                    this.errors.push(`Variable ${variable.baseName} is of type range but allowedValueRange is not provided`);
                    continue;
                }
                variable.type = BricksVariableType.GENERIC_RANGE;
                variable.allowedValues = inputV.allowedValueRange; // e.g. [0,100]
            }

        }
    }

    private static getFunctionName(executionTypeFilter: string) {
        const parsedName = executionTypeFilter == "activeLearner" ? getPythonClassName(this.baseCode) : getPythonFunctionName(this.baseCode);
        if (this.integratorInputRef) {
            const providedName = this.integratorInputRef.name;
            if (parsedName != providedName) {
                this.errors.push(`Function name in code (${parsedName}) does not match name in integrator input (${providedName})`);
            }
            return providedName;
        }
        return parsedName;
    }

    public static replaceVariables(config: BricksIntegratorConfig, executionTypeFilter: string, labelingTaskId: string, forIde: boolean = false) {
        let replacedCode = this.replaceFunctionLine(this.baseCode, executionTypeFilter);
        for (let i = 0; i < this.variables.length; i++) {
            const variable = this.variables[i];
            this.prepareReplaceLine(variable);
            replacedCode = replacedCode.replace(variable.line, variable.replacedLine);
        }
        config.preparedCode = replacedCode;
        this.extendCodeForRecordIde(config, forIde);
        this.extendCodeForLabelMapping(config, executionTypeFilter);
        config.codeFullyPrepared = this.variables.every(v => v.optional || (v.values.length > 0 && v.values.every(va => va != null)));
        config.canAccept = config.codeFullyPrepared && !this.nameTaken && this.functionName != "";
        if (config.api.data.data.id == DummyNodes.CODE_PARSER) this.parseJsonCode(config, labelingTaskId);
    }

    private static parseJsonCode(config: BricksIntegratorConfig, labelingTaskId: string = null) {
        let finalString = "integrator_inputs=";
        const json: any = {
            name: this.functionName,
            refineryDataType: config.prepareJsonAsPythonEnum ? "RefineryDataType.TEXT.value" : RefineryDataType.TEXT, //currently fix text since up until now all were interpreted as text
        }
        if (this.expected.expectedTaskLabels.length > 0) {
            json.outputs = this.expected.expectedTaskLabels.map(x => x.label);
        } else if (!labelingTaskId) {
            //expectedTaskLabels can only be filled if task id is given
            let nextUp = false;
            for (let comment of this.globalComments) {
                if (comment.startsWith("Will return")) nextUp = true;
                if (nextUp) {
                    const labelStringMatch = comment.match(/\[(.*?)\]/);
                    if (labelStringMatch && labelStringMatch.length > 1) {
                        json.outputs = labelStringMatch[1].split(",").map(x => x.replace(/\"/g, "").trim());
                        break;
                    }
                }
            }

        }
        if (this.globalComments.length > 0) {
            const remainingComments = [];
            for (let i = 0; i < this.globalComments.length; i++) {
                if (this.globalComments[i].startsWith("Will return")) i++;
                else remainingComments.push(this.globalComments[i]);
            }
            if (remainingComments.length > 0) json.globalComment = remainingComments.join("\n");
        }
        if (this.variables.length > 0) {
            json.variables = {};
            for (const variable of this.variables) {
                const element: any = { selectionType: getSelectionType(variable.type, config.prepareJsonAsPythonEnum) };
                if (variable.values.length > 0 && variable.values[0] != null) element.defaultValue = variable.values[0];
                let vComment = variable.comment;
                if (vComment) {
                    vComment = vComment.replace("only text attributes", "").trim();
                    if (vComment.length > 0) element.description = vComment;
                }
                if (variable.optional) element.optional = StringBoolean.TRUE;
                else element.optional = StringBoolean.FALSE;

                const addInfo = getAddInfo(variable.type, config.prepareJsonAsPythonEnum);
                if (addInfo && addInfo.length > 0) element.addInfo = addInfo;
                if (config.prepareJsonRemoveYOUR) json.variables[variable.baseName.substring(5)] = element;
                else json.variables[variable.baseName] = element;
            }
        }
        finalString += JSON.stringify(json, null, 4);


        if (config.prepareJsonAsPythonEnum) {
            finalString = finalString.replace(/"(\w+\.\w+\.\w+)"/g, "$1")
        }

        config.preparedJson = finalString;

    }


    private static parseExpectedLabelsComment(comment: string, labelingTaskId: string = null): string {
        if (!comment) return "";
        const labelStringMatch = comment.match(/\[(.*?)\]/);
        if (labelingTaskId) {
            if (labelStringMatch && labelStringMatch.length > 1) {
                const labels = labelStringMatch[1].split(",").map(x => x.replace(/\"/g, "").trim());
                if (labels && labels.length > 0) {

                    // this.expected.expectedTaskLabels = [];
                    // const existingLabels = this.base.dataRequestor.getLabels(this.base.labelingTaskId);
                    // for (const label of labels) {
                    //     const existingLabel = existingLabels.find(x => x.name == label);
                    //     this.expected.expectedTaskLabels.push({
                    //         label: label,
                    //         exists: !!existingLabel,
                    //         backgroundColor: 'bg-' + (existingLabel ? existingLabel.color : 'gray') + '-100',
                    //         textColor: 'text-' + (existingLabel ? existingLabel.color : 'gray') + '-700',
                    //         borderColor: 'border-' + (existingLabel ? existingLabel.color : 'gray') + '-400'
                    //     });
                    // }
                    // this.expected.expectedTaskLabels.sort((a, b) => (-a.exists) - (-b.exists) || a.label.localeCompare(b.label));
                    // this.expected.labelsToBeCreated = this.expected.expectedTaskLabels.filter(x => !x.exists).length;
                    // this.expected.labelWarning = !this.expected.expectedTaskLabels[this.expected.expectedTaskLabels.length - 1].exists;
                    // this.expected.canCreateTask = this.base.dataRequestor.getLabelingTaskAttribute(this.base.labelingTaskId, 'taskType') == 'MULTICLASS_CLASSIFICATION';
                }
                return ""; //task creation logic handled differently
            }
        } else {
            if (labelStringMatch && labelStringMatch.length > 0) {
                return "Will return " + labelStringMatch[0];
            }
        }
        return comment;
    }

    public static activeLabelMapping(config: BricksIntegratorConfig, executionTypeFilter: string, labelingTaskId: string, forIde: boolean) {
        // this.expected.availableLabels = this.base.dataRequestor.getLabels(this.base.labelingTaskId);
        this.expected.labelMappingActive = true;
        for (const label of this.expected.expectedTaskLabels) {
            label.mappedLabel = label.exists ? label.label : null;
        }
        this.replaceVariables(config, executionTypeFilter, labelingTaskId, forIde);
    }

    private static extendCodeForLabelMapping(config: BricksIntegratorConfig, executionTypeFilter: string) {
        if (!this.expected.labelMappingActive) return;
        if (this.functionName == null || this.functionName == "@@unknown@@") return;
        const isExtractor = config.api.data.data.attributes.moduleType == "extractor";

        const currentFunctionLine = this.getCurrentFunctionLine(config, executionTypeFilter);
        if (!currentFunctionLine) {
            console.log("couldn't find function line");
            return;
        }

        let functionWrapper = currentFunctionLine + "\n";
        functionWrapper += "    #this is a wrapper to map the labels according to your specifications\n";
        if (isExtractor) {
            functionWrapper += "    for (result, start, end) in bricks_base_function(record):\n";
        } else {
            functionWrapper += "    result = bricks_base_function(record)\n";
        }
        functionWrapper += (isExtractor ? "    " : "") + "    if result in my_custom_mapping:\n";
        functionWrapper += (isExtractor ? "    " : "") + "        result = my_custom_mapping[result]\n";
        let mappingDict = "\n#generated by the bricks integrator\n";
        mappingDict += "my_custom_mapping = {\n";
        for (const label of this.expected.expectedTaskLabels) {
            if (label.mappedLabel != label.label) {
                if (label.mappedLabel == null) {
                    mappingDict += '    "' + label.label + '":None';
                } else {
                    mappingDict += '    "' + label.label + '":"' + label.mappedLabel + '"';
                }
                mappingDict += ",\n";
            }

        }
        mappingDict += "}";
        functionWrapper += (isExtractor ? "    " : "") + "    if result:\n";
        if (isExtractor) {
            functionWrapper += "            yield (result, start, end)\n";
        }
        else {
            functionWrapper += "        return result\n";
        }
        functionWrapper += "\ndef bricks_base_function(record):";
        config.preparedCode = config.preparedCode.replace(currentFunctionLine, functionWrapper) + mappingDict;
    }


    private static getCurrentFunctionLine(config: BricksIntegratorConfig, executionTypeFilter: string): string {
        const lines = config.preparedCode.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (executionTypeFilter == "activeLearner") {
                if (line.startsWith('class ' + this.functionName)) {
                    return line;
                }
            } else {
                if (line.startsWith('def ' + this.functionName + '(record')) {
                    return line;
                }
            }
        }
        return null;
    }

    private static getIndexFunctionLine(code: string, executionTypeFilter: string): number {
        const lines = code.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            let functionNameBase = null;
            if (executionTypeFilter == "activeLearner") {
                functionNameBase = getPythonClassName(line);
                if (line.startsWith('class ' + functionNameBase)) {
                    return i;
                }
            } else {
                functionNameBase = getPythonFunctionName(line);
                if (line.startsWith('def ' + functionNameBase + '(record')) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static extendCodeForRecordIde(config: BricksIntegratorConfig, forIde: boolean = false) {
        if (!forIde) return;
        if (this.functionName == null || this.functionName == "@@unknown@@") return;
        const isExtractor = config.api.data.data.attributes.moduleType == "extractor";
        let printReturn = "\n\nprint(\"Record: \", record) \nprint(\"Result: \", ";
        if (isExtractor) {
            printReturn += "[v for v in " + this.functionName + "(record)])"
        } else {
            printReturn += this.functionName + "(record))"
        }
        config.preparedCode += printReturn;
    }

    private static collectGlobalComment(): string[] {
        const lines = this.baseCode.split("\n");
        const commentLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("def ")) break;
            if (line.startsWith("#")) {
                let tmpLine = line.replace("#", "").trim();
                if (isCommentTrue(tmpLine, BricksVariableComment.TASK_REQUIRED_LABELS)) {
                    tmpLine = this.parseExpectedLabelsComment(tmpLine);
                }
                const idx = tmpLine.indexOf("[");
                if (idx > 0) {
                    const parts = tmpLine.split("[").map((x, i) => (i == 0 ? x : "[" + x).trim());
                    commentLines.push(...parts);
                }
                else commentLines.push(tmpLine);
            }
        }
        if (this.integratorInputRef && this.integratorInputRef.globalComment) this.integratorInputRef.globalComment.split("\n").forEach(x => commentLines.push(x));

        return commentLines.filter(x => x.trim() != "");
    }

    private static prepareReplaceLine(variable: BricksVariable) {
        variable.replacedLine = variable.baseName;
        if (variable.pythonType) variable.replacedLine += ": " + variable.pythonType;
        variable.replacedLine += " = " + this.getValueString(variable);
        if (variable.comment) variable.replacedLine += " #" + variable.comment;

    }

    private static getValueString(variable: BricksVariable): string {
        const realValues = variable.values.filter(v => v != null);
        if (realValues.length == 0) return "None";
        if (realValues.length == 1) {
            const v = this.getPythonVariable(realValues[0], variable.pythonType, variable.type);
            if (variable.canMultipleValues) return "[" + v + "]";
            return v;
        }
        return "[" + realValues.map(x => this.getPythonVariable(x, variable.pythonType, variable.type)).join(",") + "]";
    }

    private static getPythonVariable(value: string, pythonType: string, bricksType: BricksVariableType) {
        if (value == null) return "None";
        if (bricksType == BricksVariableType.GENERIC_BOOLEAN) {
            if (value.toLowerCase() == "none") return "None";
            if (isStringTrue(value)) return "True";
            return "False";
        }
        if (bricksType == BricksVariableType.LOOKUP_LIST) return "knowledge." + value;
        if (bricksType == BricksVariableType.REGEX) return "r\"" + value + "\"";
        if (pythonType.includes("str")) return "\"" + value + "\"";

        return value;
    }

    private static collectVariableLinesFromCode(config: BricksIntegratorConfig): string[] {
        if (this.integratorInputRef || (config.api.moduleId < 0 && config.extendedIntegratorNewParse)) {
            //new version doesn't start with YOUR_
            const lines = this.baseCode.split("\n");
            const variableLines = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith("def ")) break;
                if (line.includes("import")) continue; //import lines
                if (line.trim().startsWith("#")) continue; //comment lines
                if (line.trim().length == 0) continue; //empty lines
                if (line[0].match(/[^A-Z]/)) continue;//not a python constant (reads as every not A-Z -> so my_var would be ignored)
                variableLines.push(line);
            }
            return variableLines;
        } else {
            const lines = this.baseCode.split("\n");
            const variableLines = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith("def ")) break;
                if (line.startsWith("YOUR_")) variableLines.push(line);
            }
            return variableLines;
        }

    }

    private static parseVariableLines(variableLines: string[]): BricksVariable[] {
        const variables = [];
        for (let i = 0; i < variableLines.length; i++) {
            const line = variableLines[i];
            const variable = this.parseVariableLine(line);
            variables.push(variable);
        }
        return variables;
    }

    private static parseVariableLine(line: string, labelingTaskId: string = null): BricksVariable {
        const variable = getEmptyBricksVariable();
        variable.line = line;
        variable.baseName = variable.line.split("=")[0].split(":")[0].trim();
        if (this.integratorInputRef) variable.displayName = capitalizeFirst(variable.baseName);
        else variable.displayName = capitalizeFirst(variable.baseName.substring(5));
        variable.pythonType = line.split(":")[1].split("=")[0].trim();
        variable.canMultipleValues = variable.pythonType.toLowerCase().includes("list");
        variable.type = this.getVariableType(variable, labelingTaskId);
        const comment = line.split("#");
        if (comment.length > 1) {
            comment.shift();
            variable.comment = comment.join("#");
        }
        variable.allowedValues = this.getAllowedValues(variable.type, variable.comment);
        variable.optional = isCommentTrue(variable.comment, BricksVariableComment.GLOBAL_OPTIONAL);
        variable.values = this.getValues(variable);
        this.setAddOptions(variable);
        return variable;
    }

    private static getValues(variable: BricksVariable): any[] {
        //parse variable value
        if (variable.type.startsWith("GENERIC_") || variable.type == BricksVariableType.REGEX) {

            const value = variable.line.split("=")[1].split("#")[0].trim();
            if (value == "None") return [null];
            if (value == "[]") return [null];
            if (value.charAt(0) == "[") {
                return value.substring(1, value.length - 1).split(",").map(x => this.parseValue(x.trimStart(), variable.pythonType));
            } else {
                return [this.parseValue(value, variable.pythonType)];
            }
        } else return [null];
    }
    private static parseValue(value: string, pythonType: string): any {
        if (value.startsWith("r\"")) value = value.substring(1); //remove r for regex
        value = value.replace(/"/g, "");
        if (pythonType.includes("int")) return parseInt(value);
        if (pythonType.includes("float")) return parseFloat(value);
        return value;
    }

    private static setAddOptions(variable: BricksVariable) {
        if (variable.type == BricksVariableType.GENERIC_BOOLEAN) {
            variable.options.colors = [];
            variable.values.forEach(e => variable.options.colors.push(e == "True" ? "#2563eb" : (e == "False" ? "#ef4444" : null)));
        }
    }

    private static getVariableType(variable: BricksVariable, labelingTaskId: string): BricksVariableType {
        //first try find a specific type
        const types = this.filterTypes;
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (!labelingTaskId && bricksVariableNeedsTaskId(type as BricksVariableType)) continue;
            if (variable.baseName.includes(type)) return type as BricksVariableType;
        }
        //if no specific type is found, try to find a generic type
        if (variable.pythonType.includes("int")) return BricksVariableType.GENERIC_INT;
        else if (variable.pythonType.includes("float")) return BricksVariableType.GENERIC_FLOAT;
        else if (variable.pythonType.includes("str")) return BricksVariableType.GENERIC_STRING;
        else if (variable.pythonType.includes("bool")) return BricksVariableType.GENERIC_BOOLEAN;

        return BricksVariableType.UNKNOWN;

    }

    private static getAllowedValues(forType: BricksVariableType, comment: string): any {
        // switch (forType) {
        //     case BricksVariableType.LANGUAGE:
        //         const allLanguages = isCommentTrue(comment, BricksVariableComment.LANGUAGE_ALL);
        //         return this.base.dataRequestor.getIsoCodes(!allLanguages);
        //     case BricksVariableType.ATTRIBUTE:
        //         if (isCommentTrue(comment, BricksVariableComment.ATTRIBUTE_ONLY_TEXT_LIKE)) return this.base.dataRequestor.getAttributes(['TEXT', 'CATEGORY']);
        //         else if (isCommentTrue(comment, BricksVariableComment.ATTRIBUTE_ONLY_TEXT)) return this.base.dataRequestor.getAttributes(['TEXT']);
        //         return this.base.dataRequestor.getAttributes(null);
        //     case BricksVariableType.LABELING_TASK:
        //         let typeFilter = null;
        //         if (isCommentTrue(comment, BricksVariableComment.LABELING_TASK_ONLY_CLASSIFICATION)) typeFilter = 'MULTICLASS_CLASSIFICATION';
        //         else if (isCommentTrue(comment, BricksVariableComment.LABELING_TASK_ONLY_EXTRACTION)) typeFilter = 'INFORMATION_EXTRACTION';
        //         return this.base.dataRequestor.getLabelingTasks(typeFilter);
        //     case BricksVariableType.LABEL:
        //         if (!this.base.labelingTaskId) {
        //             console.log("no labeling task id given -> can't collect allowed labels");
        //             return;
        //         }
        //         return this.base.dataRequestor.getLabels(this.base.labelingTaskId);
        //     case BricksVariableType.EMBEDDING:
        //         if (!this.base.labelingTaskId) {
        //             return this.base.dataRequestor.getEmbeddings();
        //         }
        //         return this.base.dataRequestor.getEmbeddings(this.base.labelingTaskId);
        //     case BricksVariableType.LOOKUP_LIST:
        //         return this.base.dataRequestor.getLookupLists();
        //     default:
        //         return null;
        // }
    }

    private static checkFunctionNameAndSet(name: string, config: BricksIntegratorConfig, executionTypeFilter: string, nameLookups: string[], labelingTaskId: string = null, forIde: boolean = false) {
        this.nameTaken = !!(nameLookups?.find(x => x == name));
        name = executionTypeFilter == "activeLearner" ? capitalizeFirstForClassName(name) : toPythonFunctionName(name);
        if (config.preparedCode) {
            this.functionName = name;
            this.replaceVariables(config, executionTypeFilter, labelingTaskId, forIde);
        }
        // this.base.checkCanAccept();
    }

    private static replaceFunctionLine(code: string, executionTypeFilter: string): string {
        let replacedCode = code;
        const idxReplace = this.getIndexFunctionLine(code, executionTypeFilter);
        if (idxReplace == -1) return replacedCode;
        const splitBase = code.split("\n");
        const getPythonName = executionTypeFilter == "activeLearner" ? getPythonClassName(splitBase[idxReplace]) : getPythonFunctionName(splitBase[idxReplace]);
        splitBase[idxReplace] = splitBase[idxReplace]?.replace(getPythonName, this.functionName);
        return splitBase.join("\n");
    }
}