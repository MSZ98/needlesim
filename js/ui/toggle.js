// Toggle Switch Component

class ToggleSwitch {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        if (!this.element) {
            console.warn(`ToggleSwitch: Element with id "${elementId}" not found`);
            return;
        }
        
        this.options = {
            defaultActive: options.defaultActive || false,
            onChange: options.onChange || null
        };
        
        if (this.options.defaultActive) this.element.classList.add('active');
        
        // Add click event listener
        this.element.addEventListener('click', () => {
            this.toggle();
        });
    }
    
    isActive() {
        return this.element.classList.contains('active');
    }
    
    setActive(active) {
        if (active === this.isActive()) return;
        
        if (active) {
            this.element.classList.add('active');
        } else {
            this.element.classList.remove('active');
        }
        
        if (this.options.onChange) {
            this.options.onChange(active);
        }
    }
    
    toggle() {
        this.setActive(!this.isActive());
    }
    
    getElement() {
        return this.element;
    }
}
