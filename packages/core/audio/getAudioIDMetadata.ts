import * as musicMetadata from 'music-metadata-browser';
import localforage from 'localforage';

export default function (audioId: string, callback: Function) {
    localforage.getItem(`${audioId}-metadata`, function (err, metadata) {
        if (metadata) {
            callback(metadata);
        } else {
            localforage.getItem(`${audioId}-file`, function (err, file) {
                if (file) {
                    const f = file as File;
                    musicMetadata.parseBlob(f).then((metadata) => {
                        if (metadata) {
                            localforage.setItem(`${audioId}-metadata`, metadata);
                            callback(metadata);
                        } else callback(null);
                    });
                }
            });
        }
    });
}
