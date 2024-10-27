export default function imageDataToBlob(imageData: ImageData): Blob {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);
    const header = new Uint8Array(8); // 4 bytes for width, 4 bytes for height
    const dataView = new DataView(header.buffer);
    dataView.setUint32(0, width, true); // Store width in little-endian
    dataView.setUint32(4, height, true); // Store height in little-endian
    const blob = new Blob([header, data], { type: 'image/png' });
    return blob;
}