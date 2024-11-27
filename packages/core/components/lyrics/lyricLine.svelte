<script lang="ts">
    import createSpring from '@core/graphics/spring';
    import type { LyricWord, ScriptItem } from '@alikia/aqualyrics';
    import type { LyricPos } from './type';
    import type { Spring } from '@core/graphics/spring/spring';
    import userAdjustingProgress from '@core/state/userAdjustingProgress';

    const viewportWidth = document.documentElement.clientWidth;
    const blurRatio = viewportWidth > 640 ? 1.2 : 1.4;
    const scrollDuration = 0.2;

    export let line: ScriptItem;
    export let index: number;
    export let debugMode: Boolean;
    export let lyricClick: Function;
    export let progress: number;
    export let currentLyricIndex: number;
    export let scrolling: boolean;

    let ref: HTMLDivElement;
    let clickMask: HTMLSpanElement;

    let time = 0;
    let positionX: number = 0;
    let positionY: number = 0;
    let blur = 0;
    let stopped = false;
    let we_are_scrolling = false;
    let scrollTarget: number | undefined = undefined;
    let scrollFrom: number | undefined = undefined;
    let scrollingStartTime: number | undefined = undefined;
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
        if (!springY.arrived() && !stopped && !we_are_scrolling) {
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

    $: {
        if (ref && ref.style) {
            let blurRadius = 0;
            const offset = Math.abs(index - currentLyricIndex);
            if (progress > line.end) {
                blurRadius = Math.min(offset * blurRatio, 16);
            } else if (line.start <= progress && progress <= line.end) {
                blurRadius = 0;
            } else {
                blurRadius = Math.min(offset * blurRatio, 16);
            }
            if (scrolling) blurRadius = 0;
            if ($userAdjustingProgress) blurRadius = 0;
            blur = blurRadius
        }
    }

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

    function updateScroll(timestamp: number) {
        const elapsedTime = (new Date().getTime() - scrollingStartTime!) / 1000;
        const percentage = Math.min(elapsedTime / scrollDuration, 1);
        positionY = scrollFrom! + (scrollTarget! - scrollFrom!) * percentage;
        if (percentage < 1) {
            requestAnimationFrame(updateScroll);
        }
    }

    export const scrollTo = (targetY: number) => {
        scrollFrom = positionY;
        scrollTarget = targetY;
        scrollingStartTime = new Date().getTime();
        we_are_scrolling = true;
        requestAnimationFrame(updateScroll);
        springY!.setPosition(targetY);
        we_are_scrolling = false;
    };


    export const syncSpringWithDelta = (deltaY: number) => {
        const target = positionY + deltaY;
        springY!.setPosition(target);
    }

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

    // Calculate if the current character should be highlighted based on progress
    const isCharacterHighlighted = (line: ScriptItem, word: LyricWord, charIndex: number, progress: number) => {
        const charProgress = getCharacterProgress(word, charIndex);
        return line.start <= progress &&
            progress <= line.end &&
            progress > charProgress;
    };

    // Get the progress timing for a specific character in a word
    const getCharacterProgress = (word: LyricWord, charIndex: number) => {
        const { startTime, endTime } = word;
        const wordDuration = endTime - startTime;
        return wordDuration * (charIndex / word.word.length) + startTime;
    };

    // Calculate the transition duration for a character
    const getTransitionDuration = (word: LyricWord, charIndex: number) => {
        const { startTime, endTime } = word;
        const wordDuration = endTime - startTime;
        const charDuration = wordDuration * ((charIndex + 1) / word.word.length);

        // If duration is less than 0.6s, we'll use CSS class with fixed duration
        if (charDuration < 0.6) {
            return null;
        }

        // Otherwise, calculate custom duration
        return charDuration / 1.6;
    };

    // Generate the CSS classes for a character
    const getCharacterClasses = (line: ScriptItem, word: LyricWord, charIndex: number, progress: number) => {
        const baseClasses = 'inline-block';
        const opacityClass = isCharacterHighlighted(line, word, charIndex, progress)
            ? 'opacity-100 text-glow'
            : 'opacity-35';

        return `${baseClasses} ${opacityClass}`.trim();
    };

    // Generate the style string for a character
    const getCharacterStyle = (line: ScriptItem, word: LyricWord, charIndex: number, progress: number) => {
        const duration = getTransitionDuration(word, charIndex);
        const progressAtCurrentLine = progress <= line.end;
        return (duration && progressAtCurrentLine) ? `transition-duration: ${duration}s;` : 'transition-duration: 200ms;';
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    bind:this={ref}
    class="absolute z-50 w-full pr-12 lg:pr-16 cursor-default py-5"
    on:click={() => {
        lyricClick(index);
    }}
    on:touchend={() => {
        clickMask.style.backgroundColor = 'transparent';
    }}
    on:touchstart={() => {
        clickMask.style.backgroundColor = 'rgba(255,255,255,.3)';
    }}
    style="transform: translate3d({positionX}px, {positionY}px, 0);
    transform-origin: center left; font-family: LyricFont, sans-serif; filter: blur({blur}px)"
>
    <span
        bind:this={clickMask}
        class="absolute w-[calc(100%-2.5rem)] lg:w-[calc(100%-3rem)] h-full
        -translate-x-2 lg:-translate-x-5 -translate-y-5 rounded-lg duration-300 lg:hover:bg-[rgba(255,255,255,.15)] z-[100]"
    >
    </span>
    {#if debugMode}
        <span class="text-white text-lg absolute -translate-y-7">
            {index}: duration: {(line.end - line.start).toFixed(3)}, {line.start.toFixed(3)}~{line.end.toFixed(3)}
        </span>
    {/if}
    {#if line.words !== undefined && line.words.length > 0}
        <span class={`text-white text-[2rem] leading-9 lg:text-5xl lg:leading-[4rem] font-semibold mr-4 `}>
            {#each line.words as word}
                {#if word.word}
                    {#each word.word.split('') as chr, i}
                        <span
                            class={getCharacterClasses(line, word, i, progress)}
                            style={getCharacterStyle(line, word, i, progress)}
                        >
                            {chr}
                        </span>
                    {/each}
                {/if}
            {/each}
        </span>
    {:else}
        <span
            class={`text-white text-[2rem] leading-9 lg:text-5xl lg:leading-[4rem] font-semibold mr-4 duration-200
            ${line.start <= progress && progress <= line.end ? 'opacity-100 text-glow' : 'opacity-35'}`}
        >
            {line.text}
        </span>
    {/if}

    {#if line.translation}
        <br />
        <span class={`pl-2 relative text-xl lg:text-2xl top-2 duration-300 text-white`}>
            {line.translation}
        </span>
    {/if}
</div>

<style>
    .text-glow {
        text-shadow: 0 0 3px #ffffff2c,
        0 0 6px #ffffff2c,
        0 15px 30px rgba(0, 0, 0, 0.11),
        0 5px 15px rgba(0, 0, 0, 0.08);
    }
</style>
