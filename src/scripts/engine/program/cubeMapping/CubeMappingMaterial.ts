import { Vector3 } from "../../../math/Vector3";
import { Material } from "../../Material";
import { GLTextureCubeMap } from "../../common/GLTextureCubeMap";
import { GLUniformFloat3 } from "../../common/uniform/GLUniformFloat3";
import { GLUniformInt1 } from "../../common/uniform/GLUniformInt1";

class CubeMappingMaterial implements Material {
  readonly top: TexImageSource;
  readonly bottom: TexImageSource;
  readonly front: TexImageSource;
  readonly back: TexImageSource;
  readonly left: TexImageSource;
  readonly right: TexImageSource;
  readonly eyePosition: Vector3;
  private _isReflection: boolean;

  private glTextureCubeMap: GLTextureCubeMap | undefined;
  private glEyePosition: GLUniformFloat3 | undefined;
  private glIsReflection: GLUniformInt1 | undefined;

  constructor(
    top: TexImageSource,
    bottom: TexImageSource,
    front: TexImageSource,
    back: TexImageSource,
    left: TexImageSource,
    right: TexImageSource,
    eyePosition: Vector3,
    isReflection: boolean
  ) {
    this.top = top;
    this.bottom = bottom;
    this.front = front;
    this.back = back;
    this.left = left;
    this.right = right;
    this.eyePosition = eyePosition;
    this._isReflection = isReflection;
  }

  get isReflection(): boolean {
    return this._isReflection;
  }
  set isReflection(value: boolean) {
    this._isReflection = value;
  }


  isDrawable(): boolean {
    return this.glTextureCubeMap !== undefined &&
      this.glEyePosition !== undefined &&
      this.glIsReflection !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }

    const glTextureCubeMap = GLTextureCubeMap.create(gl, program, 'cubeTexture', 1, this.top, this.bottom, this.front, this.back, this.left, this.right);
    if (!glTextureCubeMap) {
      console.error('[ERROR] CubeMappingMaterial.prepare() could not create GLTextureCubeMap');
      return undefined;
    }

    const {x, y, z} = this.eyePosition;
    const glEyePosition = GLUniformFloat3.create(gl, program, 'eyePosition', x, y, z);
    const glIsReflection = GLUniformInt1.create(gl, program, 'reflection', this._isReflection ? 1 : 0);
    if (!glEyePosition || !glIsReflection) {
      console.error('[ERROR] CubeMappingMaterial.prepare() could not create GLUniform');
      return undefined;
    }

    this.glTextureCubeMap = glTextureCubeMap;
    this.glEyePosition = glEyePosition;
    this.glIsReflection = glIsReflection;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTextureCubeMap || !this.glEyePosition || !this.glIsReflection) {
      return;
    }

    this.glTextureCubeMap.bind(gl);
    this.glEyePosition.setVector3(this.eyePosition);
    this.glEyePosition.uniform(gl);
    this.glIsReflection.setValue(this._isReflection ? 1 : 0);
    this.glIsReflection.uniform(gl);
  }
}

export {CubeMappingMaterial};
