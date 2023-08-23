import { Vector3 } from "../../../math/Vector3";
import { Material } from "../../Material";
import { GLTextureCubeMap } from "../../common/GLTextureCubeMap";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";
import { GLUniformFloat3 } from "../../common/uniform/GLUniformFloat3";

class WaterSurfaceMaterial implements Material {
  private _time: number;
  readonly top: TexImageSource;
  readonly bottom: TexImageSource;
  readonly front: TexImageSource;
  readonly back: TexImageSource;
  readonly left: TexImageSource;
  readonly right: TexImageSource;
  readonly eyePosition: Vector3;

  private glTime: GLUniformFloat1 | undefined;
  private glTextureCubeMap: GLTextureCubeMap | undefined;
  private glEyePosition: GLUniformFloat3 | undefined;

  constructor(
    time: number,
    top: TexImageSource,
    bottom: TexImageSource,
    front: TexImageSource,
    back: TexImageSource,
    left: TexImageSource,
    right: TexImageSource,
    eyePosition: Vector3
  ) {
    this.time = time;
    this.top = top;
    this.bottom = bottom;
    this.front = front;
    this.back = back;
    this.left = left;
    this.right = right;
    this.eyePosition = eyePosition;
  }

  get time(): number {
    return this._time;
  }

  set time(value: number) {
    this._time = value;
  }

  isDrawable(): boolean {
    return this.glTime !== undefined &&
      this.glTextureCubeMap !== undefined && 
      this.glEyePosition !== undefined;
  }

  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void {
    if (this.isDrawable()) {
      return;
    }

    const glTime = GLUniformFloat1.create(gl, program, 'time', this.time);
    const {x, y, z} = this.eyePosition;
    const glEyePosition = GLUniformFloat3.create(gl, program, 'eyePosition', x, y, z);
    if (!glTime || !glEyePosition) {
      console.error('[ERROR] WaterSurfaceMaterial.prepare() could not create GLUniform');
      return;
    }

    const glTextureCubeMap = GLTextureCubeMap.create(gl, program, 'cubeTexture', 2, this.top, this.bottom, this.front, this.back, this.left, this.right);
    if (!glTextureCubeMap) {
      console.error('[ERROR] WaterSurfaceMaterial.prepare() could not create GLTextureCubeMap');
      return undefined;
    }

    this.glTime = glTime;
    this.glTextureCubeMap = glTextureCubeMap;
    this.glEyePosition = glEyePosition;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTime || !this.glTextureCubeMap || !this.glEyePosition) {
      return;
    }

    this.glTime.setValue(this.time);
    this.glTime.uniform(gl);

    this.glTextureCubeMap.bind(gl);

    this.glEyePosition.setVector3(this.eyePosition);
    this.glEyePosition.uniform(gl);
  }
}

export {WaterSurfaceMaterial};
