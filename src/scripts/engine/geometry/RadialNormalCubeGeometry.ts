import { Geometry } from "../Geometry";

type AcceptableAttributeKeys = 'position' | 'normal';

class RadialNormalCubeGeometry {

  static create(
    side: number,
    attributeKeys: AcceptableAttributeKeys[] = ['position']
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    const halfSide = side / 2.0;
    const reciprocalRoot3 = 1.0 / Math.sqrt(3.0);
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
          vertices.push(s1 * reciprocalRoot3, s2 * reciprocalRoot3, reciprocalRoot3);
        }
      }
    }

    // bottom
    for (const [s1, s2] of signalCombinations) {
      for (const key of attributeKeys) {
        if (key === 'position') {
          vertices.push(s1 * halfSide, s2 * halfSide, -halfSide);
        } else if (key === 'normal') {
          vertices.push(s1 * reciprocalRoot3, s2 * reciprocalRoot3, -reciprocalRoot3);
        }
      }
    }

    indices.push(
      // top
      0, 1, 2,
      1, 3, 2,
      // bottom
      6, 5, 4,
      7, 5, 6,
      // front
      1, 0, 4,
      1, 4, 5,
      // back
      2, 3, 6,
      6, 3, 7,
      // right
      0, 2, 4,
      4, 2, 6,
      // left
      3, 1, 7,
      7, 1, 5,
    );

    return new Geometry(vertices, indices, attributeKeys);
  }
}

export {RadialNormalCubeGeometry};
