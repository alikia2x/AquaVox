export default function(durationInSeconds: number): string {
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds) % 60;

    // Format hours, minutes, and seconds into string
    let formattedTime = '';
    if (hours > 0) {
        formattedTime += hours + ':';
    }
    if (minutes < 10 && hours > 0) {
        formattedTime += '0';
    }
    formattedTime += minutes + ':';
    formattedTime += (seconds < 10 ? '0' : '') + seconds;

    return formattedTime;
}
