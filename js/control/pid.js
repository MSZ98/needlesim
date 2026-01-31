// PID Controller

function readParam(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

class PIDController {
    constructor() {
        this.initVariables();
    }
    
    compute(sp, pv, dt) {
        if (dt === 0) return 0;
        this.updateParameters();
        let e = sp - pv;
        // console.log(dt);
        
        if (this.clampingEnabled) this.performIntegrationWithClamping(e, dt);
        else if (this.saturationEnabled) this.performIntegrationWithSaturation(e, dt);
        else this.E += e * dt;

        const ep = (e - this.prev_e) / dt;
        let u = this.P * e + this.I * this.E + this.D * ep;
        
        if (u > 1) u = 1;
        if (u < -1) u = -1;
        this.normalizedOutput = u;
        
        let out = 0;
        if (u > 0) out = Math.abs(u) * this.Umax;
        else out = Math.abs(u) * this.Umin;
        
        // Update previous values
        this.prev_e = e;
        this.prev_u = u;
        
        return out;
    }

    performIntegrationWithClamping(e, dt) {
        let prev_E = this.E;
        this.E += e * dt;
        if (this.prev_u >= 1) {
            this.integralSaturated = true;
            this.E = prev_E;
        }
        else if (this.prev_u <= -1) {
            this.integralSaturated = true;
            this.E = prev_E;
        }
        else this.integralSaturated = false;
    }

    performIntegrationWithSaturation(e, dt) {
        this.E += e * dt;
        if (this.E > this.integralSaturationValue) {
            this.integralSaturated = true;
            this.E = this.integralSaturationValue;
        }
        else if (this.E < -this.integralSaturationValue) {
            this.integralSaturated = true;
            this.E = -this.integralSaturationValue;
        }
        else this.integralSaturated = false;
    }

    saturateIntegral() {
        if (this.E > this.integralSaturationValue) this.E = this.integralSaturationValue;
        else if (this.E < -this.integralSaturationValue) this.E = -this.integralSaturationValue;
    }
    
    initVariables() {
        this.prev_e = 0;
        this.E = 0;
        this.prev_e = 0;
        this.prev_u = 0;
        this.normalizedOutput = 0;
        this.clampingEnabled = false;
        this.saturationEnabled = false;
        this.integralSaturationValue = 0;
        this.integralSaturated = false;
    }

    updateParameters() {
        this.P = readParam('p-value');
        this.I = readParam('i-value');
        this.D = readParam('d-value');
        this.Umin = readParam('param-Umin');
        this.Umax = readParam('param-Umax');
        this.integralSaturationValue = readParam('integral-saturation-value');
    }
    
    reset() {
        this.E = 0;
        this.prev_e = 0;
        this.prev_out = 0;
        this.integralSaturated = false;
    }
    
    getIntegralValue() {
        return this.E;
    }

    isIntegralSaturated() {
        return this.integralSaturated;
    }
    
    resetIntegral() {
        this.E = 0;
    }
}

function saturate(u, Umin, Umax) {
    return Math.max(Umin, Math.min(Umax, u));
}
