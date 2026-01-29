// Chart rendering
const chartData = { t: [], setpoint: [], theta: [] };
const maxChartPoints = 800;
let chartTime = 0;

// Funkcja wykrywania częstotliwości drgań
function detectFrequency(data) {
    if (!data.theta || data.theta.length < 10) return null;
    
    // Oblicz średnią wartość theta (środek oscylacji)
    const mean = data.theta.reduce((a, b) => a + b, 0) / data.theta.length;
    
    // Znajdź przejścia przez średnią (zero crossings względem średniej)
    // Zapisujemy również kierunek przejścia (true = w górę, false = w dół)
    const zeroCrossings = [];
    for (let i = 1; i < data.theta.length; i++) {
        const prevDiff = data.theta[i - 1] - mean;
        const currDiff = data.theta[i] - mean;
        
        // Przejście z ujemnej na dodatnią (w górę)
        if (prevDiff <= 0 && currDiff > 0) {
            // Interpolacja liniowa dla dokładniejszego czasu przejścia
            const t1 = data.t[i - 1];
            const t2 = data.t[i];
            const y1 = prevDiff;
            const y2 = currDiff;
            const t = t1 - y1 * (t2 - t1) / (y2 - y1);
            zeroCrossings.push({ time: t, direction: 'up' });
        }
        // Przejście z dodatniej na ujemną (w dół)
        else if (prevDiff >= 0 && currDiff < 0) {
            const t1 = data.t[i - 1];
            const t2 = data.t[i];
            const y1 = prevDiff;
            const y2 = currDiff;
            const t = t1 - y1 * (t2 - t1) / (y2 - y1);
            zeroCrossings.push({ time: t, direction: 'down' });
        }
    }
    
    // Potrzebujemy co najmniej 2 przejścia w tym samym kierunku, żeby obliczyć pełny okres
    if (zeroCrossings.length < 2) return null;
    
    // Oblicz pełne okresy między kolejnymi przejściami w tym samym kierunku
    const periods = [];
    const firstDirection = zeroCrossings[0].direction;
    let lastTime = null;
    
    for (let i = 0; i < zeroCrossings.length; i++) {
        if (zeroCrossings[i].direction === firstDirection) {
            if (lastTime !== null) {
                const period = zeroCrossings[i].time - lastTime;
                // Filtruj nierealistycznie krótkie okresy (szum)
                if (period > 0.01) {
                    periods.push(period);
                }
            }
            lastTime = zeroCrossings[i].time;
        }
    }
    
    if (periods.length === 0) return null;
    
    // Oblicz średni okres (użyj mediany dla większej odporności na szum)
    periods.sort((a, b) => a - b);
    const medianPeriod = periods[Math.floor(periods.length / 2)];
    
    // Częstotliwość = 1 / okres
    const frequency = 1 / medianPeriod;
    
    // Sprawdź czy to rzeczywiście drgania (częstotliwość w rozsądnym zakresie)
    if (frequency > 0.1 && frequency < 100) {
        return frequency;
    }
    
    return null;
}

