export type TableDisplayData = {
    hoverGroups: {
        type: string,
        task: string,
        label: string,
        createdBy: string,
        rlaId: string,
    },
    orderPos: number,
    orderPosSec: number,
    sourceType: string,
    sourceTypeKey: string,
    taskName: string,
    createdBy: string,
    label: {
        name: string,
        value: string,
        backgroundColor: string,
        textColor: string,
        borderColor: string,
    },
    rla: any
}

export type HeaderHover = {
    class: string,
    typeCollection: string,
    taskCollection: string,
    labelCollection: string,
    createdByCollection: string,
    rlaCollection: string,
}