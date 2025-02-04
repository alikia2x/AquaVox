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

    let prevRealY: number | undefined = undefined;
    let prevRealTime: number | undefined = undefined;
    let lastRealY: number | undefined = undefined;
    let lastRealTime: number | undefined = undefined;
    const INTERPOLATED_RATE = 0; // 可调节的插值间隔（0-1）

    function updateY(timestamp: number) {
        if (stopped) return;

        const currentTime = new Date().getTime();
        const isRealFrame = Math.random() > INTERPOLATED_RATE;

        if (isRealFrame) {
            // 真实物理帧处理
            if (lastUpdateY === undefined) {
                lastUpdateY = currentTime;
            }
            if (springY === undefined) return;

            // 保存前一次的真实帧数据
            prevRealY = lastRealY;
            prevRealTime = lastRealTime;

            // 更新物理状态
            const deltaTime = (currentTime - lastUpdateY) / 1000;
            springY.update(deltaTime);
            positionY = springY.getCurrentPosition();

            // 记录当前真实帧数据
            lastRealY = positionY;
            lastRealTime = currentTime;
            lastUpdateY = currentTime;

            // 继续请求动画帧
            if (!springY?.arrived() && !stopped && !we_are_scrolling) {
                requestAnimationFrame(updateY);
            }
        } else {
            // 插值帧处理
            if (lastRealY !== undefined && lastRealTime !== undefined) {
                const timeSinceLastReal = currentTime - lastRealTime;
                const deltaT = timeSinceLastReal / 1000;

                // 计算速度（如果有前一次真实帧数据）
                let velocity = 0;
                if (prevRealY !== undefined && prevRealTime !== undefined && lastRealTime !== prevRealTime) {
                    velocity = (lastRealY - prevRealY) / ((lastRealTime - prevRealTime) / 1000);
                }

                positionY = lastRealY + velocity * deltaT;
            }

            // 无论是否成功插值都保持动画流畅
            if (!stopped && !we_are_scrolling) {
                requestAnimationFrame(updateY);
            }
        }
    }

    function updateX(timestamp: number) {
        if (stopped) return;
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
        stopped = true;
        positionX = pos;
    };

    /**
     * Set the y position of the element, **with no animation**
     * @param {number} pos - Y offset, in pixels
     */
    export const setY = (pos: number) => {
        stopped = true;
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
            blur = blurRadius;
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

    let processedChars = line.words?.flatMap((word) => {
        const { startTime, endTime, word: text } = word;
        const wordDuration = endTime - startTime;
        return text.split('').map((chr, i) => {
            const charProgress = startTime + wordDuration * (i / text.length);
            const charDuration = wordDuration * ((i + 1) / text.length);
            const transitionDur = charDuration < 0.6 ? null : charDuration / 1.6;
            return { chr, charProgress, transitionDur };
        });
    });

    // 新增：缓存当前行状态
    $: isActiveLine = line.start <= progress && progress <= line.end;
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
            {#each processedChars as char (char.charProgress)}
                {@const isHighlighted = line.start <= progress && progress <= line.end && progress > char.charProgress}
                {@const useCustomTransition = char.transitionDur !== null && isActiveLine}

                <span
                    class="inline-block {isHighlighted ? 'opacity-100 text-glow' : 'opacity-35'}"
                    style={useCustomTransition
                        ? `transition-duration: ${char.transitionDur}s;`
                        : 'transition-duration: 200ms;'}
                >
                    {char.chr}
                </span>
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
        text-shadow:
            0 0 3px #ffffff2c,
            0 0 6px #ffffff2c,
            0 15px 30px rgba(0, 0, 0, 0.11),
            0 5px 15px rgba(0, 0, 0, 0.08);
    }
    /* 预定义过渡类 */
    .char-transition {
        transition-property: opacity;
        transition-timing-function: ease-out;
    }

    .fast-transition {
        transition-duration: 200ms;
    }

    .custom-transition {
        transition-duration: var(--custom-duration);
    }
</style>
