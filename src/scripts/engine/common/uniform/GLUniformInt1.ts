import { GLUniform } from "../GLUniform";
import { GLUniformValue } from "../GLUniformValue";

class GLUniformInt1 implements GLUniformValue {
  readonly glUniform: GLUniform;
  private _value: number;

  private constructor(
    glUniform: GLUniform,
    value: number
  ) {
    this.glUniform = glUniform;
    this.value = value;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    value: number
  ): GLUniformInt1 | undefined {
    const glUniform = GLUniform.create(gl, program, name);
    if (!glUniform) {
      console.error('[ERROR] could not create GLUniformInt1', name);
      return undefined;
    }

    return new GLUniformInt1(glUniform, value);
  }
  
  get value(): number {
    return this._value;
  }

  set value(value: number) {
    this._value = value;
  }

  equalsValue(value: number): boolean {
    return this.value === value;
  }

  setValue(value: number): void {
    this.value = value;
  }

  uniform(gl: WebGL2RenderingContext): void {
    gl.uniform1i(this.glUniform.location, this.value);
  }
}

export {GLUniformInt1};
