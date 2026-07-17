// worker.js - Pure price extreme pivot implementation (No RSI)
let parrotsPort = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === 'INIT_PARROTS_PORT') {
    parrotsPort = event.ports ? event.ports[0] : null;
    return;
  }

  const { candles } = event.data;
  if (!candles || candles.length < 15) return;

  // Extract pure historical price points
  const closes = candles.map(c => typeof c === 'object' ? c.close : c);
  const highs = candles.map(c => typeof c === 'object' ? (c.high || c.close) : c);
  const lows = candles.map(c => typeof c === 'object' ? (c.low || c.close) : c);
  
  const currentPrice = closes[closes.length - 1];

  // 1. MinMax Normalization over the last 30 periods (Pivot Force Matrix Component)
  const maxPrice = Math.max(...highs.slice(-30));
  const minPrice = Math.min(...lows.slice(-30));
  
  let force = 50;
  if (maxPrice !== minPrice) {
    force = ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100;
  }

  let signal = "HOLD";
  if (force < 15) signal = "BUY";   // Price compressed at historical bottom
  if (force > 85) signal = "SELL";  // Price compressed at historical ceiling

  // 2. Market State Engine (38 Parrots / Bollinger Bands Spectrum)
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

  const priceChange = closes.slice(-10).map((val, i, arr) => i > 0 ? val - arr[i-1] : 0);
  const meanChange = priceChange.reduce((a, b) => a + b, 0) / priceChange.length;
  const variance = priceChange.reduce((sum, d) => sum + Math.pow(d - meanChange, 2), 0) / priceChange.length;
  const marketState = Math.sqrt(variance) < 0.5 ? "STABLE" : "NOISE"; 

  if (parrotsPort) {
    parrotsPort.postMessage({
      parrotsSignal, parrotsScore: spectrumPercent, parrotsDirection: spectrumDirection,
      price: currentPrice, deviation: Math.sqrt(variance).toFixed(2), state: marketState
    });
  }
  
  // 3. Aether Vector Flow Analysis
  const aether = getAether(candles);
  const currentAetherSignal = aether.vector > aether.anchor ? "BUY" : "SELL";

  // 4. Pure Price Action Stateless Divergences (Pivot vs Price)
  const divData = detectDivConStateless(closes, highs, lows, force);

  self.postMessage({ 
    price: currentPrice, 
    force: force, 
    signal: signal,
    aether: { 
      vector: aether.vector,
      anchor: aether.anchor,
      signal: currentAetherSignal
    },
    divSignal: divData ? divData.signal : null,
    divLines: divData ? divData.lines : null
  });
});

function detectDivConStateless(closes, highs, lows, currentForce) {
  const len = closes.length;
  if (len < 155) return null;

  const idxNow = len - 1;
  const idxL = len - 151; 
  const idxS = len - 51;  

  const priceNow = closes[idxNow];
  const forceNow = currentForce;

  const getForceAtIdx = (hSlice, lSlice, cPrice) => {
    const max = Math.max(...hSlice.slice(-30));
    const min = Math.min(...lSlice.slice(-30));
    return max === min ? 50 : ((cPrice - min) / (max - min)) * 100;
  };

  const forceL = getForceAtIdx(highs.slice(0, idxL + 1), lows.slice(0, idxL + 1), closes[idxL]);
  const forceS = getForceAtIdx(highs.slice(0, idxS + 1), lows.slice(0, idxS + 1), closes[idxS]);

  const priceL = closes[idxL];
  const priceS = closes[idxS];

  let signal = null;
  let lines = [];

  if (priceNow > priceL && forceNow < forceL) { signal = "LDS"; lines.push({ fromIndex: idxL, toIndex: idxNow, type: "LDS" }); }
  else if (priceNow > priceL && forceNow > forceL) { signal = "LCS"; lines.push({ fromIndex: idxL, toIndex: idxNow, type: "LCS" }); }
  else if (priceNow < priceL && forceNow > forceL) { signal = "LDB"; lines.push({ fromIndex: idxL, toIndex: idxNow, type: "LDB" }); }
  else if (priceNow < priceL && forceNow < forceL) { signal = "LCB"; lines.push({ fromIndex: idxL, toIndex: idxNow, type: "LCB" }); }

  if (priceNow > priceS && forceNow < forceS) { signal = "SDS"; lines.push({ fromIndex: idxS, toIndex: idxNow, type: "SDS" }); }
  else if (priceNow > priceS && forceNow > forceS) { signal = "SCS"; lines.push({ fromIndex: idxS, toIndex: idxNow, type: "SCS" }); }
  else if (priceNow < priceS && forceNow > forceS) { signal = "SDB"; lines.push({ fromIndex: idxS, toIndex: idxNow, type: "SDB" }); }
  else if (priceNow < priceS && forceNow < forceS) { signal = "SCB"; lines.push({ fromIndex: idxS, toIndex: idxNow, type: "SCB" }); }

  if (signal && lines.length > 0) return { signal, lines };
  return null;
}

function calculateBBForLast(closes, period) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return { upper: sma + (2 * stdDev), lower: sma - (2 * stdDev) };
}

function getAether(candles) {
  const getHigh = (x) => (x && x.high > 0) ? x.high : (x.close || 0);
  const getLow = (x) => (x && x.low > 0) ? x.low : (x.close || 0);
  const slice9 = candles.slice(-9);
  const slice26 = candles.slice(-26);
  const v = (Math.max(...slice9.map(getHigh)) + Math.min(...slice9.map(getLow))) / 2;
  const a = (Math.max(...slice26.map(getHigh)) + Math.min(...slice26.map(getLow))) / 2;
  return { vector: v, anchor: a };
}
