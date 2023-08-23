import { MathUtil } from "./MathUtil";
import { Vector3 } from "./Vector3";

class PolarCoordinate3 {
  private _phi: number;
  private _theta: number;
  private _radius: number;

  get phi(): number {
    return this._phi;
  }

  set phi(value: number) {
    this._phi = value;
  }

  get theta(): number {
    return this._theta;
  }

  set theta(value: number) {
    this._theta = MathUtil.clamp(value, 0.0, Math.PI);
  }

  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }

  constructor(phi: number, theta: number, radius: number) {
    this.phi = phi;
    this.theta = theta;
    this.radius = radius;
  }

  toVector3(): Vector3 {
    const sinTheta = Math.sin(this.theta);
    const x = this.radius * sinTheta * Math.cos(this.phi);
    const y = this.radius * sinTheta * Math.sin(this.phi);
    const z = this.radius * Math.cos(this.theta);
    return new Vector3(x, y, z);
  }

  toUpVector3(): Vector3 {
    const cosTheta = Math.cos(this.theta);
    const x = -1.0 * cosTheta * Math.cos(this.phi);
    const y = -1.0 * cosTheta * Math.sin(this.phi);
    const z = Math.sin(this.theta);
    return  new Vector3(x, y, z).normalizeClone();
  }

  toRightVector3(): Vector3 {
    return new Vector3(-Math.sin(this.phi), Math.cos(this.phi), 0);
  }
}

export {PolarCoordinate3};
