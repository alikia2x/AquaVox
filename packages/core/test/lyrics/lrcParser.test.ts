import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { parseLRC } from '@core/lyrics/lrc/parser';

describe('LRC parser test', () => {
    const test01Buffer = fs.readFileSync('./packages/core/test/lyrics/resources/test-01.lrc');
    const test01Text = test01Buffer.toString('utf-8');
    const test03Buffer = fs.readFileSync('./packages/core/test/lyrics/resources/test-03.lrc');
    const test03Text = test03Buffer.toString('utf-8');

    const lf_alternatives = ['\n', '\r\n', '\r'];

    it('Parses test-01.lrc', () => {
        for (const lf of lf_alternatives) {
            const text = test01Text.replaceAll('\n', lf);

            const result = parseLRC(text, { wordDiv: '', strict: true });

            expect(result.ar).toBe("洛天依");
            expect(result.ti).toBe("中华少女·终");
            expect(result.al).toBe("中华少女");
            expect(result["tool"]).toBe("歌词滚动姬 https://lrc-maker.github.io");
            expect(result.scripts!![1].text).toBe("因果与恩怨牵杂等谁来诊断");
            expect(result.scripts!![1].start).toBe(49000 + 588);
        }
    })
    it('Parses test-03.lrc', () => {
        const result = parseLRC(test03Text, { wordDiv: ' ', strict: true });
        expect(result.scripts!![5].text).toBe("བྲོ་ར་འདི་ལ་བྲོ་ཅིག་འཁྲབ།");
        expect(result.scripts!![5].translation).toBe("在舞池里舞一舞");
        expect(result.scripts!![6].text).toBe("祝祷转过千年 五色经幡飘飞");
        expect(result.scripts!![6].singer).toBe("a");
        expect(result.scripts!![11].singer).toBeUndefined();
        expect(result.scripts!![11].translation).toBe("我们在此相聚");
    });
    it('Accepts some weird but parsable LRCs', () => {
        const cases = [
            "[ti: []]",
            "[ar: [<]]",
            "[ar: <ar>]",
            "[ar: a b c]",
            "[00:00.00] <00:00.04> When the <00:00.16> the",
            "[00:00.00] [00:00.04] When [00:00.16] the",
            "[00:00.0000000] <00:00.04> When <00:00.16> the",
            "[00:00.00] <00:00.04> [When] <00:00.16> the",
        ];

        for (const c of cases) {
            expect(() => parseLRC(c, { strict: false })).not.toThrow();
        }
    })
});