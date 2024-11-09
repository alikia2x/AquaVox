export interface ScriptItem{
    end: number;
    chorus?: string;
    start: number;
    text: string;
    words?: LyricWord[];
    translation?: string;
    singer?: string;
}

export interface LyricWord {
    startTime: number;
    endTime: number;
    word: string;
    emptyBeat?: number;
}

export interface LyricMetadata {
    ar?: string;
    ti?: string;
    al?: string;
    au?: string;
    length?: string;
    offset?: string;
    tool?: string;
    ve?: string;
}

export interface LyricData extends LyricMetadata {
scripts?: ScriptItem[];

    [key: string]: any;
}