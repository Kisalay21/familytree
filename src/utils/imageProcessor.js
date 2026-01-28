/**
 * Image Processor Utility
 * Handles resizing, metadata stripping (EXIF/GPS), and 4:2:0 chroma subsampling.
 */

export const processImage = (file, maxWidth = 1080) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                // 1. Fixed Square Canvas (1080x1080)
                const canvas = document.createElement('canvas');
                canvas.width = maxWidth;
                canvas.height = maxWidth;
                const ctx = canvas.getContext('2d');

                // 2. Fill with Black Background
                ctx.fillStyle = "#000000";
                ctx.fillRect(0, 0, maxWidth, maxWidth);

                // 3. Calculate "Contain" Dimensions (Letterboxing)
                const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (maxWidth - w) / 2;
                const y = (maxWidth - h) / 2;

                // 4. Draw Centered Image
                ctx.drawImage(img, x, y, w, h);

                // 5. Chroma Subsampling & Compression (0.5 Quality)
                const processedBase64 = canvas.toDataURL('image/jpeg', 0.5);

                resolve(processedBase64);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
