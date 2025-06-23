// TransitionSystem.js

export class TransitionSystem {
  constructor(skin) {
    this.skin = skin;
    this.queue = [];
    this.curves = {};
    this.autoOptions = {};
    this.defaultSteps = 25;
    this.script = 'TransitionSystem';
    this.profiles = {};
    this.profileFunctions = {};

    this.moduleProfiles();
    this.moduleMoveX();
    this.moduleMoveY();
    this.moduleFade();
  }

  start(curve, meters, target, modifier = 'To', variableName = 'Auto', steps = this.defaultSteps) {
    const meterList = meters.split(/[\s,]+/);
    for (const meterName of meterList) {
      const isGroup = !this.skin.getMeter(meterName);

      let Xi, updateFunction;
      if (variableName === 'Auto') {
        if (!isGroup) {
          [Xi, updateFunction] = this.autoOptions[curve](meterName);
        } else {
          console.error('Error: a variable name must be given for transitions on meter groups.');
          return;
        }
      } else {
        Xi = Number(this.skin.getVariable(variableName, ''));
        updateFunction = (x) => this.skin.setVariable(variableName, x);
      }

      let Xf;
      target = Number(target);

      if (modifier === 'To') {
        Xf = target;
      } else if (modifier === 'By') {
        Xf = Xi + target;
      } else {
        const mod = Number(modifier);
        Xf = Math.abs(mod - Xi) < Math.abs(target - Xi) ? target : mod;
      }

      this.queue = this.queue.filter(q => !(q.n === meterName && q.v === variableName));

      this.queue.push({ n: meterName, v: variableName, g: isGroup, t: 0, Xi, Xf, s: steps, c: curve, f: updateFunction });

      if (this.queue.length === 1) {
        this.skin.setOption(this.script, 'UpdateDivider', 1);
        this.skin.updateMeasure(this.script);
      }
    }
  }

  update() {
    if (this.queue.length > 0) {
      for (let i = this.queue.length - 1; i >= 0; i--) {
        const v = this.queue[i];
        const { n: meterName, v: variableName, g: group, t, Xi, Xf, s: steps, c: curve, f: updateFunction } = v;

        let X;
        if (t === steps) {
          X = Xf;
          this.queue.splice(i, 1);
        } else {
          X = this.curves[curve](t, Xi, Xf, steps);
          v.t = t + 1;
        }

        updateFunction(X);
        this.skin.bang(`!UpdateMeter${group ? 'Group' : ''}`, meterName);
      }
    }

    if (this.queue.length === 0) {
      this.skin.setOption(this.script, 'UpdateDivider', -1);
    }
    return this.queue.length;
  }

  moduleProfiles() {
    this.profiles = {};
    this.profileFunctions = {};
  }

  moduleMoveX() {
    this.curves['MoveX'] = (t, Xi, Xf, steps) =>
      Xi + ((Xf - Xi) / 2) + ((Xf - Xi) / 2) * Math.sin(Math.PI * ((t / steps) - 0.5));

    this.autoOptions['MoveX'] = (meterName) => {
      const meter = this.skin.getMeter(meterName);
      const Xi = meter.getX();
      const updateFunction = (x) => this.skin.setOption(meterName, 'X', x);
      return [Xi, updateFunction];
    };

    this.profileFunctions['MoveToX'] = (...args) => this.start('MoveX', ...args);
  }

  moduleMoveY() {
    this.curves['MoveY'] = (t, Xi, Xf, steps) =>
      Xi + ((Xf - Xi) / 2) + ((Xf - Xi) / 2) * Math.sin(Math.PI * ((t / steps) - 0.5));

    this.autoOptions['MoveY'] = (meterName) => {
      const meter = this.skin.getMeter(meterName);
      const Yi = meter.getY();
      const updateFunction = (y) => this.skin.setOption(meterName, 'Y', y);
      return [Yi, updateFunction];
    };

    this.profileFunctions['MoveToY'] = (...args) => this.start('MoveY', ...args);
  }

  moduleFade() {
    this.curves['Fade'] = (t, Xi, Xf, steps) => Xi + t * (Xf - Xi) / steps;

    this.autoOptions['Fade'] = (meterName) => {
      const meter = this.skin.getMeter(meterName);
      let Ai;
      let updateFunction;
      const alphaOptions = ['ImageAlpha', 'ImageTint', 'FontColor', 'PrimaryColor', 'BarColor', 'LineColor', 'SolidColor'];

      for (const opt of alphaOptions) {
        const color = meter.getOption(opt);
        if (color) {
          const colors = this.parseColorCode(color);
          Ai = colors[3];
          updateFunction = (a) => this.skin.setOption(meterName, opt, `${colors[0]},${colors[1]},${colors[2]},${a}`);
          break;
        }
      }

      return [Ai, updateFunction];
    };

    this.profileFunctions['FadeIn'] = (meters, varName, steps) => this.start('Fade', meters, 255, 'To', varName, steps);
    this.profileFunctions['FadeOut'] = (meters, varName, steps) => this.start('Fade', meters, 0, 'To', varName, steps);
  }

  parseColorCode(str) {
    let colors = [];
    const hexMatch = str.match(/[A-Fa-f0-9]{6,8}/);

    if (hexMatch) {
      const hex = hexMatch[0];
      for (let i = 0; i < hex.length; i += 2) {
        colors.push(parseInt(hex.substr(i, 2), 16));
      }
    } else {
      colors = str.split(',').map(Number);
    }

    if (colors.length === 3) colors.push(255);
    return colors;
  }
}
