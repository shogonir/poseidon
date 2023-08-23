import { Material } from "../../Material";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";

class MultiLineStringMaterial implements Material {
  private _zoomLevel: number;

  private glZoomLevel: GLUniformFloat1 | undefined;

  constructor(zoomLevel: number) {
    this._zoomLevel = zoomLevel;
  }

  get zoomLevel(): number {
    return this._zoomLevel;
  }

  set zoomLevel(value: number) {
    this._zoomLevel = value;
  }

  isDrawable(): boolean {
    return this.glZoomLevel !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const glZoomLevel = GLUniformFloat1.create(gl, program, 'zoomLevel', this.zoomLevel);
    if (!glZoomLevel) {
      console.error('[ERROR] MultiLineStringMaterial.prepare() could not create GLUniform');
      return;
    }

    this.glZoomLevel = glZoomLevel;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glZoomLevel) {
      return;
    }

    this.glZoomLevel.setValue(this.zoomLevel);
    this.glZoomLevel.uniform(gl);
  }
}

export {MultiLineStringMaterial};
