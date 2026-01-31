import imageCompression from "browser-image-compression";

export default async function compressImage(file) {
  const options = {
    maxSizeMB: 0.5, 
    maxWidthOrHeight: 1920, 
    useWebWorker: true, 
  };

  try {
    if (!file) return null;

    console.log(`Original Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    const compressedFile = await imageCompression(file, options);

    console.log(
      `Compressed Size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
    );

    return compressedFile;
  } catch (error) {
    console.error("Compression Failed:", error);
    return file; 
  }
}
