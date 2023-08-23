import { Material } from "../../Material";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";

class SeaWaveMaterial implements Material {
  private _time: number;

  private glTime: GLUniformFloat1 | undefined;

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
    return this.glTime !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }
    
    const glTime = GLUniformFloat1.create(gl, program, 'time', this.time);
    if (!glTime) {
      console.error('[ERROR] SeaWaveMaterial.prepare() could not create GLUniform');
      return;
    }

    this.glTime = glTime;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTime) {
      return;
    }

    this.glTime.setValue(this.time);
    this.glTime.uniform(gl);
  }
}

export {SeaWaveMaterial};
