import { GLAttribute } from "./GLAttribute";
import { GLBuffer } from "./GLBuffer";
import { GLIndexBuffer } from "./GLIndexBuffer";

type GLAttributeFixedParameter = {
  normalized: boolean;
  size: number;
};

type GLAttributeParameterMapType = {
  position: GLAttributeFixedParameter;
  normal: GLAttributeFixedParameter;
  uv: GLAttributeFixedParameter;
  color: GLAttributeFixedParameter;
  vertexIndex: GLAttributeFixedParameter;
  vertexType: GLAttributeFixedParameter;
  wireframeUv: GLAttributeFixedParameter;
  scalar_00: GLAttributeFixedParameter;
  rotation1: GLAttributeFixedParameter;
};

const GLAttributeParameterMap: GLAttributeParameterMapType = {
  position: {normalized: false, size: 3},
  normal: {normalized: false, size: 3},
  uv: {normalized: false, size: 2},
  color: {normalized: false, size: 4},
  vertexIndex: {normalized: false, size: 1},
  vertexType: {normalized: false, size: 1},
  wireframeUv: {normalized: false, size: 2},
  scalar_00: {normalized: false, size: 1},
  rotation1: {normalized: false, size: 1},
};

type GLAttributeParameterKey = keyof GLAttributeParameterMapType;

class GLGeometry {
  readonly vertexBuffer: GLBuffer;
  readonly indexBuffer: GLIndexBuffer;

  private constructor(
    vertexBuffer: GLBuffer,
    indexBuffer: GLIndexBuffer
  ) {
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    vertices: number[],
    indices: number[],
    attributeKeys: GLAttributeParameterKey[] = ['position']
  ): GLGeometry | undefined {
    let offset = 0;
    const glAttributes: GLAttribute[] = [];
    for (const name of attributeKeys) {
      const fixed = GLAttributeParameterMap[name];
      const attribute = GLAttribute.create(gl, program, fixed.normalized, offset, fixed.size, name);
      if (!attribute) {
        console.error('[ERRPR] GLGeometry.create() could not create GLAttribute');
        return undefined;
      }
      glAttributes.push(attribute);
      offset += fixed.size;
    }

    const vertexBuffer = GLBuffer.create(gl, vertices, glAttributes);
    if (!vertexBuffer) {
      console.error('[ERROR] GLGeometry.create() could not create GLBuffer');
      return undefined;
    }

    const indexBuffer = GLIndexBuffer.create(gl, indices);
    if (!indexBuffer) {
      console.error('[ERROR] GLGeometry.create() could not create GLIndexBuffer');
      return undefined;
    }

    return new GLGeometry(vertexBuffer, indexBuffer);
  }

  applyVertices(
    gl: WebGL2RenderingContext,
    vertices: number[]
  ): void {
    this.vertexBuffer.applyVertices(gl, vertices);
  }

  bind(gl: WebGL2RenderingContext): void {
    this.vertexBuffer.bind(gl);
    this.indexBuffer.bind(gl);
  }
}

export {GLGeometry, GLAttributeParameterKey};
