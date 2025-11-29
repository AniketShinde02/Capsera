
const { v2: cloudinary } = require('cloudinary');

// Mock config if needed, or rely on env vars if I can load them
// But for regex testing we don't need real config for extraction
// For signing we do, but let's just test extraction first.

function extractCloudinaryPublicId(url) {
    try {
        if (!url || typeof url !== 'string') {
            return null;
        }

        const cloudinaryPattern = /\/(?:upload|private|authenticated)\/(?:s--[^/]+--\/)?(?:v\d+\/)?([^\/]+(?:\/[^\/]+)*?)(?:\.\w+)?$/;
        const match = url.match(cloudinaryPattern);

        if (match && match[1]) {
            return match[1].replace(/\.\w+$/, '');
        }

        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && lastPart.includes('.')) {
            return lastPart.split('.')[0];
        }

        return null;
    } catch (error) {
        console.error('Error extracting Cloudinary public ID:', error);
        return null;
    }
}

const testUrls = [
    'https://res.cloudinary.com/demo/image/upload/v1611315260/sample.jpg',
    'https://res.cloudinary.com/demo/image/private/s--SIGNATURE--/v1611315260/sample.jpg',
    'https://res.cloudinary.com/demo/image/authenticated/s--SIGNATURE--/v1611315260/folder/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    'https://res.cloudinary.com/demo/image/private/s--abc1234--/v123456/capsera_uploads/test-image.png'
];

console.log('Testing Cloudinary Logic:');

testUrls.forEach(url => {
    const publicId = extractCloudinaryPublicId(url);
    console.log(`\nURL: ${url}`);
    console.log(`Public ID: ${publicId}`);
});
