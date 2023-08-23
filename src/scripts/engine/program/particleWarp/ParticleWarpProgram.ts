import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { ParticleWarpMaterial } from "./ParticleWarpMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float time;

out vec2 passUv;

vec2 gln_rand2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float HALF_PI = 3.1415926538 / 2.0;

float upTime = 2.0;
float downTime = 2.0;
float hideTime = 4.0;
float showTime = 4.0;
float offsetTime = 1.0;

void main() {
  passUv = uv;
  gl_PointSize = 1.0;

  vec2 randVec = gln_rand2(position.xy * 1000.0);
  float rand = randVec.x + randVec.y;

  float totalTime = upTime + downTime + hideTime + showTime;
  float localTime = time / 1000.0 + mod(rand, offsetTime);
  float modTime = mod(localTime, totalTime);

  // hide -> up -> show -> down
  float progress = (modTime < hideTime) ? 0.0 :
    (modTime < hideTime + upTime) ? sin(HALF_PI * (modTime - hideTime) / upTime) :
    (modTime < totalTime - downTime) ? 1.0 :
    cos(HALF_PI * (modTime - hideTime - upTime - showTime) / downTime);

  gl_Position = projection * view * model * vec4(position.xy * progress, progress, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 passUv;

uniform sampler2D tex;

out vec4 fragmentColor;

void main() {
  fragmentColor = texture(tex, passUv);
}
`;

class ParticleWarpProgram implements Program {
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

  static create(
    gl: WebGL2RenderingContext
  ): ParticleWarpProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'ParticleWarpProgram');
    if (!glProgram) {
      console.error('[ERROR] ParticleWarpProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] ParticleWarpProgram.create() could not create GLCamera');
      return undefined;
    }

    return new ParticleWarpProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<ParticleWarpMaterial>): void {
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

    gl.drawArrays(gl.POINTS, 0, geometry.getIndicesLength());
  }
}

export {ParticleWarpProgram};
