import { Color } from "../../../model/Color";
import { Material } from "../../Material";
import { GLUniformFloat1 } from "../../common/uniform/GLUniformFloat1";
import { GLUniformFloat3 } from "../../common/uniform/GLUniformFloat3";
import { GLUniformInt1 } from "../../common/uniform/GLUniformInt1";

class PbrBaseMaterial implements Material {
  readonly metallic: number;
  readonly roughness: number;

  private glMetallic: GLUniformFloat1 | undefined;
  private glRoughness: GLUniformFloat1 | undefined;

  private glDirectionalLightNumber: GLUniformInt1 | undefined;
  private glPointLightNumber: GLUniformInt1 | undefined;
  private glSpotLightNumber: GLUniformInt1 | undefined;

  private glDirectionalLightDirection: GLUniformFloat3 | undefined;
  private glDirectionalLightColor: GLUniformFloat3 | undefined;

  private glPointLightPosition: GLUniformFloat3 | undefined;
  private glPointLightColor: GLUniformFloat3 | undefined;
  private glPointLightDistance: GLUniformFloat1 | undefined;
  private glPointLightDecay: GLUniformFloat1 | undefined;

  private glSpotLightPosition: GLUniformFloat3 | undefined;
  private glSpotLightDirection: GLUniformFloat3 | undefined;
  private glSpotLightColor: GLUniformFloat3 | undefined;
  private glSpotLightDistance: GLUniformFloat1 | undefined;
  private glSpotLightDecay: GLUniformFloat1 | undefined;
  private glSpotLightConeCos: GLUniformFloat1 | undefined;
  private glSpotLightPenumbraCos: GLUniformFloat1 | undefined;

  constructor(
    metallic: number,
    roughness: number,
  ) {
    this.metallic = metallic;
    this.roughness = roughness;
  }

