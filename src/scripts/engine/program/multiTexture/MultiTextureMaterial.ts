import { Material } from "../../Material";
import { GLTexture } from "../../common/GLTexture";

class MultiTextureMaterial implements Material {
  readonly image1: TexImageSource;
  readonly image2: TexImageSource;

  private glTexture1: GLTexture | undefined;
  private glTexture2: GLTexture | undefined;

  constructor(image1: TexImageSource, image2: TexImageSource) {
    this.image1 = image1;
    this.image2 = image2;
  }

  isDrawable(): boolean {
    return this.glTexture1 !== undefined && this.glTexture2 !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }

    const glTexture1 = GLTexture.create(gl, program, 'tex1', 0, this.image1);
    const glTexture2 = GLTexture.create(gl, program, 'tex2', 1, this.image2);
    if (!glTexture1 || !glTexture2) {
      console.error('[ERROR] MultiTextureMaterial.prepare() could not create GLTexture');
      return;
    }

    this.glTexture1 = glTexture1;
    this.glTexture2 = glTexture2;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTexture1 || !this.glTexture2) {
      return;
    }

    this.glTexture1.bind(gl);
    this.glTexture2.bind(gl);
  }
}

export {MultiTextureMaterial};
