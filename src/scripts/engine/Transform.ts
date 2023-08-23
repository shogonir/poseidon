import { mat4 } from "gl-matrix";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { GLTransform } from "./common/GLTransform";

class Transform {
  readonly position: Vector3;
  readonly rotation: Quaternion;
  readonly scale: Vector3;

  private positionMatrix: mat4;
  private rotationMatrix: mat4;
  private scaleMatrix: mat4;
  private modelMatrix: mat4;

  private glTransform: GLTransform | undefined;

  constructor(position: Vector3, rotation: Quaternion, scale: Vector3) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.positionMatrix = mat4.create();
    this.rotationMatrix = mat4.create();
    this.scaleMatrix = mat4.create();
    this.modelMatrix = mat4.create();
  }

  static identity(): Transform {
    return new Transform(Vector3.zero(), Quaternion.identity(), Vector3.ones());
  }

  getModelMatrix(): mat4 {
    return this.modelMatrix;
  }

  update(): void {
    mat4.identity(this.positionMatrix);
    mat4.identity(this.rotationMatrix);
    mat4.identity(this.scaleMatrix);
    mat4.identity(this.modelMatrix);

    mat4.scale(this.scaleMatrix, this.scaleMatrix, this.scale.toArray());
    mat4.multiply(this.rotationMatrix, this.rotationMatrix, this.rotation.toMat4());
    mat4.translate(this.positionMatrix, this.positionMatrix, this.position.toArray());

    mat4.multiply(this.modelMatrix, this.modelMatrix, this.positionMatrix);
    mat4.multiply(this.modelMatrix, this.modelMatrix, this.rotationMatrix);
    mat4.multiply(this.modelMatrix, this.modelMatrix, this.scaleMatrix);
  }

  isDrawable(): boolean {
    return this.glTransform !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const glTransform = GLTransform.create(gl, program);
    if (!glTransform) {
      console.error('[ERROR] Transform.prepare() could not create GLTransform');
      return;
    }

    this.glTransform = glTransform;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glTransform) {
      return;
    }

    const modelUniform = this.glTransform.modelUniform;
    if (!modelUniform.equalsMat4(this.modelMatrix)) {
      modelUniform.setMat4(this.modelMatrix);
    }
    modelUniform.uniform(gl);
  }
}

export {Transform};
