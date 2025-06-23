// BlendColor.js
// Converts multiple color scales into RGBA color based on input percentage

// Helper: scale a value from one range to another
function scale(value, oldMin, oldMax, newMin, newMax) {
  const oldRange = oldMax - oldMin;
  const newRange = newMax - newMin;
  return (((value - oldMin) * newRange) / oldRange) + newMin;
}

// Parse a scale string into an array of arrays, e.g.:
// "0,50,0,128|50,100,128,255" -> [[0,50,0,128],[50,100,128,255]]
function loadScales(scaleString) {
  if (typeof scaleString !== 'string') {
    throw new Error('Scale string must be a string');
  }
  const parts = scaleString.split('|');
  const result = parts.map(part => {
    const nums = part.split(',').map(Number);
    if (nums.length !== 4 || nums.some(isNaN)) {
      throw new Error(`Invalid scale group: "${part}". Expect 4 numeric values.`);
    }
    return nums;
  });
  return result;
}

// Given a percentage (0-100) and a scale array, find the matching segment and interpolate
function multiScaleColor(percentage, colorScaleTable) {
  if (!Array.isArray(colorScaleTable)) {
    throw new Error('colorScaleTable must be an array');
  }

  for (const scale of colorScaleTable) {
    if (!Array.isArray(scale) || scale.length !== 4) {
      throw new Error('Each scale must be an array of 4 numbers');
    }
    const [startPct, endPct, startVal, endVal] = scale;
    if (percentage >= startPct && percentage <= endPct) {
      return scaleValue(percentage, startPct, endPct, startVal, endVal);
    }
  }

  // Default fallback if no match found
  return 0;
}

// Wrapper for scale with rounding
function scaleValue(percentage, oldMin, oldMax, newMin, newMax) {
  return Math.round(scale(percentage, oldMin, oldMax, newMin, newMax));
}

// Main function that processes RGBA channels using scale strings
// Inputs:
//  - meterValuePercent: number between 0 and 100 representing the measure's relative value
//  - scales: object with keys redScale, greenScale, blueScale, alphaScale containing scale strings
// Output: RGBA string like "255,128,0,255"
function blendColor(meterValuePercent, scales) {
  const redScale = loadScales(scales.redScale || '0,100,0,255');
  const greenScale = loadScales(scales.greenScale || '0,100,0,255');
  const blueScale = loadScales(scales.blueScale || '0,100,0,255');
  const alphaScale = loadScales(scales.alphaScale || '0,100,255,255');

  const red = multiScaleColor(meterValuePercent, redScale);
  const green = multiScaleColor(meterValuePercent, greenScale);
  const blue = multiScaleColor(meterValuePercent, blueScale);
  const alpha = multiScaleColor(meterValuePercent, alphaScale);

  return `${red},${green},${blue},${alpha}`;
}

// Export functions
export {
  blendColor,
  loadScales,
  multiScaleColor,
  scale,
};
