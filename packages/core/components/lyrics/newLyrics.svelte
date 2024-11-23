<script lang="ts">
    import { type LyricData, type ScriptItem } from '@alikia/aqualyrics';
    import { onMount } from 'svelte';
    import LyricLine from './lyricLine.svelte';
    import createLyricsSearcher from '@core/lyrics/lyricSearcher';
    import userAdjustingProgress from '@core/state/userAdjustingProgress';

    // constants
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const marginY = viewportWidth > 640 ? 12 : 0;
    const blurRatio = viewportWidth > 640 ? 1 : 1.4;
    const currentLyricTop = viewportWidth > 640 ? viewportHeight * 0.12 : viewportHeight * 0.05;
    const deceleration = 0.95; // Velocity decay factor for inertia
    const minVelocity = 0.001; // Minimum velocity to stop inertia
    document.body.style.overflow = 'hidden';

    // Props
    let { originalLyrics, progress, player, showInteractiveBox } : {
        originalLyrics: LyricData,
        progress: number,
        player: HTMLAudioElement | null,
        showInteractiveBox: boolean
    } = $props();

    // States
    let lyricLines: ScriptItem[] = $state([]);
    let lyricsContainer: HTMLDivElement | null = $state(null);
    let debugMode = $state(false);
    let nextUpdate = $state(0);
    let lastProgress = $state(0);
    let showTranslation = $state(false);
    let scrollEventAdded = $state(false);
    let scrolling = $state(false);
    let scrollingTimeout: Timer | null = $state(null);
    let lastY: number = $state(0); // For tracking touch movements
    let lastTime: number = $state(0); // For tracking time between touch moves
    let velocityY = $state(0); // Vertical scroll velocity
    let inertiaFrame: number = $state(0); // For storing the requestAnimationFrame reference
    let inertiaFrameCount: number = $state(0);

    // References to lyric elements
    let lyricElements: HTMLDivElement[] = $state([]);
    let lyricComponents: LyricLine[] = $state([]);
    let lyricTopList: number[] = $state([]);

    let getLyricIndex = $derived(createLyricsSearcher(originalLyrics));
    let currentLyricIndex = $derived(getLyricIndex(progress));

    function initLyricComponents() {
        initLyricTopList();
        for (let i = 0; i < lyricComponents.length; i++) {
            const currentLyric = lyricComponents[i];
            currentLyric.init({ x: 0, y: lyricTopList[i] });
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
            const lyric = originalLyrics.scripts[i];
            let delay = 0;
            if (progress > lyric.end) {
                delay = 0;
            } else if (lyric.start <= progress && progress <= lyric.end) {
                delay = 0.042;
            } else {
                delay = Math.min(Math.min(currentLyricDuration, 0.6), 0.067 * (i - currentLyricIndex + 1.2));
            }
            currentLyricComponent.update({ x: 0, y: lyricTopList[i] - relativeOrigin }, delay);
        }
    }

    function seekForward() {
        if (!originalLyrics.scripts) return;
        const relativeOrigin = lyricTopList[currentLyricIndex] - currentLyricTop;
        for (let i = 0; i < lyricElements.length; i++) {
            const currentLyricComponent = lyricComponents[i];
            currentLyricComponent.scrollTo(lyricTopList[i] - relativeOrigin);
        }
        lastSeekForward = new Date().getTime();
    }

    $effect(() => {
        if (!originalLyrics || !originalLyrics.scripts) return;
        lyricLines = originalLyrics.scripts!;
    });
    let initialized = $state(false);
    $effect(() => {
        if (lyricComponents.length > 0 && !initialized) {
            initLyricComponents();
            initialized = true;
        }
    });

    function handleScroll(deltaY: number) {
        for (let i = 0; i < lyricElements.length; i++) {
            const currentLyricComponent = lyricComponents[i];
            const currentY = currentLyricComponent.getInfo().y;
            scrolling = true;
            currentLyricComponent.stop();
            currentLyricComponent.setY(currentY - deltaY);
            currentLyricComponent.syncSpringWithDelta(deltaY);
        }
        scrolling = true;
        if (scrollingTimeout) clearTimeout(scrollingTimeout);
        scrollingTimeout = setTimeout(() => {
            scrolling = false;
        }, 2000);
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

    $effect(() => {
        if (!lyricsContainer || scrollEventAdded) return;
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
    });

    let lastEventLyricIndex = $state(0);
    let lastEventProgress = $state(0);
    let lastSeekForward = $state(0);
    $effect(() => {
        const progressDelta = progress - lastEventProgress;
        const deltaInRange = 0 <= progressDelta && progressDelta <= 0.15;
        const deltaTooBig = progressDelta > 0.15;
        const deltaIsNegative = progressDelta < 0;
        const lyricChanged = currentLyricIndex !== lastEventLyricIndex;
        const lyricIndexDeltaTooBig = Math.abs(currentLyricIndex - lastEventLyricIndex) > 1;

        lastEventLyricIndex = currentLyricIndex;
        lastEventProgress = progress;
        if (!lyricChanged || scrolling) return;
        if (!lyricIndexDeltaTooBig && deltaInRange) {
            console.log("Event: regular move");
            console.log(new Date().getTime(), lastSeekForward);
            computeLayout();
        }
        else if ($userAdjustingProgress) {
            if (deltaTooBig && lyricChanged) {
                console.log("Event: seek forward");
                seekForward();
            } else if (deltaIsNegative && lyricChanged) {
                console.log("Event: seek backward");
                seekForward();
            }
        }
        else {
            console.log("Event: regular move");
            computeLayout();
        }
    });

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
        userAdjustingProgress.set(false);
        player.play();
    }
</script>

<svelte:window on:keydown={onKeyDown} />

{#if debugMode}
    <span
        class="text-white text-lg absolute z-50 px-2 py-0.5 m-2 rounded-3xl bg-white bg-opacity-20 backdrop-blur-lg
         right-0 font-mono">
        progress: {progress.toFixed(2)}, nextUpdate: {nextUpdate}, scrolling: {scrolling}, current: {currentLyricIndex},
        uap: {$userAdjustingProgress}
    </span>
{/if}

{#if originalLyrics && originalLyrics.scripts}
    <div
        class={`absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12 duration-500
        ${showInteractiveBox ? "h-[calc(100vh-21rem)]" : "h-[calc(100vh-7rem)]"}
        lg:px-[7.5rem] xl:left-[46vw] xl:px-[3vw] xl:h-screen font-sans
        text-left no-scrollbar z-[1] pt-16 overflow-hidden`}
        style={`mask: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 7%, rgba(0, 0, 0, 1) 95%,
        rgba(0, 0, 0, 0) 100%);`}
        bind:this={lyricsContainer}
    >
        {#each lyricLines as lyric, i}
            <LyricLine line={lyric} index={i} bind:this={lyricComponents[i]} {debugMode} {lyricClick} {progress}
                       {currentLyricIndex} {scrolling}/>
        {/each}
    </div>
{/if}
