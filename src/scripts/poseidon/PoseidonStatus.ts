import { LatLng } from "../model/LatLng";

class PoseidonStatus {
  readonly centerLatLng: LatLng;
  private _zoomLevel: number;

  constructor(centerLatLng: LatLng, zoomLevel: number) {
    this.centerLatLng = centerLatLng;
    this._zoomLevel = zoomLevel;
  }

  get zoomLevel(): number {
    return this._zoomLevel;
  }

  set zoomLevel(value: number) {
    this._zoomLevel = value;
  }
}

export {PoseidonStatus};
