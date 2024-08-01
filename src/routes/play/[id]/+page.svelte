<script lang="ts">
    import { page } from '$app/stores';
    import getAudioIDMetadata from '$lib/audio/getAudioIDMetadata';
    import Background from '$lib/components/background.svelte';
    import Cover from '$lib/components/cover.svelte';
    import InteractiveBox from '$lib/components/interactiveBox.svelte';
    import extractFileName from '$lib/extractFileName';
    import localforage from 'localforage';
    import { writable } from 'svelte/store';
    import userAdjustingProgress from '$lib/state/userAdjustingProgress';
    import type { IAudioMetadata } from 'music-metadata-browser';
    import { onDestroy, onMount } from 'svelte';
    import progressBarRaw from '$lib/state/progressBarRaw';
    import { parseTTML, type TTMLLyric } from '$lib/ttml';
    import type { LyricLine, LyricLineMouseEvent, LyricPlayer } from '@applemusic-like-lyrics/core';
    import NewLyrics from '$lib/components/newLyrics.svelte';
    import { LyricPlayer as CoreLyricPlayer } from '@applemusic-like-lyrics/core';
    import { parseLrc } from '@applemusic-like-lyrics/lyric';
    import { mapLyric } from '$lib/lyrics/mapLyric';

    const audioId = $page.params.id;
    let audioPlayer: HTMLAudioElement | null = null;
    let volume = 1;
    let name = '';
    let singer = '';
    let duration = 0;
    let currentProgress = 0;
    let audioFile: File;
    let paused: boolean = true;
    let launched = false;
    let prepared: string[] = [];
    let lyricLines: LyricLine[];
    let hasLyrics: boolean;
    let lyricPlayer: LyricPlayer = new CoreLyricPlayer();
    const coverPath = writable('');
    let mainInterval: ReturnType<typeof setInterval>;

    function setMediaSession() {
        if ('mediaSession' in navigator === false) return;
        const ms = navigator.mediaSession;
        ms.metadata = new MediaMetadata({
            title: name,
            artist: singer,
            artwork: [
                {
                    src: $coverPath
                }
            ]
        });
        ms.setActionHandler('play', function () {
            if (audioPlayer === null) return;
            audioPlayer.play();
            paused = false;
        });

        ms.setActionHandler('pause', function () {
            if (audioPlayer === null) return;
            audioPlayer.pause();
            paused = true;
        });

        ms.setActionHandler('seekbackward', function () {
            if (audioPlayer === null) return;
            if (audioPlayer.currentTime > 4) {
                audioPlayer.currentTime = 0;
            }
        });

        ms.setActionHandler('previoustrack', function () {
            if (audioPlayer === null) return;
            if (audioPlayer.currentTime > 4) {
                audioPlayer.currentTime = 0;
            }
        });
    }

    function readDB() {
        getAudioIDMetadata(audioId, (metadata: IAudioMetadata | null) => {
            if (!metadata) return;
            duration = metadata.format.duration ? metadata.format.duration : 0;
            singer = metadata.common.artist ? metadata.common.artist : '未知歌手';
            prepared.push('duration');
        });
        localforage.getItem(`${audioId}-cover`, function (err, file) {
            if (file) {
                const path = URL.createObjectURL(file as File);
                coverPath.set(path);
            }
            prepared.push('cover');
        });
        localforage.getItem(`${audioId}-file`, function (err, file) {
            if (audioPlayer === null) return;
            if (file) {
                const f = file as File;
                audioFile = f;
                audioPlayer.src = URL.createObjectURL(audioFile);
                name = extractFileName(f.name);
                prepared.push('name');
                prepared.push('file');
            }
        });
        localforage.getItem(`${audioId}-lyric`, function (err, file) {
            if (file) {
                const f = file as File;
                f.text().then((lr) => {
                    if (f.name.endsWith('.ttml')) {
                        lyricLines = parseTTML(lr).lyricLines;
                        hasLyrics = true;
                    } else if (f.name.endsWith('.lrc')) {
                        lyricLines = parseLrc(lr).map((line, i, lines) => ({
                            words: [
                                {
                                    word: line.words[0]?.word ?? '',
                                    startTime: line.words[0]?.startTime ?? 0,
                                    endTime: lines[i + 1]?.words?.[0]?.startTime ?? Infinity
                                }
                            ],
                            startTime: line.words[0]?.startTime ?? 0,
                            endTime: lines[i + 1]?.words?.[0]?.startTime ?? Infinity,
                            translatedLyric: '',
                            romanLyric: '',
                            isBG: false,
                            isDuet: false
                        }));
                        hasLyrics = true;
                    }
                });
            }
        });
    }

    function playAudio() {
        if (audioPlayer === null) return;
        if (audioPlayer.duration) {
            duration = audioPlayer.duration;
        }
        audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
        paused = audioPlayer.paused;
        setMediaSession();
    }

    $: {
        if (!launched && audioPlayer) {
            const requirements = ['name', 'file', 'cover'];
            let flag = true;
            for (const r of requirements) {
                if (!prepared.includes(r)) {
                    flag = false;
                }
            }
            if (flag) {
                launched = true;
                setMediaSession();
                audioPlayer.play();
            }
        }
    }

    function adjustProgress(progress: number) {
        if (audioPlayer) {
            audioPlayer.currentTime = duration * progress;
            currentProgress = duration * progress;
            lyricPlayer.calcLayout(false, true);
        }
    }

    function adjustDisplayProgress(progress: number) {
        if (audioPlayer) {
            currentProgress = duration * progress;
        }
    }

    function adjustVolume(targetVolume: number) {
        if (audioPlayer) {
            audioPlayer.volume = targetVolume;
        }
    }

    $: {
        clearInterval(mainInterval);
        mainInterval = setInterval(() => {
            if (audioPlayer === null) return;
            if ($userAdjustingProgress === false) currentProgress = audioPlayer.currentTime;
            progressBarRaw.set(audioPlayer.currentTime);
        }, 50);
    }

    onMount(() => {
        if (audioPlayer === null) return;
        audioPlayer.volume = localStorage.getItem('volume') ? Number(localStorage.getItem('volume')) : 1;
    });
    onDestroy(() => {
        if (audioPlayer === null) return;
    });

    $: {
        if (audioPlayer) {
            paused = audioPlayer.paused;
            volume = audioPlayer.volume;
        }
    }

    function onLyricLineClick(e: LyricLineMouseEvent) {
        lyricPlayer.resetScroll();
        adjustProgress(lyricLines[e.lineIndex].startTime / 1000 / duration);
    }

    readDB();
</script>

<svelte:head>
    <title>{name} - AquaVox</title>
</svelte:head>

<Background coverId={audioId} />
<Cover {coverPath} {hasLyrics} />
<InteractiveBox
    {name}
    {singer}
    {duration}
    {volume}
    progress={currentProgress}
    clickPlay={playAudio}
    {paused}
    {adjustProgress}
    {adjustVolume}
    {adjustDisplayProgress}
    {hasLyrics}
/>

<NewLyrics
    {lyricPlayer}
    {lyricLines}
    currentTime={Math.round(currentProgress * 1000)}
    playing={!paused}
    {onLyricLineClick}
/>

<audio
    bind:this={audioPlayer}
    controls
    style="display: none"
    on:play={() => {
        if (audioPlayer === null) return;
        paused = audioPlayer.paused;
    }}
    on:pause={() => {
        if (audioPlayer === null) return;
        paused = audioPlayer.paused;
    }}
    on:ended={() => {
        paused = true;
        if (audioPlayer == null) return;
        audioPlayer.pause();
    }}
></audio>
