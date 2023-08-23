import { Geometry } from "../Geometry";

type AcceptableAttributeKeys = 'position' | 'normal' | 'uv';

class QuadGeometry {

  static create(
    side: number,
    attributeKeys: AcceptableAttributeKeys[] = ['position']
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [
      1, 2, 0,
      1, 3, 2,
    ];
    
    const halfSide = side / 2.0;
    const up = [0, 0, 1];

    // front right
    for (const key of attributeKeys) {
      if (key === 'position') {
        vertices.push(halfSide, halfSide, 0.0);
      } else if (key === 'normal') {
        vertices.push(...up);
      } else if (key === 'uv') {
        vertices.push(1.0, 0.0);
      }
    }

    // front left
    for (const key of attributeKeys) {
      if (key === 'position') {
        vertices.push(-halfSide, halfSide, 0.0);
      } else if (key === 'normal') {
        vertices.push(...up);
      } else if (key === 'uv') {
        vertices.push(0.0, 0.0);
      }
    }

    // back right
    for (const key of attributeKeys) {
      if (key === 'position') {
        vertices.push(halfSide, -halfSide, 0.0);
      } else if (key === 'normal') {
        vertices.push(...up);
      } else if (key === 'uv') {
        vertices.push(1.0, 1.0);
      }
    }

    // back left
    for (const key of attributeKeys) {
      if (key === 'position') {
        vertices.push(-halfSide, -halfSide, 0.0);
      } else if (key === 'normal') {
        vertices.push(...up);
      } else if (key === 'uv') {
        vertices.push(0.0, 1.0);
      }
    }

    return new Geometry(vertices, indices, attributeKeys);
  }
}

export {QuadGeometry};
