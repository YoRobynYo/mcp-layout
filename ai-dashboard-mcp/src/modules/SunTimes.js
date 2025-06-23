// SunTimes.js - Sunrise, Sunset, Twilight Calculator

class SunTimes {
  constructor(latitude, longitude, timeZone = 0) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.timeZone = timeZone;

    this.jDateSun = 0;
    this.noSunRise = false;
    this.noSunSet = false;
    this.noNight = false;
    this.strSunTip = "";

    this.dawnAngle = 6; // Civil twilight angle
    this.duskAngle = 6;
  }

  // Degree <-> Radian
  static dtr(d) {
    return (d * Math.PI) / 180;
  }
  static rtd(r) {
    return (r * 180) / Math.PI;
  }

  // Fix angle to [0,360)
  static fixAngle(a) {
    a = a - 360 * Math.floor(a / 360);
    return a < 0 ? a + 360 : a;
  }

  // Fix hour to [0,24)
  static fixHour(a) {
    a = a - 24 * Math.floor(a / 24);
    return a < 0 ? a + 24 : a;
  }

  // Trig helpers in degrees
  static Msin(d) {
    return Math.sin(SunTimes.dtr(d));
  }
  static Mcos(d) {
    return Math.cos(SunTimes.dtr(d));
  }
  static Mtan(d) {
    return Math.tan(SunTimes.dtr(d));
  }
  static arcsin(d) {
    return SunTimes.rtd(Math.asin(d));
  }
  static arccos(d) {
    return SunTimes.rtd(Math.acos(d));
  }
  static arctan(d) {
    return SunTimes.rtd(Math.atan(d));
  }
  static arccot(x) {
    return SunTimes.rtd(Math.atan(1 / x));
  }
  static arctan2(y, x) {
    return SunTimes.rtd(Math.atan2(y, x));
  }

  // Julian Date from Gregorian
  static julian(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD =
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      B -
      1524.5;
    return JD;
  }

  // Sun position: returns equation of time or declination
  sunPosition(jd, returnDeclination) {
    const D = jd - 2451545;
    const g = SunTimes.fixAngle(357.529 + 0.98560028 * D);
    const q = SunTimes.fixAngle(280.459 + 0.98564736 * D);
    const L =
      SunTimes.fixAngle(
        q + 1.915 * SunTimes.Msin(g) + 0.02 * SunTimes.Msin(2 * g)
      );
    const e = 23.439 - 0.00000036 * D;
    const RA =
      SunTimes.arctan2(
        SunTimes.Mcos(e) * SunTimes.Msin(L),
        SunTimes.Mcos(L)
      ) / 15;
    const eqt = q / 15 - SunTimes.fixHour(RA);
    const decl = SunTimes.arcsin(SunTimes.Msin(e) * SunTimes.Msin(L));
    return returnDeclination ? decl : eqt;
  }

  midDay(Ftime) {
    const eqt = this.sunPosition(this.jDateSun + Ftime, false);
    return SunTimes.fixHour(12 - eqt);
  }

  sunAngleTime(angle, Ftime, direction) {
    const decl = this.sunPosition(this.jDateSun + Ftime, true);
    const noon = this.midDay(Ftime);
    let t =
      (-SunTimes.Msin(angle) -
        SunTimes.Msin(decl) * SunTimes.Msin(this.latitude)) /
      (SunTimes.Mcos(decl) * SunTimes.Mcos(this.latitude));

    if (t > 1) {
      this.noSunRise = true;
      this.strSunTip = "\nThe sun is below the horizon all day today";
      return noon;
    }
    if (t < -1) {
      this.noSunSet = true;
      this.strSunTip = "\nNo sunrise / no sunset\nThe sun is up all day";
      return noon;
    }

    t = (1 / 15) * SunTimes.arccos(t);
    return noon + (direction === "CCW" ? -t : t);
  }

  // Twilight time calculation
  duskAngleTime(angle, Ftime, direction) {
    const decl = this.sunPosition(this.jDateSun + Ftime, true);
    const noon = this.midDay(Ftime);
    let t =
      (-SunTimes.Msin(angle) -
        SunTimes.Msin(decl) * SunTimes.Msin(this.latitude)) /
      (SunTimes.Mcos(decl) * SunTimes.Mcos(this.latitude));

    if (t > 1) {
      this.noNight = true; // Twilight all night
      return 0;
    }
    if (t < -1) {
      this.noNight = true; // Twilight all night
      return 0;
    }

    t = (1 / 15) * SunTimes.arccos(t);
    return noon + (direction === "CCW" ? -t : t);
  }

  riseSetAngle() {
    const angle = 0.0347;
    return 0.833 + angle; // Sun radius + atmospheric refraction
  }

  // Converts hours to day portion [0..1]
  dayPortion(times) {
    return times.map((t) => t / 24);
  }

  // Adjust times for timezone and longitude
  adjustTimes(times) {
    return times.map((t) => t + (this.timeZone - this.longitude / 15));
  }

  // Adjust times for higher latitudes to handle polar days/nights
  adjustHighLats(times) {
    const nightTime = this.timeDiff(times[2], times[1]); // sunset - sunrise
    times[0] = this.refineHLtimes(times[0], times[1], this.dawnAngle, nightTime, "CCW"); // dawn
    times[3] = this.refineHLtimes(times[3], times[2], this.duskAngle, nightTime, "CW"); // dusk
    return times;
  }

  refineHLtimes(time, base, angle, night, direction) {
    const portion = night / 2;
    const timeDiff = direction === "CCW" ? this.timeDiff(time, base) : this.timeDiff(base, time);

    if (!(time * 2 > 2) || timeDiff > portion) {
      time = base + (direction === "CCW" ? -portion : portion);
    }
    return time;
  }

  timeDiff(time1, time2) {
    return SunTimes.fixHour(time2 - time1);
  }

  // Calculate all sun times (dawn, sunrise, sunset, dusk) from base times array (hours)
  setTimes(baseTimes) {
    const times = this.dayPortion(baseTimes);

    const dawn = this.duskAngleTime(this.dawnAngle, times[0], "CCW");
    const sunrise = this.sunAngleTime(this.riseSetAngle(), times[1], "CCW");
    const sunset = this.sunAngleTime(this.riseSetAngle(), times[6], "CW");
    const dusk = this.duskAngleTime(this.duskAngle, times[5], "CW");

    return [dawn, sunrise, sunset, dusk];
  }

  // Main function to calculate sun times
  calculate(julianDate) {
    this.jDateSun = julianDate - this.longitude / (15 * 24);
    this.noSunRise = false;
    this.noSunSet = false;
    this.noNight = false;
    this.strSunTip = "";

    // Default base times in hours (from Lua script)
    let baseTimes = [6, 6, 6, 12, 13, 18, 18, 18, 24];

    let times = this.setTimes(baseTimes);
    times = this.adjustTimes(times);
    times = this.adjustHighLats(times);

    // Compose tooltip string similar to Lua script
    let tooltip = "";

    if (this.noSunRise) {
      tooltip = "The sun does not rise today.";
    } else if (this.noSunSet) {
      tooltip = "The sun does not set today.";
    } else if (this.noNight) {
      tooltip = "Twilight lasts all night.";
    } else {
      tooltip =
        "Twilight: " +
        this.formatTime(times[0]) +
        "\nSunrise: " +
        this.formatTime(times[1]) +
        "\nSunset: " +
        this.formatTime(times[2]) +
        "\nTwilight: " +
        this.formatTime(times[3]);
    }

    this.strSunTip = tooltip;

    return {
      dawn: this.formatTime(times[0]),
      sunrise: this.formatTime(times[1]),
      sunset: this.formatTime(times[2]),
      dusk: this.formatTime(times[3]),
      noSunRise: this.noSunRise,
      noSunSet: this.noSunSet,
      noNight: this.noNight,
      tooltip,
    };
  }

  // Helper to format decimal hours to HH:mm string
  formatTime(time) {
    let hours = Math.floor(time);
    let minutes = Math.floor((time - hours) * 60);
    if (hours < 0) hours += 24;
    if (minutes < 0) minutes = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}

// Example usage when running as main module
if (require.main === module) {
  const latitude = 51.5074; // London
  const longitude = -0.1278;
  const now = new Date();
  const timeZone = now.getTimezoneOffset() / -60; // e.g. BST=1
  const jd = SunTimes.julian(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());

  const sunTimes = new SunTimes(latitude, longitude, timeZone);
  const times = sunTimes.calculate(jd);

  console.log("Sun Times for London today:");
  console.log(times);
}

export default SunTimes;
