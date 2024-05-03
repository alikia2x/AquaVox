<script lang="ts">
    import { processImage } from '$lib/graphics';
    import blobToImageData from '$lib/graphics/blob2imageData';
    import imageDataToBlob from '$lib/graphics/imageData2blob';
    import localforage from '$lib/storage';
    export let coverId: string;
    let canvas: HTMLCanvasElement;

    localforage.getItem(`${coverId}-cover-cache`, function (err, file) {
        if (file) {
            const ctx = canvas.getContext('2d');
            blobToImageData(file as Blob).then((imageData) => {
                ctx?.putImageData(imageData, 0, 0);
                canvas.style.opacity = '1';
            });
        } else {
            localforage.getItem(`${coverId}-cover`, function (err, file) {
                if (file) {
                    const path = URL.createObjectURL(file as File);
                    processImage(16, 3, 96, path, canvas, (resultImageData: ImageData) => {
                        localforage.setItem(
                            `${coverId}-cover-cache`,
                            imageDataToBlob(resultImageData)
                        );
                        canvas.style.opacity = '1';
                    });
                }
            });
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
        object-fit: cover;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: 0.6s;
    }
</style>
