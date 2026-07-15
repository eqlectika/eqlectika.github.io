// worker_2.js
let parrotsPort = null;
let lastAetherSignal = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === 'INIT_PARROTS_PORT') {
    parrotsPort = event.ports ? event.ports[0] : null;
    return;
  }

  const { candles } = event.data;
  if (!candles || candles.length < 15) return;

  const closes = candles.map(c => typeof c === 'object' ? c.close : c);
  const currentPrice = closes[closes.length - 1];

  // 1. Расчет FORCE для текущей точки
  const force = calculateFORCE(closes, 14);
  let signal = "HOLD";
  if (force !== null) {
    if (force < 30) signal = "BUY";
    if (force > 70) signal = "SELL";
  }

  // 2. Расчет состояния рынка (38 Parrots)
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
  
  // 3. Фильтрация сигналов AETHER
  const aether = getAether(candles);
  const currentAetherSignal = aether.vector > aether.anchor ? "BUY" : "SELL";

  // 4. Динамический stateless расчет дивергенций/конвергенций
  const divData = detectDivConStateless(closes, force);

  lastAetherSignal = currentAetherSignal;
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

function detectDivConStateless(closes, currentForce) {
  const len = closes.length;
  if (len < 55) return null; // Минимальная история для безопасного смещения на 50 свечей

  const idxNow = len - 1;
  const idxL = len - 51; // Точка L (50 свечей назад относительно текущей)
  const idxS = len - 21; // Точка S (20 свечей назад относительно текущей)

  const priceNow = closes[idxNow];
  const rsiNow = currentForce;

  // Рассчитываем FORCE на исторических срезах БЕЗ заглядывания в будущее
  const rsiL = calculateFORCE(closes.slice(0, idxL + 1), 14);
  const rsiS = calculateFORCE(closes.slice(0, idxS + 1), 14);

  const priceL = closes[idxL];
  const priceS = closes[idxS];

  if (rsiL === null || rsiS === null) return null;

  let signal = null;
  let lines = [];

  // Дивергенция L (Long-period: 50 свечей)
  if (priceNow > priceL && rsiNow < rsiL) {
    signal = "LS";
    lines.push({ fromIndex: idxL, toIndex: idxNow, type: "LS" });
  } else if (priceNow < priceL && rsiNow > rsiL) {
    signal = "LB";
    lines.push({ fromIndex: idxL, toIndex: idxNow, type: "LB" });
  }

  // Конвергенция S (Short-period: 20 свечей)
  if (priceNow > priceS && rsiNow > rsiS) {
    signal = "SS";
    lines.push({ fromIndex: idxS, toIndex: idxNow, type: "SS" });
  } else if (priceNow < priceS && rsiNow < rsiS) {
    signal = "SB";
    lines.push({ fromIndex: idxS, toIndex: idxNow, type: "SB" });
  }

  if (signal) {
    return { signal, lines };
  }
  return null;
}

// Вспомогательные математические функции

function calculateFORCE(closes, period = 14) {
  if (closes.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[closes.length - i] - closes[closes.length - i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if (gains + losses === 0) return 50;
  return (gains / (gains + losses)) * 100;
}

function calculateBBForLast(closes, period) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: sma + (2 * stdDev),
    lower: sma - (2 * stdDev)
  };
}

function getAether(candles) {
  const closes = candles.map(c => typeof c === 'object' ? c.close : c);
  const getHigh = (x) => (x && x.high > 0) ? x.high : (x.close || 0);
  const getLow = (x) => (x && x.low > 0) ? x.low : (x.close || 0);

  const slice9 = candles.slice(-9);
  const slice26 = candles.slice(-26);

  const v = (Math.max(...slice9.map(getHigh)) + Math.min(...slice9.map(getLow))) / 2;
  const a = (Math.max(...slice26.map(getHigh)) + Math.min(...slice26.map(getLow))) / 2;
  
  if (v === 0 || a === 0) return { vector: 0, anchor: 0 };
  return { vector: v, anchor: a };
}
