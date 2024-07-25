import {
    alt_sc,
    apply,
    buildLexer,
    expectEOF,
    fail,
    kmid,
    opt_sc,
    rep,
    rep_sc,
    seq,
    str,
    tok,
    type Parser,
    type Token
} from 'typescript-parsec';

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

function convertTimeToMs({
    mins,
    secs,
    decimals
}: {
    mins?: number | string;
    secs?: number | string;
    decimals?: string;
}) {
    let result = 0;
    if (mins) {
        result += Number(mins) * 60 * 1000;
    }
    if (secs) {
        result += Number(secs) * 1000;
    }
    if (decimals) {
        const denom = Math.pow(10, decimals.length);
        result += Number(decimals) / (denom / 1000);
    }
    return result;
}

const digit = Array.from({ length: 10 }, (_, i) => apply(str(i.toString()), (_) => i)).reduce(
    (acc, cur) => alt_sc(cur, acc),
    fail('no alternatives')
);
const numStr = apply(rep_sc(digit), (r) => r.join(''));
const num = apply(numStr, (r) => parseInt(r));
const alpha = alt_sc(
    Array.from({ length: 26 }, (_, i) =>
        apply(str(String.fromCharCode('a'.charCodeAt(0) + i)), (_) => String.fromCharCode('a'.charCodeAt(0) + i))
    ).reduce((acc, cur) => alt_sc(cur, acc), fail('no alternatives')),
    Array.from({ length: 26 }, (_, i) =>
        apply(str(String.fromCharCode('A'.charCodeAt(0) + i)), (_) => String.fromCharCode('A'.charCodeAt(0) + i))
    ).reduce((acc, cur) => alt_sc(cur, acc), fail('no alternatives'))
);

const alphaStr = apply(rep(alpha), (r) => r.join(''));
const spaces = rep_sc(str(' '));

const unicodeStr = rep_sc(tok('char'));

function trimmed<K, T>(p: Parser<K, Token<T>[]>): Parser<K, Token<T>[]> {
    return apply(p, (r) => {
        while (r.length > 0 && r[0].text.trim() === '') {
            r.shift();
        }
        while (r.length > 0 && r[r.length - 1].text.trim() === '') {
            r.pop();
        }
        return r;
    });
}

function anythingTyped(types: string[]) {
    return types.map((t) => tok(t)).reduce((acc, cur) => alt_sc(cur, acc), fail('no alternatives'));
}

function lrcTimestamp<K, T>(delim: [Parser<K, Token<T>>, Parser<K, Token<T>>]) {
    const innerTS = alt_sc(
        apply(seq(num, str(':'), num, str('.'), numStr), (r) =>
            convertTimeToMs({ mins: r[0], secs: r[2], decimals: r[4] })
        ),
        apply(seq(num, str('.'), numStr), (r) => convertTimeToMs({ secs: r[0], decimals: r[2] })),
        apply(seq(num, str(':'), num), (r) => convertTimeToMs({ mins: r[0], secs: r[2] })),
        apply(num, (r) => convertTimeToMs({ secs: r }))
    );
    return kmid(delim[0], innerTS, delim[1]);
}

const squareTS = lrcTimestamp([tok('['), tok(']')]);
const angleTS = lrcTimestamp([tok('<'), tok('>')]);

const lrcTag = apply(
    seq(
        tok('['),
        alphaStr,
        str(':'),
        tokenParserToText(trimmed(rep(anythingTyped(['char', '[', ']', '<', '>'])))),
        tok(']')
    ),
    (r) => ({
        [r[1]]: r[3]
    })
);

function tokenParserToText<K, T>(p: Parser<K, Token<T>> | Parser<K, Token<T>[]>): Parser<K, string> {
    return apply(p, (r: Token<T> | Token<T>[]) => {
        if (Array.isArray(r)) {
            return joinTokens(r);
        }
        return r.text;
    });
}

function joinTokens<T>(tokens: Token<T>[]) {
    return tokens.map((t) => t.text).join('');
}

function lrcLine(
    wordDiv = ''
): Parser<unknown, ['script_item', ScriptItem] | ['lrc_tag', IDTag] | ['comment', string] | ['empty', string]> {
    return alt_sc(
        apply(seq(squareTS, rep_sc(seq(opt_sc(angleTS), trimmed(rep_sc(anythingTyped(['char', '[', ']'])))))), (r) => {
            const start = r[0];

            const text = r[1]
                .map((s) => joinTokens(s[1]))
                .filter((s) => s.trim().length > 0)
                .join(wordDiv);

            const words = r[1]
                .filter((s) => joinTokens(s[1]).trim().length > 0)
                .map((s) => {
                    const wordBegin = s[0];
                    const word = s[1];
                    let ret: Partial<ScriptWordsItem> = { start: wordBegin };
                    if (word[0]) {
                        ret.beginIndex = word[0].pos.columnBegin - 1;
                    }
                    if (word[word.length - 1]) {
                        ret.endIndex = word[word.length - 1].pos.columnEnd;
                    }
                    return ret as ScriptWordsItem; // TODO: Complete this
                });
            return ['script_item', { start, text, words } as any as ScriptItem]; // TODO: Complete this
        }),
        apply(lrcTag, (r) => ['lrc_tag', r as IDTag]),
        apply(seq(spaces, str('#'), rep_sc(unicodeStr)), (cmt) => ['comment', cmt[2].join('')] as const)
    );
}

export function dumpToken<T>(t: Token<T> | undefined): string {
    if (t === undefined) {
        return '<EOF>';
    }
    return '`' + t.text + '` -> ' + dumpToken(t.next);
}

export function parseLRC(
    input: string,
    { wordDiv, strict }: { wordDiv?: string; strict?: boolean } = { wordDiv: ' ' }
): LrcJsonData {
    const tokenizer = buildLexer([
        [true, /^\[/gu, '['],
        [true, /^\]/gu, ']'],
        [true, /^</gu, '<'],
        [true, /^>/gu, '>'],
        [true, /^./gu, 'char']
    ]);

    const lines = input
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => tokenizer.parse(line));

    return lines
        .map((line) => {
            const res = expectEOF(lrcLine(wordDiv).parse(line));
            if (!res.successful) {
                if (strict) {
                    throw new Error('Failed to parse full line: ' + dumpToken(line));
                } else {
                    console.error('Failed to parse full line: ' + dumpToken(line));
                }
                return null;
            }
            return res.candidates[0].result;
        })
        .filter((r) => r !== null)
        .reduce((acc, cur) => {
            switch (cur[0]) {
                case 'lrc_tag':
                    Object.assign(acc, cur[1]);
                    return acc;
                case 'script_item':
                    acc.scripts = acc.scripts || [];
                    acc.scripts.push(cur[1]);
                    return acc;
                default:
                    return acc;
            }
        }, {} as LrcJsonData);
}
