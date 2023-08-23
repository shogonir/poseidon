import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { WaterSurfaceMaterial } from "./WaterSurfaceMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float time;

out vec3 passPosition;
out vec2 passUv;
out vec3 passNormal;

void main() {
  passPosition = (model * vec4(position, 1.0)).xyz;
  passUv = uv;
  
  float maxHeight = 0.07;
  float waveSide = 0.07;

  float s = time / 1000.0;
  float t = s - floor(s);
  vec2 diff = uv - vec2(0.5, 0.5);

  // 原点からの距離
  float d = 2.0 * sqrt(diff.x * diff.x + diff.y * diff.y);

  float pi = 3.1415926538;
  float theta = pi * (d - (t - waveSide)) / (2.0 * waveSide);
  float z = (t - waveSide < d && d < t + waveSide) ? (1.0 - t) * maxHeight * sin(theta) : 0.0;
 
  // 法線
  float flatX = -1.0 * (1.0 - t) * maxHeight * cos(theta);
  float phi = diff.x == 0.0 ? 0.5 * pi * sign(diff.y) : atan(diff.y, diff.x);
  float normX = flatX * cos(phi);
  float normY = flatX * sin(phi);
  passNormal = (t - waveSide < d && d < t + waveSide) ? normalize(vec3(normX, normY, 1.0)) : vec3(0.0, 0.0, 1.0);

  gl_Position = projection * view * model * vec4(position + vec3(0.0, 0.0, z), 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec3 passPosition;
in vec2 passUv;
in vec3 passNormal;

uniform vec3 eyePosition;
uniform samplerCube cubeTexture;

out vec4 fragmentColor;

void main() {
  vec3 toLight = normalize(vec3(-1.0, 1.0, 1.0));
  float light = clamp(1.0 * pow(dot(passNormal, toLight), 3.0), -1.0, 1.0);

  vec4 color = vec4(32.0 / 255.0, 47.0 / 255.0, 85.0 / 255.0, 1.0);

  vec3 tmp = reflect(passPosition - eyePosition, passNormal);
  vec3 ref = vec3(tmp.x, tmp.z, tmp.y);

  vec3 envColor = texture(cubeTexture, ref).xyz;

  fragmentColor = color + vec4(light) + vec4(envColor * 0.2, 0.0);
}
`;

class WaterSurfaceProgram implements Program {
  readonly gl: WebGL2RenderingContext;
  readonly glProgram: GLProgram;
  readonly glCamera: GLCamera;

  private constructor(
    gl: WebGL2RenderingContext,
    glProgram: GLProgram,
    glCamera: GLCamera
  ) {
    this.gl = gl;
    this.glProgram = glProgram;
    this.glCamera = glCamera;
  }

  static create (
    gl: WebGL2RenderingContext
  ): WaterSurfaceProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'TextureProgram');
    if (!glProgram) {
      console.error('[ERROR] WaterSurfaceProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] WaterSurfaceProgram.create() could not create GLCamera');
      return undefined;
    }

    return new WaterSurfaceProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<WaterSurfaceMaterial>): void {
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

    gl.enable(gl.DEPTH_TEST);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {WaterSurfaceProgram};
