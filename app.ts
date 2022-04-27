document.addEventListener("DOMContentLoaded", (event) => {
    let plotData: object[] = [];
    let bendData: object[] = [];
    let slitData: object[] = [];
    let airfoilName: string = "";
    let chart;
    let bends = [];
    let slits = []
    let bendChart;
    let slitChart;

    let errorThreshold = 0.005;

    let interpolatedData: object[] = [];

    let draw = SVG().addTo("#svg").size(800, 200);

    document
        .getElementById("calculate-button")
        ?.addEventListener("click", (e) => {
            const inputTextArea = <HTMLTextAreaElement>(
                document.getElementById("dat-input")
            );
            const datFile: string = inputTextArea.value;
            const lines: string[] = datFile.split("\n");

            airfoilName = lines.shift()!;

            const filteredLines = lines.filter((e) => e !== "");

            plotData = [];
            filteredLines.forEach((line) => {
                const coords: string[] = line.split(" ").filter((s) => s !== "")
                // const coords: string[] = line.split("     ");
                const x: number = parseFloat(coords[0]);
                const y: number = parseFloat(coords[1]);
                plotData.push({ x, y });
            });
            
            errorThreshold = document.getElementById("errorThresholdInput")?.value;

            plotAirfoil();
            calculateBend();
            plotBend();
            calculateSlits();
            plotSlits();
            drawSVG();
        });

    document.getElementById("downloadButton")?.addEventListener("click", (e) => {
        const svgEl = document.getElementById("svg")?.firstChild
        console.log(svgEl)
        saveSvg(svgEl, "test.svg")
    })

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
        bends = []
        bendData = [];
        for (let i = 1; i < plotData.length - 1; i++) {
            const lastPoint = new Victor(plotData[i - 1].x, plotData[i - 1].y);
            const currentPoint = new Victor(plotData[i].x, plotData[i].y);
            const nextPoint = new Victor(plotData[i + 1].x, plotData[i + 1].y);

            const backwardSegment = lastPoint.subtract(currentPoint);
            const forwardSegment = nextPoint.subtract(currentPoint);

            const segmentLength = forwardSegment.length();
            totalLength += segmentLength;

            let segmentBendAngle = Math.acos(
                backwardSegment.dot(forwardSegment) /
                    (backwardSegment.length() * forwardSegment.length())
            );

            // there has to be a better solution for this
            segmentBendAngle =
                segmentBendAngle > Math.PI
                    ? segmentBendAngle
                    : segmentBendAngle - Math.PI;
            segmentBendAngle *= -1;
            //segmentBendAngle = Math.abs(Math.PI - segmentBendAngle)
            //segmentBendAngle = (segmentBendAngle - Math.PI) % Math.PI

            bends.push({ totalLength, segmentBendAngle });
        }

        bends.forEach((e) => {
            bendData.push({ x: e.totalLength, y: e.segmentBendAngle });
        });
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

    function calculateSlits() {
        slitData = [];
        interpolatedData = [];

        const totalLength = bends[bends.length - 1].totalLength;
        const step = 0.00001;
        let aggregate = 0;

        for (let f = 0; f < totalLength; f += step) {
            let idx = 0;
            for (; idx < bends.length; idx++) {
                if (bends[idx].totalLength > f) break;
            }

            let t = 0;

            if (idx > 0 && f != bends[idx - 1].totalLength) {
                t =
                    (f - bends[idx - 1].totalLength) /
                    (bends[idx].totalLength - bends[idx - 1].totalLength);
            }

            let graphValue =
                bends[Math.floor(idx)].segmentBendAngle +
                t *
                    (bends[Math.min(bends.length - 1, Math.ceil(idx))]
                        .segmentBendAngle -
                        bends[Math.floor(idx)].segmentBendAngle);

            interpolatedData.push({ x: f, y: t });

            aggregate += step * graphValue;

            if (aggregate < -errorThreshold) {
                aggregate += errorThreshold;
                slitData.push({ x: f, y: 0 });
            } else if (aggregate > errorThreshold) {
                aggregate -= errorThreshold;
                slitData.push({ x: f, y: 0 });
            }
        }
    }

    function plotSlits() {
        const canvas = <HTMLCanvasElement>document.getElementById("slitPlot")!;
        const ctx = canvas.getContext("2d");

        if (slitChart) slitChart.destroy();
        slitChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "slit position",
                        data: slitData,
                        backgroundColor: "rgb(255, 99, 132)",
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: "linear",
                        position: "bottom",
                        min: 0,
                        max: 2,
                    },
                },
            },
        });
    }

    function drawSVG() {
        // initialize SVG.js
        draw.clear()

        // draw pink square
        draw.rect(400 * bends[bends.length - 1].totalLength, 200).fill("none").stroke("#f06").fill();

        slitData.forEach((slit) => draw.line(400 * slit.x, 0, 400 * slit.x, 200).fill("none").stroke("#f06")) 

        
    }

    // https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
    function saveSvg(svgEl, name) {
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        var svgData = svgEl.outerHTML;
        var preface = '<?xml version="1.0" standalone="no"?>\r\n';
        var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
});
