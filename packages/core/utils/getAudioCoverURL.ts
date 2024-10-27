import * as musicMetadata from 'music-metadata-browser';

export default function getAudioMeta(audio: File, callback: Function) {
    musicMetadata.parseBlob(audio).then((metadata) => {
        if (metadata)
            callback(metadata);
        else
            callback(null);
    })
}
