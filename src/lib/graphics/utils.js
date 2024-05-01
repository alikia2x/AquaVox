// Function to apply filter to the block
export function applyFilter(block) {
    let imageData = block.getContext("2d").getImageData(0, 0, block.width, block.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let hsv = rgbToHsv(data[i], data[i + 1], data[i + 2]);

        // Mainly adjust saturation and value channels
        hsv[1] = Math.min(hsv[1] * 1.05 + 30 * Math.log(hsv[1] / 100 + 1), 100);
        hsv[2] = Math.min(hsv[2] * 1.3 + 40 * Math.log(hsv[2] / 100 + 1), 100);

        let rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);

        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
    }

    block.getContext("2d").putImageData(imageData, 0, 0);
}

// Function to perform horizontal Gaussian blur
export function gaussianBlurHorizontal(imageData, radius) {
    const width = imageData.width;
    const height = imageData.height;

    const newData = new Uint8ClampedArray(imageData.data);

    const kernel = generateGaussianKernel(radius);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0,
                g = 0,
                b = 0,
                a = 0;

            for (let kx = -radius; kx <= radius; kx++) {
                const pixelX = Math.min(width - 1, Math.max(0, x + kx));

                const kernelValue = kernel[kx + radius];

                const index = (y * width + pixelX) * 4;

                r += imageData.data[index] * kernelValue;
                g += imageData.data[index + 1] * kernelValue;
                b += imageData.data[index + 2] * kernelValue;
                a += imageData.data[index + 3] * kernelValue;
            }

            const dataIndex = (y * width + x) * 4;
            newData[dataIndex] = r;
            newData[dataIndex + 1] = g;
            newData[dataIndex + 2] = b;
            newData[dataIndex + 3] = a;
        }
    }

    return new ImageData(newData, width, height);
}

// Function to perform vertical Gaussian blur
export function gaussianBlurVertical(imageData, radius) {
    const width = imageData.width;
    const height = imageData.height;

    const newData = new Uint8ClampedArray(imageData.data);

    const kernel = generateGaussianKernel(radius);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0,
                g = 0,
                b = 0,
                a = 0;

            for (let ky = -radius; ky <= radius; ky++) {
                const pixelY = Math.min(height - 1, Math.max(0, y + ky));

                const kernelValue = kernel[ky + radius];

                const index = (pixelY * width + x) * 4;

                r += imageData.data[index] * kernelValue;
                g += imageData.data[index + 1] * kernelValue;
                b += imageData.data[index + 2] * kernelValue;
                a += imageData.data[index + 3] * kernelValue;
            }

            const dataIndex = (y * width + x) * 4;
            newData[dataIndex] = r;
            newData[dataIndex + 1] = g;
            newData[dataIndex + 2] = b;
            newData[dataIndex + 3] = a;
        }
    }

    return new ImageData(newData, width, height);
}

// Function to generate Gaussian kernel
function generateGaussianKernel(radius) {
    const size = radius * 2 + 1;
    const kernel = [];

    const sigma = 0.4 * ((radius - 1) * 0.5 - 1) + 0.8;

    for (let i = 0; i < size; i++) {
        const x = i - radius;
        const exponent = Math.exp(-(x * x) / (2 * sigma * sigma));
        kernel[i] = exponent / (Math.sqrt(2 * Math.PI) * sigma);
    }

    // Normalize the kernel
    const sum = kernel.reduce((a, b) => a + b, 0);
    return kernel.map((value) => value / sum);
}

// Function to convert RGB to HSV
function rgbToHsv(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);

    let max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        h,
        s,
        v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, v * 100];
}

// Function to convert HSV to RGB
function hsvToRgb(h, s, v) {
    h /= 360;
    s /= 100;
    v /= 100;

    let i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        r,
        g,
        b;

    switch (i % 6) {
        case 0:
            (r = v), (g = t), (b = p);
            break;
        case 1:
            (r = q), (g = v), (b = p);
            break;
        case 2:
            (r = p), (g = v), (b = t);
            break;
        case 3:
            (r = p), (g = q), (b = v);
            break;
        case 4:
            (r = t), (g = p), (b = v);
            break;
        case 5:
            (r = v), (g = p), (b = q);
            break;
    }

    return [r * 255, g * 255, b * 255];
}