import { GLTexture } from "../../common/GLTexture";
import { Material } from "../../Material";

class TextureMaterial implements Material {
  readonly image: TexImageSource;

  private glTexture: GLTexture | undefined;
  
  constructor(image: TexImageSource) {
    this.image = image;
  }

  isDrawable(): boolean {
    return this.glTexture !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }

    const glTexture = GLTexture.create(gl, program, 'tex', 0, this.image);
    if (!glTexture) {
      console.error('[ERROR] TextureMaterial.prepare() could not create GLTexture');
      return;
    }

    this.glTexture = glTexture;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTexture) {
      return;
    }

    this.glTexture.bind(gl);
  }
}

export {TextureMaterial};
