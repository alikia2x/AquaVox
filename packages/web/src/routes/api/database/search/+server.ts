import { songNameCache } from '$lib/server/cache.js';
import { loadData } from '$lib/server/database/loadData';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const keyword = url.searchParams.get('keyword');

    await loadData();

    if (keyword === null) {
        return error(400, {
            'message': 'Miss parameter: keyword'
        });
    }

    const resultList: MusicMetadata[] = [];

    for (const songName of songNameCache.keys()) {
        if (songName.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())) {
            resultList.push(songNameCache.get(songName)!);
        }
    }

    return json({
        'result': resultList
    });
};