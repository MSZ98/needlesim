class KnobController {
    constructor(knobId, valueId, options = {}) {
        this.initOptions(options);
        this.initVariables(knobId, valueId);
        document.getElementById(knobId).style.transform = `rotate(${this.rotationOffset}deg)`;
        this.initEventListeners();
        this.updateDisplay();
    }

    initOptions(options) {
        this.options = options;
        this.minValue = options.minValue;
        this.maxValue = options.maxValue;
        this.valuePerRev = options.valuePerRev ?? 1;
        this.initialValue = options.initialValue ?? 0;
        this.wheelStep = options.wheelStep ?? 10;
        this.formatValue = options.formatValue || ((v) => v.toFixed(3));
        this.rotationOffset = options.rotationOffset ?? 0;
    }

    initVariables(knobId, valueId) {
        this.knobId = knobId;
        this.knob = document.getElementById(knobId);
        this.knobInner = this.knob.querySelector('.knob-inner');
        this.valueDisplay = document.getElementById(valueId);
        this.value = this.initialValue;
        this.angle = this.getAngleFromValue(this.value);
        this.pressCursorAngle = 0;
        this.prevCursorAngle = 0;
        this.isDragging = false;
    }

    initEventListeners() {
        this.knob.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.knob.addEventListener('wheel', this.onWheel.bind(this));
        if (this.valueDisplay.tagName === 'INPUT') {
            this.valueDisplay.addEventListener('change', () => {
                const value = parseFloat(this.valueDisplay.value) || 0;
                this.setValue(value);
            });
            this.valueDisplay.addEventListener('blur', () => {
                const value = parseFloat(this.valueDisplay.value) || 0;
                this.setValue(value);
            });
        }
    }

    onMouseDown(e) {
        this.isDragging = true;
        const coords = this.getCursorPolarCoordsFromMouseEvent(e);
        this.pressCursorAngle = coords.angle;
        this.knob.style.cursor = 'grabbing';
        this.prevCursorAngle = this.pressCursorAngle;
        e.preventDefault();
    }

    onMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.knob.style.cursor = 'pointer';
        }
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        const currentCursorCoords = this.getCursorPolarCoordsFromMouseEvent(e);
        const currentCursorAngle = currentCursorCoords.angle;
        let delta = currentCursorAngle - this.prevCursorAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        this.angle += delta;
        this.prevCursorAngle = currentCursorAngle;
        this.updateDisplay();
        e.preventDefault();
    }

    onWheel(e) {
        e.preventDefault();
        let dir = e.deltaY > 0 ? -1 : 1;
        if (typeof this.valuePerRev === 'string' && this.valuePerRev.includes('-')) dir *= -1;
        else if (this.valuePerRev < 0) dir *= -1;
        const step = dir * this.wheelStep;
        const newAngle = this.angle + step;
        const newValue = this.getValueFromAngle(newAngle);
        if (
            (this.minValue === undefined || newValue >= this.minValue) &&
            (this.maxValue === undefined || newValue <= this.maxValue)
        ) {
            this.angle = newAngle;
            this.lastAngle = newAngle;
            this.updateDisplay();
        }
    }
    
    getValueFromAngle(angle) {
        if (this.options.getValueFromAngle) return this.options.getValueFromAngle(angle);
        if (this.valuePerRev === "decade") {
            if (angle === 0) return 0;
            const sign = Math.sign(this.angle);
            const angle_abs = Math.abs(this.angle);
            const turns = Math.floor(angle_abs / 360);
            const base = 10 ** (turns - 3);
            const t = (angle_abs % 360) / 360;
            const value = sign * base * (1 + 9 * t);
            return value;
        }
        const value = this.angle / 360 * this.valuePerRev;
        return value;
    }
    
    getAngleFromValue(value) {
        if (this.options.getAngleFromValue) return this.options.getAngleFromValue(value);
        if (this.valuePerRev === "decade") {
            if (value === 0) return 0;
            const sign = Math.sign(value) || 1;
            const v = Math.abs(value);
            const decade = Math.floor(Math.log10(v));
            const base = 10 ** decade;
            const t = (v / base - 1) / 9;
            const turns = decade + 3;
            const angle = (turns * 360) + t * 360;
            return sign * angle;
        }
        const angle = value / this.valuePerRev * 360;
        return angle;
    }

    setValue(value) {
        this.value = value;
        this.angle = this.getAngleFromValue(value);
        this.updateDisplay();
    }

    setAngle(angle) {
        this.angle = angle;
        this.value = this.getValueFromAngle(angle);
        this.updateDisplay();
    }

    getAngle() {
        return this.angle;
    }

    getValue() {
        return this.value;
    }

    getMouseAngle(e, centerX, centerY) {
        const rect = this.knob.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        let mouseAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        return mouseAngle;
    }
    
    getCursorPolarCoordsFromMouseEvent(e) {
        const rect = this.knob.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return { r, angle };
    }
    
    updateDisplay() {
        this.value = this.getValueFromAngle(this.angle);
        if (this.minValue !== undefined) {
            if (this.value < this.minValue) {
                this.value = this.minValue;
                const prevAngle = this.angle;
                this.angle = this.getAngleFromValue(this.value);
            }
        }
        if (this.maxValue !== undefined) {
            if (this.value > this.maxValue) {
                this.value = this.maxValue;
                this.angle = this.getAngleFromValue(this.value);
            }
        }
        if (this.knobInner) this.knobInner.style.transform = `rotate(${this.angle}deg)`;
        else this.knob.style.transform = `rotate(${this.angle}deg)`;
        if (this.valueDisplay.tagName === 'INPUT') this.valueDisplay.value = this.formatValue(this.value);
        else this.valueDisplay.textContent = this.formatValue(this.value);
    }
    
}


function initKnobs() {
    // Inicjalizacja knobów
    const setpointKnob = new KnobController('setpoint-knob', 'setpoint-value', {
        minValue: -180,
        maxValue: 180,
        initialAngle: 0,
        valuePerRev: -360,
        rotationOffset: 180,
        formatValue: (v) => `${Math.round(v)}°`,
    });

    const pKnob = new KnobController('p-knob', 'p-value', {
        minValue: 0,
        initialValue: DEFAULT_PARAMS.P,
        valuePerRev: "decade",
        sensitivity: 0.5
    });

    const iKnob = new KnobController('i-knob', 'i-value', {
        minValue: 0,
        initialValue: DEFAULT_PARAMS.I,
        valuePerRev: "decade",
        sensitivity: 0.5
    });

    const dKnob = new KnobController('d-knob', 'd-value', {
        minValue: 0,
        initialValue: DEFAULT_PARAMS.D,
        valuePerRev: "decade",
        sensitivity: 0.5
    });

    // Toggle switch dla setpoint (±180°)
    const setpointToggle = document.getElementById('setpoint-toggle');
    const toggleSetpoint = function() {
        const isActive = setpointToggle.classList.toggle('active');
        let v = setpointKnob.getValue();
        v += isActive ? 180 : -180;
        v = ((v + 180) % 360 + 360) % 360 - 180;
        setpointKnob.setValue(v);
    };
    
    setpointToggle.addEventListener('click', toggleSetpoint);
    
    // Obsługa klawisza spacji do przełączania setpoint toggle
    document.addEventListener('keydown', function(e) {
        // Sprawdź czy spacja została naciśnięta i czy nie jesteśmy w polu input/textarea
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            toggleSetpoint();
        }
    });

    return { setpointKnob, pKnob, iKnob, dKnob };
}
