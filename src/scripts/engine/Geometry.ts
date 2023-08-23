import { GLAttributeParameterKey, GLGeometry } from "./common/GLGeometry";

class Geometry {
  private vertices: number[];
  private indices: number[];
  private attributeKeys: GLAttributeParameterKey[];

  private needsApplyVertices: boolean;

  private glGeometry?: GLGeometry;

  constructor(
    vertices: number[], 
    indices: number[],
    attributeKeys: GLAttributeParameterKey[] = ['position']
  ) {
    this.vertices = vertices;
    this.indices = indices;
    this.attributeKeys = attributeKeys;

    this.needsApplyVertices = false;
  }

  getIndicesLength(): number {
    return this.indices.length;
  }

  setVertices(vertices: number[]): void {
    this.vertices = vertices;
    this.needsApplyVertices = true;
  }

  setVerticesValue(value: number, index: number): void {
    this.vertices[index] = value;
    this.needsApplyVertices = true;
  }

  isDrawable(): boolean {
    return this.glGeometry ? true : false;
  }

  prepare(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    if (this.isDrawable()) {
      return;
    }

    const glGeometry= GLGeometry.create(gl, program, this.vertices, this.indices, this.attributeKeys);
    if (!glGeometry) {
      console.error('[ERROR] Geometry.prepare() could not create GLGeometry');
      return;
    }

    this.glGeometry = glGeometry;
  }

  bind(gl: WebGL2RenderingContext): void {
    if (!this.glGeometry) {
      return;
    }

    if (this.needsApplyVertices) {
      this.glGeometry.applyVertices(gl, this.vertices);
    }
    this.glGeometry.bind(gl);
  }
}

export {Geometry};
