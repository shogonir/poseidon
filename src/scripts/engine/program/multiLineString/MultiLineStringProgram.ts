import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { MultiLineStringMaterial } from "./MultiLineStringMaterial";
import { Object3D } from "../../Object3D";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec4 color;
in float rotation1;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float zoomLevel;

out vec3 passPosition;
out vec4 passColor;

void main() {
  float offset = 0.01;
  float x = offset * cos(rotation1) - 0.0 * sin(rotation1);
  float y = offset * sin(rotation1) + 0.0 * cos(rotation1);
  passPosition = position + vec3(x, y, zoomLevel * 0.0);
  passColor = color;
  gl_Position = projection * view * model * vec4(passPosition, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec3 passPosition;
in vec4 passColor;

out vec4 fragmentColor;

void main () {
  vec3 pp = passPosition;
  if (pp.x >= 0.5 || pp.x < -0.5 || pp.y >= 0.5 || pp.y < -0.5) {
    discard;
  }
  fragmentColor = vec4(0.0, 0.0, 0.0, 1.0);
  fragmentColor = passColor;
}
`

class MultiLineStringProgram implements Program {
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
  ): MultiLineStringProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'MultiLineStringProgram');
    if (!glProgram) {
      console.error('[ERROR] MultiLineStringProgram.create() could not create GLProgram');
      return undefined;
    }

    const program = glProgram.program;
    const glCamera = GLCamera.create(gl, program);
    if (!glCamera) {
      console.error('[ERROR] MultiLineStringProgram.create() could not create GLCamera');
      return undefined;
    }

    return new MultiLineStringProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<MultiLineStringMaterial>): void {
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

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {MultiLineStringProgram};
