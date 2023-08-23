import { RenderTarget } from "../../../model/RenderTarget";
import { ScenePlayer } from "../../../player/ScenePlayer";
import { Material } from "../../Material";
import { Object3D } from "../../Object3D";
import { Program } from "../../Program";
import { GLProgram } from "../../common/GLProgram";
import { SeaWaveMaterial } from "./SeaWaveMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;
in float vertexIndex;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float time;

out vec2 passUv;
out float quadIndex;
out float passTime;

float rand (float x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

void main() {
  passUv = uv;
  quadIndex = floor(vertexIndex / 4.0);
  passTime = time;

  // dummy calculation to use position
  gl_Position = projection * view * model * vec4(position, 1.0);

  float rt2 = 1.41421356;
  float x = rt2 * (uv.x * 2.0 - 1.0);
  float y = rt2 * (uv.y * 2.0 - 1.0);

  const float pi = 3.14159265358979323846;
  float wide = 90.0;
  float degree = mod(rand(quadIndex), wide) + wide / 2.0;
  float radian = degree * pi / 180.0;

  float xx = cos(radian) * x - sin(radian) * y;
  float yy = sin(radian) * x + cos(radian) * y;

  gl_Position = vec4(xx, yy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 passUv;
in float quadIndex;
in float passTime;

out vec4 fragmentColor;

const float pi = 3.14159265358979323846;
const float g = 9.8;
const float rc = 1.0;
const float l = 2.0 * pi * rc;
const float r = 1.0;
const float rd = r * l / (4.0 * pi);
const float t = 0.0;
const float a = l / (2.0 * pi);
const float b = r * l / (4.0 * pi);
const float c = sqrt(l * g / (2.0 * pi)) * t;

float calcFirstTheta (float x) {
  return (x - c) / a;
}

float nextTheta (float x, float theta) {
  return theta - (a * theta - b * sin(theta) + c - x) / (a - b * cos(theta));
}

float calcTheta (float x) {
  float firstTheta = calcFirstTheta(x);
  return nextTheta(x, nextTheta(x, firstTheta));
}

float calcY (float theta) {
  return rd * cos(theta);
}

void main(void) {
  float height = 1.0 / pow(2.0, quadIndex + 1.0);

  // float freq = quadIndex + 1.0;
  float x = (1.0 / height) * 4.0 * passUv.y + (passTime / 600.0);
  float theta = calcTheta(x);
  float y = height * (calcY(theta) + 0.5);

  fragmentColor = vec4(1.0, 1.0, 1.0, y);
}
`;

class SeaWaveProgram implements Program {
  readonly gl: WebGL2RenderingContext;
  readonly glProgram: GLProgram;

  private constructor(
    gl: WebGL2RenderingContext,
    glProgram: GLProgram
  ) {
    this.gl = gl;
    this.glProgram = glProgram;
  }

  static create(
    gl: WebGL2RenderingContext
  ): SeaWaveProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'PerlinWaveProgram');
    if (!glProgram) {
      console.error('[ERROR] SeaWaveProgram.create() could not create GLProgram');
      return undefined;
    }

    return new SeaWaveProgram(gl, glProgram);
  }
  
  draw(object3D: Object3D<SeaWaveMaterial>, renderTarget?: RenderTarget | undefined): void {
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

    if (!renderTarget || renderTarget.type === 'default') {
      const clientSize = ScenePlayer.defaultRenderTarget.clientSize;
      gl.viewport(0, 0, clientSize.width, clientSize.height);
    } else if (renderTarget.type === 'framebuffer') {
      const target = renderTarget.target;
      const clientSize = renderTarget.clientSize;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, clientSize.width, clientSize.height);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);

    if (renderTarget && renderTarget.type === 'framebuffer') {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }
}

export {SeaWaveProgram};
