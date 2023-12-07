export type ChartData = {
    group: string;
    values: { name: string; value: number; color: string }[];
};

export type LabelDistribution = {
    labelId: string;
    labelName: string;
    ratioScaleManually: number;
    absoluteScaleManually: number;
    ratioScaleProgrammatically: number;
    absoluteScaleProgrammatically: number;
}