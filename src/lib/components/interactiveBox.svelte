<script lang="ts">
    import formatDuration from '$lib/formatDuration';

    export let name: string;
    export let singer: string = '';
    export let duration: number = 0;
    export let progress: number = 0;
    export let paused: boolean;
    export let clickPlay: Function;
    export let adjustProgress: Function;
    let onSlide = false;
    let progressBar: HTMLInputElement;

    function progressBarOnChange(e: any) {
        adjustProgress(e.target.value / (duration + 0.001));
    }
</script>

<div class="interactive-box">
    <div class="song-info">
        <span class="song-name text-shadow">{name}</span><br />
        <span class="song-author">{singer}</span>
    </div>
    <div class="progress">
        <div class="time-indicator text-shadow-md time-current">{formatDuration(progress)}</div>
        <input
            class="progress-bar shadow-md"
            bind:this={progressBar}
            on:change={progressBarOnChange}
            on:mousedown={() => (onSlide = true)}
            on:mouseup={() => {
                setTimeout(() => {
                    onSlide = false;
                }, 50);
            }}
            type="range"
            min="0"
            max={duration - 0.2}
            step="1"
            value={onSlide ? progressBar.value : progress}
        />
        <!-- <div class="bar" style={`width: ${(progress / (duration + 0.001)) * 100}%;`}></div> -->
        <div class="time-indicator text-shadow-md time-total">{formatDuration(duration)}</div>
    </div>
    <div class="controls">
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
</div>

<style>
    .controls {
        position: absolute;
        top: 10rem;
        width: 100%;
        left: 50%;
        transform: translate(-50%, 0);
    }
    .control-btn {
        display: inline-block;
        position: absolute;
        height: 4.2rem;
        width: 6rem;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: 0.1s;
    }
    .control-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    .play-btn {
        left: 50%;
        transform: translate(-50%, 0);
    }
    .control-img {
        position: relative;
        height: 2.3rem;
        width: 2.3rem;
        left: 50%;
        transform: translate(-50%, 0);
    }
    .previous {
        left: 50%;
        transform: translate(calc(-50% - 8rem), 0);
    }
    .next {
        right: 50%;
        transform: translate(calc(50% + 8rem), 0);
    }
    .switch-song-img {
        width: auto !important;
        height: 2rem !important;
    }

    .song-info {
        user-select: text;
        position: absolute;
        width: auto;
        left: 50%;
        transform: translate(-50%, 0);
        top: 1rem;
        font-family: sans-serif;
        text-align: center;
    }
    .song-name {
        font-size: 1.6rem;
        line-height: 2.5rem;
        font-weight: 700;
        color: white;
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
        top: 6rem;
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
        width: 0.2rem;
        height: 0.7rem;
        background-color: white;
        box-shadow: -700px 0 0 700px white;
        cursor: pointer;
    }

    /* Customize the appearance of the thumb for Firefox */
    .progress-bar::-moz-range-thumb {
        appearance: none;
        width: 0px;
        height: 0px;
        background-color: white;
        box-shadow: -700px 0 0 700px white;
        cursor: pointer;
        border: none;
    }
    .bar {
        background-color: white;
        position: absolute;
        content: '';
        height: 0.4rem;
        display: inline-block;
        border-radius: 1.5rem;
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
    .interactive-box {
        user-select: none;
        position: absolute;
        width: 34vw;
        top: 70vh;
        height: 15rem;
        left: 10vw;
    }
</style>
