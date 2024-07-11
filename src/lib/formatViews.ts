export function formatViews(num: number): string {
    if (num >= 10000) {
        const formattedNum = Math.floor(num / 1000) / 10; // 向下保留1位小数
        return `${formattedNum} 万`;
    } else {
        return num.toString() + " ";
    }
}