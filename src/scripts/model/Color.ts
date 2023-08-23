import { Vector4 } from "../math/Vector4";

class Color {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static fromValues255(r: number, g: number, b: number, a: number): Color {
    return new Color(r / 255, g / 255, b / 255, a);
  }

  get r(): number {
    return this._r;
  }

  set r(value: number) {
    this._r = value;
  }

  get g(): number {
    return this._g;
  }

  set g(value: number) {
    this._g = value;
  }

  get b(): number {
    return this._b;
  }

  set b(value: number) {
    this._b = value;
  }

  get a(): number {
    return this._a;
  }

  set a(value: number) {
    this._a = value;
  }

  static clear(): Color {
    return new Color(0.0, 0.0, 0.0, 0.0);
  }

  static black(): Color {
    return new Color(0.0, 0.0, 0.0, 1.0);
  }

  static red(): Color {
    return new Color(1.0, 0.0, 0.0, 1.0);
  }

  static green(): Color {
    return new Color(0.0, 1.0, 0.0, 1.0);
  }

  static blue(): Color {
    return new Color(0.0, 0.0, 1.0, 1.0);
  }

  static yellow(): Color {
    return new Color(1.0, 1.0, 0.0, 1.0);
  }

  static cyan(): Color {
    return new Color(0.0, 1.0, 1.0, 1.0);
  }

  static magenta(): Color {
    return new Color(1.0, 0.0, 1.0, 1.0);
  }

  static white(): Color {
    return new Color(1.0, 1.0, 1.0, 1.0);
  }

  toVector4(): Vector4 {
    return new Vector4(this.r, this.g, this.b, this.a);
  }
}

export {Color};
