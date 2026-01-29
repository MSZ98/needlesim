// UI Panels (log, params)

// Log panel toggle
let isLogPanelOpen = DEFAULT_PARAMS.logPanelOpen || false;

function updateLogPanel() {
    const logPanelContainer = document.getElementById('log-panel-container');
    const logPanel = document.getElementById('log-panel');
    const arrow = document.querySelector('#show-log-toggle .arrow');
    
    if (isLogPanelOpen) {
        logPanelContainer.classList.add('show');
        logPanel.classList.add('show');
        if (arrow) arrow.textContent = '←';
        document.body.classList.add('log-panel-open');
        const onoffWrapper = document.getElementById('onoff-wrapper');
        if (onoffWrapper) onoffWrapper.classList.add('log-panel-open');
    } else {
        logPanelContainer.classList.remove('show');
        logPanel.classList.remove('show');
        if (arrow) arrow.textContent = '→';
        document.body.classList.remove('log-panel-open');
        const onoffWrapper = document.getElementById('onoff-wrapper');
        if (onoffWrapper) onoffWrapper.classList.remove('log-panel-open');
    }
}

document.getElementById('show-log-toggle').addEventListener('click', function() {
    isLogPanelOpen = !isLogPanelOpen;
    updateLogPanel();
});

// Params panel toggle
let isParamsPanelOpen = DEFAULT_PARAMS.paramsPanelOpen || false;

function updateParamsPanel() {
    const container = document.getElementById('params-panel-container');
    const panel = document.getElementById('params-panel');
    const arrow = document.querySelector('#show-params-toggle .arrow');
    
    if (isParamsPanelOpen) {
        container.classList.add('show');
        panel.classList.add('show');
        if (arrow) arrow.textContent = '→';
        document.body.classList.add('params-panel-open');
    } else {
        container.classList.remove('show');
        panel.classList.remove('show');
        if (arrow) arrow.textContent = '←';
        document.body.classList.remove('params-panel-open');
    }
}

document.getElementById('show-params-toggle').addEventListener('click', function() {
    isParamsPanelOpen = !isParamsPanelOpen;
    updateParamsPanel();
});

// Initialize panels with default values
document.addEventListener('DOMContentLoaded', function() {
    updateLogPanel();
    updateParamsPanel();
});

// Log panel: Clear, Copy, Save
const logTextarea = document.getElementById('log-textarea');

document.getElementById('clear-log-btn').addEventListener('click', function() {
    logTextarea.value = '';
});

document.getElementById('copy-log-btn').addEventListener('click', function() {
    navigator.clipboard.writeText(logTextarea.value);
});

document.getElementById('save-log-btn').addEventListener('click', function() {
    const blob = new Blob([logTextarea.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'needlesim-log-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
});
