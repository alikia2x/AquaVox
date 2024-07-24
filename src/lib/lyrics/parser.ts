export interface ScriptItem {
    start: number;
    text: string;
    end: number;
    translation?: string;
    words?: ScriptWordsItem[];
    singer?: number;
    chorus?: string;
}

export interface ScriptWordsItem {
    start: number;
    end: number;
    beginIndex: number;
    endIndex: number;
}

export interface LrcJsonData {
    ar?: string;
    ti?: string;
    al?: string;
    scripts?: ScriptItem[];

    [key: string]: any;
}

interface IDTag {
    [key: string]: string;
}

export function splitLine(str: string) {
    return str.split('\n').filter((str) => str.trim() !== '');
}

export function ExtractIDTags(lines: string[]) {
    let result: IDTag = {};
    const IDTagRegex = /^\[(\w*): (.*?)]$/;
    let lastMatch = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matchResult = line.trim().match(IDTagRegex);
        if (matchResult && matchResult.length == 3) {
            const tagName = matchResult[1];
            const tagValue = matchResult[2];
            result[tagName] = tagValue;
        }
    }
    return result;
}