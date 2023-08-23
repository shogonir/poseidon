import { Geometry } from "../Geometry";

type AcceptableAttributeKeys = 'position' | 'uv' | 'normal' | 'wireframeUv';

class PlaneGeometry {

  static create(
    side: number,
    split: number,
    attributeKeys: AcceptableAttributeKeys[] = ['position']
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    const halfSide = side / 2.0;
    const upVector = [0, 0, 1];
    for (let yIndex = 0; yIndex <= split; yIndex++) {
      for (let xIndex = 0; xIndex <= split; xIndex++) {
        for (const key of attributeKeys) {
          if (key === 'position') {
            const x = -halfSide + side * (xIndex / split);
            const y = halfSide - side * (yIndex / split);
            vertices.push(x, y, 0.0);
          } else if (key === 'uv') {
            const u = 1.0 * xIndex / split;
            const v = 1.0 * yIndex / split;
            vertices.push(u, v);
          } else if (key === 'normal') {
            vertices.push(...upVector);
          } else if (key === 'wireframeUv') {
            const u = xIndex % 2;
            const v = yIndex % 2;
            vertices.push(u, v);
          }
        }

        if (xIndex === 0 || yIndex === 0) {
          continue;
        }
        const current = yIndex * (split + 1) + xIndex;
        const left = current - 1;
        const up = current - (split + 1);
        const upLeft = current - (split + 1) - 1;
        indices.push(
          upLeft, current, up,
          upLeft, left, current,
        );
      }
    }

    return new Geometry(vertices, indices, attributeKeys);
  }
}

export {PlaneGeometry};
