import { mat4 } from "gl-matrix";
import { Object3D } from "../../Object3D";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { MandelbrotSetMaterial } from "./MandelbrotSetMaterial";

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
precision highp float;

in vec2 passUv;

uniform float zoomRate;
uniform vec2 center;

out vec4 fragmentColor;

float isMandelbrot(vec2 c, int iterations) {
  vec2 z = vec2(0.0, 0.0);
  for (int index = 0; index < iterations; index++) {
    z = vec2(
      z.x * z.x - z.y * z.y + c.x,
      z.y * z.x + z.x * z.y + c.y
    );
    if (z.x * z.x + z.y * z.y > 2.0) {
      return float(index) / float(iterations);
    }
  }
  return 1.0;
}

void main() {
  float minX = center.x - (2.0 / zoomRate);
  float maxX = center.x + (2.0 / zoomRate);
  float minY = center.y - (2.0 / zoomRate);
  float maxY = center.y + (2.0 / zoomRate);
  float x = passUv.x * (maxX - minX) + minX;
  float y = passUv.y * (minY - maxY) + maxY;
  
  float ratio = isMandelbrot(vec2(x, y), 150);
  
  fragmentColor = vec4(vec3(ratio), 1.0 );
}
`;

class MandelbrotSetProgram implements Program {
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
  ): MandelbrotSetProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'RayMarchingSpheresProgram');
    if (!glProgram) {
      console.error('[ERROR] RayMarchingSpheresProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] RayMarchingSpheresProgram.create() could not create GLCamera');
      return undefined;
    }

    return new MandelbrotSetProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<MandelbrotSetMaterial>): void {
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
    gl.enable(gl.CULL_FACE);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {MandelbrotSetProgram};
