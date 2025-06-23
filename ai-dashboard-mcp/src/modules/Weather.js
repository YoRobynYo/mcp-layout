// Weather.js 

function initialize(skin) {
  const getMeasure = name => skin.getMeasure(name);

  return {
    msUnits: getMeasure("@UnitsType"),
    msWindNow: getMeasure("@CurrentWindSpeed"),
    msWindToday: getMeasure("@ForecastTodayDayWindSpeed"),
    msWindTonight: getMeasure("@ForecastTodayNightWindSpeed"),
    msWindTomorrow: getMeasure("@ForecastDay2DayWindSpeed"),
    msWindAfter: getMeasure("@ForecastDay3DayWindSpeed"),
    msWindAfterA: getMeasure("@ForecastDay4DayWindSpeed"),
    msPressure: getMeasure("@CurrentPressure"),
    msChange: getMeasure("@CurrentPressureChangeTrend"),
    msPresUnits: getMeasure("@UnitsPressure"),
    msTempNow: getMeasure("@CurrentTemperature"),
  };
}

function update(state, skin) {
  skin.disableMeasure("mLuaScript");
  skin.enableMeasure("mToggleDayNight");

  let units = state.msUnits.getStringValue().toLowerCase();
  let tempNow = Number(state.msTempNow.getStringValue());

  if (units !== "m") tempNow = round((5 / 9) * (tempNow - 32));
  setMeterValue(skin, "MtTempPointer", (tempNow + 30) / 70);

  // Wind setup
  const windNow = Number(state.msWindNow.getStringValue());
  const windNowClass = windclass(windNow, units);

  if (windNow > 0) {
    skin.setVariable("NowWind", `${windNowClass} at [@CurrentWindSpeed] [@UnitsSpeed] from the [@CurrentWindDirectionCompass]`);
    skin.setOption("MtWindIndicator", "ToolTipText", `${windNowClass} at [@CurrentWindSpeed] [@UnitsSpeed]\nfrom the [@CurrentWindDirectionCompass]`);
  } else {
    skin.setVariable("NowWind", "It is calm without even the lightest breeze");
    skin.setOption("MtWindIndicator", "ToolTipText", "It is calm without wind");
  }

  skin.setOption("TomorrowWindSpeed", "Text", `Wind:   ${windclass(Number(state.msWindTomorrow.getStringValue()), units)}`);
  skin.setOption("AfterWindSpeed", "Text", `Wind:   ${windclass(Number(state.msWindAfter.getStringValue()), units)}`);
  skin.setOption("AfterWindSpeedA", "Text", `Wind:   ${windclass(Number(state.msWindAfterA.getStringValue()), units)}`);

  // Barometer
  const pressure = Number(state.msPressure.getStringValue());
  const trend = state.msChange.getStringValue().toLowerCase();
  let inchesHg = (units === "m") ? round(pressure / 33.8639, 2) : round(pressure, 2);
  const pressureMb = round(inchesHg * 33.8639, 0);

  setMeterValue(skin, "MtBarometer", pressureMb);

  const desc = barometerDescription(inchesHg, trend);
  skin.setVariable("NowBarometer", `${pressureMb} mb and [@CurrentPressureChangeTrend] - ${desc}`);
  skin.setOption("MtBarometer", "ToolTipText", `${pressureMb} mb and [@CurrentPressureChangeTrend]\n${desc}`);

  console.log("Dieselpunk-Weather updated");
  return "meters set";
}

function round(num, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.floor(num * factor + 0.5) / factor;
}

function windclass(speed, units) {
  if (units !== "m") speed *= 1.60934;
  if (speed <= 1) return "Calm";
  if (speed <= 5) return "Light air";
  if (speed <= 11) return "Light Breeze";
  if (speed <= 19) return "Gentle Breeze";
  if (speed <= 28) return "Moderate Breeze";
  if (speed <= 38) return "Fresh Breeze";
  if (speed <= 49) return "Strong Breeze";
  if (speed <= 61) return "Moderate Gale";
  if (speed <= 74) return "Fresh Gale";
  if (speed <= 88) return "Strong Gale";
  if (speed <= 102) return "Storm";
  if (speed <= 117) return "Violent Storm";
  return "Hurricane";
}

function barometerDescription(inHg, trend) {
  if (inHg <= 28.59) return trend === "falling" ? "Increasingly Stormy" : trend === "steady" ? "Rain and Stormy" : "Stormy but improving";
  if (inHg <= 29.59) return trend === "falling" ? "more rain likely" : trend === "steady" ? "Rainy" : "Rainy but improving";
  if (inHg <= 30.09) return trend === "falling" ? "changing to Rain" : trend === "steady" ? "between Rain & Fair" : "changing to Fair";
  if (inHg <= 30.59) return trend === "falling" ? "Fair but worsening" : trend === "steady" ? "Fair" : "Fair and improving";
  return trend === "falling" ? "Very Dry, getting drier" : trend === "steady" ? "Very Dry" : "Very Dry but improving";
}

function setMeterValue(skin, meter, value) {
  const meterHandle = skin.getMeter(meter);
  if (!meterHandle) throw new Error(`Invalid Meter: ${meter}`);
  const measureName = meterHandle.getOption("MeasureName");
  if (!measureName) throw new Error(`MeasureName not found in ${meter}`);
  skin.setOption(measureName, "Formula", value);
  skin.updateMeasure(measureName);
}
