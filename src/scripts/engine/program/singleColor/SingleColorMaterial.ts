import { Color } from "../../../model/Color";
import { GLUniformFloat4 } from "../../common/uniform/GLUniformFloat4";
import { Material } from "../../Material";

class SingleColorMaterial implements Material {
  readonly color: Color;

  private colorUniform: GLUniformFloat4 | undefined;

  constructor(color: Color) {
    this.color = color;
  }

  isDrawable(): boolean {
    return this.colorUniform !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const c = this.color;
    const colorUniform = GLUniformFloat4.create(gl, program, 'color', c.r, c.g, c.b, c.a);
    if (!colorUniform) {
      console.error('[ERROR] SingleColorMaterial.prepare() could not create GLUniform');
      return;
    }

    this.colorUniform = colorUniform;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.colorUniform) {
      return;
    }

    if (!this.colorUniform.equalsColor(this.color)) {
      this.colorUniform.setColor(this.color);
    }
    this.colorUniform.uniform(gl);
  }
}

export {SingleColorMaterial};
