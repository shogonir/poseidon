class Vector4 {
  private _x: number;
  private _y: number;
  private _z: number;
  private _w: number;

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
  }

  get z(): number {
    return this._z;
  }

  set z(value: number) {
    this._z = value;
  }

  get w(): number {
    return this._w;
  }

  set w(value: number) {
    this._w = value;
  }

  static zero(): Vector4 {
    return new Vector4(0.0, 0.0, 0.0, 0.0);
  }

  static ones(): Vector4 {
    return new Vector4(1.0, 1.0, 1.0, 1.0);
  }

  clone(): Vector4 {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0 && this.z === 0 && this.w === 0;
  }

  divide(value: number): void {
    this.x /= value;
    this.y /= value;
    this.z /= value;
    this.w /= value;
  }

  squaredMagnitude(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2;
  }

  magnitude(): number {
    return Math.sqrt(this.squaredMagnitude());
  }

  normalize(): void {
    const magnitude = this.magnitude();
    this.divide(magnitude);
  }

  normalizeClone(): Vector4 {
    const clone = this.clone();
    clone.normalize();
    return clone;
  }

  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }
}

export {Vector4};
