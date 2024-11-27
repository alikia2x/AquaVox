<script lang="ts">
    import createSpring from '@core/graphics/spring';
    import type { ScriptItem } from '@alikia/aqualyrics';
    import type { LyricPos } from './type';
    import type { Spring } from '@core/graphics/spring/spring';

    const viewportWidth = document.documentElement.clientWidth;

    export let line: ScriptItem;
    export let index: number;
    export let debugMode: Boolean;
    export let lyricClick: Function;

    let ref: HTMLDivElement;
    let clickMask: HTMLSpanElement;

    let time = 0;
    let positionX: number = 0;
    let positionY: number = 0;
    let opacity = 1;
    let stopped = false;
    let lastPosX: number | undefined = undefined;
    let lastPosY: number | undefined = undefined;
    let lastUpdateY: number | undefined = undefined;
    let lastUpdateX: number | undefined = undefined;
    let springY: Spring | undefined = undefined;
    let springX: Spring | undefined = undefined;
    let isCurrentLyric = false;

    function updateY(timestamp: number) {
        if (lastUpdateY === undefined) {
            lastUpdateY = new Date().getTime();
        }
        if (springY === undefined) return;
        time = (new Date().getTime() - lastUpdateY) / 1000;
        springY.update(time);
        positionY = springY.getCurrentPosition();
        if (!springY.arrived() && !stopped) {
            requestAnimationFrame(updateY);
        }
        lastUpdateY = new Date().getTime();
    }

    function updateX(timestamp: number) {
        if (lastUpdateX === undefined) {
            lastUpdateX = timestamp;
        }
        if (springX === undefined) return;
        time = (new Date().getTime() - lastUpdateX) / 1000;
        springX.update(time);
        positionX = springX.getCurrentPosition();
        if (!springX.arrived()) {
            requestAnimationFrame(updateX);
        }
        lastUpdateX = timestamp;
    }

    /**
     * Set the x position of the element, **with no animation**
     * @param {number} pos - X offset, in pixels
     */
    export const setX = (pos: number) => {
        positionX = pos;
    };

    /**
     * Set the y position of the element, **with no animation**
     * @param {number} pos - Y offset, in pixels
     */
    export const setY = (pos: number) => {
        positionY = pos;
    };

    export const setCurrent = (isCurrent: boolean) => {
        isCurrentLyric = isCurrent;
        opacity = isCurrent ? 1 : 0.36;
    };

    export const setBlur = (blur: number) => {
        ref.style.filter = `blur(${blur}px)`;
    };

    export const update = (pos: LyricPos, delay: number = 0) => {
        if (lastPosX === undefined || lastPosY === undefined) {
            lastPosX = pos.x;
            lastPosY = pos.y;
        }
        springX!.setTargetPosition(pos.x, delay);
        springY!.setTargetPosition(pos.y, delay);
        lastUpdateY = new Date().getTime();
        lastUpdateX = new Date().getTime();
        stopped = false;
        requestAnimationFrame(updateY);
        requestAnimationFrame(updateX);
        lastPosX = pos.x;
        lastPosY = pos.y;
    };

    export const getInfo = () => {
        return {
            x: positionX,
            y: positionY,
            isCurrent: isCurrentLyric
        };
    };

    export const init = (pos: LyricPos) => {
        lastPosX = pos.x;
        lastPosY = pos.y;
        positionX = pos.x;
        positionY = pos.y;
        springX = createSpring(pos.x, pos.x, 0.114, 0.72);
        springY = createSpring(pos.y, pos.y, 0.114, 0.72);
    };

    export const stop = () => {
        stopped = true;
    };

    export const getRef = () => ref;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    style="transform: translate3d({positionX}px, {positionY}px, 0); transition-property: opacity, text-shadow; 
    transition-duration: 0.36s; transition-timing-function: ease-out; opacity: {opacity};
    transform-origin: center left;"
    class="absolute z-50 w-full pr-12 lg:pr-16 cursor-default py-5"
    bind:this={ref}
    on:touchstart={() => {
        clickMask.style.backgroundColor = 'rgba(255,255,255,.3)';
    }}
    on:touchend={() => {
        clickMask.style.backgroundColor = 'transparent';
    }}
    on:click={() => {
        lyricClick(index);
    }}
>
    <span
        class="absolute w-[calc(100%-2.5rem)] lg:w-[calc(100%-3rem)] h-full
        -translate-x-2 lg:-translate-x-5 -translate-y-5 rounded-lg duration-300 lg:hover:bg-[rgba(255,255,255,.15)]"
        bind:this={clickMask}
    >
    </span>
    {#if debugMode}
        <span class="text-lg absolute -translate-y-7">
            {index}: duration: {(line.end - line.start).toFixed(3)}, {line.start.toFixed(3)}~{line.end.toFixed(3)}
        </span>
    {/if}
    <span
        class={`text-white text-[2rem] leading-9 lg:text-5xl lg:leading-[4rem] font-semibold text-shadow-lg mr-4
    ${isCurrentLyric ? 'text-glow' : ''}`}
    >
        {line.text}
    </span>
    {#if line.translation}
        <br />
        <span class={`pl-2 relative text-xl lg:text-2xl top-2 duration-300`}>
            {line.translation}
        </span>
    {/if}
</div>

<style>
    .text-glow {
        text-shadow:
            0 0 3px #ffffff2c,
            0 0 6px #ffffff2c,
            0 15px 30px rgba(0, 0, 0, 0.11),
            0 5px 15px rgba(0, 0, 0, 0.08);
    }
</style>
