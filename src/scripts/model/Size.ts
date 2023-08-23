import { Vector2 } from "../math/Vector2";

class Size {
  private _width: number;
  private _height: number;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width;
  }

  set width(width: number) {
    this._width = width;
  }

  get height(): number {
    return this._height;
  }

  set height(height: number) {
    this._height = height;
  }

  setSize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }

  toVector2(): Vector2 {
    return new Vector2(this._width, this._height);
  }
}

export {Size};
