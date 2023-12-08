export type NotificationListWrapper = {
    highlightMe: boolean;
    array: any[];
};

export enum NotificationLevel {
    WARNING = 'WARNING',
    SUCCESS = 'SUCCESS',
    INFO = 'INFO',
    ERROR = 'ERROR',
}

export type NotificationDataProps = {
    textColor: string;
    notification: any;
};