import type { ParserScriptItem } from "./lrc/type";

export interface ScriptItem extends ParserScriptItem {
    end: number;
    chorus?: string;
}

export interface ScriptWordsItem {
    start: number;
    end: number;
    beginIndex: number;
    endIndex: number;
}

export interface LrcMetaData {
    ar?: string;
    ti?: string;
    al?: string;
    au?: string;
    length?: string;
    offset?: string;
    tool?: string;
    ve?: string;
}

export interface ParsedLrc extends LrcMetaData {
    scripts?: ParserScriptItem[];

    [key: string]: any;
}

export interface LrcJsonData extends LrcMetaData {
    scripts?: ScriptItem[];

    [key: string]: any;
}