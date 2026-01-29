// Motor Dynamics

/**
 * For the electric motor shaft angle transfer function is:
 * Go(s) = kt/(s(LJs²+BJ+ktke))
 * where:
 * kt = torque constant
 * L = inductance
 * J = moment of inertia
 * B = damping coefficient
 * ke = back emf constant
 * 
 * 
 * For asymptotic object, transfer function is:
 * Go(s) = k/(s(as²+bs+c))
 * 
 * So we have to rewrite it to the form of a differential equation:
 * Y/X = k/(as²+bs+c)
 * kX = (as²+bs+c)Y
 * 
 * s is differential operator, so:
 * s = ( )' = d/dt
 * s² = ( )'' = d²/dt²
 * s³ = ( )''' = d³/dt³
 * 
 * kX = a·s²Y + b·sY + c·Y
 * kx = a·y'' + b·y' + c·y
 * a·y'' = kx - b·y' - c·y
 * 
 * For non-asymptotic object, transfer function is:
 * Go(s) = k/(s(as²+bs+c))
 * 
 * We are going to use it for the motor with asymetric load (needle).
 * 
 * So we have to rewrite it to the form of a differential equation:
 * Y/X = k/(s(as²+bs+c))
 * kX = sY·(as²+bs+c)
 * 
 * s is differential operator, so:
 * s = ( )' = d/dt
 * s² = ( )'' = d²/dt²
 * s³ = ( )''' = d³/dt³
 * 
 * kX = a·s³Y + b·s²Y + c·sY
 * kx = a·y''' + b·y'' + c·y'
 * a·y''' = kx - b·y'' - c·y'
 * 
 * y = angle
 * y' = velocity
 * y'' = acceleration
 * y''' = jerk
 * x = voltage
*/

class Motor {
    constructor() {
        this.initVariables();
        this.updateParameters();
    }

    initVariables() {
        this.y = 0;      // angle
        this.yp = 0;     // velocity
        this.ypp = 0;    // acceleration
        this.yppp = 0;   // jerk
        this.prev_y = 0;
        this.motorGroup = document.getElementById('motor-group');
        this.motorGroupParent = this.motorGroup.parentElement;
    }

    normalizeAngle(angle) {
        angle = angle % 360;
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    }

    updateParameters() {
        // Transfer function parameters
        this.k = readParam('param-k');
        this.a = readParam('param-a');
        this.b = readParam('param-b');
        this.c = readParam('param-c');
    }

    step_asymptotic(u, dt) {
        this.updateParameters();
        
        // We are going to divide by a, so it can't be 0
        if (this.a == 0) return;
        
        // Simulation steps
        const n = 200;
        const dti = dt / n;
        
        // Solve the differential equation
        for (let i = 0; i < n; i++) {
            // a·y'' = kx - b·y' - c·y
            this.ypp = (this.k*u - this.b*this.yp - this.c*this.y) / this.a;
            this.yp += this.ypp * dti;
            this.y += this.yp * dti;
        }
        
        this.prev_y = this.y;
    }

    step_nonasymptotic(u, dt) {
        this.updateParameters();
        
        // We are going to divide by a, so it can't be 0
        if (this.a == 0) return;
        
        // Simulation steps
        const n = 200;
        const dti = dt / n;
        
        // Solve the differential equation
        for (let i = 0; i < n; i++) {
            // a·y''' = kx - b·y'' - c·y'
            this.yppp = (this.k*u - this.b*this.ypp - this.c*this.yp) / this.a;
            this.ypp += this.yppp * dti;
            this.yp += this.ypp * dti;
            this.y += this.yp * dti;
        }
    
        this.prev_y = this.y;
    }

    updateGraphics() {
        this.motorGroup.style.transform = `rotate(${-(this.y + 180)}deg)`;
    }

    getMotorAngle() {
        return this.y;
    }

    getMotorVel() {
        return this.yp;
    }

    setMotorAngle(angle) {
        this.y = angle;
    }

    resetMotor() {
        this.motorAngle = 0;
        this.motorVel = 0;
        this.motorAcc = 0;
        this.prev_shaft_angle = 0;
    }
}
