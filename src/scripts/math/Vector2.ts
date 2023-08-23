class Vector2 {
  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
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

  static zero(): Vector2 {
    return new Vector2(0.0, 0.0);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  divide(value: number): void {
    this.x /= value;
    this.y /= value;
  }

  squaredMagnitude(): number {
    return this.x ** 2 + this.y ** 2;
  }

  magnitude(): number {
    return Math.sqrt(this.squaredMagnitude());
  }

  normalize(): void {
    const magnitude = this.magnitude();
    this.divide(magnitude);
  }

  normalizeClone(): Vector2 {
    const clone = this.clone();
    clone.normalize();
    return clone;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }
}

export {Vector2};
