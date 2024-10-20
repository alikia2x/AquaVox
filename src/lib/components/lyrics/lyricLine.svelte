<script lang="ts">
    import createSpring from '$lib/graphics/spring';
    import type { ScriptItem } from '$lib/lyrics/type';
    import type { LyricPos } from './type';
    import type { Spring } from '$lib/graphics/spring/spring';

    export let line: ScriptItem;
    export let index: number;
    export let debugMode: Boolean;
    export let initPos: LyricPos;
    let ref: HTMLDivElement;

    let time = 0;
    let positionX: number = 0;
    let positionY: number = 0;
    let lastPosX: number | undefined = undefined;
    let lastPosY: number | undefined = undefined;
    let lastUpdateY: number | undefined = undefined;
    let lastUpdateX: number | undefined = undefined;
    let springY: Spring | undefined = undefined;
    let springX: Spring | undefined = undefined;
    let isCurrentLyric = false;

    $: {
        if (initPos) {
            positionX = initPos.x;
            positionY = initPos.y;
        }
    }

    function updateY(timestamp: number) {
        if (lastUpdateY === undefined) {
            lastUpdateY = timestamp;
        }
        if (springY === undefined) return;
        time = (timestamp - lastUpdateY) / 1000;
        springY.update(time);
        positionY = springY.getCurrentPosition();
        if (!springY.arrived()) {
            requestAnimationFrame(updateY);
        }
        lastUpdateY = timestamp;
    }

    function updateX(timestamp: number) {
        if (lastUpdateX === undefined) {
            lastUpdateX = timestamp;
        }
        if (springX === undefined) return;
        time = (timestamp - lastUpdateX) / 1000;
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
    };

    export const update = (pos: LyricPos, delay: number = 0) => {
        if (lastPosX === undefined) {
            lastPosX = pos.x;
        }
        if (lastPosY === undefined) {
            lastPosY = pos.y;
        }
        springY = createSpring(lastPosY, pos.y, 0.12, 0.7, delay);
        springX = createSpring(lastPosX, pos.x, 0.12, 0.7, delay);
        requestAnimationFrame(updateY);
        requestAnimationFrame(updateX);
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
    };

    export const getRef = () => ref;
</script>

<div style="transform: translateY({positionY}px) translateX({positionX}px);" class="absolute z-50" bind:this={ref}>
    {#if debugMode}
        <span class="text-lg absolute -translate-y-7">Line idx: {index}</span>
    {/if}
    <span class={`text-white text-5xl font-semibold text-shadow-lg ${!isCurrentLyric && 'opacity-50'} `}>
        {line.text}
    </span>
</div>
