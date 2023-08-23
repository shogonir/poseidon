import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { ColorMaterial } from "./ColorMaterial";
import { Object3D } from "../../Object3D";

const vertexShaderSource = `#version 300 es
in vec3 position;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform vec4 color;

out vec4 passColor;
out vec3 passPosition;

void main() {
  passColor = color;
  passPosition = position;
  gl_Position = projection * view * model * vec4(position, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec4 passColor;
in vec3 passPosition;

out vec4 fragmentColor;

void main() {
  vec3 pp = passPosition;
  if (pp.x >= 0.5 || pp.x < -0.5 || pp.y >= 0.5 || pp.y < -0.5) {
    discard;
  }
  fragmentColor = passColor;
}
`;

class ColorProgram implements Program {
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
  ): ColorProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'ColorProgram');
    if (!glProgram) {
      console.error('[ERROR] ColorProgram.create() could not create GLProgram');
      return undefined;
    }

    const program = glProgram.program;
    const glCamera = GLCamera.create(gl, program);
    if (!glCamera) {
      console.error('[ERROR] ColorProgram.create() could not create GLCamera');
      return undefined;
    }

    return new ColorProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<ColorMaterial>): void {
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

export {ColorProgram};
