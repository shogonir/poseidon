import { Vector2 } from "../../../math/Vector2";
import { GLUniform } from "../GLUniform";
import { GLUniformValue } from "../GLUniformValue";

class GLUniformFloat2 implements GLUniformValue {
  readonly glUniform: GLUniform;
  private _x: number;
  private _y: number;

  private constructor(
    glUniform: GLUniform,
    x: number,
    y: number
  ) {
    this.glUniform = glUniform;
    this.x = x;
    this.y = y;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    x: number,
    y: number
  ): GLUniformFloat2 | undefined {
    const glUniform = GLUniform.create(gl, program, name);
    if (!glUniform) {
      console.error('[ERROR] could not create GLUniformFloat2');
      return undefined;
    }

    return new GLUniformFloat2(glUniform, x, y);
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

  equalsVector2(vector2: Vector2): boolean {
    return this.x === vector2.x &&
      this.y === vector2.y;
  }

  setVector2(vector2: Vector2): void {
    this.x = vector2.x;
    this.y = vector2.y;
  }

  uniform(gl: WebGL2RenderingContext): void {
    gl.uniform2f(this.glUniform.location, this.x, this.y);
  }
}

export {GLUniformFloat2};
