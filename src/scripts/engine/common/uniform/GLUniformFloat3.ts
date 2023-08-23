import { Vector3 } from "../../../math/Vector3";
import { GLUniform } from "../GLUniform";
import { GLUniformValue } from "../GLUniformValue";

class GLUniformFloat3 implements GLUniformValue {
  readonly glUniform: GLUniform;
  private _x: number;
  private _y: number;
  private _z: number;

  private constructor(
    glUniform: GLUniform,
    x: number,
    y: number,
    z: number
  ) {
    this.glUniform = glUniform;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    x: number,
    y: number,
    z: number
  ): GLUniformFloat3 | undefined {
    const glUniform = GLUniform.create(gl, program, name);
    if (!glUniform) {
      console.error('[ERROR] could not create GLUniformFloat3');
      return undefined;
    }

    return new GLUniformFloat3(glUniform, x, y, z);
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

  uniform(gl: WebGL2RenderingContext): void {
    gl.uniform3f(this.glUniform.location, this.x, this.y, this.z);
  }

  equalsVector3(vector3: Vector3): boolean {
    return this.x === vector3.x &&
      this.y === vector3.y &&
      this.z === vector3.z;
  }

  setVector3(vector3: Vector3): void {
    this.x = vector3.x;
    this.y = vector3.y;
    this.z = vector3.z;
  }
}

export {GLUniformFloat3};
