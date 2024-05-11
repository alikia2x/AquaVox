export default function(key: string){
    const dict = {
        "audio/mpeg": "MP3 音频",
        "audio/ogg": "OGG 容器",
        "audio/flac": "FLAC 无损音频",
        "audio/aac": "AAC 音频",
        "srt": "SRT 字幕"
    }
    if (!key) return "未知格式";
    else return dict[key as keyof typeof dict];
}