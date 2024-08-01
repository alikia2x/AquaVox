<script lang="ts">
    import { onDestroy } from 'svelte';
    import {
        LyricPlayer as CoreLyricPlayer,
        type LyricLineMouseEvent,
        type LyricLine,
        type spring
    } from '@applemusic-like-lyrics/core';

    export let disabled: boolean = false;
    export let playing: boolean = true;
    export let alignAnchor: 'top' | 'bottom' | 'center' = 'center';
    export let alignPosition: number = 0.5;
    export let enableSpring: boolean = true;
    export let enableBlur: boolean = true;
    export let enableScale: boolean = true;
    export let hidePassedLines: boolean = false;
    export let lyricLines: LyricLine[] = [];
    export let currentTime: number = 0;
    export let linePosXSpringParams: Partial<spring.SpringParams> = {};
    export let linePosYSpringParams: Partial<spring.SpringParams> = {};
    export let lineScaleSpringParams: Partial<spring.SpringParams> = {};
    export let bottomLine: any = null;
    export let onLyricLineClick: (line: LyricLineMouseEvent) => void = () => {};
    export let onLyricLineContextMenu: (line: LyricLineMouseEvent) => void = () => {};

    export let lyricPlayer: CoreLyricPlayer;
    let wrapperEl: HTMLDivElement | null;

    $: {
        if (playing) {
            lyricPlayer.resume();
        } else {
            lyricPlayer.pause();
        }
    }

    let animationCanceled = false;
    let animationLastTime = -1;

    const onFrame = (time: number) => {
        if (animationCanceled) return;
        if (animationLastTime === -1) {
            animationLastTime = time;
        }
        lyricPlayer.update(time - animationLastTime);
        animationLastTime = time;
        requestAnimationFrame(onFrame);
    };

    const startAnimation = () => {
        animationCanceled = false;
        animationLastTime = -1;
        requestAnimationFrame(onFrame);
    };

    const stopAnimation = () => {
        animationCanceled = true;
    };

    // Monitor changes to `disabled`
    $: {
        if (!disabled) {
            startAnimation();
        } else {
            stopAnimation();
        }
    }

    $: {
        if (playing) {
            lyricPlayer.resume();
        } else {
            lyricPlayer.pause();
        }
    }

    $: {
        if (lyricPlayer && wrapperEl) {
            wrapperEl.appendChild(lyricPlayer.getElement());
        }
    }

    $: {
        if (alignAnchor !== undefined) {
            lyricPlayer.setAlignAnchor(alignAnchor);
        }
    }

    $: {
        lyricPlayer.setLyricLines(lyricLines);
        lyricPlayer.update();
    }

    $: {
        lyricPlayer.setAlignPosition(alignPosition);
    }

    $: {
        lyricPlayer.setEnableSpring(enableSpring);
    }

    $: {
        lyricPlayer.setEnableScale(enableScale);
    }

    $: {
        lyricPlayer.setEnableBlur(enableBlur);
    }

    $: {
        lyricPlayer.setCurrentTime(currentTime);
    }

    $: {
        const handler = (e: Event) => onLyricLineClick(e as LyricLineMouseEvent);
        lyricPlayer.addEventListener('line-click', handler);
    }

    // Clean up on component unmount
    onDestroy(() => {
        animationCanceled = true;
        lyricPlayer.dispose();
    });
</script>

<div
    bind:this={wrapperEl}
    class="absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12 lg:px-[7.5rem] xl:left-[45vw]
        xl:px-[3vw] h-[calc(100vh-17rem)] xl:h-screen font-sans
        text-left no-scrollbar overflow-y-auto z-[1] pt-16 font-semibold mix-blend-plus-lighter"
></div>
