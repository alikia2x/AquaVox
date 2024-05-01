import { gaussianBlurHorizontal, gaussianBlurVertical, applyFilter } from "./utils";

export async function processImage(blockSize: number, resolutionFactor:number, radius:number, path: string, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;

    const image = new Image();
    image.src = path; // Replace with your image path

    image.onload = function () {
        // Resize image to 1/9 of the original resolution
        const resizedWidth = image.width / resolutionFactor;
        const resizedHeight = image.height / resolutionFactor;

        const num_blocks_x = Math.floor(resizedWidth / blockSize);
        const num_blocks_y = Math.floor(resizedHeight / blockSize);

        canvas.width = resizedWidth;
        canvas.height = resizedHeight;

        for (let i = 0; i < num_blocks_y; i++) {
            for (let j = 0; j < num_blocks_x; j++) {
                const block = document.createElement("canvas");
                block.width = blockSize;
                block.height = blockSize;

                const blockCtx = block.getContext("2d")!;
                blockCtx.drawImage(
                    image,
                    j * blockSize * resolutionFactor,
                    i * blockSize * resolutionFactor,
                    blockSize * resolutionFactor,
                    blockSize * resolutionFactor,
                    0,
                    0,
                    blockSize,
                    blockSize
                );

                applyFilter(block);

                ctx.drawImage(block, j * blockSize, i * blockSize);
            }
        }

        // Horizontal Gaussian blur
        const imageDataHorizontal = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blurredImageDataHorizontal = gaussianBlurHorizontal(imageDataHorizontal, radius);

        // Vertical Gaussian blur
        const imageDataVertical = blurredImageDataHorizontal;
        const blurredImageData = gaussianBlurVertical(imageDataVertical, radius);

        ctx.putImageData(blurredImageData, 0, 0);
    };
}