import { Material } from "../../Material";
import { GLFramebuffer } from "../../common/GLFramebuffer";

class FramebufferMaterial implements Material {
  readonly glFramebuffer: GLFramebuffer;

  constructor(glFramebuffer: GLFramebuffer) {
    this.glFramebuffer = glFramebuffer;
  }

  isDrawable(): boolean {
    return true;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    return;
  }

  bind(gl: WebGL2RenderingContext): void {
    this.glFramebuffer.bind(gl);
  }
}

export {FramebufferMaterial};
