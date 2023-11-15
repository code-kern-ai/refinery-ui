export type HighlightProps = {
    text: string;
    regex: RegExp[] | RegExp;
    searchFor: string[] | string;
    matchCase: boolean | string;
    searchForExtended: HighlightSearch[];
    highlightClass: string;
    additionalClasses: string[];
};

export type RegexDisplay = {
    text: string,
    isMatch: boolean
};

export type RegexMatch = {
    start: number,
    end: number
};

export type HighlightSearch = {
    searchFor?: string,
    matchCase?: boolean
    regex?: RegExp
}