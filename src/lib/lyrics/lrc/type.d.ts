export interface ParserScriptItem {
    start: number;
    text: string;
    words?: ScriptWordsItem[];
    translation?: string;
    singer?: string;
}

export interface IDTag {
    [key: string]: string;
}