// PID Output Bar

class PIDOutputBar {
    constructor() {
        this.outputBarContainer = document.getElementById('output-bar-container');
        this.outputBar = document.getElementById('output-bar');
    }
    
    update(normalizedOutput) {
        // normalizedOutput is in range [-1, 1]
        if (!this.outputBarContainer || !this.outputBar) return;
        
        const containerHeight = this.outputBarContainer.offsetHeight;
        if (containerHeight === 0) return;
        
        const halfHeight = containerHeight / 2;
        const height = Math.abs(normalizedOutput) * halfHeight;
        
        this.outputBar.style.transform = '';
        this.outputBar.style.top = '';
        this.outputBar.style.bottom = '';
        
        if (normalizedOutput < 0) {
            this.outputBar.style.height = `${height}px`;
            this.outputBar.style.top = '50%';
            this.outputBar.style.bottom = 'auto';
        } else if (normalizedOutput > 0) {
            this.outputBar.style.height = `${height}px`;
            this.outputBar.style.top = '50%';
            this.outputBar.style.bottom = 'auto';
            this.outputBar.style.transform = 'translateY(-100%)';
        } else {
            this.outputBar.style.height = '0px';
            this.outputBar.style.top = '50%';
            this.outputBar.style.bottom = 'auto';
        }
    }
}
