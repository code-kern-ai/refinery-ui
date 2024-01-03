export type DeleteModelCallBacksModalProps = {
    countSelected: number;
    selectionList: string;
    checkedModelCallbacks: any[];
    modelCallBacks: any[];
    removeModelCallBack: (modelCallBackId: string) => void;
}