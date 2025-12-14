const fs = require('fs');
const path = require('path');

// Fix path to point to CORRECT location
const engineerDir = path.join(__dirname, '../pages/engineering');

// Helper to recursively walk directories
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory not found: ${dir}`);
        return;
    }
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

// Map of file names to their new relative paths
const fileMap = {};

// 1. First Pass: Build map
console.log('Scanning for documentation files...');
walkDir(engineerDir, (filePath) => {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) return;

    const fileName = path.basename(filePath);
    // Calculate relative path from pages/engineering
    const relativePath = path.relative(path.join(__dirname, '../pages'), filePath)
        .replace(/\\/g, '/')
        .replace(/\.mdx?$/, '');

    fileMap[fileName] = `/docs/${relativePath}`;
});

console.log(`Found ${Object.keys(fileMap).length} documentation files.`);

// 2. Second Pass: Replace links
walkDir(engineerDir, (filePath) => {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Regex for Markdown links [Text](url)
    content = content.replace(/\[([^\]]+)\]\((?!http|#|mailto)([^)]+)\)/g, (match, text, url) => {
        // If it points to code, link to GitHub
        if (url.includes('src/') || url.includes('.ts') || url.includes('.js')) {
            const githubBase = 'https://github.com/AniketShinde02/Capsera/blob/main/';
            const cleanPath = url.replace(/^(\.\.\/)+/, ''); // Remove ../../
            return `[${text}](${githubBase}${cleanPath})`;
        }

        const basename = path.basename(url);
        const cleanBasename = basename.split('#')[0].split('?')[0];

        // Try finding exact match or .md match
        const target = fileMap[basename] ||
            fileMap[`${basename}.md`] ||
            fileMap[cleanBasename] ||
            fileMap[`${cleanBasename}.md`];

        if (target) {
            return `[${text}](${target})`;
        }

        // console.log(`Could not resolve: ${url}`);
        return match;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed links in: ${path.basename(filePath)}`);
    }
});
