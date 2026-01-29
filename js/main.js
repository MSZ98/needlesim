// Main initialization and event handlers

// Initialize knobs (global variables for use in other files)
const knobs = initKnobs();
setpointKnob = knobs.setpointKnob;
pKnob = knobs.pKnob;
iKnob = knobs.iKnob;
dKnob = knobs.dKnob;

// Create simulation instance
const simulation = new Simulation();

// Toggle switches with default values from parameters.js
const ylimLockToggle = new ToggleSwitch('ylim-lock-toggle', {
    defaultActive: DEFAULT_PARAMS.yLimLocked !== undefined ? DEFAULT_PARAMS.yLimLocked : false
});
const onoffToggle = new ToggleSwitch('onoff-toggle', {
    defaultActive: DEFAULT_PARAMS.onoff || false
});
const needleLoadToggle = new ToggleSwitch('needle-load-toggle', {
    defaultActive: DEFAULT_PARAMS.needleLoad !== undefined ? DEFAULT_PARAMS.needleLoad : true,
    onChange: (isActive) => {
        updateFormula(isActive);
    }
});
const clampingToggle = new ToggleSwitch('clamping-toggle', {
    defaultActive: DEFAULT_PARAMS.clamping !== undefined ? DEFAULT_PARAMS.clamping : false,
    onChange: (isActive) => {
        // Jeśli clamping został włączony, wyłącz saturation
        if (isActive && saturationToggle.isActive()) {
            saturationToggle.setActive(false);
        }
    }
});
const saturationToggle = new ToggleSwitch('saturation-toggle', {
    defaultActive: DEFAULT_PARAMS.saturation !== undefined ? DEFAULT_PARAMS.saturation : false,
    onChange: (isActive) => {
        // Jeśli saturation został włączony, wyłącz clamping
        if (isActive && clampingToggle.isActive()) {
            clampingToggle.setActive(false);
        }
    }
});

// Set default value for integral saturation value
const integralSaturationValueInput = document.getElementById('integral-saturation-value');
integralSaturationValueInput.value = DEFAULT_PARAMS.integralSaturationValue || 1.0;

// Add wheel support for integral saturation value
integralSaturationValueInput.addEventListener('wheel', (e) => {
    e.preventDefault();
    const currentValue = parseFloat(integralSaturationValueInput.value) || 0;
    const step = e.deltaY > 0 ? -0.1 : 0.1;
    const newValue = Math.max(0, currentValue + step);
    integralSaturationValueInput.value = newValue.toFixed(1);
    simulation.setIntegralSaturationValue(newValue);
}, { passive: false });

// Function to update formula based on needle load
function updateFormula(isAsymptotic) {
    const formulaElement = document.querySelector('.params-formula-main');
    if (formulaElement) {
        if (isAsymptotic) {
            // Asymptotic: Go(s) = k/(s(a·s² + b·s + c))
            formulaElement.innerHTML = 'G<sub>o</sub>(s) = <span class="params-frac"><span class="params-num">k</span><span class="params-den">s(a·s² + b·s + c)</span></span>';
        } else {
            // Non-asymptotic: Go(s) = k/(a·s² + b·s + c)
            formulaElement.innerHTML = 'G<sub>o</sub>(s) = <span class="params-frac"><span class="params-num">k</span><span class="params-den">a·s² + b·s + c</span></span>';
        }
    }
}

// Initialize formula based on default needle load state
updateFormula(needleLoadToggle.isActive());

// Manual motor control
const motorContainer = document.getElementById('motor-container');
const motorGroup = document.getElementById('motor-group');
const manualMotorControl = new ManualMotorControl(
    simulation.getMotor(),
    motorContainer,
    motorGroup,
    onoffToggle,
    simulation.getNeedle()
);

// Reset button
document.getElementById('motor-reset-btn').addEventListener('click', () => {
    simulation.reset();
});

// Integral value display - click to reset
const integralValueElement = document.getElementById('integral-value');
if (integralValueElement) {
    integralValueElement.addEventListener('click', () => {
        simulation.pidController.resetIntegral();
    });
}

// Simulation loop (10 ms)
setInterval(() => {
    simulation.run = onoffToggle.isActive();
    simulation.setNeedleLoad(needleLoadToggle.isActive());
    simulation.setClampingEnabled(clampingToggle.isActive());
    simulation.setSaturationEnabled(saturationToggle.isActive());
    simulation.step();
}, 5);
