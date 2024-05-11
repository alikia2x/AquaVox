<script lang="ts">
    import formatDuration from '$lib/formatDuration';

    export let name: string;
    export let singer: string = '';
    export let duration: number = 0;
    export let progress: number = 0;
    export let paused: boolean;
    export let clickPlay: Function;
</script>

<div class="interactive-box">
    <div class="song-info">
        <span class="song-name text-shadow">{name}</span><br />
        <span class="song-author">{singer}</span>
    </div>
    <div class="progress">
        <div class="time-indicator text-shadow-md time-current">{formatDuration(progress)}</div>
        <div class="progress-bar shadow-md">
            <div class="bar" style={`width: ${(progress / (duration + 0.001)) * 100}%;`}></div>
        </div>
        <div class="time-indicator text-shadow-md time-total">{formatDuration(duration)}</div>
    </div>
    <div class="controls">
        <div style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );" class="control-btn previous">
            <img class="control-img switch-song-img" src="/previous.svg" alt="上一曲" />
        </div>
        <div style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );" class="control-btn play-btn" on:click={() => clickPlay()}>
            <img class="control-img" src={paused ? '/play.svg' : '/pause.svg'} alt="暂停或播放" />
        </div>
        <div style="filter: drop-shadow( 0 4px 8px rgba(0, 0, 0, 0.12) );" class="control-btn next">
            <img class="control-img switch-song-img" src="/next.svg" alt="下一曲" />
        </div>
    </div>
</div>

<style>
    .controls {
        position: absolute;
        top: 9rem;
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
        top: 50%;
        transform: translate(-50%, -50%);
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
        top: 1.8rem;
        position: relative;
        width: 100%;
        height: 0.3rem;
        background-color: rgba(255, 255, 255, .5);
        border-radius: 0.5rem;
    }
    .bar {
        background-color: white;
        position: absolute;
        content: '';
        height: 0.3rem;
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
        position: absolute;
        width: 34vw;
        top: 70vh;
        height: 15rem;
        left: 10vw;
    }
</style>
