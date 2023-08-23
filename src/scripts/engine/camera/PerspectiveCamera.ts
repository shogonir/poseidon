import { mat4 } from "gl-matrix";
import { PolarCoordinate3 } from "../../math/PolarCoordinate3";
import { Vector3 } from "../../math/Vector3";
import { Camera } from "./Camera";

class PerspectiveCamera implements Camera {
  readonly position: Vector3;
  readonly target: Vector3;
  readonly upVector: Vector3;

  private _verticalFov: number;
  private _aspect: number;
  private _near: number;
  private _far: number;

  private viewMatrix: mat4;
  private projectionMatrix: mat4;

  constructor(
    position: Vector3,
    target: Vector3,
    upVector: Vector3,
    verticalFov: number,
    aspect: number,
    near: number,
    far: number
  ) {
    this.position = position;
    this.target = target;
    this.upVector = upVector;
    this.verticalFov = verticalFov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.viewMatrix = mat4.create();
    mat4.identity(this.viewMatrix);
    this.projectionMatrix = mat4.create();
    mat4.identity(this.projectionMatrix);
  }

  static createWithPolar(
    polar: PolarCoordinate3,
    verticalFov: number,
    aspect: number,
    near: number,
    far: number
  ): PerspectiveCamera {
    const position = polar.toVector3();
    const target = Vector3.zero();
    const upVector = polar.toUpVector3();
    return new PerspectiveCamera(position, target, upVector, verticalFov, aspect, near, far);
  }

  get verticalFov(): number {
    return this._verticalFov;
  }

  set verticalFov(value: number) {
    this._verticalFov = value;
  }

  get aspect(): number {
    return this._aspect;
  }

  set aspect(value: number) {
    this._aspect = value;
  }

  get near(): number {
    return this._near;
  }

  set near(value: number) {
    this._near = value;
  }

  get far(): number {
    return this._far;
  }

  set far(value: number) {
    this._far = value;
  }

  setPolar(polar: PolarCoordinate3): void {
    const position = polar.toVector3();
    const target = Vector3.zero();
    const upVector = polar.toUpVector3();
    this.position.setValues(position.x, position.y, position.z);
    this.target.setValues(target.x, target.y, target.z);
    this.upVector.setValues(upVector.x, upVector.y, upVector.z);
  }

  updateMatrix(): void {
    mat4.identity(this.viewMatrix);
    mat4.lookAt(
      this.viewMatrix,
      this.position.toArray(),
      this.target.toArray(),
      this.upVector.toArray()
    );

    mat4.identity(this.projectionMatrix);
    mat4.perspective(
      this.projectionMatrix,
      this.verticalFov,
      this.aspect,
      this.near,
      this.far
    );
  }

  getViewMatrix(): mat4 {
    return this.viewMatrix;
  }

  getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }
}

export {PerspectiveCamera};
