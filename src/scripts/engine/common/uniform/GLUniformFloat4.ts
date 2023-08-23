import { Vector4 } from "../../../math/Vector4";
import { Color } from "../../../model/Color";
import { GLUniform } from "../GLUniform";
import { GLUniformValue } from "../GLUniformValue";

class GLUniformFloat4 implements GLUniformValue {
  readonly glUniform: GLUniform;
  private _x: number;
  private _y: number;
  private _z: number;
  private _w: number;

  private constructor(
    glUniform: GLUniform,
    x: number,
    y: number,
    z: number,
    w: number
  ) {
    this.glUniform = glUniform;
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number
  ): GLUniformFloat4 | undefined {
    const glUniform = GLUniform.create(gl, program, name);
    if (!glUniform) {
      console.error('[ERROR] could not create GLUniformFloat4');
      return undefined;
    }

    return new GLUniformFloat4(glUniform, x, y, z, w);
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

  uniform(gl: WebGL2RenderingContext): void {
    gl.uniform4f(this.glUniform.location, this.x, this.y, this.z, this.w);
  }

  equalsVector4(vector4: Vector4): boolean {
    return this.x === vector4.x &&
      this.y === vector4.y &&
      this.z === vector4.z &&
      this.w === vector4.w;
  }

  setVector4(vector4: Vector4): void {
    this.x = vector4.x;
    this.y = vector4.y;
    this.z = vector4.z;
    this.w = vector4.w;
  }

  equalsColor(color: Color): boolean {
    return this.x === color.r &&
      this.y === color.g &&
      this.z === color.b &&
      this.w === color.a;
  }

  setColor(color: Color): void {
    this.x = color.r;
    this.y = color.g;
    this.z = color.b;
    this.w = color.a;
  }
}

export {GLUniformFloat4};
