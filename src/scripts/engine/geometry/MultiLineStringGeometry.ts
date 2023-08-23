import { Geometry } from "../Geometry";
import { PolylineGeometryBuilder } from "./PolylineGeometryBuilder";

const PI = Math.PI;
const PI_HALF = PI / 2.0;
const PI_QUATER = PI / 4.0;
const PI_3QUATERS = PI * 3.0 / 4.0;

const calculateDirection = (current: [number, number], next: [number, number]) => {
  const [currentX, currentY] = current;
  const [nextX, nextY] = next;
  if (currentX === nextX) {
    return  nextY > currentY ? -PI_HALF : PI_HALF;
  }
  return Math.atan2(currentY - nextY, nextX - currentX);
}

class MultiLineStringGeometry {
  static create(
    paths: [number, number][][],
    extent: number
  ): Geometry {
    const builder = new PolylineGeometryBuilder(8);

    const blue = [0.0, 0.0, 1.0, 1.0];
    for (const path of paths) {
      if (path.length === 0) {
        continue;
      }
      if (path.length === 1) {
        continue;
      }
      let previousX = 0;
      let previousY = 0;
      path.forEach((current: [number, number], pointIndex) => {
        const [currentX, currentY] = current;
        if (pointIndex === path.length - 1) {
          const direction = calculateDirection([previousX, previousY], current);
          console.log('direction', direction);
          const x = currentX / extent - 0.5;
          const y = 0.5 - currentY / extent;
          // cap tail
          builder.growLeft([x, y, 0.0, ...blue, direction + PI_HALF]);
          builder.growRight([x, y, 0.0, ...blue, direction - PI_HALF]);
          builder.growCenter([x, y, 0.0, ...blue, direction + PI]);
          builder.growLeft([x, y, 0.0, ...blue, direction + PI_QUATER]);
          builder.growRight([x, y, 0.0, ...blue, direction - PI_QUATER]);
          builder.growCenter([x, y, 0.0, ...blue, direction]);
          previousX = 0.0;
          previousY = 0.0;
          return;
        }
        const next = path[pointIndex + 1];
        const [nextX, nextY] = next;
        if (pointIndex === 0) {
          const direction = calculateDirection(current, next);
          const x = currentX / extent - 0.5;
          const y = 0.5 - currentY / extent;
          // cap head
          builder.growLeft([x, y, 0.0, ...blue, direction + PI_3QUATERS]);
          builder.growRight([x, y, 0.0, ...blue, direction - PI_3QUATERS]);
          builder.growCenter([x, y, 0.0, ...blue, direction + PI]);
          builder.growLeft([x, y, 0.0, ...blue, direction + PI_HALF]);
          builder.growRight([x, y, 0.0, ...blue, direction - PI_HALF]);
          builder.growCenter([x, y, 0.0, ...blue, direction]);
          previousX = currentX;
          previousY = currentY;
          return;
        }
      });
    }

    return builder.build(['position', 'color', 'rotation1']);
  }
}

export {MultiLineStringGeometry};
