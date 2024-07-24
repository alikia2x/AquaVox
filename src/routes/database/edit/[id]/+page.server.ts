/** @type {import('./$types').PageLoad} */
import fs from 'fs';
import path from 'path';


export function load({ params }) {
    const filePath = path.join('./data/song', `${params.id}.json`);
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