function drawChart() {
    const canvas = document.getElementById('chart-canvas');
    const container = document.getElementById('chart-container');
    if (!canvas || !container) return;
    const data = chartData;
    if (!data.t || data.t.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    const pad = { L: 48, R: 16, T: 16, B: 40 };
    const x0 = pad.L, x1 = w - pad.R, y0 = pad.T, y1 = h - pad.B;
    const tMin = data.t[0], tMax = data.t[data.t.length - 1];
    const tSpan = Math.max(tMax - tMin, 0.1);
    
    // Check if Y-limits are locked by checking the toggle element
    const ylimToggleElement = document.getElementById('ylim-lock-toggle');
    const yLimLocked = ylimToggleElement && ylimToggleElement.classList.contains('active');
    let yMin, yMax;
    
    if (yLimLocked) {
        // Use fixed Y-limits from parameters
        yMin = DEFAULT_PARAMS.y_low;
        yMax = DEFAULT_PARAMS.y_high;
    } else {
        // Auto-scale based on data
        const allY = data.setpoint.concat(data.theta);
        const yLo = Math.min(...allY), yHi = Math.max(...allY);
        const ySpan = Math.max(yHi - yLo, 1) || 1;
        const yMid = (yLo + yHi) / 2;
        yMin = yMid - ySpan / 2;
        yMax = yMid + ySpan / 2;
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1);
    ctx.stroke();
    
    // Rysuj linie pomocnicze i podpisy na osi Y
    const numYTicks = 5; // liczba podziałek na osi Y
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= numYTicks; i++) {
        const yValue = yMin + (yMax - yMin) * (i / numYTicks);
        const yPos = y1 - (i / numYTicks) * (y1 - y0);
        
        // Linia pomocnicza
        ctx.beginPath();
        ctx.moveTo(x0, yPos);
        ctx.lineTo(x1, yPos);
        ctx.stroke();
        
        // Podpis wartości
        const label = yValue.toFixed(1);
        ctx.fillText(label, x0 - 6, yPos);
    }
    
    // Rysuj pionowe kratki (2x więcej niż oznaczeń na osi X)
    const numXTicks = 10; // liczba podziałek na osi X (2x więcej niż było)
    const numVerticalGridLines = numXTicks * 2; // 2x więcej pionowych kratek
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= numVerticalGridLines; i++) {
        const xPos = x0 + (i / numVerticalGridLines) * (x1 - x0);
        
        // Pionowa linia pomocnicza
        ctx.beginPath();
        ctx.moveTo(xPos, y0);
        ctx.lineTo(xPos, y1);
        ctx.stroke();
    }
    
    // Rysuj linie pomocnicze i podpisy na osi X (czas w sekundach)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i <= numXTicks; i++) {
        const tValue = tMin + tSpan * (i / numXTicks);
        const xPos = x0 + (i / numXTicks) * (x1 - x0);
        
        // Linia pomocnicza (krótka kreska na osi)
        ctx.beginPath();
        ctx.moveTo(xPos, y1);
        ctx.lineTo(xPos, y1 + 4);
        ctx.stroke();
        
        // Podpis wartości czasu w sekundach
        const label = tValue.toFixed(1);
        ctx.fillText(label, xPos, y1 + 6);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.fillText('θ (°)', 52, y0);
    ctx.fillText('t (s)', x1 - 10, h - 45);
    ctx.fillStyle = '#2196F3';
    ctx.fillText('zadana', x1 - 52, y0 + 10);
    ctx.fillStyle = '#f44336';
    ctx.fillText('θ(t)', x1 - 36, y0 + 22);

    function toX(t) { return x0 + (t - tMin) / tSpan * (x1 - x0); }
    function toY(y) { return y1 - (y - yMin) / (yMax - yMin) * (y1 - y0); }

    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(data.t[0]), toY(data.setpoint[0]));
    for (let i = 1; i < data.t.length; i++) ctx.lineTo(toX(data.t[i]), toY(data.setpoint[i]));
    ctx.stroke();

    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(data.t[0]), toY(data.theta[0]));
    for (let i = 1; i < data.t.length; i++) ctx.lineTo(toX(data.t[i]), toY(data.theta[i]));
    ctx.stroke();
    
    // Wykryj i wyświetl częstotliwość drgań w lewym dolnym rogu
    const frequency = detectFrequency(data);
    if (frequency !== null) {
        ctx.fillStyle = '#666';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`f = ${frequency.toFixed(2)} Hz`, x0 - 40, y1 + 35);
    }
}

function addChartPoint(setpoint, theta) {
    chartTime += 0.01; // dt
    chartData.t.push(chartTime);
    chartData.setpoint.push(setpoint);
    chartData.theta.push(theta);
    if (chartData.t.length > maxChartPoints) {
        chartData.t.shift();
        chartData.setpoint.shift();
        chartData.theta.shift();
    }
}

function resetChart() {
    chartTime = 0;
    chartData.t.length = 0;
    chartData.setpoint.length = 0;
    chartData.theta.length = 0;
}
