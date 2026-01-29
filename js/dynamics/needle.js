// Needle Dynamics (1:1 z motorem)
// Zależności: ANGLE_OFFSET (z parameters.js)

class Needle {
    constructor() {
        this.needleAngle = 0;
        this.needleDisplayAngle = ANGLE_OFFSET; // Kąt wyświetlany (z offsetem dla przeskoków)
        this.lastUpdateTime = Date.now(); // Czas ostatniego wywołania update
        this.needleVel = 0;
        this.needleGroup = document.getElementById('needle-group');
    }
    
    update(motorAngle, powered) {
        // Oblicz dt od ostatniego wywołania
        const now = Date.now();
        const dt = (now - this.lastUpdateTime) / 1000; // w sekundach
        this.lastUpdateTime = now;
        
        // Aktualizuj needleAngle
        const prevNeedleAngle = this.needleAngle;
        this.needleAngle = motorAngle;
        
        // Wykryj przeskok przez granicę -180°/180° i oblicz różnicę
        let angleDiff = this.needleAngle - prevNeedleAngle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        // Aktualizuj wyświetlany kąt z uwzględnieniem przeskoków
        this.needleDisplayAngle += angleDiff;
        
        // Normalizuj wyświetlany kąt (opcjonalne, dla czytelności)
        if (this.needleDisplayAngle > 360) this.needleDisplayAngle -= 360;
        if (this.needleDisplayAngle < -360) this.needleDisplayAngle += 360;
        
        // Użyj CSS custom property zamiast bezpośredniego style.transform
        // To jest bardziej wydajne i pozwala uniknąć problemów z przeskokami
        if (this.needleGroup) {
            const rot = Number.isFinite(this.needleDisplayAngle) ? this.needleDisplayAngle : ANGLE_OFFSET;
            this.needleGroup.style.setProperty('--needle-angle', `${-rot}deg`);
        }
    }
    
    stepNonpowered(dt) {
        this.needleAngle += this.needleVel * dt;
        this.needleDisplayAngle += this.needleVel * dt;
    }
    
    getNeedleAngle() {
        return this.needleAngle;
    }
    
    reset() {
        this.needleAngle = 0;
        this.needleDisplayAngle = ANGLE_OFFSET;
        this.needleVel = 0;
        if (this.needleGroup) {
            this.needleGroup.style.setProperty('--needle-angle', `${ANGLE_OFFSET}deg`);
        }
    }
}