  isDrawable(): boolean {
    return this.glMetallic !== undefined ||
      this.glRoughness !== undefined ||
      this.glDirectionalLightNumber !== undefined ||
      this.glPointLightNumber !== undefined ||
      this.glSpotLightNumber !== undefined ||
      this.glDirectionalLightDirection !== undefined ||
      this.glDirectionalLightColor !== undefined ||
      this.glPointLightPosition !== undefined ||
      this.glPointLightColor !== undefined ||
      this.glPointLightDistance !== undefined ||
      this.glPointLightDecay !== undefined ||
      this.glSpotLightPosition !== undefined ||
      this.glSpotLightDirection !== undefined ||
      this.glSpotLightColor !== undefined ||
      this.glSpotLightDistance !== undefined ||
      this.glSpotLightDecay !== undefined ||
      this.glSpotLightConeCos !== undefined ||
      this.glSpotLightPenumbraCos !== undefined;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const glMetallic = GLUniformFloat1.create(gl, program, 'metallic', this.metallic);
    const glRoughness = GLUniformFloat1.create(gl, program, 'roughness', this.roughness);

    const glDirectionalLightNumber = GLUniformInt1.create(gl, program, 'numDirectionalLights', 1);
    const glPointLightNumber = GLUniformInt1.create(gl, program, 'numPointLights', 0);
    const glSpotLightNumber = GLUniformInt1.create(gl, program, 'numSpotLights', 0);

    const glDirectionalLightDirection = GLUniformFloat3.create(gl, program, 'directionalLights[0].direction', -0.3, -0.3, 1.0);
    const glDirectionalLightColor = GLUniformFloat3.create(gl, program, 'directionalLights[0].color', 1.0, 1.0, 0.97);

    const glPointLightPosition = GLUniformFloat3.create(gl, program, 'pointLights[0].position', 1.0, 1.0, 1.0);
    const glPointLightColor = GLUniformFloat3.create(gl, program, 'pointLights[0].color', 1.0, 0.0, 0.0);
    const glPointLightDistance = GLUniformFloat1.create(gl, program, 'pointLights[0].distance', 2.0);
    const glPointLightDecay = GLUniformFloat1.create(gl, program, 'pointLights[0].decay', 0.1);

    const glSpotLightPosition = GLUniformFloat3.create(gl, program, 'spotLights[0].position', -1.0, -1.0, 1.0);
    const glSpotLightDirection = GLUniformFloat3.create(gl, program, 'spotLights[0].direction', 1.0, 1.0, -1.0);
    const glSpotLightColor = GLUniformFloat3.create(gl, program, 'spotLights[0].color', 0.0, 0.0, 1.0);
    const glSpotLightDistance = GLUniformFloat1.create(gl, program, 'spotLights[0].distance', 2.0);
    const glSpotLightDecay = GLUniformFloat1.create(gl, program, 'spotLights[0].decay', 0.1);
    const glSpotLightConeCos = GLUniformFloat1.create(gl, program, 'spotLights[0].coneCos', 0.5);
    const glSpotLightPenumbraCos = GLUniformFloat1.create(gl, program, 'spotLights[0].penumbraCos', 0.5);

    if (
      glMetallic === undefined ||
      glRoughness === undefined ||
      glDirectionalLightNumber === undefined ||
      glPointLightNumber === undefined ||
      glSpotLightNumber === undefined ||
      glDirectionalLightDirection === undefined ||
      glDirectionalLightColor === undefined ||
      glPointLightPosition === undefined ||
      glPointLightColor === undefined ||
      glPointLightDistance === undefined ||
      glPointLightDecay === undefined ||
      glSpotLightPosition === undefined ||
      glSpotLightDirection === undefined ||
      glSpotLightColor === undefined ||
      glSpotLightDistance === undefined ||
      glSpotLightDecay === undefined ||
      glSpotLightConeCos === undefined ||
      glSpotLightPenumbraCos === undefined
    ) {
      console.error('[ERROR] PbrBaseMaterial.prepare() could not create GLUniform');
      return;
    }

    this.glMetallic = glMetallic;
    this.glRoughness = glRoughness;
    this.glDirectionalLightNumber = glDirectionalLightNumber;
    this.glPointLightNumber = glPointLightNumber;
    this.glSpotLightNumber = glSpotLightNumber;
    this.glDirectionalLightDirection = glDirectionalLightDirection;
    this.glDirectionalLightColor = glDirectionalLightColor;
    this.glPointLightPosition = glPointLightPosition;
    this.glPointLightColor = glPointLightColor;
    this.glPointLightDistance = glPointLightDistance;
    this.glPointLightDecay = glPointLightDecay;
    this.glSpotLightPosition = glSpotLightPosition;
    this.glSpotLightDirection = glSpotLightDirection;
    this.glSpotLightColor = glSpotLightColor;
    this.glSpotLightDistance = glSpotLightDistance;
    this.glSpotLightDecay = glSpotLightDecay;
    this.glSpotLightConeCos = glSpotLightConeCos;
    this.glSpotLightPenumbraCos = glSpotLightPenumbraCos;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (
      this.glMetallic === undefined ||
      this.glRoughness === undefined ||
      this.glDirectionalLightNumber === undefined ||
      this.glPointLightNumber === undefined ||
      this.glSpotLightNumber === undefined ||
      this.glDirectionalLightDirection === undefined ||
      this.glDirectionalLightColor === undefined ||
      this.glPointLightPosition === undefined ||
      this.glPointLightColor === undefined ||
      this.glPointLightDistance === undefined ||
      this.glPointLightDecay === undefined ||
      this.glSpotLightPosition === undefined ||
      this.glSpotLightDirection === undefined ||
      this.glSpotLightColor === undefined ||
      this.glSpotLightDistance === undefined ||
      this.glSpotLightDecay === undefined ||
      this.glSpotLightConeCos === undefined ||
      this.glSpotLightPenumbraCos === undefined
    ) {
      return;
    }

    this.glMetallic.uniform(gl);
    this.glRoughness.uniform(gl);
    this.glDirectionalLightNumber.uniform(gl);
    this.glPointLightNumber.uniform(gl);
    this.glSpotLightNumber.uniform(gl);
    this.glDirectionalLightDirection.uniform(gl);
    this.glDirectionalLightColor.uniform(gl);
    this.glPointLightPosition.uniform(gl);
    this.glPointLightColor.uniform(gl);
    this.glPointLightDistance.uniform(gl);
    this.glPointLightDecay.uniform(gl);
    this.glSpotLightPosition.uniform(gl);
    this.glSpotLightDirection.uniform(gl);
    this.glSpotLightColor.uniform(gl);
    this.glSpotLightDistance.uniform(gl);
    this.glSpotLightDecay.uniform(gl);
    this.glSpotLightConeCos.uniform(gl);
    this.glSpotLightPenumbraCos.uniform(gl);
  }
}

export {PbrBaseMaterial};
