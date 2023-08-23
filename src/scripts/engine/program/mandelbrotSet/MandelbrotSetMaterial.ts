import { Vector2 } from "../../../math/Vector2";
import { Material } from "../../Material";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";
import { GLUniformFloat2 } from "../../common/uniform/GLUniformFloat2";

class MandelbrotSetMaterial implements Material {
  private _zoomRate: number;
  readonly center: Vector2;

  private zoomRateUniform: GLUniformFloat1 | undefined;
  private centerUniform: GLUniformFloat2 | undefined;

  constructor(
    zoomRate: number,
    center: Vector2
  ) {
    this.zoomRate = zoomRate;
    this.center = center;
  }

  get zoomRate(): number {
    return this._zoomRate;
  }

  set zoomRate(value: number) {
    this._zoomRate = value;
  }

  isDrawable(): boolean {
    return this.zoomRateUniform !== undefined &&
      this.centerUniform !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const c = this.center;
    const zoomRateUniform = GLUniformFloat1.create(gl, program, 'zoomRate', this.zoomRate);
    const centerUniform = GLUniformFloat2.create(gl, program, 'center', c.x, c.y);
    if (!zoomRateUniform || !centerUniform) {
      console.error('[ERROR] RayMarchingSpheresMaterial.prepare() could not create GLUniform', zoomRateUniform, centerUniform);
      return;
    }

    this.zoomRateUniform = zoomRateUniform;
    this.centerUniform = centerUniform;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.zoomRateUniform || !this.centerUniform) {
      return;
    }

    if (!this.zoomRateUniform.equalsValue(this.zoomRate)) {
      this.zoomRateUniform.setValue(this.zoomRate);
    }
    this.zoomRateUniform.uniform(gl);

    if (!this.centerUniform.equalsVector2(this.center)) {
      this.centerUniform.setVector2(this.center);
    }
    this.centerUniform.uniform(gl);
  }
}

export {MandelbrotSetMaterial};
