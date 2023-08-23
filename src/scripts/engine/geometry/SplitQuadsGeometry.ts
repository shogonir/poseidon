import { Geometry } from "../Geometry";

type AcceptableAttributeKeys = 'position' | 'uv' | 'vertexIndex';

class SplitQuadsGeometry {

  static create(
    quadNumber: number,
    attributeKeys: AcceptableAttributeKeys[] = ['position']
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let quadIndex = 0; quadIndex < quadNumber; quadIndex++) {
      for (let vertexIndex = 0; vertexIndex < 4; vertexIndex++) {
        for (const key of attributeKeys) {
          if (key === 'position') {
            vertices.push(0.0, 0.0, 0.0);
          } else if (key === 'uv') {
            vertices.push(
              vertexIndex % 2 === 0 ? 0.0 : 1.0,
              vertexIndex <= 1 ? 0.0 : 1.0,
            );
          } else if (key === 'vertexIndex') {
            vertices.push(quadIndex * 4 + vertexIndex);
          }
        }
      }

      indices.push(
        quadIndex * 4 + 0, quadIndex * 4 + 2, quadIndex * 4 + 1,
        quadIndex * 4 + 1, quadIndex * 4 + 2, quadIndex * 4 + 3,
      );
    }

    return new Geometry(vertices, indices, attributeKeys);
  }
}

export {SplitQuadsGeometry};
