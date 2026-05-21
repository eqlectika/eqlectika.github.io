let parrotsPort = null;
let deviations = [];

self.addEventListener("message", (event) => {
  console.log("Worker received event:", event.data ? event.data.type : "no data");

  if (event.data && event.data.type === 'INIT_PARROTS_PORT') {
    parrotsPort = event.ports ? event.ports[0] : null;
    if (parrotsPort) console.log("Parrots port was accepted");
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

  let totalLines = 0;
  let brokenUpper = 0;
  let brokenLower = 0;
  
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
  let parrotsSignal = "HOLD";
  let spectrumPercent = 0;
  let spectrumDirection = "NONE";
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
      parrotsSignal: parrotsSignal,
      parrotsScore: spectrumPercent,
            parrotsDirection: spectrumDirection,
      price: currentPrice,
      deviation: stdDev.toFixed(2), // передаем число
      state: marketState          // передаем слово (STABLE или NOISE)
    });
  }
  const aether = getAether(candles);
  
  let aetherSignal = "HOLD";
  if (aether.vector > aether.anchor) aetherSignal = "BUY";
  if (aether.vector < aether.anchor) aetherSignal = "SELL";

  self.postMessage({ 
    type: 'AETHER_UPDATE', 
    vector: aether.vector, 
    anchor: aether.anchor,
    signal: aetherSignal 
  });
});

function calculateFORCE(closes, period) {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
}

function calculateBBForLast(closes, period) {
  const len = closes.length;
  if (len < period) return null;
  const slice = closes.slice(len - period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return { upper: sma + (2 * stdDev), lower: sma - (2 * stdDev) };
}

function getAether(candles) {
    const periodVector = 9;
    const periodAnchor = 26;
    
    const getHigh = (i) => Math.max(...candles.slice(i - periodVector + 1, i + 1).map(c => c.high || c.close));
    const getLow = (i) => Math.min(...candles.slice(i - periodVector + 1, i + 1).map(c => c.close));

    const vector = (getHigh(candles.length-1) + getLow(candles.length-1)) / 2;
    const anchor = (Math.max(...candles.slice(candles.length-26, candles.length).map(c => c.close)) + 
                   Math.min(...candles.slice(candles.length-26, candles.length).map(c => c.close))) / 2;

    return { vector, anchor };
}
