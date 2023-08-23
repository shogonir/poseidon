import { Quaternion } from "../../../math/Quaternion";
import { Material } from "../../Material";
import { GLTexture } from "../../common/GLTexture";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";
import { GLUniformMat4 } from "../../common/uniform/GLUniformMat4";

class FallingLeavesMaterial implements Material {
  readonly image: TexImageSource;
  readonly rotation1: Quaternion;
  readonly rotation2: Quaternion;
  readonly rotation3: Quaternion;
  readonly rotation4: Quaternion;
  private _time: number;
  
  private glTexture: GLTexture | undefined;
  private glRotation1: GLUniformMat4 | undefined;
  private glRotation2: GLUniformMat4 | undefined;
  private glRotation3: GLUniformMat4 | undefined;
  private glRotation4: GLUniformMat4 | undefined;
  private glTime: GLUniformFloat1 | undefined;

  constructor(image: TexImageSource, time: number) {
    this.image = image;
    this.rotation1 = Quaternion.identity();
    this.rotation2 = Quaternion.identity();
    this.rotation3 = Quaternion.identity();
    this.rotation4 = Quaternion.identity();
    this.time = time;
  }

  get time(): number {
    return this._time;
  }

  set time(value: number) {
    this._time = value;
  }

  isDrawable(): boolean {
    return this.glTexture !== undefined &&
      this.glRotation1 !== undefined &&
      this.glRotation2 !== undefined &&
      this.glRotation3 !== undefined &&
      this.glRotation4 !== undefined &&
      this.glTime !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const glTexture = GLTexture.create(gl, program, 'tex', 0, this.image);
    if (!glTexture) {
      console.error('[ERROR] FallingLeavesMaterial.prepare() could not create GLTexture');
      return;
    }

    const glRotation1 = GLUniformMat4.create(gl, program, 'rotation1', this.rotation1.getAsMat4());
    const glRotation2 = GLUniformMat4.create(gl, program, 'rotation2', this.rotation1.getAsMat4());
    const glRotation3 = GLUniformMat4.create(gl, program, 'rotation2', this.rotation1.getAsMat4());
    const glRotation4 = GLUniformMat4.create(gl, program, 'rotation2', this.rotation1.getAsMat4());
    const glTime = GLUniformFloat1.create(gl, program, 'time', this.time);
    if (!glRotation1 || !glRotation2 || !glRotation3 || !glRotation4 || !glTime) {
      console.error('[ERROR] FallingLeavesMaterial.prepare() could not create GLUniform');
      return;
    }

    this.glTexture = glTexture;
    this.glRotation1 = glRotation1;
    this.glRotation2 = glRotation2;
    this.glRotation3 = glRotation3;
    this.glRotation4 = glRotation4;
    this.glTime = glTime;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (
      !this.glTexture ||
      !this.glRotation1 ||
      !this.glRotation2 ||
      !this.glRotation3 ||
      !this.glRotation4 ||
      !this.glTime
    ) {
      return;
    }

    this.glTexture.bind(gl);

    this.glRotation1.setMat4(this.rotation1.getAsMat4());
    this.glRotation1.uniform(gl);

    this.glRotation2.setMat4(this.rotation2.getAsMat4());
    this.glRotation2.uniform(gl);

    this.glRotation3.setMat4(this.rotation3.getAsMat4());
    this.glRotation3.uniform(gl);

    this.glRotation4.setMat4(this.rotation4.getAsMat4());
    this.glRotation4.uniform(gl);

    this.glTime.setValue(this.time);
    this.glTime.uniform(gl);
  }
}

export {FallingLeavesMaterial};
