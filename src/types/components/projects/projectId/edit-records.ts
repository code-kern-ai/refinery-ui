import { Attribute } from "./settings/data-schema"

export type EditRecordSessionData = {
    records: any[],
    selectedRecordId: string,
    attributes: any[],
}

export type EditRecordComponentData = {
    projectId: string,
    loading: boolean,
    navBar: {
        nextDisabled: boolean,
        prevDisabled: boolean,
        positionString: string,
    },
    columnClass: string,
    modals: {
        hideExplainModal: boolean
    }
    data?: EditRecordSessionData,
    editRecordId?: string,
    displayRecords?: any[],
    syncing: boolean,
    errors: string[],
    cachedRecordChanges: {
        [accessKey: string]: {
            recordId: string,
            attributeName: string,
            newValue: any,
            subKey?: number,
            //only for display frontend, remove before sending to backend
            display: {
                record: string,
                oldValue: string,
                subKeyAdd?: string,
            }
        }
    },
}

export type NavBarTopEditRecordsProps = {
    erdData: EditRecordComponentData;
    setErdData: (erdData: EditRecordComponentData) => void;
};

export type EditFieldProps = {
    erdData: EditRecordComponentData;
    attribute: Attribute;
    record: any;
    subKey?: number;
    setErdData: (erdData: EditRecordComponentData) => void;
}

export type ExplainModalProps = {
    erdData: EditRecordComponentData;
    setErdData: (erdData: EditRecordComponentData) => void;
}

export type SyncRecordsModalProps = {
    erdData: EditRecordComponentData;
    setErdData: (erdData: EditRecordComponentData) => void;
}