import { Geometry } from "../Geometry";

type AcceptableAttributeKeys = 'position' | 'normal';

class CubeGeometry {
  
  static create(
    side: number,
    attributeKeys: AcceptableAttributeKeys[] = ['position']
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    const halfSide = side / 2.0;
    const signalCombinations: [number, number][] = [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];

    // top
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(s1 * halfSide, s2 * halfSide, halfSide);
        } else if (key === 'normal') {
          vertices.push(0, 0, 1);
        }
      }
    }

    // bottom
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(s2 * halfSide, s1 * halfSide, -halfSide);
        } else if (key === 'normal') {
          vertices.push(0, 0, -1);
        }
      }
    }

    // front
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(s2 * halfSide, halfSide, s1 * halfSide);
        } else if (key === 'normal') {
          vertices.push(0, 1, 0);
        }
      }
    }

    // back
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(s1 * halfSide, -halfSide, s2 * halfSide);
        } else if (key === 'normal') {
          vertices.push(0, -1, 0);
        }
      }
    }

    // right
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(halfSide, s1 * halfSide, s2 * halfSide);
        } else if (key === 'normal') {
          vertices.push(1, 0, 0);
        }
      }
    }

    // left
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(-halfSide, s2 * halfSide, s1 * halfSide);
        } else if (key === 'normal') {
          vertices.push(-1, 0, 0);
        }
      }
    }

    for (let planeIndex = 0; planeIndex < 6; planeIndex++) {
      const vertex = planeIndex * 4;
      indices.push(vertex + 0, vertex + 1, vertex + 2);
      indices.push(vertex + 1, vertex + 3, vertex + 2);
    }

    return new Geometry(vertices, indices, attributeKeys);
  }
}

export {CubeGeometry};
