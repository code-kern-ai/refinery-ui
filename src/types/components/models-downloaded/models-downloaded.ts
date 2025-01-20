import { ModelsDownloadedStatus } from "@/submodules/javascript-functions/enums/enums";

export type ModelsDownloaded = {
    date: string;
    link?: string;
    name: string;
    revision?: string;
    size?: number;
    status: ModelsDownloadedStatus;
    sizeFormatted?: string;
    parseDate?: string;
    prio?: number;
};
