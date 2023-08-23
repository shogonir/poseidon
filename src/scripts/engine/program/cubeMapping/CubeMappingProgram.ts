import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { CubeMappingMaterial } from "./CubeMappingMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec3 normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 passPosition;
out vec3 passNormal;

void main(void){
	passPosition = (model * vec4(position, 1.0)).xyz;
	passNormal = (model * vec4(normal, 0.0)).xyz;
  gl_Position = projection * view * model * vec4(position, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec3 eyePosition;
uniform samplerCube cubeTexture;
uniform bool reflection;

in vec3 passPosition;
in vec3 passNormal;

out vec4 fragmentColor;

void main(void){
	vec3 ref;

	if (reflection) {
		vec3 tmp = reflect(passPosition - eyePosition, passNormal);
    ref = vec3(tmp.x, tmp.z, tmp.y);
	} else {
    ref = vec3(passNormal.x, passNormal.z, passNormal.y);
	}

	vec4 envColor = texture(cubeTexture, ref);

	fragmentColor = envColor * (reflection ? 1.3 : 1.0);
  fragmentColor.a = 1.0;
}
`;

class CubeMappingProgram implements Program {
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
  ): CubeMappingProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'PerlinWaveProgram');
    if (!glProgram) {
      console.error('[ERROR] CubeMappingProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] CubeMappingProgram.create() could not create GLCamera');
      return undefined;
    }

    return new CubeMappingProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<CubeMappingMaterial>): void {
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

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {CubeMappingProgram};
