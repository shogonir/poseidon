import { Material } from "../../Material";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";

class PerlinWaveMaterial implements Material {
  private _time: number;

  private timeUniform: GLUniformFloat1 | undefined;

  constructor(time: number) {
    this.time = time;
  }

  get time(): number {
    return this._time;
  }

  set time(value: number) {
    this._time = value;
  }

  isDrawable(): boolean {
    return this.timeUniform !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const t = this.time;
    const timeUniform = GLUniformFloat1.create(gl, program, 'time', t);
    if (!timeUniform) {
      console.error('[ERROR] PerlinWaveMaterial.prepare() could not create GLUniformFloat1');
      return;
    }

    this.timeUniform = timeUniform;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.timeUniform) {
      return;
    }

    if (!this.timeUniform.equalsValue(this.time)) {
      this.timeUniform.setValue(this.time);
    }
    this.timeUniform.uniform(gl);
  }
}

export {PerlinWaveMaterial};
