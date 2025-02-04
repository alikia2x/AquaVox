<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    // 可调整的更新频率（毫秒）
    const UPDATE_INTERVAL = 300;
    const TIME_WINDOW = 1000 * 15;

    let frameCount = 0;
    let lastTime = 0;
    let fps = 0;
    let frameTimes: number[] = [];
    let frameTime = 0;
    let onePercentLow = 0;

    let fpsChart: Chart;
    let frameTimeChart: Chart;

    let lastFrameTime = 0;

    function updateFPS() {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        frameTime = currentTime - lastFrameTime;
        // 计算1% Low FPS
        const sortedFrameTimes = frameTimes.sort((a, b) => b - a);
        const onePercentIndex = Math.floor(sortedFrameTimes.length * 0.01);
        onePercentLow = Math.round(1000 / sortedFrameTimes[onePercentIndex]);
        if (frameTimeChart) {
            if ((frameTimeChart.data.labels![0] as number) < Date.now() - 5000) {
                frameTimeChart.data.labels!.shift();
                frameTimeChart.data.datasets[0].data.shift();
            }
            frameTimeChart.data.labels!.push(Date.now());
            frameTimeChart.data.datasets[0].data.push(frameTime);
        }

        if (deltaTime > UPDATE_INTERVAL) {
            fps = Math.round((frameCount * 1000) / deltaTime);
            // 更新图表数据
            if (fpsChart) {
                if ((fpsChart.data.labels![0] as number) < Date.now() - TIME_WINDOW) {
                    fpsChart.data.labels!.shift();
                    fpsChart.data.datasets[0].data.shift();
                }
                fpsChart.data.labels!.push(Date.now());
                fpsChart.data.datasets[0].data.push(fps);
                fpsChart.update();
            }
            if (frameTimeChart) {
                frameTimeChart.update();
            }

            frameCount = 0;
            lastTime = currentTime;
        }

        frameCount++;
        frameTimes.push(frameTime);
        lastFrameTime = performance.now();

        requestAnimationFrame(updateFPS);
    }

    const createChart = (ctx: CanvasRenderingContext2D, label: string, color: string) => {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: label,
                        borderColor: color,
                        data: [],
                        pointRadius: 0,
                        borderWidth: label == 'FPS' ? undefined : 2,
                        tension: label == 'FPS' ? 0.1 : 0,
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            padding: 0
                        },
                        border: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                interaction: {
                    mode: 'x'
                },
                animations: {
                    y: {
                        duration: 0
                    },
                    x: {
                        duration: label == 'FPS' ? undefined : 0,
                    }
                }
            }
        });
    };

    onMount(() => {
        const ctx1 = (document.getElementById('fpsChart')! as HTMLCanvasElement).getContext('2d')!;
        const ctx2 = (document.getElementById('frameTimeChart')! as HTMLCanvasElement).getContext('2d')!;

        fpsChart = createChart(ctx1, 'FPS', '#4CAF50');
        frameTimeChart = createChart(ctx2, 'Frame Time', '#2196F3');
        updateFPS();
    });
</script>

<p>
    <span>{fps} fps</span><br />
    <span>Frame Time: {frameTime.toFixed(2)} ms</span><br />
    <span>1% Low: {onePercentLow} fps</span>
</p>
<span class="fixed right-2 text-white/50">fps</span>
<canvas id="fpsChart" width="400" height="100" class="mt-2"></canvas>
<span class="fixed right-2 text-white/50">frametime</span>
<canvas id="frameTimeChart" width="400" height="100" class="mt-2"></canvas>
