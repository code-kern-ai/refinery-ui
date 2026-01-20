import { DataTypeEnum } from "@/src/types/shared/general"

export enum DataBlocksColumnsExamples {
    DC_EMPTY_TEMPLATE
}

export class DataBlocksColumnsCodeLookup {
    static getDataBlocksColumnsTemplate(l: DataBlocksColumnsExamples, dataType: string) {
        switch (l) {
            case DataBlocksColumnsExamples.DC_EMPTY_TEMPLATE: {
                switch (dataType) {
                    case DataTypeEnum.CATEGORY: return {
                        code: `def ac(record):
    # e.g. categorize the records conditional on the text length of a string attribute
    text_length = len(record["str_attribute"].text)
    if text_length < 35:
        return "short"
    elif text_length < 70:
        return "normal"
    else:
        return "long"
                    `}
                    case DataTypeEnum.TEXT: return {
                        code: `def ac(record):
    # e.g. transform the string attribute to lower case
    return record["str_attribute"].text.lower()
                    `}
                    case DataTypeEnum.BOOLEAN: return {
                        code: `def ac(record):
    # e.g. does the string attribute contain a digit
    return any([token.is_digit for token in record["str_attribute"]])
                    `}
                    case DataTypeEnum.INTEGER: return {
                        code: `def ac(record):
    # e.g. length of the longest word in string attribute
    word_length = [len(word) for word in record["str_attribute"]]
    return max(word_length)
                    `}
                    case DataTypeEnum.FLOAT: return {
                        code: `def ac(record):
    # e.g. mean number of chars per word
    words = record["str_attribute"].text.split()
    num_words = len(words)
    sum_word_lengths = sum([len(word) for word in words])
    return sum_word_lengths / num_words
                    `}
                    case DataTypeEnum.LLM_RESPONSE: return {
                        code: `                  
async def ac(record):
    # no post processing of answer

    llm_response = await get_llm_response()
    return llm_response.get("result") or "no result provided"
                    `
                    }
                    default: return {
                        code: `def ac(record):
    return "Hello World"
                    `
                    }
                }
            }
        }
    }

    static isCodeStillTemplate(code: string, dataType: string): boolean {

        return DataBlocksColumnsCodeLookup.getDataBlocksColumnsTemplate(DataBlocksColumnsExamples.DC_EMPTY_TEMPLATE, dataType).code.trim() == code.trim();
    }
}