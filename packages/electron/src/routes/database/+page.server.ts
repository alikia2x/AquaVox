import { songData } from '$lib/server/cache.js';
import { loadData } from '$lib/server/database/loadData.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
    loadData();
    const songIDList = songData.keys().slice(0, 20);
    const songDataList = [];
    for (const songID of songIDList) {
        songDataList.push(songData.get(songID)!);
    }
	return {
        songDataList: songDataList
    };
};

export const ssr = true;