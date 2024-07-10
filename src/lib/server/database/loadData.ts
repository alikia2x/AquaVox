import fs from 'fs';
import { globalMemoryStorage, songData, songNameCache } from '$lib/server/cache.js';

export async function loadData() {
    const LastLoaded: number | undefined  = globalMemoryStorage.get("lastLoadData");
    const currentTime = new Date().getTime();
    // Already loaded.
    if (LastLoaded && currentTime - LastLoaded < 3600) {
        return;
    }

    const dataPath = "./data/song/";
    const songList = fs.readdirSync(dataPath)
        .map(fileName => {
            if (fileName.endsWith(".json"))
                return fileName.slice(0, fileName.length - 5);
            else return null;
        })
        .filter(fileName => fileName !== null);
    for (const songID of songList) {
        try {
            const fileContentString = fs.readFileSync(dataPath + songID + ".json").toString();
            const data = JSON.parse(fileContentString);
            songData.set(songID, data);
            const metadata: MusicMetadata = data;
            songNameCache.set(metadata.name, metadata);
        }
        catch {
            console.error(`[load-song-data] Could not load song ID ${songID}`);
        }
    }
    globalMemoryStorage.set("lastLoadData", new Date().getTime());
}