// Logging functionality

let lastLogTime = 0;

function log(text, timeout = 0) {
    const now = Date.now();
    
    // If timeout is set and not enough time has passed, skip logging
    if (timeout > 0 && (now - lastLogTime) < timeout) {
        return;
    }
    
    const logTextarea = document.getElementById('log-textarea');
    if (!logTextarea) return;
    
    // Append text with newline
    logTextarea.value += text + '\n';
    
    // Auto-scroll if enabled
    const autoscrollCheckbox = document.getElementById('autoscroll-checkbox');
    if (autoscrollCheckbox && autoscrollCheckbox.checked) {
        logTextarea.scrollTop = logTextarea.scrollHeight;
    }
    
    lastLogTime = now;
}
