class MathUtil {
  static deg2rad = Math.PI / 180.0;
  static rad2deg = 180.0 / Math.PI;
  static halfPi = Math.PI / 2.0;
  
  static clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
}

export {MathUtil};
