import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { ScenePlayer } from "../../../player/ScenePlayer";
import { RenderTarget } from "../../../model/RenderTarget";
import { Object3D } from "../../Object3D";
import { SeaSurfaceMaterial } from "./SeaSurfaceMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform sampler2D tex;

out vec2 passUv;
out vec3 passNormal;
out vec3 passPosition;

void main() {
  passUv = uv;

  float epsilon = 5.12 / 512.0;
  float up = texture(tex, uv + vec2(0.0, -epsilon)).r;
  float down = texture(tex, uv + vec2(0.0, epsilon)).r;
  float left = texture(tex, uv + vec2(-epsilon, 0.0)).r;
  float right = texture(tex, uv + vec2(epsilon, 0.0)).r;
  passNormal = normalize(vec3(left - right, down - up, 0.7));

  passPosition = (model * vec4(position, 1.0)).xyz;

  vec4 pixel = texture(tex, uv);
  float brightness = (pixel.r + pixel.g + pixel.b) / 3.0;
  vec3 pos = position + vec3(0.0, 0.0, brightness * 0.2);
  gl_Position = projection * view * model * vec4(pos, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 passUv;
in vec3 passNormal;
in vec3 passPosition;

uniform vec3 eyePosition;
uniform samplerCube cubeTexture;

out vec4 fragmentColor;

void main() {
  vec3 toLight = normalize(vec3(-1.0, 1.0, 1.0));
  // vec3 toLight = normalize(vec3(0.0, 0.0, 1.0));

  vec3 reflection = reflect(passPosition - eyePosition, passNormal);
  float light = 1.0 * pow(1.3 * dot(passNormal, toLight), 5.0);
  float normLight = clamp(light, -1.0, 1.0);

  // vec4 color = vec4(32.0 / 255.0, 47.0 / 255.0, 85.0 / 255.0, 1.0);
  vec4 color = vec4(0.0 / 255.0, 100.0 / 255.0, 255.0 / 255.0, 1.0);

  vec3 tmp = reflect(passPosition - eyePosition, passNormal);
  vec3 ref = vec3(tmp.x, tmp.z, tmp.y);
  vec3 envColor = texture(cubeTexture, ref).xyz;
  // vec3 envColor = vec3(0.0, 0.0, 0.0);

  fragmentColor = color * 0.5 + vec4(normLight) + vec4(envColor, 0.0) * 0.2;
  fragmentColor.a = 1.0;
}
`;

class SeaSurfaceProgram implements Program {
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
  ): SeaSurfaceProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'SingleColorProgram');
    if (!glProgram) {
      console.error('[ERROR] SeaSurfaceProgram.create() could not create GLProgram');
      return undefined;
    }

    const program = glProgram.program;
    const glCamera = GLCamera.create(gl, program);
    if (!glCamera) {
      console.error('[ERROR] SeaSurfaceProgram.create() could not create GLCamera');
      return undefined;
    }

    return new SeaSurfaceProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<SeaSurfaceMaterial>, renderTarget?: RenderTarget): void {
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

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);

    if (renderTarget && renderTarget.type === 'framebuffer') {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }
}

export {SeaSurfaceProgram};
