import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { LatLng } from "./LatLng";

const MAX_ZOOM_LEVEL = 24;
const MAX_LAT = 85.05112878;
const PI_HALF = Math.PI / 2.0;
const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;

const pixelToLatLng = (pixel: Vector2, zoomLevel: number): LatLng => {
  const width = 2 ** (zoomLevel + 8);
  const lng = 180.0 * 2 * (pixel.x / width - 0.5);

  const tilesAtZoom = 2 ** zoomLevel;
  const latHeight = -2.0 / tilesAtZoom;
  const tileY = pixel.y / 256.0;
  const normalizedY = 1.0 + tileY * latHeight;
  const lat = RAD_TO_DEG * (2.0 * Math.atan(Math.E ** (Math.PI * normalizedY)) - PI_HALF);

  return new LatLng(lat, lng);
}

const latLngToPixel = (latLng: LatLng, zoomLevel: number): Vector2 => {
  // https://www.trail-note.net/tech/coordinate/
  const width = 2 ** (zoomLevel + 8);
  const x = width / 2 * (latLng.lng / 180 + 1.0);
  const y = width / (2 * Math.PI) * (-Math.atanh(Math.sin(latLng.lat * DEG_TO_RAD)) + Math.atanh(Math.sin(MAX_LAT * DEG_TO_RAD)));
  return new Vector2(x, y);
};

const latLngToWorld = (latLng: LatLng): Vector3 => {
  const globalPixel = latLngToPixel(latLng, 24);
  const globalWidthHalf = 2 ** (MAX_ZOOM_LEVEL + 8) / 2.0;
  return new Vector3(globalPixel.x - globalWidthHalf, globalWidthHalf - globalPixel.y, 0.0);
};

class TileNumber {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly cacheKey: string;

  private centerLatLng: LatLng | undefined;
  private centerWorld: Vector3 | undefined;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.cacheKey = `tile(${x},${y},${z})`;
  }

  static fromLatLng(latLng: LatLng, zoomLevel: number): TileNumber | undefined {
    if (zoomLevel < 0) {
      return undefined;
    }
    const zoomLevelInt = Math.round(zoomLevel);
    const pixel = latLngToPixel(latLng, zoomLevelInt);
    return new TileNumber(Math.floor(pixel.x / 256), Math.floor(pixel.y / 256), zoomLevelInt);
  }

  getCenterLatLng(): LatLng {
    if (this.centerLatLng) {
      return this.centerLatLng;
    }

    const pixelX = (this.x + 0.5) * 256;
    const pixelY = (this.y + 0.5) * 256;
    this.centerLatLng = pixelToLatLng(new Vector2(pixelX, pixelY), this.z);
    return this.centerLatLng; 
  }

  getCenterWorld(): Vector3 {
    if (this.centerWorld) {
      return this.centerWorld;
    }

    const centerLatLng = this.getCenterLatLng();
    this.centerWorld = latLngToWorld(centerLatLng);
    return this.centerWorld;
  }
}

export {
  TileNumber,
  pixelToLatLng,
  latLngToPixel,
  latLngToWorld,
  MAX_ZOOM_LEVEL,
};
