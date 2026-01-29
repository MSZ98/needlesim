// Default parameters for the simulation
const DEFAULT_PARAMS = {
    k: 1,
    a: 0.001,
    b: 0.01,
    c: 0.1,
    Umin: -30,
    Umax: 30,
    P: 0.01,
    I: 0,
    D: 0,
    dt: 0.01, // simulation time step in seconds
    
    // Toggle defaults
    onoff: false,
    needleLoad: true,
    clamping: false,
    saturation: false,
    integralSaturationValue: 1.0,
    
    // Panel defaults
    logPanelOpen: false,
    paramsPanelOpen: false,
    
    // Chart Y-axis limits
    y_low: -180,
    y_high: 180,
    yLimLocked: false  // If true, use y_low/y_high; if false, auto-scale
};

// Offset kąta: 0° = w dół (needle skierowana w dół)
const ANGLE_OFFSET = 180;
