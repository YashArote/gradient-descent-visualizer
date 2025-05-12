let lossFunc;
let currentW = 0, currentB = 0;
let isRunning = false;
let animationInterval;
let wValues, bValues, zValues;
let wRange = [-5, 5], bRange = [-5, 5];
let compiledLossExpr, gradientW, gradientB;
let w, b, z;
const step = 0.1;

let markerTrace = {
    x: [],
    y: [],
    z: [],
    mode: 'markers',
    type: 'scatter3d',
    marker: { color: 'red', size: 16 },
    name: 'Current Point'
};

function getZOffset() {
    const markerPixelSize = markerTrace.marker.size || 6;
    if (!zValues || zValues.length === 0) return 0.1;
    const zMin = Math.min(...zValues.flat().filter(x => x !== null));
    const zMax = Math.max(...zValues.flat().filter(x => x !== null));
    const zRange = zMax - zMin;
    const plotDiv = document.getElementById('plot');
    const plotHeight = plotDiv.offsetHeight || 600;
    return (markerPixelSize / plotHeight) * zRange * 2.05;
}

function setupLossFunction(userFuncStr) {
    const expr = math.parse(userFuncStr);
    compiledLossExpr = expr.compile();
    gradientW = math.derivative(expr, 'w').compile();
    gradientB = math.derivative(expr, 'b').compile();
}


function computeGradient(w, b) {
    const scope = { w, b };
    const dw = gradientW.evaluate(scope);
    const db = gradientB.evaluate(scope);

    return { dw, db };
}
var toPause = false;
function updateMarker() {
    const z = lossFunc(currentW, currentB) + getZOffset();
    Plotly.animate('plot', {
        data: [
            null,
            {
                x: [currentW],
                y: [currentB],
                z: [z],
                marker: { color: 'red', size: markerTrace.marker.size }
            }
        ]
    }, {
        transition: { duration: 50 },
        frame: { duration: 50, redraw: true }
    });
}


function stepGradientDescent() {
    const { dw, db } = computeGradient(currentW, currentB);
    const gradNorm = Math.sqrt(dw * dw + db * db);
    t += 1;

    if (gradNorm < 1e-2 || !isBetween(currentB, bRange[0], bRange[1]) || !isBetween(currentW, wRange[0], wRange[1])) {

        pauseAnimation();
        return;
    }
    switch (optimizer) {
        case 'momentum':
            previousDW = momentum * previousDW + learningRate * dw;
            previousDB = momentum * previousDB + learningRate * db;
            currentW -= previousDW;
            currentB -= previousDB;
            break;

        case 'adagrad':
            squareDW += dw * dw;
            squareDB += db * db;
            currentW -= learningRate / Math.sqrt(squareDW + 1e-8) * dw;
            currentB -= learningRate / Math.sqrt(squareDB + 1e-8) * db;
            break;

        case 'rmsprop':
            squareDW = decayRate * squareDW + (1 - decayRate) * dw * dw;
            squareDB = decayRate * squareDB + (1 - decayRate) * db * db;
            currentW -= learningRate / Math.sqrt(squareDW + 1e-8) * dw;
            currentB -= learningRate / Math.sqrt(squareDB + 1e-8) * db;
            break;

        case 'adam':
            const beta1_t = Math.pow(beta1, t);
            const beta2_t = Math.pow(beta2, t);

            const mW = beta1 * previousDW + (1 - beta1) * dw;
            const mB = beta1 * previousDB + (1 - beta1) * db;

            const vW = beta2 * squareDW + (1 - beta2) * dw * dw;
            const vB = beta2 * squareDB + (1 - beta2) * db * db;

            const mW_hat = mW / (1 - beta1_t);
            const mB_hat = mB / (1 - beta1_t);
            const vW_hat = vW / (1 - beta2_t);
            const vB_hat = vB / (1 - beta2_t);

            currentW -= learningRate * mW_hat / (Math.sqrt(vW_hat) + 1e-8);
            currentB -= learningRate * mB_hat / (Math.sqrt(vB_hat) + 1e-8);

            previousDW = mW;
            previousDB = mB;
            squareDW = vW;
            squareDB = vB;

            break;

        case 'gradientDescent':
        default:
            // Standard gradient descent update
            currentW -= learningRate * dw;
            currentB -= learningRate * db;
            break;
    }

    updateMarker();
}

function startAnimation() {
    if (!isRunning) {
        isRunning = true;
        learningRate = parseFloat(document.getElementById('learningRate').value);
        momentum = parseFloat(document.getElementById('momentum')?.value) || 0.9;
        decayRate = parseFloat(document.getElementById('decayRate')?.value) || 0.01;
        beta1 = parseFloat(document.getElementById('beta1')?.value) || 0.9;
        beta2 = parseFloat(document.getElementById('beta2')?.value) || 0.999;
        const speed = parseInt(document.getElementById('speedSelect').value);
        animationInterval = setInterval(stepGradientDescent, speed);
    }
}


