import { mat4 } from "gl-matrix";
import { GLUniform } from "../GLUniform";
import { GLUniformValue } from "../GLUniformValue";

class GLUniformMat4 implements GLUniformValue {
  readonly glUniform: GLUniform;
  readonly matrix: mat4;

  private constructor(
    glUniform: GLUniform,
    matrix: mat4
  ) {
    this.glUniform = glUniform;
    this.matrix = matrix;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    matrix: mat4
  ): GLUniformMat4 | undefined {
    const glUniform = GLUniform.create(gl, program, name);
    if (!glUniform) {
      console.error('[ERROR] could not create GLUniformMat4');
      return undefined;
    }

    return new GLUniformMat4(glUniform, matrix);
  }

  equalsMat4(matrix: mat4): boolean {
    for (let index = 0; index < 16; index++) {
      if (this.matrix[index] !== matrix[index]) {
        return false;
      }
    }
    return true;
  }

  setMat4(matrix: mat4): void {
    for (let index = 0; index < 16; index++) {
      this.matrix[index] = matrix[index];
    }
  }

  uniform(gl: WebGL2RenderingContext): void {
    gl.uniformMatrix4fv(this.glUniform.location, false, this.matrix);
  }
}

export {GLUniformMat4};
