<script lang="ts">
    import formatDuration from '$lib/formatDuration';
    import { onMount } from 'svelte';
    import userAdjustingProgress from '$lib/state/userAdjustingProgress';
    import progressBarSlideValue from '$lib/state/progressBarSlideValue';

    export let name: string;
    export let singer: string = '';
    export let duration: number = 0;
    export let progress: number = 0;
    export let paused: boolean;
    export let volume: number = 1;
    export let clickPlay: Function;
    export let adjustProgress: Function;
    export let adjustDisplayProgress: Function;
    export let adjustVolume: Function;

    export let hasLyrics: boolean;

    let progressBar: HTMLDivElement;
    let volumeBar: HTMLDivElement;
    let showInfoTop: boolean = false;
    let isInfoTopOverflowing = false;
    let songInfoTopContainer: HTMLDivElement;
    let songInfoTopContent: HTMLSpanElement;
    let lastTouchProgress: number;
    let userAdjustingVolume = false;

    const mql = window.matchMedia('(max-width: 1280px)');

    function volumeBarOnChange(e: MouseEvent) {
        const value = e.offsetX / volumeBar.getBoundingClientRect().width;
        adjustVolume(value);
        localStorage.setItem('volume', value.toString());
    }

    function volumeBarChangeTouch(e: TouchEvent) {
        const value = turncate(
                            e.touches[0].clientX - volumeBar.getBoundingClientRect().x,
                            0,
                            volumeBar.getBoundingClientRect().width
                        ) / volumeBar.getBoundingClientRect().width;
        adjustVolume(value);
        localStorage.setItem('volume', value.toString());
    }

    function progressBarOnClick(e: MouseEvent) {
        adjustProgress(e.offsetX / progressBar.getBoundingClientRect().width);
        progressBarSlideValue.set((e.offsetX / progressBar.getBoundingClientRect().width) * duration);
    }

    function turncate(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    onMount(() => {
        mql.addEventListener('change', (e) => {
            showInfoTop = e.matches && hasLyrics;
        });
    });

    $: {
        if (songInfoTopContainer && songInfoTopContent) {
            isInfoTopOverflowing = songInfoTopContent.offsetWidth > songInfoTopContainer.offsetWidth;
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
            <span class="song-author text-shadow-lg">{singer}</span>
        </div>
    {/if}

    <div class="progress top-16">
        <div class="time-indicator text-shadow-md time-current">
            {formatDuration(progress)}
        </div>
        <div
            class="progress-bar shadow-md"
            on:click={(e) => progressBarOnClick(e)}
            bind:this={progressBar}
            on:mousedown={() => {
                userAdjustingProgress.set(true);
            }}
            on:mousemove={(e) => {
                if ($userAdjustingProgress) {
                    adjustDisplayProgress(e.offsetX / progressBar.getBoundingClientRect().width);
                }
            }}
            on:touchstart={(e) => {
                if (e.cancelable) {
                    e.preventDefault();
                }
                userAdjustingProgress.set(true);
            }}
            on:touchmove={(e) => {
                e.preventDefault();
                userAdjustingProgress.set(true);
                if ($userAdjustingProgress) {
                    lastTouchProgress =
                        turncate(
                            e.touches[0].clientX - progressBar.getBoundingClientRect().x,
                            0,
                            progressBar.getBoundingClientRect().width
                        ) / progressBar.getBoundingClientRect().width;
                    adjustDisplayProgress(lastTouchProgress);
                }
            }}
            on:touchend={(e) => {
                e.preventDefault();
                userAdjustingProgress.set(false);
                adjustProgress(lastTouchProgress);
            }}
            on:mouseup={() => {
                userAdjustingProgress.set(false);
            }}
            role="slider"
            aria-valuemin="0"
            aria-valuemax={duration}
            aria-valuenow={progress}
            tabindex="0"
            on:keydown
            on:keyup
        >
            <div class="bar" style={`width: ${(progress / (duration + 0.001)) * 100}%;`}></div>
        </div>

        <div class="time-indicator text-shadow-md time-total">{formatDuration(duration)}</div>
    </div>
    <div class="controls top-32 flex h-16 overflow-hidden items-center justify-center">
        <button style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );" class="control-btn previous">
            <img class="control-img switch-song-img" src="/previous.svg" alt="上一曲" />
        </button>
        <button
            style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );"
            class="control-btn play-btn"
            on:click={() => clickPlay()}
        >
            <img class="control-img" src={paused ? '/play.svg' : '/pause.svg'} alt="暂停或播放" />
        </button>
        <button style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );" class="control-btn next">
            <img class="control-img switch-song-img" src="/next.svg" alt="下一曲" />
        </button>
    </div>
    <div class="relative top-52 h-6 flex">
        <img class="scale-75" src="/volumeDown.svg" alt="最小音量" />
        <!-- <input
            class="mx-2 progress-bar shadow-md !translate-y-[-50%] !top-1/2"
            bind:this={volumeBar}
            on:input={volumeBarOnChange}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={$userAdjustingProgress ? volumeBar.value : volume}
        /> -->
        <div
            class="progress-bar shadow-md !top-1/2 !translate-y-[-50%]"
            on:click={(e) => volumeBarOnChange(e)}
            bind:this={volumeBar}
            on:mousedown={() => {
                userAdjustingVolume = true;
            }}
            on:mousemove={(e) => {
                if (userAdjustingVolume) {
                    volumeBarOnChange(e);
                }
            }}
            on:touchstart={(e) => {
                if (e.cancelable) {
                    e.preventDefault();
                }
                userAdjustingVolume = true;
            }}
            on:touchmove={(e) => {
                e.preventDefault();
                userAdjustingVolume = true;
                if (userAdjustingVolume) {
                    volumeBarChangeTouch(e);
                }
            }}
            on:touchend={(e) => {
                e.preventDefault();
                userAdjustingVolume = false;
            }}
            on:mouseup={() => {
                userAdjustingVolume = false;
            }}
            role="slider"
            aria-valuemin="0"
            aria-valuemax="1"
            aria-valuenow={volume}
            tabindex="0"
            on:keydown
            on:keyup
        >
            <div class="bar" style={`width: ${volume * 100}%;`}></div>
        </div>
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
    .bar {
        background-color: white;
        position: absolute;
        content: '';
        height: 0.4rem;
        display: inline-block;
        border-radius: 1rem;
        transition: height 0.3s;
    }

    .progress-bar:hover .bar {
        height: 0.7rem;
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
