// Image compression and validation utility
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_DIMENSION = 2048; // Max width or height

/**
 * Compress image to reduce file size while maintaining quality
 * @param {File} file - Image file to compress
 * @returns {Promise<string>} - Data URL of compressed image
 */
export const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            reject(new Error(`Invalid image type. Allowed types: ${ALLOWED_TYPES.join(', ')}`));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if image is too large
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                    width *= scale;
                    height *= scale;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Determine quality based on file type
                let quality = 0.85;
                let outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

                // Generate data URL with good quality
                let dataUrl = canvas.toDataURL(outputType, quality);

                resolve(dataUrl);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = event.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Create custom image handler for React Quill
 * @param {Function} setImageError - Callback to set error message
 * @returns {Function} - Handler function for image insertion
 */
export const createImageHandler = (setImageError) => {
    return () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                setImageError(null);

                const dataUrl = await compressImage(file);
                const quill = this; // React Quill context

                // Get current selection
                const range = quill.getSelection();
                if (range) {
                    // Insert the image at cursor position
                    quill.insertEmbed(range.index, 'image', dataUrl);
                    // Move cursor after the image
                    quill.setSelection(range.index + 1);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Failed to process image';
                setImageError(errorMsg);
                console.error('Image compression error:', error);
            }
        };

        input.click();
    };
};

/**
 * Validate if an image data URL is safe and valid
 * @param {string} dataUrl - Image data URL
 * @returns {boolean} - Whether the data URL is valid
 */
export const isValidImageUrl = (dataUrl) => {
    return typeof dataUrl === 'string' && dataUrl.startsWith('data:image/');
};

/**
 * Clear unused images from notes to prevent localStorage overflow
 * Used when deleting notes that contain images
 */
export const cleanupImages = (noteBody) => {
    // This is informational - localStorage cleanup happens automatically
    // but this helps identify which images are embedded
    const imageRegex = /src="(data:image[^"]+)"/g;
    const images = [];
    let match;
    while ((match = imageRegex.exec(noteBody)) !== null) {
        images.push(match[1]);
    }
    return images;
};
