import { Geometry } from "./Geometry";
import { Material } from "./Material";
import { Transform } from "./Transform";

class Object3D<M extends Material> {
  readonly transform: Transform;
  readonly geometry: Geometry;
  readonly material: M;

  constructor(
    transform: Transform,
    geometry: Geometry,
    material: M
  ) {
    this.transform = transform;
    this.geometry = geometry;
    this.material = material;
  }
}

export {Object3D};