function pauseAnimation() {
    previousDW = 0, previousDB = 0;
    squareDW = 0, squareDB = 0;
    t = 0;
    clearInterval(animationInterval);
    isRunning = false;
}

function resetAnimation() {
    pauseAnimation();
    currentW = w;
    currentB = b;
    markerTrace.marker.size = parseInt(document.getElementById('markerSize').value) || 16;
    Plotly.animate('plot', {
        data: [
            null,
            { x: [w], y: [b], z: [z], marker: { color: 'red', size: markerTrace.marker.size } }
        ]
    }, {
        transition: { duration: 0 },
        frame: { duration: 0, redraw: true }
    });
}

document.getElementById('surfaceSelect').addEventListener('change', function () {
    const selected = this.value;
    const preset = surfacePresets[selected];
    document.getElementById('userFunction').value = preset.func;
    document.getElementById('weightRange').value = `${preset.wRange[0]},${preset.wRange[1]}`;
    document.getElementById('biasRange').value = `${preset.bRange[0]},${preset.bRange[1]}`;
    plotSurface(); // auto-plot
});
function sanitizeExpression(expr) {
    expr = expr.replace(/Math\./g, '');
    expr = expr.replace(/(\w+|\))\s*\*\*\s*(\w+|\()/g, '($1)^($2)');
    const allowedFuncs = ['sin', 'cos', 'tan', 'tanh', 'log', 'exp', 'sqrt', 'abs'];
    for (const fn of allowedFuncs) {
        const regex = new RegExp(`\\b${fn}\\s*\\(([^)]*)\\)`, 'g');
        expr = expr.replace(regex, `${fn}($1)`);
    }

    return expr.trim();
}
function attachPlotInteractionWarning() {
    const plotElement = document.getElementById('plot');

    plotElement.on('plotly_relayouting', () => {
        if (isRunning) {
            showPauseAlert();
        }
    });
}
function plotSurface() {
    pauseAnimation();
    const userFuncStr = document.getElementById('userFunction').value;
    const sanitized = sanitizeExpression(userFuncStr);
    setupLossFunction(sanitized);
    lossFunc = function (w, b) {
        return compiledLossExpr.evaluate({ w, b });
    };
    const wRangeStr = document.getElementById('weightRange').value.split(',').map(Number);
    const bRangeStr = document.getElementById('biasRange').value.split(',').map(Number);
    wRange = [wRangeStr[0], wRangeStr[1]];
    bRange = [bRangeStr[0], bRangeStr[1]];
    wValues = [], bValues = [], zValues = [];

    for (let w = wRange[0]; w <= wRange[1]; w += step) wValues.push(w);
    for (let b = bRange[0]; b <= bRange[1]; b += step) bValues.push(b);

    for (let i = 0; i < bValues.length; i++) {
        const row = [];
        for (let j = 0; j < wValues.length; j++) {
            try {
                const loss = lossFunc(wValues[j], bValues[i]);
                row.push(isFinite(loss) ? loss : null);
            } catch (e) {
                row.push(null);
            }
        }
        zValues.push(row);
    }

    const surfaceTrace = {
        x: wValues,
        y: bValues,
        z: zValues,
        type: 'surface',
        name: 'Loss Surface',
        colorbar: {
            title: 'Loss',
            titleside: 'right',
            tickfont: { size: 12 },
            titlefont: { size: 14 },
            len: 0.75,
            thickness: 20,
            x: 1.05
        }
    };


    markerTrace.x = [];
    markerTrace.y = [];
    markerTrace.z = [];
    markerTrace.marker.size = parseInt(document.getElementById('markerSize').value) || 16;

    Plotly.newPlot('plot', [surfaceTrace, markerTrace], {
        title: 'Loss Surface (w vs b vs loss)',
        height: 800,
        scene: {
            xaxis: { title: 'Weight (w)' },
            yaxis: { title: 'Bias (b)' },
            zaxis: { title: 'Loss' }
        },

    }, {
        responsive: true,
        displayModeBar: false
    }).then(() => {
        attachPlotInteractionWarning()
    });

    document.getElementById('plot').on('plotly_click', function (data) {
        w = data.points[0].x;
        b = data.points[0].y;
        z = lossFunc(w, b) + getZOffset();
        currentW = w;
        currentB = b;

        markerTrace.marker.size = parseInt(document.getElementById('markerSize').value) || 16;

        Plotly.animate('plot', {
            data: [
                null,
                { x: [w], y: [b], z: [z], marker: { color: 'red', size: markerTrace.marker.size } }
            ]
        }, {
            transition: { duration: 0 },
            frame: { duration: 0, redraw: true }
        });
    });
}

plotSurface();