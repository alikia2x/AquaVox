<script lang="ts">
    import formatDuration from '../utils/formatDuration';
    import { onMount } from 'svelte';
    import userAdjustingProgress from '../state/userAdjustingProgress';
    import progressBarSlideValue from '../state/progressBarSlideValue';
    import truncate from '../utils/truncate';
    import timestamp from '@core/utils/getCurrentTimestamp';

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

    export let showInteractiveBox: boolean;
    export let showingInteractiveBoxUntil: Function;

    let progressBar: HTMLDivElement;
    let volumeBar: HTMLDivElement;
    let showInfoTop: boolean = false;
    let isInfoTopOverflowing = false;
    let songInfoTopContainer: HTMLDivElement;
    let songInfoTopContent: HTMLSpanElement;
    let userAdjustingVolume = false;
    let lastTouchClientX = 0;
    let mobileDeviceAdjustingProgress = false;

   if (screen.width < 728) {
       showingInteractiveBoxUntil(timestamp() + 3000);
   }

    const mql = window.matchMedia('(max-width: 1280px)');

    function volumeBarOnChange(e: MouseEvent) {
        const value = e.offsetX / volumeBar.getBoundingClientRect().width;
        adjustVolume(value);
        localStorage.setItem('volume', value.toString());
    }

    function volumeBarChangeTouch(e: TouchEvent) {
        const value = truncate(
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

    function progressBarMouseUp(offsetX: number) {
        adjustDisplayProgress(offsetX / progressBar.getBoundingClientRect().width);
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

    window.addEventListener("mousemove", (event) => {
        if ($userAdjustingProgress) {
            const x = event.clientX;
            const rec = progressBar.getBoundingClientRect();
            adjustDisplayProgress(truncate((x - rec.left) / rec.width,0,1));
        }
    });
    window.addEventListener("mouseup", (event) => {
        if ($userAdjustingProgress) {
            const x = event.clientX;
            const rec = progressBar.getBoundingClientRect();
            userAdjustingProgress.set(false);
            adjustProgress(truncate((x - rec.left) / rec.width,0,1));
        }
    });
    window.addEventListener("touchmove", (event) => {
        if ($userAdjustingProgress) {
            const x = event.touches[0].clientX;
            const rec = progressBar.getBoundingClientRect();
            adjustDisplayProgress(truncate((x - rec.left) / rec.width,0,1));
            lastTouchClientX = x;
        }
    });
    window.addEventListener("touchend", (event) => {
        if ($userAdjustingProgress) {
            const x = lastTouchClientX;
            const rec = progressBar.getBoundingClientRect();
            adjustProgress(truncate((x - rec.left) / rec.width,0,1));
            userAdjustingProgress.set(false);
            mobileDeviceAdjustingProgress = false;
        }
    });

    userAdjustingProgress.subscribe(()=> {
        showingInteractiveBoxUntil(timestamp() + 5000);
    });

    function handleClick() {
        showingInteractiveBoxUntil(timestamp() + 5000);
    }
</script>

{#if showInfoTop}
    <div class="absolute top-6 md:top-12 left-28 md:left-48 lg:left-64 flex-col">
        <span class="song-name text-shadow">{name}</span><br />
        <span class="song-author">{singer}</span>
    </div>
{/if}

<div
    class={'absolute select-none bottom-12 h-60 w-[86vw] left-[7vw] duration-500 z-10 transition-[opacity,transform] ' +
        (hasLyrics
            ? 'lg:w-[76vw] lg:left-[12vw] xl:w-[37vw] xl:left-[7vw]'
            : 'lg:w-[76vw] lg:left-[12vw] xl:w-[37vw] xl:left-[31.5vw]') + ' ' +
             (showInteractiveBox ? 'opacity-100' : 'opacity-0 translate-y-48')}
    style={`z-index: ${showInteractiveBox ? "0" : "50"}`}
>

    {#if !showInfoTop}
        <div class="song-info">
            <div class="song-info-regular {isInfoTopOverflowing ? 'animate' : ''}" bind:this={songInfoTopContainer}>
                <span
                    class="song-name text-shadow {isInfoTopOverflowing ? 'animate' : ''}"
                    bind:this={songInfoTopContent}>{name}</span
                >
            </div>
            <span class="song-author text-shadow-lg">{singer}</span>
        </div>
    {/if}

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class={"absolute w-full h-2/3 bottom-0" + (showInteractiveBox ? '' : '-translate-y-48')}
         style={`z-index: ${showInteractiveBox ? "0" : "50"}`}
         on:click={handleClick}
    ></div>

    <div class="progress top-16">
        <div class="time-indicator text-shadow-md time-current">
            {formatDuration(progress)}
        </div>
        <div
            aria-valuemax={duration}
            aria-valuemin="0"
            aria-valuenow={progress}
            bind:this={progressBar}
            class="progress-bar shadow-md {mobileDeviceAdjustingProgress && '!h-[0.7rem]'}"
            on:keydown
            on:keyup
            on:click={(e) => {
                progressBarOnClick(e);
            }}
            on:mousedown={() => {
                userAdjustingProgress.set(true);
            }}
            on:touchstart={() => {
                userAdjustingProgress.set(true);
                mobileDeviceAdjustingProgress = true;
            }}
            role="slider"
            tabindex="0"
        >
            <div class="bar {mobileDeviceAdjustingProgress && '!h-[0.7rem]'}" style={`width: ${(progress / (duration + 0.001)) * 100}%;`}></div>
        </div>

        <div class="time-indicator text-shadow-md time-total">{formatDuration(duration)}</div>
    </div>
    <div class="controls top-32 flex h-16 overflow-hidden items-center justify-center">
        <button class="control-btn previous" style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );">
            <img alt="上一曲" class="control-img switch-song-img" src="/previous.svg" />
        </button>
        <button
            class="control-btn play-btn"
            on:click={(e) => clickPlay()}
            on:focus={null}
            on:mouseleave={(e) => {
                e.currentTarget.style.backgroundColor = '';
            }}
            on:mouseover={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }}
            on:touchend={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.scale = '1';
                clickPlay();
            }}
            on:touchstart={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.scale = '0.8';
            }}
            style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );"
        >
            <img alt={paused ? '播放' : '暂停'} class="control-img" src={paused ? '/play.svg' : '/pause.svg'} />
        </button>
        <button class="control-btn next" style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );">
            <img alt="下一曲" class="control-img switch-song-img" src="/next.svg" />
        </button>
    </div>
    <div class="relative top-52 h-6 flex">
        <img alt="最小音量" class="scale-75" src="/volumeDown.svg" />
        <div
            aria-valuemax="1"
            aria-valuemin="0"
            aria-valuenow={volume}
            bind:this={volumeBar}
            class="progress-bar shadow-md !top-1/2 !translate-y-[-50%]"
            on:click={(e) => volumeBarOnChange(e)}
            on:keydown
            on:keyup
            on:mousedown={() => {
                userAdjustingVolume = true;
            }}
            on:mousemove={(e) => {
                if (userAdjustingVolume) {
                    volumeBarOnChange(e);
                }
            }}
            on:mouseup={() => {
                userAdjustingVolume = false;
            }}
            on:touchend={(e) => {
                e.preventDefault();
                userAdjustingVolume = false;
            }}
            on:touchmove={(e) => {
                e.preventDefault();
                userAdjustingVolume = true;
                if (userAdjustingVolume) {
                    volumeBarChangeTouch(e);
                }
            }}
            on:touchstart={(e) => {
                if (e.cancelable) {
                    e.preventDefault();
                }
                userAdjustingVolume = true;
            }}
            role="slider"
            tabindex="0"
        >
            <div class="bar" style={`width: ${volume * 100}%;`}></div>
        </div>
        <img alt="最大音量" class="scale-75" src="/volumeUp.svg" />
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
        transition: 0.45s;
        scale: 1;
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

    .song-info-regular {
        white-space: nowrap;
        overflow: hidden;
        position: relative;
        height: 2.375rem;
    }

    .song-info-regular.animate {
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

    .progress-bar:active {
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

    .progress-bar:active .bar {
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

    @media (min-width: 768px) {
        .control-btn {
            transition: 0.1s
        }
        .progress-bar:hover {
            height: 0.7rem;
        }
        .progress-bar:hover .bar {
            height: 0.7rem;
        }
    }
</style>
