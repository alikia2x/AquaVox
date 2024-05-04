export default function toHumanSize(size: number | undefined){
    if (!size) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;
    while (size >= 1000 && unitIndex < units.length - 1) {
        size /= 1000;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
}