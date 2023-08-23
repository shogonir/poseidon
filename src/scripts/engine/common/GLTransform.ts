import { mat4 } from "gl-matrix";
import { GLUniformMat4 } from "./uniform/GLUniformMat4";

class GLTransform {
  readonly modelUniform: GLUniformMat4;

  private constructor(modelUniform: GLUniformMat4) {
    this.modelUniform = modelUniform;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): GLTransform | undefined {
    const matrix = mat4.create();
    const modelUniform = GLUniformMat4.create(gl, program, 'model', matrix);
    if (!modelUniform) {
      console.error('[ERROR] GLTransform.create() could not create GLUniformMat4');
      return undefined;
    }

    return new GLTransform(modelUniform);
  }
}

export {GLTransform};
