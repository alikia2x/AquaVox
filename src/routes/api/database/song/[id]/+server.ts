import { getCurrentFormattedDateTime } from '$lib/songUpdateTime';
import { json, error } from '@sveltejs/kit';
import fs from 'fs';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const filePath = `./data/song/${params.id}.json`;
    if (!fs.existsSync(filePath)) {
        return error(404, {
            message: "No corresponding song."
        })
    }
    const data = fs.readFileSync(filePath);
	return json(JSON.parse(data.toString()));
}

export const POST: RequestHandler = async ({ request, params }) => {
    const timeStamp = new Date().getTime();
    if (!fs.existsSync("./data/pending/")) {
        fs.mkdirSync("./data/pending");
    }
    const filePath = `./data/pending/${params.id}-${timeStamp}.json`;
    const data: MusicMetadata = await request.json();
    data.updateTime = getCurrentFormattedDateTime();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    return json({
        "message": "successfully created"
    }, {
        status: 201
    });
}