class Vector3 {
  private _x: number;
  private _y: number;
  private _z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
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

  set(other: Vector3): void {
    this.setValues(other.x, other.y, other.z);
  }

  setValues(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static zero(): Vector3 {
    return new Vector3(0.0, 0.0, 0.0);
  }

  static ones(): Vector3 {
    return new Vector3(1.0, 1.0, 1.0);
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  add(other: Vector3): void {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  addValues(x: number, y: number, z: number): void {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  multiply(value: number): void {
    this.x *= value;
    this.y *= value;
    this.z *= value;
  }

  divide(value: number): void {
    this.x /= value;
    this.y /= value;
    this.z /= value;
  }

  squaredMagnitude(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }

  magnitude(): number {
    return Math.sqrt(this.squaredMagnitude());
  }

  normalize(): void {
    const magnitude = this.magnitude();
    this.divide(magnitude);
  }

  normalizeClone(): Vector3 {
    const clone = this.clone();
    clone.normalize();
    return clone;
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}

export {Vector3};
