<script lang="ts">
    import { page } from '$app/stores';
    import getAudioIDMetadata from '$lib/audio/getAudioIDMetadata';
    import Background from '$lib/components/background.svelte';
    import Cover from '$lib/components/cover.svelte';
    import InteractiveBox from '$lib/components/interactiveBox.svelte';
    import extractFileName from '$lib/extractFileName';
    import localforage from 'localforage';
    import { writable } from 'svelte/store';

    const audioId = $page.params.id;
    let audioPlayer: HTMLAudioElement;
    let name = '';
    let singer = '';
    let duration = 0;
    let currentProgress = 0;
    let audioFile: File;
    let paused: boolean = true;
    let launched = false;
    let prepared: string[] = [];
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
            audioPlayer.play();
            paused = false;
        });

        ms.setActionHandler('pause', function () {
            audioPlayer.pause();
            paused = true;
        });

        ms.setActionHandler('seekbackward', function () {
            if (audioPlayer.currentTime > 4) {
                audioPlayer.currentTime = 0;
            }
        });

        ms.setActionHandler('previoustrack', function () {
            if (audioPlayer.currentTime > 4) {
                audioPlayer.currentTime = 0;
            }
        });
    }

    function readDB() {
        getAudioIDMetadata(audioId, (metadata: any) => {
            duration = metadata.format.duration ? metadata.format.duration : 0;
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
            if (file) {
                const f = file as File;
                audioFile = f;
                audioPlayer.src = URL.createObjectURL(audioFile);
                name = extractFileName(f.name);
                prepared.push('name');
                prepared.push('file');
            }
        });
    }

    function playAudio() {
        if (audioPlayer.duration) {
            duration = audioPlayer.duration;
        }
        audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
        paused = audioPlayer.paused;
        setMediaSession();
    }

    $: {
        if (!launched) {
            console.log('launch?');
            const requirements = ['name', 'file', 'cover'];
            let flag = true;
            for (const r of requirements) {
                if (!prepared.includes(r)) {
                    flag = false;
                }
            }
            console.log(prepared, flag);
            if (flag) {
                launched = true;
                console.log('launch!');
                setMediaSession();
                audioPlayer.play();
            }
        }
    }

    $: {
        clearInterval(mainInterval);
        mainInterval = setInterval(() => {
            if (audioPlayer !== null && audioPlayer.currentTime !== undefined) {
                currentProgress = audioPlayer.currentTime;
            }
        }, 500);
    }

    $: {
        if (audioPlayer) {
            paused = audioPlayer.paused;
            if (audioPlayer.ended) {
                paused = true;
                audioPlayer.pause();
            }
        }
    }
    readDB();
</script>

<Background coverId={audioId} />
<Cover {coverPath} />
<InteractiveBox
    {name}
    {singer}
    {duration}
    progress={currentProgress}
    clickPlay={playAudio}
    {paused}
/>
<audio bind:this={audioPlayer} controls style="display: none"></audio>
