import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Function to get hash for a given directory
export function getDirectoryHash(dir: string): string {
    const fileDetails: string[] = [];

    // Recursive function to traverse the directory
    function traverseDirectory(currentDir: string): void {
        const files = fs.readdirSync(currentDir);

        files.forEach(file => {
            const filePath = path.join(currentDir, file);
            const stats = fs.lstatSync(filePath);

            if (stats.isDirectory()) {
                traverseDirectory(filePath);
            } else {
                // Collect file path and last modification time
                fileDetails.push(`${filePath}:${stats.mtimeMs}`);
            }
        });
    }

    traverseDirectory(dir);

    // Sort file details to ensure consistent hash
    fileDetails.sort();

    // Create hash from file details
    const hash = crypto.createHash('sha256');
    hash.update(fileDetails.join('\x00'));

    return hash.digest('hex');
}