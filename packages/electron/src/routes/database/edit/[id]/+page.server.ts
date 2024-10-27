import fs from 'fs';
import type { PageServerLoad } from './$types';
import { safePath } from '$lib/server/safePath';

export const load: PageServerLoad = ({ params }) => {
    const filePath = safePath(`${params.id}.json`, { base: './data/song' });
    if (!filePath) {
        return {
            songData: null
        };
    }
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = JSON.parse(dataBuffer.toString());
        return {
            songData: data
        };
    } catch {
        return {
            songData: null
        }
    }
}
