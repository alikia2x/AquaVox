import { songData } from '$lib/server/cache.js';
import { loadData } from '$lib/server/database/loadData.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
    const offset = (parseInt(params.id) - 1) * 20;
    loadData();
    const songIDList = songData.keys().slice(offset, offset + 20);
    const songDataList = [];
    for (const songID of songIDList) {
        songDataList.push(songData.get(songID)!);
    }
	return {
        songDataList: songDataList
    };
};

export const ssr = true;