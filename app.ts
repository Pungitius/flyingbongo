document.addEventListener("DOMContentLoaded", (event) => {
    let plotData: object[] = [];
    let bendData: object[] = [];
    let airfoilName: string = "";
    let chart;

    document
        .getElementById("calculate-button")
        ?.addEventListener("click", (e) => {
            const inputTextArea = <HTMLTextAreaElement>(
                document.getElementById("dat-input")
            );
            const datFile: string = inputTextArea.value;
            const lines: string[] = datFile.split("\n");

            airfoilName = lines.shift()!;

            lines.forEach((line) => {
                const coords: string[] = line.split("     ");
                const x: number = parseFloat(coords[0]);
                const y: number = parseFloat(coords[1]);

                console.log(x, y);
                plotData.push({ x, y });
            });

            console.log(lines);
            plotAirfoil();
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

    
});
