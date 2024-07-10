import { json, error } from '@sveltejs/kit';
import fs from 'fs';

export async function GET({ params }) {
    const filePath = `./data/song/${params.id}.json`;
    if (!fs.existsSync(filePath)) {
        return error(404, {
            message: "No correspoding song."
        })
    }
    const data = fs.readFileSync(filePath);
	return json(JSON.parse(data.toString()));
}

export async function POST({ params, request }) {
    const timeStamp = new Date().getTime();
    if (!fs.existsSync("./data/pending/")) {
        fs.mkdirSync("./data/pending");
    }
    const filePath = `./data/pending/${params.id}-${timeStamp}.json`;
    const data: MusicMetadata = await request.json();
    data.updateTime = new Date().getTime().toString();
    fs.writeFileSync(filePath, JSON.stringify(data));
    return json({});
}