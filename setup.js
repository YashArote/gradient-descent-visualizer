document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});


let optimizer = 'gradientDescent';
let momentum = 0.9;
let decayRate = 0.01;
let beta1 = 0.9, beta2 = 0.999;


let previousDW = 0, previousDB = 0;
let squareDW = 0, squareDB = 0;
let t = 1;
let learningRate = 0.01;

document.getElementById('optimizerSelect').addEventListener('change', function () {
    optimizer = this.value;

    switch (optimizer) {
        case 'gradientDescent':
            document.getElementById('learningRateField').style.display = 'block';
            document.getElementById('momentumField').style.display = 'none';
            document.getElementById('decayRateField').style.display = 'none';
            document.getElementById('beta1Field').style.display = 'none';
            document.getElementById('beta2Field').style.display = 'none';
            break;
        case 'momentum':
            document.getElementById('learningRateField').style.display = 'block';
            document.getElementById('momentumField').style.display = 'block';
            document.getElementById('decayRateField').style.display = 'none';
            document.getElementById('beta1Field').style.display = 'none';
            document.getElementById('beta2Field').style.display = 'none';
            break;
        case 'adagrad':
            document.getElementById('learningRateField').style.display = 'block';
            document.getElementById('momentumField').style.display = 'none';
            document.getElementById('decayRateField').style.display = 'none';
            document.getElementById('beta1Field').style.display = 'none';
            document.getElementById('beta2Field').style.display = 'none';
            break;
        case 'rmsprop':
            document.getElementById('learningRateField').style.display = 'block';
            document.getElementById('momentumField').style.display = 'none';
            document.getElementById('decayRateField').style.display = 'block';
            document.getElementById('beta1Field').style.display = 'none';
            document.getElementById('beta2Field').style.display = 'none';
            break;
        case 'adam':
            document.getElementById('learningRateField').style.display = 'block';
            document.getElementById('momentumField').style.display = 'none';
            document.getElementById('decayRateField').style.display = 'none';
            document.getElementById('beta1Field').style.display = 'block';
            document.getElementById('beta2Field').style.display = 'block';
            break;
    }

    learningRate = parseFloat(document.getElementById('learningRate').value);
    momentum = parseFloat(document.getElementById('momentum')?.value) || 0.9;
    decayRate = parseFloat(document.getElementById('decayRate')?.value) || 0.01;
    beta1 = parseFloat(document.getElementById('beta1')?.value) || 0.9;
    beta2 = parseFloat(document.getElementById('beta2')?.value) || 0.999;
});
document.getElementById('optimizerSelect').dispatchEvent(new Event('change'));
const surfacePresets = {
    default: {
        func: "pow(w*w + b - 11, 2) + pow(w + b*b - 7, 2)",
        wRange: [-5, 5],
        bRange: [-5, 5]
    },
    global: {
        func: "pow(w, 2) + pow(b, 2)",
        wRange: [-5, 5],
        bRange: [-5, 5]
    },
    local: {
        func: "(1 - 8*w + 7*w**2 - (7/3)*w**3 + 0.25*w**4) * b**2 * exp(-b)",
        wRange: [0, 5],
        bRange: [0, 6]
    },
    elliptical: {
        func: "4 * pow(w, 2) + pow(b, 2)",
        wRange: [-3, 3],
        bRange: [-5, 5]
    },
    saddle: {
        func: "pow(w, 2) - pow(b, 2)",
        wRange: [-5, 5],
        bRange: [-5, 5]
    },
    hills: {
        func: "sin(w) + cos(b)",
        wRange: [-6.3, 6.3],
        bRange: [-6.3, 6.3]
    },
    plateau: {
        func: "tanh(w) + tanh(b)",
        wRange: [-5, 5],
        bRange: [-5, 5]
    }
};
function isBetween(value, min, max) {
    return value >= Math.min(min, max) && value <= Math.max(min, max);
}
function showPauseAlert() {
    const alertEl = document.getElementById('pauseAlert');
    if (!alertEl.classList.contains('show')) {
        alertEl.classList.add('show');
        setTimeout(() => {
            alertEl.classList.remove('show');
        }, 2000);
    }
}