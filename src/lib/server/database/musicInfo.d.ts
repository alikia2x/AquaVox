interface MusicMetadata {
    id: string;
    name: string;
    url: string;
    singer: string[];
    producer: string | null;
    tuning: string[];
    lyricist: string[];
    composer: string[];
    arranger: string[];
    mixing: string[];
    pv: string[];
    illustrator: string[];
    harmony: string[];
    instruments: string[];
    songURL: string[];
    coverURL: string[];
    duration: number | null;
    views: number | null;
    publishTime: string | null;
    updateTime: string | null;
    netEaseID: number | null;
    lyric: string | null;
}