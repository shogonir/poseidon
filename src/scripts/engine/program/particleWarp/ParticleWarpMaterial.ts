import { Material } from "../../Material";
import { GLTexture } from "../../common/GLTexture";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";

class ParticleWarpMaterial implements Material {
  readonly image: TexImageSource;
  private _time: number;

  private glTexture: GLTexture | undefined;
  private glTime: GLUniformFloat1 | undefined;

  constructor(image: TexImageSource, time: number) {
    this.image = image;
    this._time = time;
  }

  get time(): number {
    return this._time;
  }

  set time(value: number) {
    this._time = value;
  }

  isDrawable(): boolean {
    return this.glTexture !== undefined && this.glTime !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }

    const glTexture = GLTexture.create(gl, program, 'tex', 0, this.image);
    if (!glTexture) {
      console.error('[ERROR] ParticleWarpMaterial.prepare() could not GLTexture');
      return;
    }

    const glTime = GLUniformFloat1.create(gl, program, 'time', this.time);
    if (!glTime) {
      console.error('[ERROR] ParticleWarpMaterial.prepare() could not create GLUniform');
      return;
    }

    this.glTexture = glTexture;
    this.glTime = glTime;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTexture || !this.glTime) {
      return;
    }

    this.glTexture.bind(gl);

    this.glTime.setValue(this.time);
    this.glTime.uniform(gl);
  }
}

export {ParticleWarpMaterial};
