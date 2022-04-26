"use strict";
document.addEventListener("DOMContentLoaded", (event) => {
    var _a;
    let plotData = [];
    let bendData = [];
    let airfoilName = "";
    let chart;
    let bendChart;
    (_a = document
        .getElementById("calculate-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (e) => {
        const inputTextArea = (document.getElementById("dat-input"));
        const datFile = inputTextArea.value;
        const lines = datFile.split("\n");
        airfoilName = lines.shift();
        plotData = [];
        lines.forEach((line) => {
            const coords = line.split("     ");
            const x = parseFloat(coords[0]);
            const y = parseFloat(coords[1]);
            plotData.push({ x, y });
        });
        plotAirfoil();
        calculateBend();
        plotBend();
    });
    function plotAirfoil() {
        const canvas = (document.getElementById("airfoilPlot"));
        const ctx = canvas.getContext("2d");
        if (chart)
            chart.destroy();
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
        bendData = [];
        for (let i = 1; i < plotData.length - 1; i++) {
            const lastPoint = new Victor(plotData[i - 1].x, plotData[i - 1].y);
            const currentPoint = new Victor(plotData[i].x, plotData[i].y);
            const nextPoint = new Victor(plotData[i + 1].x, plotData[i + 1].y);
            const backwardSegment = currentPoint.subtract(lastPoint);
            const forwardSegment = nextPoint.subtract(currentPoint);
            const segmentLength = forwardSegment.length();
            totalLength += segmentLength;
            let segmentBendAngle = Math.acos(backwardSegment.dot(forwardSegment) /
                (backwardSegment.length() * forwardSegment.length()));
            console.log(segmentBendAngle);
            // there has to be a better solution for this
            segmentBendAngle = segmentBendAngle < Math.PI / 2 ? segmentBendAngle : Math.PI - segmentBendAngle;
            //segmentBendAngle = Math.abs(Math.PI - segmentBendAngle)
            bendData.push({ x: totalLength, y: segmentBendAngle });
        }
    }
    function plotBend() {
        const canvas = document.getElementById("bendPlot");
        const ctx = canvas.getContext("2d");
        if (bendChart)
            bendChart.destroy();
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
