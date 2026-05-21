let parrotsPort = null;
let deviations = []; 

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === 'INIT_PARROTS_PORT') {
    parrotsPort = event.ports ? event.ports[0] : null;
    return; 
  }

  const { candles } = event.data;
  if (!candles || candles.length < 15) return;

  const closes = candles.map(c => typeof c === 'object' ? c.close : c);
  const currentPrice = closes[closes.length - 1];

  const force = calculateFORCE(closes, 14);
  let signal = "HOLD";
  if (force !== null) {
    if (force < 30) signal = "BUY";
    if (force > 70) signal = "SELL";
  }
  self.postMessage({ price: currentPrice, force: force, signal: signal });

  let totalLines = 0, brokenUpper = 0, brokenLower = 0;
  for (let i = 0; i < 27; i++) {
    const period = (i + 1) * 20;
    if (closes.length >= period) {
      const bb = calculateBBForLast(closes, period);
      if (bb) {
        totalLines++;
        if (currentPrice > bb.upper) brokenUpper++;
        if (currentPrice < bb.lower) brokenLower++;
      }
    }
  }
  
  let parrotsSignal = "HOLD", spectrumPercent = 0, spectrumDirection = "NONE";
  if (totalLines > 0) {
    if (brokenUpper > brokenLower) {
      spectrumPercent = (brokenUpper / totalLines) * 100;
      spectrumDirection = "UP";
      if (spectrumPercent > 70) parrotsSignal = "SELL";
    } else if (brokenLower > brokenUpper) {
      spectrumPercent = (brokenLower / totalLines) * 100;
      spectrumDirection = "DOWN";
      if (spectrumPercent > 70) parrotsSignal = "BUY";
    }
  }

  deviations.push(spectrumPercent);
  if (deviations.length > 10) deviations.shift(); 
  const meanDev = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const variance = deviations.reduce((sum, d) => sum + Math.pow(d - meanDev, 2), 0) / deviations.length;
  const stdDev = Math.sqrt(variance);
  const marketState = stdDev < 15 ? "STABLE" : "NOISE"; 

  if (parrotsPort) {
    parrotsPort.postMessage({
      parrotsSignal, parrotsScore: spectrumPercent, parrotsDirection: spectrumDirection,
      price: currentPrice, deviation: stdDev.toFixed(2), state: marketState
    });
  }
  
  const aether = getAether(candles);
  self.postMessage({ type: 'AETHER_UPDATE', vector: aether.vector, anchor: aether.anchor, signal: aether.vector > aether.anchor ? "BUY" : "SELL" });
});

function calculateFORCE(c, p) {
  if (c.length < p + 1) return null;
  let g = 0, l = 0;
  for (let i = c.length - p; i < c.length; i++) {
    let d = c[i] - c[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  return l === 0 ? 100 : 100 - (100 / (1 + (g / p) / (l / p)));
}

function calculateBBForLast(c, p) {
  const s = c.slice(c.length - p);
  const sma = s.reduce((a, b) => a + b, 0) / p;
  const std = Math.sqrt(s.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / p);
  return { upper: sma + (2 * std), lower: sma - (2 * std) };
}

function getAether(c) {
  const v = (Math.max(...c.slice(-9).map(x => x.high || x.close)) + Math.min(...c.slice(-9).map(x => x.close))) / 2;
  const a = (Math.max(...c.slice(-26).map(x => x.close)) + Math.min(...c.slice(-26).map(x => x.close))) / 2;
  return { vector: v, anchor: a };
}
