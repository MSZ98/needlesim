// Manual Motor Control

class ManualMotorControl {
    constructor(motor, motorContainer, motorGroup, onoffToggle, needle) {
        this.motor = motor;
        this.motorContainer = motorContainer;
        this.motorGroup = motorGroup;
        this.onoffToggle = onoffToggle;
        this.needle = needle;
        
        this.motorPressAngle = 0;
        this.motorStartAngle = 0;
        this.motorDragging = false;
        
        this.initEventListeners();
    }
    
    getMotorCenter() {
        const r = this.motorContainer.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    
    getMotorCursorAngle(e) {
        const c = this.getMotorCenter();
        return Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180 / Math.PI;
    }
    
    normalizeAngle(angle) {
        const normalizedAngle = ((angle % 360) + 360) % 360;
        return normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;
    }
    
    updateMotorAngle(angle) {
        const clampedAngle = this.normalizeAngle(angle);
        this.motor.setMotorAngle(clampedAngle);
        const rot = Number.isFinite(clampedAngle) ? clampedAngle + ANGLE_OFFSET : ANGLE_OFFSET;
        this.motorGroup.style.transform = `rotate(${rot}deg)`;
        // Aktualizuj needle (szybkie sprzężenie przy przeciąganiu)
        if (this.needle) {
            this.needle.update(clampedAngle);
        }
    }
    
    initEventListeners() {
        // Mouse down
        this.motorContainer.addEventListener('mousedown', (e) => {
            if (this.onoffToggle.isActive()) return;
            this.motorDragging = true;
            this.motorPressAngle = this.getMotorCursorAngle(e);
            this.motorStartAngle = this.motor.getMotorAngle();
            e.preventDefault();
        });
        
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (!this.motorDragging || this.onoffToggle.isActive()) return;
            const newAngle = this.motorStartAngle + (this.getMotorCursorAngle(e) - this.motorPressAngle);
            this.updateMotorAngle(newAngle);
            e.preventDefault();
        });
        
        // Mouse up
        document.addEventListener('mouseup', () => {
            this.motorDragging = false;
        });
        
        // Wheel
        this.motorContainer.addEventListener('wheel', (e) => {
            if (this.onoffToggle.isActive()) return;
            const currentAngle = this.motor.getMotorAngle();
            const newAngle = currentAngle + (e.deltaY > 0 ? -10 : 10);
            this.updateMotorAngle(newAngle);
            e.preventDefault();
        }, { passive: false });
    }
}
