import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { FramebufferMaterial } from "./FramebufferMaterial";
import { RenderTarget } from "../../../model/RenderTarget";
import { ScenePlayer } from "../../../player/ScenePlayer";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 passUv;

void main() {
  passUv = uv;
  gl_Position = projection * view * model * vec4(position, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 passUv;

uniform sampler2D tex;

out vec4 fragmentColor;

void main() {
  float threshold = 0.01;
  if (
    passUv.x < threshold ||
    passUv.y < threshold ||
    passUv.x > 1.0 - threshold ||
    passUv.y > 1.0 - threshold
  ) {
    fragmentColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  fragmentColor = texture(tex, passUv);
}
`;

class FramebufferProgram implements Program {
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
  ): FramebufferProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'PerlinWaveProgram');
    if (!glProgram) {
      console.error('[ERROR] FramebufferProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] FramebufferProgram.create() could not create GLCamera');
      return undefined;
    }

    return new FramebufferProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(
    object3D: Object3D<FramebufferMaterial>,
    renderTarget?: RenderTarget
  ): void {
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
    gl.enable(gl.CULL_FACE);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);

    if (renderTarget && renderTarget.type === 'framebuffer') {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }
}

export {FramebufferProgram};
