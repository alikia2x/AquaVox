/** @type {import('./$types').PageLoad} */
import fs from 'fs';


export function load({ params }) {
    const filePath = `./data/song/${params.id}.json`;
    if (!fs.existsSync(filePath)) {
        return {
            songData: null
        }
    }
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = JSON.parse(dataBuffer.toString());
        return {
            songData: data
        };
    }
    catch {
        return {
            songData: null
        }
    }
}
