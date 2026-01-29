// Simulation class

class Simulation {
    constructor() {
        this.initVariables();
        this.updateParameters();
    }
    
    setNeedleLoad(needleLoad) {
        this.needleLoad = needleLoad;
    }
    
    setClampingEnabled(isClampingEnabled) {
        this.isClampingEnabled = isClampingEnabled;
        this.pidController.clampingEnabled = isClampingEnabled;
    }
    
    setSaturationEnabled(isSaturationEnabled) {
        this.isSaturationEnabled = isSaturationEnabled;
        this.pidController.saturationEnabled = isSaturationEnabled;
    }
    
    setIntegralSaturationValue(value) {
        this.pidController.setIntegralSaturationValue(value);
    }
    
    step() {
        this.updateParameters();

        if (this.run) {
            const angle = this.motor.getMotorAngle();
            const dt = this.calculateDt();
            this.updateDtDisplay(dt);
            const u = this.pidController.compute(this.setpoint, angle, dt);
            if (this.needleLoad) this.motor.step_asymptotic(u, dt);
            else this.motor.step_nonasymptotic(u, dt);

            this.needle.update(angle, this.needleLoad);
            this.motor.updateGraphics();
            this.outputBar.update(this.pidController.normalizedOutput);
            
            addChartPoint(this.setpoint, angle);
            drawChart();
        } else {
            if (this.needleLoad) {
                const angle = this.motor.getMotorAngle();
                this.needle.update(angle);
            }
            this.outputBar.update(0);
        }
        
        this.updateIntegralDisplay();
    }

    calculateDt() {
        if (this.prevTime === undefined) {
            this.prevTime = performance.now() / 1000;
            return 0;
        }
        const currentTime = performance.now() / 1000;
        const dt = currentTime - this.prevTime;
        this.prevTime = currentTime;
        return dt;
    }
    
    updateIntegralDisplay() {
        const integralValue = this.pidController.getIntegralValue();
        const integralElement = document.getElementById('integral-value');
        if (integralElement) {
            integralElement.textContent = `∫ = ${integralValue.toFixed(3)}`;
        }
    }

    updateDtDisplay(dt) {
        if (this.dtSamples === undefined) this.dtSamples = [];
        this.dtSamples.push(dt);
        if (this.dtSamples.length > 30) {
            this.dtSamples.shift();
        }
        const averageDt = this.dtSamples.reduce((a, b) => a + b, 0) / this.dtSamples.length;
        const dtElement = document.getElementById('dt-value');
        if (dtElement) dtElement.textContent = `dt = ${averageDt.toFixed(3)}s`;
    }
    
    reset() {
        this.motor.resetMotor();
        this.needle.reset();
        this.pidController.reset();
        resetChart();
        drawChart();
    }

    updateParameters() {
        this.setpoint = setpointKnob.getValue();
        this.P = pKnob.getValue();
        this.I = iKnob.getValue();
        this.D = dKnob.getValue();
        this.Umin = readParam('param-Umin');
        this.Umax = readParam('param-Umax');
        this.integralSaturationValue = readParam('integral-saturation-value');
        console.log(this.isClampingEnabled, this.isSaturationEnabled, this.integralSaturationValue);
    }

    initVariables() {
        this.dt = DEFAULT_PARAMS.dt;
        this.motor = new Motor();
        this.needle = new Needle();
        this.pidController = new PIDController();
        this.outputBar = new PIDOutputBar();
        this.run = false;
        this.needleLoad = true;
        this.isClampingEnabled = false;
        this.isSaturationEnabled = false;
    }
    
    getMotor() {
        return this.motor;
    }
    
    getNeedle() {
        return this.needle;
    }
}
