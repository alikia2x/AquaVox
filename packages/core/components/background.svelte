<script lang="ts">
    import { processImage } from '@core/graphics';
    import blobToImageData from '@core/graphics/blob2imageData';
    import imageDataToBlob from '@core/graphics/imageData2blob';
    import localforage from '@core/utils/storage';
    export let coverId: string;
    let canvas: HTMLCanvasElement;

    localforage.getItem(`${coverId}-cover-cache`, function (err, file) {
        if (file) {
            const ctx = canvas.getContext('2d');
            blobToImageData(file as Blob).then((imageData) => {
                canvas.height = imageData.height;
                canvas.width = imageData.width;
                ctx?.putImageData(imageData, 0, 0);
                canvas.style.opacity = '1';
            });
        } else {
            localforage.getItem(`${coverId}-cover`, function (err, file) {
                if (file) {
                    const path = URL.createObjectURL(file as File);
                    processImage(16, 4, 96, path, canvas, (resultImageData: ImageData) => {
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
    }
    canvas {
        position: relative;
        object-fit: cover;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: .45s;
        filter: saturate(1.2);
    }
</style>
