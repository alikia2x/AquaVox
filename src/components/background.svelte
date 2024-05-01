<script lang="ts">
    import { processImage } from '$lib/graphics';
    import localforage from 'localforage';
    // Initialize IndexedDB
    localforage.config({
        driver: localforage.INDEXEDDB,
        name: 'audioDB'
    });

    export let coverId: string;
    let canvas: HTMLCanvasElement;
    localforage.getItem(`${coverId}-cover`, function (err, file) {
        console.log(file);
        console.log(err);
        if (file) {
            const path = URL.createObjectURL(file as File);
            processImage(16, 4, 96, path, canvas);
        }
    });
</script>

<div class="bg">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .bg {
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
        overflow: hidden;
    }
    canvas {
        position: relative;
        width: 110%;
        height: 110%;
        object-fit: cover;
    }
</style>
