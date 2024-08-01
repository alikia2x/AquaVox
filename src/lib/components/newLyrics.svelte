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
    export let bottomLine: Node = document.createElement('div');
    export let onLyricLineClick: (line: LyricLineMouseEvent) => void = () => {};
    export let onLyricLineContextMenu: (line: LyricLineMouseEvent) => void = () => {};
    export let lyricPlayer: CoreLyricPlayer;
    let className;
    export { className as class };

    let lyricsElement: HTMLDivElement | null;
    let bottomLineElement: HTMLDivElement | null;

    let animationCanceled = false;
    let animationLastTime = -1;
    let lineClickHandler: (e: Event) => void;
    let contextMenuHandler: (e: Event) => void;

    $: {
        if (playing) {
            lyricPlayer.resume();
        } else {
            lyricPlayer.pause();
        }
    }

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

    $: {
        if (!disabled) {
            startAnimation();
        } else {
            stopAnimation();
        }
    }

    $: {
        if (lyricsElement) {
            lyricsElement.appendChild(lyricPlayer.getElement());
        }
        if (bottomLineElement) {
            lyricPlayer.getBottomLineElement().appendChild(bottomLine);
        }
    }

    $: {
        lyricPlayer.setAlignAnchor(alignAnchor);
        lyricPlayer.setAlignPosition(alignPosition);
        lyricPlayer.setEnableSpring(enableSpring);
        lyricPlayer.setEnableScale(enableScale);
        lyricPlayer.setEnableBlur(enableBlur);
        lyricPlayer.setLinePosXSpringParams(linePosXSpringParams);
        lyricPlayer.setLinePosYSpringParams(linePosYSpringParams);
        lyricPlayer.setLineScaleSpringParams(lineScaleSpringParams);
        lyricPlayer.setHidePassedLines(hidePassedLines);
    }

    $: {
        lyricPlayer.setLyricLines(lyricLines);
        lyricPlayer.update();
    }

    $: {
        lyricPlayer.setCurrentTime(currentTime);
    }

    $: {
        lineClickHandler = (e: Event) => onLyricLineClick(e as LyricLineMouseEvent);
        lyricPlayer.addEventListener('line-click', lineClickHandler);
    }

    $: {
        contextMenuHandler = (e: Event) => onLyricLineContextMenu(e as LyricLineMouseEvent);
        lyricPlayer.addEventListener('line-contextmenu', contextMenuHandler);
    }

    onDestroy(() => {
        animationCanceled = true;
        lyricPlayer.dispose();
        lyricPlayer.removeEventListener('line-contextmenu', contextMenuHandler);
        lyricPlayer.removeEventListener('line-click', lineClickHandler);
    });
</script>

<div bind:this={lyricsElement} class={className}></div>

<div bind:this={bottomLineElement}></div>
