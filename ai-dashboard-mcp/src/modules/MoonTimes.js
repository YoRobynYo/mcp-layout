// MoonTimes.js

// MoonTimes.js - self-contained and runs immediately

class MoonTimes {
  static M_PI = Math.PI;
  static DR = Math.PI / 180;
  static synmonth = 29.53058868;

  static torad(d) {
    return d * (Math.PI / 180);
  }

  static todeg(r) {
    return r * (180 / Math.PI);
  }

  static fixangle(a) {
    return a - 360 * Math.floor(a / 360);
  }

  static dsin(d) {
    return Math.sin(this.torad(d));
  }

  static dcos(d) {
    return Math.cos(this.torad(d));
  }

  static jyear(td) {
    td = td + 0.5;
    const z = Math.floor(td);
    const f = td - z;
    let a;
    if (z < 2299161) {
      a = z;
    } else {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    return [day, month, year];
  }

  static meanphase(sdate, k) {
    const t = (sdate - 2415020) / 36525;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      2415020.75933 +
      this.synmonth * k +
      0.0001178 * t2 -
      0.000000155 * t3 +
      0.00033 * this.dsin(166.56 + 132.87 * t - 0.009173 * t2)
    );
  }

  static truephase(k, phase) {
    k += phase;
    const t = k / 1236.85;
    const t2 = t * t;
    const t3 = t2 * t;

    let pt =
      2415020.75933 +
      this.synmonth * k +
      0.0001178 * t2 -
      0.000000155 * t3 +
      0.00033 * this.dsin(166.56 + 132.87 * t - 0.009173 * t2);

    const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
    const mprime =
      306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
    const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;

    if (phase < 0.01 || Math.abs(phase - 0.5) < 0.01) {
      pt +=
        (0.1734 - 0.000393 * t) * this.dsin(m) +
        0.0021 * this.dsin(2 * m) -
        0.4068 * this.dsin(mprime) +
        0.0161 * this.dsin(2 * mprime) -
        0.0004 * this.dsin(3 * mprime) +
        0.0104 * this.dsin(2 * f) -
        0.0051 * this.dsin(m + mprime) -
        0.0074 * this.dsin(m - mprime) +
        0.0004 * this.dsin(2 * f + m) -
        0.0004 * this.dsin(2 * f - m) -
        0.0006 * this.dsin(2 * f + mprime) +
        0.0010 * this.dsin(2 * f - mprime) +
        0.0005 * this.dsin(m + 2 * mprime);
    } else if (
      Math.abs(phase - 0.25) < 0.01 ||
      Math.abs(phase - 0.75) < 0.01
    ) {
      pt +=
        (0.1721 - 0.0004 * t) * this.dsin(m) +
        0.0021 * this.dsin(2 * m) -
        0.6280 * this.dsin(mprime) +
        0.0089 * this.dsin(2 * mprime) -
        0.0004 * this.dsin(3 * mprime) +
        0.0079 * this.dsin(2 * f) -
        0.0119 * this.dsin(m + mprime) -
        0.0047 * this.dsin(m - mprime) +
        0.0003 * this.dsin(2 * f + m) -
        0.0004 * this.dsin(2 * f - m) -
        0.0006 * this.dsin(2 * f + mprime) +
        0.0021 * this.dsin(2 * f - mprime) +
        0.0003 * this.dsin(m + 2 * mprime) +
        0.0004 * this.dsin(m - 2 * mprime) -
        0.0003 * this.dsin(2 * m + mprime);

      if (phase < 0.5) {
        pt += 0.0028 - 0.0004 * this.dcos(m) + 0.0003 * this.dcos(mprime);
      } else {
        pt -= 0.0028 - 0.0004 * this.dcos(m) + 0.0003 * this.dcos(mprime);
      }
    }

    return pt;
  }
}

// Automatically run when loaded:
(function runMoonTimes() {
  const now = new Date();
  // Convert current date to Julian date
  const Y = now.getUTCFullYear();
  const M = now.getUTCMonth() + 1; // JS months 0-11
  const D =
    now.getUTCDate() +
    now.getUTCHours() / 24 +
    now.getUTCMinutes() / (24 * 60) +
    now.getUTCSeconds() / (24 * 3600);

  // Julian date calculation
  const JD =
    367 * Y -
    Math.floor((7 * (Y + Math.floor((M + 9) / 12))) / 4) +
    Math.floor((275 * M) / 9) +
    D +
    1721013.5;

  console.log("Current Julian Date:", JD.toFixed(5));

  // k cycles since base date
  const k = Math.floor((JD - 2415020.75933) / MoonTimes.synmonth);

  // Calculate true new moon phase time
  const newMoonJD = MoonTimes.truephase(k, 0);
  const [day, month, year] = MoonTimes.jyear(newMoonJD);

  console.log(
    `Next New Moon: ${year}-${month}-${Math.floor(day)} (Julian Date: ${newMoonJD.toFixed(
      5
    )})`
  );
})();
