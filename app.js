"use strict";
document.addEventListener("DOMContentLoaded", (event) => {
    var _a;
    let plotData = [];
    let bendData = [];
    let airfoilName = "";
    let chart;
    (_a = document
        .getElementById("calculate-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (e) => {
        const inputTextArea = (document.getElementById("dat-input"));
        const datFile = inputTextArea.value;
        const lines = datFile.split("\n");
        airfoilName = lines.shift();
        lines.forEach((line) => {
            const coords = line.split("     ");
            const x = parseFloat(coords[0]);
            const y = parseFloat(coords[1]);
            console.log(x, y);
            plotData.push({ x, y });
        });
        console.log(lines);
        plotAirfoil();
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
});
