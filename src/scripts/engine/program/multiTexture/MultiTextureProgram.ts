import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { RenderTarget } from "../../../model/RenderTarget";
import { Material } from "../../Material";
import { Object3D } from "../../Object3D";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec2 uv;
in float vertexIndex;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 passUv;
out float passQuadIndex;

void main() {
  passUv = uv;
  passQuadIndex = floor(vertexIndex / 4.0);
  
  float localIndex = mod(vertexIndex, 4.0);
  float x = -0.5 + mod(localIndex, 2.0) - 0.5 + passQuadIndex * 1.2;
  float y = 0.5 - floor(localIndex / 2.0);

  gl_Position = projection * view * model * vec4(position + vec3(x, y, 0.0), 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 passUv;
in float passQuadIndex;

uniform sampler2D tex1;
uniform sampler2D tex2;

out vec4 fragmentColor;

void main() {
  if (passQuadIndex < 0.5) {
    fragmentColor = texture(tex1, passUv);
  } else {
    fragmentColor = texture(tex2, passUv);
  }
}

`;

class MultiTextureProgram implements Program {
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
  ): MultiTextureProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'ParticleWarpProgram');
    if (!glProgram) {
      console.error('[ERROR] MultiTextureProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] MultiTextureProgram.create() could not create GLCamera');
      return undefined;
    }

    return new MultiTextureProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<Material>, renderTarget?: RenderTarget | undefined): void {
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

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {MultiTextureProgram};
