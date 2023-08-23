import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { FallingLeavesMaterial } from "./FallingLeavesMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;
in float vertexIndex;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform mat4 rotation1;
uniform mat4 rotation2;
uniform mat4 rotation3;
uniform mat4 rotation4;
uniform float time;

out vec2 passUv;

// fixed number
float leafSize = 0.08;
float sky = 5.0;
float ground = 0.0;
float hell = -1.0;
float fallTime = 4.0;
float groundTime = 3.0;

vec2 gln_rand2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

mat4 getRotation(float index) {
  if (index <= 0.1) {
    return rotation1;
  }
  if (index <= 1.1) {
    return rotation2;
  }
  if (index <= 2.1) {
    return rotation3;
  }
  if (index <= 3.1) {
    return rotation4;
  }
  return rotation1;
}

void main() {
  passUv = uv;
  
  float leafNumberSide = 30.0;

  int leafIndex = int(floor(vertexIndex / 4.0));
  int xLeafIndex = int(floor(mod(float(leafIndex), leafNumberSide)));
  int yLeafIndex = int(floor(float(leafIndex) / leafNumberSide));
  float side = 10.0;
  
  float xOffset = side * (float(xLeafIndex) / leafNumberSide - 0.5);
  float yOffset = side * (float(yLeafIndex) / leafNumberSide - 0.5);
  
  vec2 randVec = gln_rand2(vec2(xOffset, yOffset));
  float rand = randVec.x + randVec.y;

  int localIndex = int(floor(vertexIndex)) % 4;
  float x = localIndex % 2 == 0 ? 0.0 : 1.0;
  float y = localIndex <= 1 ? 0.0 : 1.0;

  float totalTime = fallTime + groundTime;
  float quotient = floor(time / totalTime);
  float progress = mod((time - quotient * totalTime) / totalTime + rand, 1.0);
  float fallProgress = progress >= fallTime / totalTime ? 1.0 : progress * totalTime / fallTime;
  float z = sky - sky * fallProgress;

  mat4 rot1 = getRotation(floor(mod(float(leafIndex), 4.0)));
  mat4 rot2 = getRotation(floor(mod(float(leafIndex) / 4.0, 4.0)));

  float leafSide = 30.0;
  float leafX = mod(float(leafIndex), leafSide) / leafSide - 0.5;
  float leafY = mod(float(leafIndex) / leafSide, leafSide) / leafSide - 0.5;

  vec4 zure = rot2 * vec4(0.0, 0.0, 0.4, 1.0);
  
  vec3 offset = (rot1 * vec4(leafSize * uv, 0.0, 0.0)).xyz + vec3(xOffset, yOffset, z) + zure.xyz;
  gl_Position = projection * view * (model * vec4(position, 1.0) + vec4(offset, 0.0));
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 passUv;

uniform sampler2D tex;

out vec4 fragmentColor;

void main() {
  // leaf
  // vec4 color = vec4(0.0, 0.5, 0.0, 1.0);

  // sakura
  vec4 color = vec4(0.9922, 0.9333, 0.9373, 1.0);

  vec4 pixel = texture(tex, passUv);
  float value = (pixel.r + pixel.g + pixel.b) / 3.0;
  fragmentColor = texture(tex, passUv) * color;
  
  // alpha test
  if (value <= 0.1) {
    discard;
  }

  // premultiplied alpha
  fragmentColor.r /= fragmentColor.a;
  fragmentColor.g /= fragmentColor.a;
  fragmentColor.b /= fragmentColor.a;
}
`;

class FallingLeavesProgram implements Program {
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
  ): FallingLeavesProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'FallingLeavesProgram');
    if (!glProgram) {
      console.error('[ERROR] FallingLeavesProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] FallingLeavesProgram.create() could not create GLCamera');
      return undefined;
    }

    return new FallingLeavesProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<FallingLeavesMaterial>): void {
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
    gl.disable(gl.CULL_FACE);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {FallingLeavesProgram};
