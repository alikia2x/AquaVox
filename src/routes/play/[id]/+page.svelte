<script lang="ts">
    import { page } from '$app/stores';
    import getAudioIDMetadata from '$lib/audio/getAudioIDMetadata';
    import Background from '$lib/components/background.svelte';
    import Cover from '$lib/components/cover.svelte';
    import InteractiveBox from '$lib/components/interactiveBox.svelte';
    import Lyrics from '$lib/components/lyrics.svelte';
    import extractFileName from '$lib/extractFileName';
    import localforage from 'localforage';
    import { writable } from 'svelte/store';
    import lrcParser from '$lib/lyrics/lrc/parser';
    import type { LrcJsonData } from '$lib/lyrics/type';
    import userAdjustingProgress from '$lib/state/userAdjustingProgress';
    import type { IAudioMetadata } from 'music-metadata-browser';
    import { onMount } from 'svelte';
    import progressBarRaw from '$lib/state/progressBarRaw';
    import { parseTTML, type LyricLine } from '$lib/lyrics/ttml';
    import NewLyrics from '$lib/components/newLyrics.svelte';

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
    let originalLyrics: LrcJsonData;
    let lyricsText: string[] = [];
    let hasLyrics: boolean;
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
                        originalLyrics = parseTTML(lr);
                        for (const line of originalLyrics.scripts!) {
                            lyricsText.push(line.text);
                        }
                        hasLyrics = true;
                    } else if (f.name.endsWith('.lrc')) {
                        originalLyrics = lrcParser(lr);
                        if (!originalLyrics.scripts) return;
                        for (const line of originalLyrics.scripts) {
                            lyricsText.push(line.text);
                        }
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

    $: {
        if (audioPlayer) {
            paused = audioPlayer.paused;
            volume = audioPlayer.volume;
        }
    }

    $: hasLyrics = !!originalLyrics;

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

<NewLyrics {originalLyrics} progress={currentProgress} player={audioPlayer}/>

<Lyrics lyrics={lyricsText} {originalLyrics} progress={currentProgress} player={audioPlayer} class="hidden" />

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
