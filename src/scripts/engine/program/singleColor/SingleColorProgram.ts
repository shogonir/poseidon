import { mat4 } from "gl-matrix";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { Program } from "../../Program";
import { SingleColorMaterial } from "./SingleColorMaterial";
import { GLUniformMat4 } from "../../common/uniform/GLUniformMat4";
import { GLUniformFloat3 } from "../../common/uniform/GLUniformFloat3";
import { Vector3 } from "../../../math/Vector3";
import { RenderTarget } from "../../../model/RenderTarget";
import { ScenePlayer } from "../../../player/ScenePlayer";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec3 normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform mat4 inverseMatrix;
uniform vec3 lightDirection;
uniform vec3 eyeDirection;

uniform vec4 color;

out vec4 passColor;

void main() {
  vec3 invLight = normalize(inverseMatrix * vec4(lightDirection, 0.0)).xyz;
  vec3 invEye = normalize(inverseMatrix * vec4(eyeDirection, 0.0)).xyz;
  vec3 halfLE = normalize(invLight + invEye);
  float diffuse = clamp(dot(normal, invLight), 0.0, 1.0);
  float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);
  vec4 light = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);

  passColor = light;
  gl_Position = projection * view * model * vec4(position, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec4 passColor;

out vec4 fragmentColor;

void main() {
  fragmentColor = passColor;
}
`;

class SingleColorProgram implements Program {
  readonly gl: WebGL2RenderingContext;
  readonly glProgram: GLProgram;
  readonly glCamera: GLCamera;

  readonly inverseUniform: GLUniformMat4;
  readonly lightUniform: GLUniformFloat3;
  readonly eyeUniform: GLUniformFloat3;

  private inverseMatrix: mat4;
  private lightDirection: Vector3;
  private eyeDirection: Vector3;

  private constructor(
    gl: WebGL2RenderingContext,
    glProgram: GLProgram,
    glCamera: GLCamera,
    inverseUniform: GLUniformMat4,
    lightUniform: GLUniformFloat3,
    eyeUniform: GLUniformFloat3,
    inverseMatrix: mat4,
    lightDirection: Vector3,
    eyeDirection: Vector3
  ) {
    this.gl = gl;
    this.glProgram = glProgram;
    this.glCamera = glCamera;
    this.inverseUniform = inverseUniform;
    this.lightUniform = lightUniform;
    this.eyeUniform = eyeUniform;
    this.inverseMatrix = inverseMatrix;
    this.lightDirection = lightDirection;
    this.eyeDirection = eyeDirection;
  }

  static create(
    gl: WebGL2RenderingContext
  ): SingleColorProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'SingleColorProgram');
    if (!glProgram) {
      console.error('[ERROR] SingleColorProgram.create() could not create GLProgram');
      return undefined;
    }

    const program = glProgram.program;
    const glCamera = GLCamera.create(gl, program);
    if (!glCamera) {
      console.error('[ERROR] SingleColorProgram.create() could not create GLCamera');
      return undefined;
    }

    const inverseMatrix = mat4.identity(mat4.create());
    const light = new Vector3(-100, -100, 100);
    const eye = new Vector3(0, -100, 50);

    const inverseUniform = GLUniformMat4.create(gl, program, 'inverseMatrix', inverseMatrix);
    const lightUniform = GLUniformFloat3.create(gl, program, 'lightDirection', light.x, light.y, light.z);
    const eyeUniform = GLUniformFloat3.create(gl, program, 'eyeDirection', eye.x, eye.y, eye.z);
    if (!inverseUniform || !lightUniform || !eyeUniform) {
      console.error('[ERROR] SingleColorProgram.create() could not create GLUniform');
      return undefined;
    }

    return new SingleColorProgram(
      gl,
      glProgram,
      glCamera,
      inverseUniform,
      lightUniform,
      eyeUniform,
      inverseMatrix,
      light,
      eye
    );
  }

  setup(): void {
    const gl = this.gl;
    const program: WebGLProgram = this.glProgram.program;
    gl.useProgram(program);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<SingleColorMaterial>, renderTarget?: RenderTarget): void {
    const gl = this.gl;
    const program = this.glProgram.program;

    gl.useProgram(program);

    const geometry = object3D.geometry;
    if (!geometry.isDrawable()) {
      geometry.prepare(gl, program);
    }
    geometry.bind(gl);

    const transform = object3D.transform;
    if (!transform.isDrawable()) {
      transform.prepare(gl, program);
    }
    transform.update();
    transform.bind(gl);

    gl.useProgram(program);
    const material = object3D.material;
    if (!material.isDrawable()) {
      material.prepare(gl, program);
    }
    material.bind(gl);

    mat4.identity(this.inverseMatrix);
    mat4.invert(this.inverseMatrix, transform.getModelMatrix());
    this.inverseUniform.setMat4(this.inverseMatrix);
    this.inverseUniform.uniform(gl);

    this.lightUniform.setVector3(this.lightDirection);
    this.lightUniform.uniform(gl);

    this.eyeUniform.setVector3(this.eyeDirection);
    this.eyeUniform.uniform(gl);

    if (!renderTarget || renderTarget.type === 'default') {
      const clientSize = ScenePlayer.defaultRenderTarget.clientSize;
      gl.viewport(0, 0, clientSize.width, clientSize.height);
    } else if (renderTarget.type === 'framebuffer') {
      const target = renderTarget.target;
      const clientSize = renderTarget.clientSize;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, clientSize.width, clientSize.height);
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);

    if (renderTarget && renderTarget.type === 'framebuffer') {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }
}

export {SingleColorProgram};
