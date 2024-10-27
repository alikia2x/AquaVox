export default function(dataObject: any) {
    // Create a blob from the UInt8Array data
    const blob = new Blob([dataObject.data], { type: dataObject.format });

    // Create a URL for the blob
    const imageUrl = URL.createObjectURL(blob);

    // Create an Image object
    const image = new Image();
    image.src = imageUrl;

    return imageUrl; // return the URL of the image
}