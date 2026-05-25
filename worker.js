let parrotsPort = null;
let lastAetherSignal = null; // Для фильтрации "дребезга"
let lastSentForce = 0;
let lastSentParrotsSignal = "";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === 'INIT_PARROTS_PORT') {
    parrotsPort = event.ports ? event.ports[0] : null;
    return;
  }

  const { candles } = event.data;
  if (!candles || candles.length < 15) return;

  const closes = candles.map(c => typeof c === 'object' ? c.close : c);
  const currentPrice = closes[closes.length - 1];

  // 1. Исправленный расчет FORCE с проверкой на null
  const force = calculateFORCE(closes, 14);
  let signal = "HOLD";
  if (force !== null) {
    if (force < 30) signal = "BUY";
    if (force > 70) signal = "SELL";
  }

  // 2. Расчет состояния рынка на основе волатильности цены
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

  // Расчет рыночной фазы через изменение цены (stdDev)
  const priceChange = closes.slice(-10).map((val, i, arr) => i > 0 ? val - arr[i-1] : 0);
  const meanChange = priceChange.reduce((a, b) => a + b, 0) / priceChange.length;
  const variance = priceChange.reduce((sum, d) => sum + Math.pow(d - meanChange, 2), 0) / priceChange.length;
  const marketState = Math.sqrt(variance) < 0.5 ? "STABLE" : "NOISE"; 

  if (parrotsPort) {
    if (parrotsSignal !== lastSentParrotsSignal) {
      lastSentParrotsSignal = parrotsSignal;
    parrotsPort.postMessage({
      parrotsSignal, parrotsScore: spectrumPercent, parrotsDirection: spectrumDirection,
      price: currentPrice, deviation: Math.sqrt(variance).toFixed(2), state: marketState
    });
  }
 } 
  // 3. Фильтрация сигналов AETHER
const aether = getAether(candles);
  const currentAetherSignal = aether.vector > aether.anchor ? "BUY" : "SELL";
  
  // УСЛОВИЕ ДЛЯ ОТПРАВКИ (только если данные изменились)
  if (Math.abs(force - lastSentForce) > 0.1 || currentAetherSignal !== lastAetherSignal) {
    lastSentForce = force;
    lastAetherSignal = currentAetherSignal;

    self.postMessage({ 
      price: currentPrice, 
      force: force, 
      signal: signal,
      aether: { 
        vector: aether.vector,
        anchor: aether.anchor,
        signal: currentAetherSignal
      }
    });
  }
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

function getAether(candles) {
  if (!candles || candles.length < 26) return { vector: 0, anchor: 0 };

  // Используем цену закрытия как fallback, если high/low не определены
  const getHigh = (x) => (x && x.high > 0) ? x.high : (x.close || 0);
  const getLow = (x) => (x && x.low > 0) ? x.low : (x.close || 0);

  const slice9 = candles.slice(-9);
  const slice26 = candles.slice(-26);

  const v = (Math.max(...slice9.map(getHigh)) + Math.min(...slice9.map(getLow))) / 2;
  const a = (Math.max(...slice26.map(getHigh)) + Math.min(...slice26.map(getLow))) / 2;
  
  // Добавим проверку, чтобы исключить нулевые значения при расчете
  if (v === 0 || a === 0) return { vector: 0, anchor: 0 };
  
  return { vector: v, anchor: a };
}
