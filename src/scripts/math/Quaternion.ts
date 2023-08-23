import { mat4 } from "gl-matrix";
import { Vector3 } from "./Vector3";

class Quaternion {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  private static temporary: Quaternion = Quaternion.identity();
  private mat: mat4;

  private constructor(a: number, b: number, c: number, d: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;

    this.mat = mat4.identity(mat4.create());
  }

  static identity(): Quaternion {
    return new Quaternion(1, 0, 0, 0);
  }

  setValues(a: number, b: number, c: number, d: number): void {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  setIdentity(): void {
    this.setValues(1, 0, 0, 0);
  }

  setRadianAndAxis(radian: number, axis: Vector3): void {
    if (axis.isZero()) {
      this.setIdentity();
    }

    const normalized = axis.normalizeClone();
    const halfRadian = radian / 2;
    const sinHalfRadian = Math.sin(halfRadian);
    this.setValues(
      Math.cos(halfRadian),
      normalized.x * sinHalfRadian,
      normalized.y * sinHalfRadian,
      normalized.z * sinHalfRadian
    );
  }

  static fromRadianAndAxis(radian: number, axis: Vector3): Quaternion {
    const quaternion = Quaternion.identity();
    quaternion.setRadianAndAxis(radian, axis);
    return quaternion;
  }

  clone(): Quaternion {
    return new Quaternion(this.a, this.b, this.c, this.d);
  }

  squaredNorm(): number {
    return this.a ** 2 + this.b ** 2 + this.c ** 2 + this.d ** 2;
  }

  norm(): number {
    return Math.sqrt(this.squaredNorm());
  }

  getAsMat4(): mat4 {
    const s = 2 / this.norm();
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    mat4.set(
      this.mat, 
      1 - s * (c**2 + d**2) , s * (b * c - a * d)   , s * (b * d + a * c)   , 0,
      s * (b * c + d * a)   , 1 - s * (b**2 + d**2) , s * (c * d - a * b)   , 0,
      s * (b * d - a * c)   , s * (c * d + a * b)   , 1 - s * (b**2 + c**2) , 0,
      0                     , 0                     , 0                     , 1
    );
    return this.mat;
  }

  toMat4(): mat4 {
    const matrix = mat4.create();
    const s = 2 / this.norm();
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    mat4.set(
      matrix, 
      1 - s * (c**2 + d**2) , s * (b * c - a * d)   , s * (b * d + a * c)   , 0,
      s * (b * c + d * a)   , 1 - s * (b**2 + d**2) , s * (c * d - a * b)   , 0,
      s * (b * d - a * c)   , s * (c * d + a * b)   , 1 - s * (b**2 + c**2) , 0,
      0                     , 0                     , 0                     , 1
    )
    return matrix
  }

  multiply(other: Quaternion): void {
    const a = this.a * other.a - this.b * other.b - this.c * other.c - this.d * other.d;
    const b = this.a * other.b + this.b * other.a + this.c * other.d - this.d * other.c;
    const c = this.a * other.c - this.b * other.d + this.c * other.a + this.d * other.b;
    const d = this.a * other.d + this.b * other.c - this.c * other.b + this.d * other.a;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  multiplyClone(other: Quaternion): Quaternion {
    const clone = this.clone();
    clone.multiply(other);
    return clone;
  }

  rotateX(radian: number): void {
    Quaternion.temporary.setIdentity();
    Quaternion.temporary.setRadianAndAxis(radian, new Vector3(1, 0, 0));
    this.multiply(Quaternion.temporary);
  }

  rotateY(radian: number): void {
    Quaternion.temporary.setIdentity();
    Quaternion.temporary.setRadianAndAxis(radian, new Vector3(0, 1, 0));
    this.multiply(Quaternion.temporary);
  }

  rotateZ(radian: number): void {
    Quaternion.temporary.setIdentity();
    Quaternion.temporary.setRadianAndAxis(radian, new Vector3(0, 0, 1));
    this.multiply(Quaternion.temporary);
  }
}

export {Quaternion};
