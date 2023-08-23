import { Material } from "../../Material";

class DelaunayContourMaterial implements Material {
  constructor() {

  }

  isDrawable(): boolean {
    return true;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }
    return;
  }

  bind(gl: WebGL2RenderingContext): void {
    return;
  }
}

export {DelaunayContourMaterial};
