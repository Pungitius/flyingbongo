document.addEventListener("DOMContentLoaded", (event) => {
    let plotData: object[] = [];
    let bendData: object[] = [];
    let airfoilName: string = "";
    let chart;
    let bendChart;

    document
        .getElementById("calculate-button")
        ?.addEventListener("click", (e) => {
            const inputTextArea = <HTMLTextAreaElement>(
                document.getElementById("dat-input")
            );
            const datFile: string = inputTextArea.value;
            const lines: string[] = datFile.split("\n");

            airfoilName = lines.shift()!;

            plotData = [];
            lines.forEach((line) => {
                const coords: string[] = line.split("     ");
                const x: number = parseFloat(coords[0]);
                const y: number = parseFloat(coords[1]);
                plotData.push({ x, y });
            });

            plotAirfoil();
            calculateBend();
            plotBend();
        });

    function plotAirfoil() {
        const canvas = <HTMLCanvasElement>(
            document.getElementById("airfoilPlot")!
        );
        const ctx = canvas.getContext("2d");

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: airfoilName,
                        data: plotData,
                        backgroundColor: "rgb(255, 99, 132)",
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: "linear",
                        position: "bottom",
                    },
                },
            },
        });
    }

    function calculateBend() {
        let totalLength = 0;
        bendData = []
        for (let i = 1; i < plotData.length - 1; i++) {

            const lastPoint = new Victor(plotData[i - 1].x, plotData[i - 1].y);
            const currentPoint = new Victor(plotData[i].x, plotData[i].y);
            const nextPoint = new Victor(plotData[i + 1].x, plotData[i + 1].y);

            const backwardSegment = currentPoint.subtract(lastPoint);
            const forwardSegment = nextPoint.subtract(currentPoint);

            const segmentLength = forwardSegment.length();
            totalLength += segmentLength;

            let segmentBendAngle = Math.acos(
                backwardSegment.dot(forwardSegment) /
                (backwardSegment.length() * forwardSegment.length())
            );

            console.log(segmentBendAngle)

            // there has to be a better solution for this
            segmentBendAngle = segmentBendAngle < Math.PI/2 ? segmentBendAngle : Math.PI - segmentBendAngle;
            //segmentBendAngle = Math.abs(Math.PI - segmentBendAngle)

            bendData.push({ x: totalLength, y: segmentBendAngle });
        }
    }

    function plotBend() {
        const canvas = <HTMLCanvasElement>document.getElementById("bendPlot")!;
        const ctx = canvas.getContext("2d");

        if (bendChart) bendChart.destroy();
        bendChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "bend",
                        data: bendData,
                        backgroundColor: "rgb(255, 99, 132)",
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: "linear",
                        position: "bottom",
                    },
                },
            },
        });
    }
});
