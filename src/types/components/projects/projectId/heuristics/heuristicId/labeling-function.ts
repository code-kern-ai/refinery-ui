import { Attribute } from "../../settings/data-schema";

export type SampleRecordProps = {
    sampleRecords: SampleRecord;
    selectedAttribute: string;
}

export type SampleRecord = {
    records: any[];
    codeHasErrors: boolean;
    containerLogs: any;
}