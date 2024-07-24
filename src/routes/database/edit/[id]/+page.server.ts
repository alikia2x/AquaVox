/** @type {import('./$types').PageLoad} */
import { safePath } from '$lib/server/safePath';
import fs from 'fs';


export function load({ params }) {
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
