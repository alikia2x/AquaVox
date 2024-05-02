export default function blobToImageData(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const dataView = new DataView(arrayBuffer);
            const width = dataView.getUint32(0, true); // Read width from little-endian bytes
            const height = dataView.getUint32(4, true); // Read height from little-endian bytes
            const byteArray = new Uint8ClampedArray(arrayBuffer, 8); // Skip the header
            resolve(new ImageData(byteArray, width, height));
        };
        reader.onerror = () => {
            reject(new Error("Failed to read Blob as ArrayBuffer"));
        };
        reader.readAsArrayBuffer(blob);
    });
}
