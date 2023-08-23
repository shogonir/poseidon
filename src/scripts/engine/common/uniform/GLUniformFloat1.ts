import { GLUniform } from "../GLUniform";
import { GLUniformValue } from "../GLUniformValue";

class GLUniformFloat1 implements GLUniformValue {
  readonly glUniform: GLUniform;
  private _x: number;

  private constructor(
    glUniform: GLUniform,
    x: number
  ) {
    this.glUniform = glUniform;
    this.x = x;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    x: number
  ): GLUniformFloat1 | undefined {
    const glUniform = GLUniform.create(gl, program, name);
    if (!glUniform) {
      console.error('[ERROR] could not create GLUniformFloat1');
      return undefined;
    }

    return new GLUniformFloat1(glUniform, x);
  }
  
  get x(): number {
    return this._x;
  }
  set x(value: number) {
    this._x = value;
  }

  equalsValue(x: number): boolean {
    return this.x === x;
  }

  setValue(x: number): void {
    this.x = x;
  }

  uniform(gl: WebGL2RenderingContext): void {
    gl.uniform1f(this.glUniform.location, this.x);
  }
}

export {GLUniformFloat1};
