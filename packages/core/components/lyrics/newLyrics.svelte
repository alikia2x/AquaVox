<script lang="ts">
    import type { LrcJsonData, ScriptItem } from '@core/lyrics/type';
    import { onMount } from 'svelte';
    import LyricLine from './lyricLine.svelte';
    import createLyricsSearcher from '@core/lyrics/lyricSearcher';

    // constants
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const marginY = viewportWidth > 640 ? 12 : 0;
    const blurRatio = viewportWidth > 640 ? 1 : 1.4;
    const currentLyricTop = viewportWidth > 640 ? viewportHeight * 0.12 : viewportHeight * 0.05;
    const deceleration = 0.95; // Velocity decay factor for inertia
    const minVelocity = 0.1; // Minimum velocity to stop inertia
    document.body.style.overflow = 'hidden';

    // Props
    export let originalLyrics: LrcJsonData;
    export let progress: number;
    export let player: HTMLAudioElement | null;

    // States
    let lyricLines: ScriptItem[] = [];
    let lyricExists = false;
    let lyricsContainer: HTMLDivElement | null;
    let debugMode = false;
    let nextUpdate = 0;
    let lastProgress = 0;
    let showTranslation = false;
    let scrollEventAdded = false;
    let scrolling = false;
    let scrollingTimeout: Timer;
    let lastY: number; // For tracking touch movements
    let lastTime: number; // For tracking time between touch moves
    let velocityY = 0; // Vertical scroll velocity
    let inertiaFrame: number; // For storing the requestAnimationFrame reference

    // References to lyric elements
    let lyricElements: HTMLDivElement[] = [];
    let lyricComponents: LyricLine[] = [];
    let lyricTopList: number[] = [];

    let currentLyricIndex: number;

    $: getLyricIndex = createLyricsSearcher(originalLyrics);

    $: {
        currentLyricIndex = getLyricIndex(progress);
    }

    function initLyricComponents() {
        initLyricTopList();
        for (let i = 0; i < lyricComponents.length; i++) {
            lyricComponents[i].init({ x: 0, y: lyricTopList[i] });
        }
    }

    function initLyricTopList() {
        let cumulativeHeight = currentLyricTop;
        for (let i = 0; i < lyricLines.length; i++) {
            const c = lyricComponents[i];
            lyricElements.push(c.getRef());
            const e = lyricElements[i];
            const elementHeight = e.getBoundingClientRect().height;
            const elementTargetTop = cumulativeHeight;
            cumulativeHeight += elementHeight + marginY;
            lyricTopList.push(elementTargetTop);
        }
    }

    function computeLayout() {
        if (!originalLyrics.scripts) return;
        const currentLyricDuration =
            originalLyrics.scripts[currentLyricIndex].end - originalLyrics.scripts[currentLyricIndex].start;
        const relativeOrigin = lyricTopList[currentLyricIndex] - currentLyricTop;
        for (let i = 0; i < lyricElements.length; i++) {
            const currentLyricComponent = lyricComponents[i];
            let delay = 0;
            if (i < currentLyricIndex) {
                delay = 0;
            } else if (i == currentLyricIndex) {
                delay = 0.042;
            } else {
                delay = Math.min(Math.min(currentLyricDuration, 0.6), 0.067 * (i - currentLyricIndex + 1.2));
            }
            const offset = Math.abs(i - currentLyricIndex);
            let blurRadius = Math.min(offset * blurRatio, 16);
            currentLyricComponent.setBlur(blurRadius);
            currentLyricComponent.update({ x: 0, y: lyricTopList[i] - relativeOrigin }, delay);
        }
    }

    $: {
        if (originalLyrics && originalLyrics.scripts) {
            lyricExists = true;
            lyricLines = originalLyrics.scripts!;
        }
    }

    $: {
        if (lyricComponents.length > 0) {
            initLyricComponents();
        }
    }

    function handleScroll(deltaY: number) {
        for (let i = 0; i < lyricElements.length; i++) {
            const currentLyricComponent = lyricComponents[i];
            const currentY = currentLyricComponent.getInfo().y;
            currentLyricComponent.setBlur(0);
            currentLyricComponent.stop();
            currentLyricComponent.setY(currentY - deltaY);
        }
        scrolling = true;
        if (scrollingTimeout) clearTimeout(scrollingTimeout);
        scrollingTimeout = setTimeout(() => {
            scrolling = false;
        }, 5000);
    }

    // Handle the touch start event
    function handleTouchStart(event: TouchEvent) {
        lastY = event.touches[0].clientY;
    }

    // Handle the touch move event
    function handleTouchMove(event: TouchEvent) {
        const currentY = event.touches[0].clientY;
        const currentTime = Date.now();
        const deltaY = lastY - currentY; // Calculate vertical swipe distance
        const deltaTime = currentTime - lastTime;

        // Calculate the scroll velocity (change in Y over time)
        if (deltaTime > 0) {
            velocityY = deltaY / deltaTime;
        }

        handleScroll(deltaY); // Simulate the scroll event
        lastY = currentY; // Update lastY for the next move event
        lastTime = currentTime; // Update the lastTime for the next move event
    }

    // Handle the touch end event
    function handleTouchEnd() {
        // Start inertia scrolling based on the velocity
        function inertiaScroll() {
            if (Math.abs(velocityY) < minVelocity) {
                cancelAnimationFrame(inertiaFrame);
                return;
            }
            handleScroll(velocityY * 16); // Multiply by frame time (16ms) to get smooth scroll
            velocityY *= deceleration; // Apply deceleration to velocity
            inertiaFrame = requestAnimationFrame(inertiaScroll); // Continue scrolling in next frame
        }

        inertiaScroll();
    }

    $: {
        if (lyricsContainer && !scrollEventAdded) {
            // Wheel event for desktop
            lyricsContainer.addEventListener(
                'wheel',
                (e) => {
                    e.preventDefault();
                    const deltaY = e.deltaY;
                    handleScroll(deltaY);
                },
                { passive: false }
            );

            // Touch events for mobile
            lyricsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
            lyricsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
            lyricsContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

            scrollEventAdded = true;
        }
    }

    $: {
        if (lyricsContainer && lyricComponents.length > 0) {
            if (progress >= nextUpdate - 0.5 && !scrolling) {
                computeLayout();
            }
            if (Math.abs(lastProgress - progress) > 0.5) {
                scrolling = false;
            }
            if (lastProgress - progress > 0) {
                computeLayout();
                nextUpdate = progress;
            } else {
                const lyricLength = originalLyrics.scripts!.length;
                const currentEnd = originalLyrics.scripts![currentLyricIndex].end;
                const nextStart = originalLyrics.scripts![Math.min(currentLyricIndex + 1, lyricLength - 1)].start;
                if (currentEnd !== nextStart) {
                    nextUpdate = currentEnd;
                } else {
                    nextUpdate = nextStart;
                }
            }
        }
        lastProgress = progress;
    }

    // $: {
    //     for (let i = 0; i < lyricElements.length; i++) {
    //         const s = originalLyrics.scripts![i].start;
    //         const t = originalLyrics.scripts![i].end;
    //         // Explain:
    //         // The `currentLyricIndex` is also used for locating & layout computing,
    //         // so when the current progress is in the interlude between two lyrics,
    //         // `currentLyricIndex` still needs to have a valid value to ensure that
    //         // the style and scrolling position are calculated correctly.
    //         // But in that situation, the “current lyric index” does not exist.
    //         const isCurrent = i == currentLyricIndex && s <= progress && progress <= t;
    //         const currentLyricComponent = lyricComponents[i];
    //         currentLyricComponent.setCurrent(isCurrent);
    //     }
    // }

    onMount(() => {
        // Initialize
        if (localStorage.getItem('debugMode') == null) {
            localStorage.setItem('debugMode', 'false');
        } else {
            debugMode = localStorage.getItem('debugMode')!.toLowerCase() === 'true';
        }
    });

    // handle KeyDown event
    function onKeyDown(e: KeyboardEvent) {
        if (e.altKey && e.shiftKey && (e.metaKey || e.key === 'OS') && e.key === 'Enter') {
            debugMode = !debugMode;
            localStorage.setItem('debugMode', debugMode ? 'true' : 'false');
        } else if (e.key === 't') {
            showTranslation = !showTranslation;
            localStorage.setItem('showTranslation', showTranslation ? 'true' : 'false');
            computeLayout();
        }
    }

    function lyricClick(lyricIndex: number) {
        if (player === null || originalLyrics.scripts === undefined) return;
        player.currentTime = originalLyrics.scripts[lyricIndex].start;
        player.play();
    }
</script>

<svelte:window on:keydown={onKeyDown} />

{#if debugMode}
    <span class="text-lg absolute">
        progress: {progress.toFixed(2)}, nextUpdate: {nextUpdate}, scrolling: {scrolling}, current: {currentLyricIndex}
    </span>
{/if}

{#if originalLyrics && originalLyrics.scripts}
    <div
        class="absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12
        lg:px-[7.5rem] xl:left-[46vw] xl:px-[3vw] h-[calc(100vh-17rem)] xl:h-screen font-sans
        text-left no-scrollbar z-[1] pt-16 overflow-hidden"
        bind:this={lyricsContainer}
    >
        {#each lyricLines as lyric, i}
            <LyricLine line={lyric} index={i} bind:this={lyricComponents[i]} {debugMode} {lyricClick} {progress} />
        {/each}
    </div>
{/if}
