import { songData } from '$lib/server/cache.js';
import { loadData } from '$lib/server/database/loadData.js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");
    loadData();
    const songIDList = songData.keys().slice(offset, offset + limit);
    const songDataList = [];
    for (const songID of songIDList) {
        songDataList.push(songData.get(songID)!);
    }
	return json(songDataList);
}