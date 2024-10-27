import fs from 'fs';
import { globalMemoryStorage, songData, songNameCache } from '@core/server/cache.js';
import { getDirectoryHash } from '../dirHash';
import { safePath } from '../safePath';

const dataPath = './data/song/';

export async function loadData() {
    const LastLoaded: number | undefined = globalMemoryStorage.get('lastLoadData');
    const LastHash: string | undefined = globalMemoryStorage.get('lastDataDirHash');
    const currentTime = new Date().getTime();
    const currentHash = getDirectoryHash(dataPath);
    // Already loaded.
    if (LastLoaded && LastHash && currentTime - LastLoaded < 120 * 1000 && currentHash === LastHash) {
        return;
    }

    const songList = fs
        .readdirSync(dataPath)
        .map((fileName) => {
            if (fileName.endsWith('.json')) return fileName.slice(0, fileName.length - 5);
            else return null;
        })
        .filter((fileName) => fileName !== null);
    songData.flushAll();
    songNameCache.flushAll();
    for (const songID of songList) {
        try {
            const normPath = safePath(songID + '.json', { base: dataPath });
            if (!normPath) {
                console.error(`[load-song-data] Invalid path for song ID ${songID}`);
                continue;
            }
            const fileContentString = fs.readFileSync(normPath).toString();
            const data = JSON.parse(fileContentString);
            songData.set(songID, data);
            const metadata: MusicMetadata = data;
            songNameCache.set(metadata.name, metadata);
        } catch {
            console.error(`[load-song-data] Could not load song ID ${songID}`);
        }
    }
    globalMemoryStorage.set('lastLoadData', new Date().getTime());
    globalMemoryStorage.set('lastDataDirHash', getDirectoryHash(dataPath));
}
