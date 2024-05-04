import * as musicMetadata from 'music-metadata-browser';
import convertCoverData from './convertCoverData';

export default function getAudioMeta(audio: File, callback: Function) {
    musicMetadata.parseBlob(audio).then((metadata) => {
        if (metadata)
            callback(metadata);
        else
            callback(null);
    })
}
