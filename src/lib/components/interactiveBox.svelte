<script lang="ts">
    import formatDuration from '$lib/formatDuration';
    import { onMount } from 'svelte';

    export let name: string;
    export let singer: string = '';
    export let duration: number = 0;
    export let progress: number = 0;
    export let paused: boolean;
    export let volume: number = 1;
    export let clickPlay: Function;
    export let adjustProgress: Function;
    export let adjustRealProgress: Function;
    export let adjustVolume: Function;
    export let onSlide: boolean;
    export let setOnSlide: Function;
    export let hasLyrics: boolean;

    let progressBar: HTMLInputElement;
    let volumeBar: HTMLInputElement;
    let showInfoTop: boolean = false;
    let isInfoTopOverflowing = false;
    let songInfoTopContainer: HTMLDivElement;
    let songInfoTopContent: HTMLSpanElement;
    const mql = window.matchMedia('(max-width: 1280px)');

    function progressBarOnChange(e: any) {
        adjustProgress(e.target.value / (duration + 0.001));
    }

    function progressBarOnInput(e: any) {
        adjustRealProgress(e.target.value / (duration + 0.001));
    }

    function volumeBarOnChange(e: any) {
        adjustVolume(e.target.value);
    }

    onMount(() => {
        mql.addEventListener('change', (e) => {
            showInfoTop = e.matches && hasLyrics;
        });
    });

    $: {
        console.log(songInfoTopContainer, songInfoTopContent);
        if (songInfoTopContainer && songInfoTopContent) {
            console.log(songInfoTopContent.offsetWidth, songInfoTopContainer.offsetWidth);
            isInfoTopOverflowing =
                songInfoTopContent.offsetWidth > songInfoTopContainer.offsetWidth;
        }
    }

    $: {
        showInfoTop = mql.matches && hasLyrics;
    }
</script>

{#if showInfoTop}
    <div class="absolute top-6 md:top-12 left-28 md:left-48 lg:left-64 flex-col">
        <span class="song-name text-shadow">{name}</span><br />
        <span class="song-author">{singer}</span>
    </div>
{/if}

<div
    class={'absolute select-none bottom-2 h-60 w-[86vw] left-[7vw] z-10 ' +
        (hasLyrics
            ? 'lg:w-[76vw] lg:left-[12vw] xl:w-[37vw] xl:left-[7vw]'
            : 'lg:w-[76vw] lg:left-[12vw] xl:w-[37vw] xl:left-[31.5vw]')}
>
    {#if !showInfoTop}
        <div class="song-info">
            <div class="song-info-top {isInfoTopOverflowing ? 'animate' : ''}" bind:this={songInfoTopContainer}>
                <span
                    class="song-name text-shadow {isInfoTopOverflowing ? 'animate' : ''}"
                    bind:this={songInfoTopContent}>{name}</span
                >
            </div>
            <span class="song-author">{singer}</span>
        </div>
    {/if}

    <div class="progress top-16">
        <div class="time-indicator text-shadow-md time-current">{formatDuration(progress)}</div>
        <input
            class="progress-bar shadow-md"
            bind:this={progressBar}
            on:change={progressBarOnChange}
            on:input={progressBarOnInput}
            on:mousedown={() => setOnSlide(true)}
            on:mouseup={() => {
                setTimeout(() => {
                    setOnSlide(false);
                }, 50);
            }}
            type="range"
            min="0"
            max={duration - 0.2}
            step="1"
            value={onSlide ? progressBar.value : progress}
        />
        <div class="time-indicator text-shadow-md time-total">{formatDuration(duration)}</div>
    </div>
    <div class="controls top-32 flex h-16 overflow-hidden items-center justify-center">
        <button
            style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );"
            class="control-btn previous"
        >
            <img class="control-img switch-song-img" src="/previous.svg" alt="上一曲" />
        </button>
        <button
            style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );"
            class="control-btn play-btn"
            on:click={() => clickPlay()}
        >
            <img class="control-img" src={paused ? '/play.svg' : '/pause.svg'} alt="暂停或播放" />
        </button>
        <button
            style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );"
            class="control-btn next"
        >
            <img class="control-img switch-song-img" src="/next.svg" alt="下一曲" />
        </button>
    </div>
    <div class="relative top-52 h-6 flex">
        <img class="scale-75" src="/volumeDown.svg" alt="最小音量" />
        <input
            class="mx-2 progress-bar shadow-md !translate-y-[-50%] !top-1/2"
            bind:this={volumeBar}
            on:input={volumeBarOnChange}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={onSlide ? volumeBar.value : volume}
        />
        <img class="scale-75" src="/volumeUp.svg" alt="最大音量" />
    </div>
</div>

<style>
    .controls {
        position: absolute;
        width: 100%;
        left: 50%;
        transform: translate(-50%, 0);
    }
    .control-btn {
        display: inline-block;
        height: 3.7rem;
        width: 5rem;
        cursor: pointer;
        margin: 0 0.5rem;
        border-radius: 0.5rem;
        transition: 0.1s;
    }
    .control-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    .control-img {
        height: 2rem;
        width: 2rem;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }
    .switch-song-img {
        width: auto !important;
        height: 1.7rem !important;
    }

    .song-info {
        user-select: text;
        position: absolute;
        width: auto;
        max-width: 100%;
        left: 50%;
        transform: translate(-50%, 0);
        top: 1rem;
        font-family: sans-serif;
        text-align: center;
    }
    .song-info-top {
        white-space: nowrap;
        overflow: hidden;
        position: relative;
    }

    .song-info-top.animate {
        mask-image: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 1) 2rem,
            rgba(0, 0, 0, 1) calc(100% - 5rem),
            rgba(0, 0, 0, 0) 100%
        );
    }

    .song-name {
        position: relative;
        font-size: 1.6rem;
        line-height: 2.5rem;
        overflow-y: auto;
        font-weight: 700;
        color: white;
        scrollbar-width: none;
        height: 2.5rem;
        display: inline-block;
    }
    .song-name.animate {
        animation: scroll 10s linear infinite;
    }
    .song-name::-webkit-scrollbar {
        display: none;
    }
    @keyframes scroll {
        0% {
            transform: translateX(100%);
        }
        50% {
            transform: translateX(0%);
        }
        100% {
            transform: translateX(-100%);
        }
    }
    .song-author {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.8);
    }
    .progress {
        position: absolute;
        width: 100%;
        left: 50%;
        transform: translate(-50%, 0);
        height: 2.4rem;
    }
    .progress-bar {
        -webkit-appearance: none;
        appearance: none;
        top: 1.8rem;
        position: relative;
        width: 100%;
        height: 0.4rem;
        background-color: rgba(64, 64, 64, 0.5);
        color: white;
        border-radius: 0.5rem;
        overflow: hidden;
        cursor: pointer;
        transition: 0.3s;
    }
    .progress-bar:hover {
        height: 0.7rem;
    }
    .progress-bar::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 0rem;
        height: 0.7rem;
        background-color: white;
        box-shadow: -700px 0 0 700px white;
        cursor: pointer;
    }

    .progress-bar::-moz-range-thumb {
        appearance: none;
        width: 0px;
        height: 0px;
        background-color: white;
        box-shadow: -700px 0 0 700px white;
        cursor: pointer;
        border: none;
    }

    .time-indicator {
        width: fit-content;
        position: absolute;
        font-size: 1rem;
        line-height: 1rem;
        color: rgba(255, 255, 255, 0.8);
        display: inline-block;
        top: 0.2rem;
    }
    .time-current {
        left: 0;
    }
    .time-total {
        right: 0;
    }
</style>
