import { Geometry } from "../Geometry";
import { GLAttributeParameterKey } from "../common/GLGeometry";

class PolylineGeometryBuilder {
  private vertexSize: number;
  private vertices: number[];
  private indices: number[];

  private leftIndex: number;
  private rightIndex: number;
  private centerIndex: number;
  private previousLeftIndex: number;
  private previousRightIndex: number;
  private previousCenterIndex: number;

  constructor(vertexSize: number) {
    this.vertexSize = vertexSize;
    this.vertices = [];
    this.indices = [];

    this.leftIndex = -1;
    this.rightIndex = -1;
    this.centerIndex = -1;
    this.previousLeftIndex = -1;
    this.previousRightIndex = -1;
    this.previousCenterIndex = -1;
  }

  growLeft(vertex: number[]): void {
    this.addLeftPoint(vertex);
    if (this.previousLeftIndex !== -1 && this.centerIndex !== -1) {
      this.addFace(this.leftIndex, this.previousLeftIndex, this.centerIndex);
    }
  }

  growRight(vertex: number[]): void {
    this.addRightPoint(vertex);
    if (this.previousRightIndex !== -1 && this.centerIndex !== -1) {
      this.addFace(this.centerIndex, this.previousRightIndex, this.rightIndex);
    }
  }

  growCenter(vertex: number[]): void {
    this.addCenterPoint(vertex);
    if (this.previousCenterIndex === -1) {
      return;
    }
    if (this.leftIndex !== -1) {
      this.addFace(this.leftIndex, this.previousCenterIndex, this.centerIndex);
    }
    if (this.rightIndex !== -1) {
      this.addFace(this.centerIndex, this.previousCenterIndex, this.rightIndex);
    }
  }

  enclose(): void {
    this.leftIndex = -1;
    this.rightIndex = -1;
    this.centerIndex = -1;
    this.previousLeftIndex = -1;
    this.previousRightIndex = -1;
    this.previousCenterIndex = -1;
  }

  build(attributes: Array<GLAttributeParameterKey>): Geometry {
    const geometry = new Geometry(this.vertices, this.indices, attributes);
    this.vertices = [];
    this.indices = [];
    this.enclose();
    return geometry;
  }

  private addLeftPoint(vertex: number[]): void {
    this.vertices.push(...vertex);
    this.previousLeftIndex = this.leftIndex;
    this.leftIndex = this.vertices.length / this.vertexSize - 1;
  }

  private addRightPoint(vertex: number[]): void {
    this.vertices.push(...vertex);
    this.previousRightIndex = this.rightIndex;
    this.rightIndex = this.vertices.length / this.vertexSize - 1;
  }

  private addCenterPoint(vertex: number[]): void {
    this.vertices.push(...vertex);
    this.previousCenterIndex = this.centerIndex;
    this.centerIndex = this.vertices.length / this.vertexSize - 1;
  }

  private addFace(index1: number, index2: number, index3: number): void {
    if (index1 === -1 || index2 === -1 || index3 === -1) {
      return;
    }
    this.indices.push(index1, index2, index3);
  }
}

export {PolylineGeometryBuilder};
