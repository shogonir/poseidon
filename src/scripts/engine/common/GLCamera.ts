import { mat4 } from "gl-matrix";
import { GLUniformMat4 } from "./uniform/GLUniformMat4";

class GLCamera {
  readonly viewUniform: GLUniformMat4;
  readonly projectionUniform: GLUniformMat4;

  private constructor(
    viewUniform: GLUniformMat4,
    projectionUniform: GLUniformMat4
  ) {
    this.viewUniform = viewUniform;
    this.projectionUniform = projectionUniform;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): GLCamera | undefined {
    const view = mat4.create();
    const projection = mat4.create();
    const viewUniform = GLUniformMat4.create(gl, program, 'view', view);
    const projectionUniform = GLUniformMat4.create(gl, program, 'projection', projection);
    if (!viewUniform || !projectionUniform) {
      console.error('[ERROR] GLCameraAngle.create() could not create GLUniform');
      return undefined;
    }

    return new GLCamera(viewUniform, projectionUniform);
  }

  update(
    gl: WebGL2RenderingContext,
    viewMatrix: mat4,
    projectionMatrix: mat4
  ): void {
    this.viewUniform.setMat4(viewMatrix);
    this.viewUniform.uniform(gl);
    this.projectionUniform.setMat4(projectionMatrix);
    this.projectionUniform.uniform(gl);
  }
}

export {GLCamera};
