import { Vector3 } from "../../../math/Vector3";
import { Material } from "../../Material";
import { GLFramebuffer } from "../../common/GLFramebuffer";
import { GLTextureCubeMap } from "../../common/GLTextureCubeMap";
import { GLUniformFloat3 } from "../../common/uniform/GLUniformFloat3";

class SeaSurfaceMaterial implements Material {
  readonly glFramebuffer: GLFramebuffer;
  readonly top: TexImageSource;
  readonly bottom: TexImageSource;
  readonly front: TexImageSource;
  readonly back: TexImageSource;
  readonly left: TexImageSource;
  readonly right: TexImageSource;
  readonly eyePosition: Vector3;

  private glTextureCubeMap: GLTextureCubeMap | undefined;
  private glEyePosition: GLUniformFloat3 | undefined;

  constructor(
    glFramebuffer: GLFramebuffer,
    top: TexImageSource,
    bottom: TexImageSource,
    front: TexImageSource,
    back: TexImageSource,
    left: TexImageSource,
    right: TexImageSource,
    eyePosition: Vector3
  ) {
    this.glFramebuffer = glFramebuffer;
    this.top = top;
    this.bottom = bottom;
    this.front = front;
    this.back = back;
    this.left = left;
    this.right = right;
    this.eyePosition = eyePosition;
  }

  isDrawable(): boolean {
    return this.glEyePosition !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }

    const glTextureCubeMap = GLTextureCubeMap.create(gl, program, 'cubeTexture', 2, this.top, this.bottom, this.front, this.back, this.left, this.right);
    if (!glTextureCubeMap) {
      console.error('[ERROR] CubeMappingMaterial.prepare() could not create GLTextureCubeMap');
      return undefined;
    }

    const {x, y, z} = this.eyePosition;
    const glEyePosition = GLUniformFloat3.create(gl, program, 'eyePosition', x, y, z);
    if (!glEyePosition) {
      console.error('[ERROR] SeaSurfaceMaterial.prepare() could not create GLUniform');
      return;
    }

    this.glTextureCubeMap = glTextureCubeMap;
    this.glEyePosition = glEyePosition;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTextureCubeMap || !this.glEyePosition) {
      return;
    }

    this.glFramebuffer.bind(gl);
    this.glTextureCubeMap.bind(gl);
    this.glEyePosition.setVector3(this.eyePosition);
    this.glEyePosition.uniform(gl);
  }
}

export {SeaSurfaceMaterial};
