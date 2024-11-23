export default function(key: string){
    const dict = {
        "audio/mpeg": "MP3 音频",
        "audio/ogg": "OGG 容器",
        "audio/flac": "FLAC 无损音频",
        "audio/aac": "AAC 音频",
        "audio/wav": "WAV 音频",
        "ttml": "TTML歌词",
        "lrc": "LRC 歌词"
    }
    if (!key) return "未知格式";
    if (!(key in dict)) return key;
    else return dict[key as keyof typeof dict];
}