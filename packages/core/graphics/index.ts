import { gaussianBlurHorizontal, gaussianBlurVertical, applyFilter } from './utils';

export function processImage(
    blockSize: number,
    resolutionFactor: number,
    radius: number,
    path: string,
    canvas: HTMLCanvasElement,
    callback: (resultImageData: ImageData) => void
) {
    const ctx = canvas.getContext('2d')!;

    const image = new Image();
    image.src = path; // Replace with your image path

    image.onload = function () {
        // Resize image to 1/9 of the original resolution
        const width = image.width;
        const height = image.height;
        const resizedWidth = image.width / resolutionFactor;
        const resizedHeight = image.height / resolutionFactor;

        canvas.width = resizedWidth;
        canvas.height = resizedHeight;
        const block = document.createElement('canvas');
        const blockCtx = block.getContext('2d')!;
        block.width = image.width;
        block.height = image.height;
        blockCtx.drawImage(image, 0, 0, width, height, 0, 0, resizedWidth, resizedHeight);
        applyFilter(block);
        ctx.drawImage(block, 0, 0);

        // Horizontal Gaussian blur
        const imageDataHorizontal = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blurredImageDataHorizontal = gaussianBlurHorizontal(imageDataHorizontal, radius);

        // Vertical Gaussian blur
        const imageDataVertical = blurredImageDataHorizontal;
        const blurredImageData = gaussianBlurVertical(imageDataVertical, radius);

        ctx.putImageData(blurredImageData, 0, 0, 0, 0, width, height);
        callback(blurredImageData);
    };
}
