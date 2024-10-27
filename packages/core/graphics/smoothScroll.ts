import BezierEasing from 'bezier-easing';

export function smoothScrollTo(element: HTMLElement, to: number, duration: number, timingFunction: Function) {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    function animateScroll(timestamp: number) {
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = timingFunction(progress, 0.38, 0, 0.24, 0.99);
        element.scrollTop = start + change * easedProgress;

        if (elapsedTime < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

// Define your custom Bézier curve function
export function customBezier(progress: number, p1x: number, p1y: number, p2x: number, p2y: number) {
    return BezierEasing(p1x, p1y, p2x, p2y)(progress);
}