import earcut from "earcut";
import { Object3D } from "../engine/Object3D";
import { Transform } from "../engine/Transform";
import { PerspectiveCamera } from "../engine/camera/PerspectiveCamera";
import { ProgramMap } from "../engine/program/ProgramMap";
import { PbrBaseMaterial } from "../engine/program/pbrBase/PbrBaseMaterial";
import { MathUtil } from "../math/MathUtil";
import { PolarCoordinate3 } from "../math/PolarCoordinate3";
import { MouseEventUtil } from "../model/MouseEventUtil";
import { PoseidonContext } from "../poseidon/PoseidonContext";
import { Tile, Tile_Value } from "../proto/tile_pb";
import { Scene } from "./Scene";
import { Geometry } from "../engine/Geometry";
import { Color } from "../model/Color";
import { SphereGeometry } from "../engine/geometry/SphereGeometry";
import { CubeGeometry } from "../engine/geometry/CubeGeometry";
import { ColorMaterial } from "../engine/program/color/ColorMaterial";
import { MAX_ZOOM_LEVEL, TileNumber, latLngToWorld } from "../model/TileNumber";
import { Vector3 } from "../math/Vector3";
import { MultiLineStringMaterial } from "../engine/program/multiLineString/MultiLineStringMaterial";
import { MultiLineStringGeometry } from "../engine/geometry/MultiLineStringGeometry";
import { makeGenericClientConstructor } from "@grpc/grpc-js";

const PI_HALF = Math.PI / 2.0;

const host = 'https://api.mapbox.com';
const path = '/v4/mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2,mapbox.mapbox-bathymetry-v2/';
const extension = '.vector.pbf';
const query = '?sku=101eX64XXSl5h&access_token=';

type TileProperties = Map<string, Tile_Value>;

const allTypes: Set<string> = new Set();

type FeatureCategory = {
  name: string;
  zIndex: number;
  color: Color;
  height?: number;
};

const propertiesToType = (properties: TileProperties): string | undefined => {
  const featureType = properties.get('type');
  if (!featureType) {
    return undefined;
  }
  return featureType.stringValue;
};

const propertiesToCategory = (properties: TileProperties): FeatureCategory | undefined => {
  const featureType = propertiesToType(properties);
  if (!featureType) {
    return undefined;
  }

  const alpha = 0.8;
  const height = properties.get('height');
  switch(featureType) {
    case 'background':
    case 'land':
      return {
        name: '',
        zIndex: 5,
        color: Color.fromValues255(254, 250, 236, alpha),
      };
    case 'water':
    case 'river':
      console.log('water or river', featureType);
      return {
        name: '',
        zIndex: 100,
        color: Color.fromValues255(156, 192, 249, alpha),
      };
    case 'park':
      return {
        name: '',
        zIndex: 20,
        color: Color.fromValues255(172, 220, 185, alpha),
      };
    case 'wood':
      return {
        name: '',
        zIndex: 30,
        color: Color.fromValues255(178, 207, 189, alpha),
      };
    case 'garden':
    case 'natural_area':
      return {
        name: '',
        zIndex: 75,
        color: Color.fromValues255(206, 234, 214, alpha),
      };
    case 'subway':
    case 'train_station':
    case 'underground_mall':
      // station underground
      return {
        name: '',
        zIndex: 100,
        color: Color.fromValues255(219, 132, 126, alpha),
      };
    case 'facility':
      return {
        name: '',
        zIndex: 0,
        color: Color.fromValues255(248, 249, 250, alpha),
      };
    case 'commercial_area':
    case 'commercial':
    case 'civic':
    case 'landmark':
    case 'hotel':
    case 'helipad':
    case 'leisure':
      // big building
      return {
        name: '',
        zIndex: 75,
        // color: Color.fromValues255(0, 0, 0, alpha),
        color: Color.fromValues255(255, 251, 240, alpha),
        height: height?.doubleValue,
      };
    case 'school':
    case 'hospital':
    case 'building':
      // small building
      return {
        name: '',
        zIndex: 50,
        color: Color.fromValues255(241, 243, 244, alpha),
      };
    default:
      // console.log('default', featureType);
      return {
        name: '',
        zIndex: 0,
        color: new Color(0.0, 1.0, 1.0, alpha),
      };
  }
}

const tileToObjects = async (tileNumber: TileNumber, debug = false): Promise<Array<Object3D<PbrBaseMaterial>>> => {
  // const objects: Array<Object3D<ColorMaterial>> = [];
  const objects: Array<Object3D<PbrBaseMaterial>> = [];
  const url = `${host}${path}${tileNumber.z}/${tileNumber.x}/${tileNumber.y}${extension}${query}`;
  
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const tile = Tile.fromBinary(byteArray);

  // let totalVertexLength = 0;

  const allVertices: number[] = [];
  const allIndices: number[] = [];
  const vertexSize = 10;

  // floor
  const floorNormal = [0.0, 0.0, 1.0];
  const floorColor = [232 / 255, 234 / 255, 237 / 255, 1.0];
  allVertices.push(
    -0.5, +0.5, 0.0, ...floorNormal, ...floorColor,
    +0.5, +0.5, 0.0, ...floorNormal, ...floorColor,
    -0.5, -0.5, 0.0, ...floorNormal, ...floorColor,
    +0.5, -0.5, 0.0, ...floorNormal, ...floorColor,
  );
  allIndices.push(0, 2, 1, 1, 2, 3);

  const featureTypeCounter: Map<string, number> = new Map();
  let layerIndex = -1;
  for (const layer of tile.layers) {
    layerIndex++;
    const extent = layer.extent ?? 4096;
    let featureIndex = -1;
    for (const feature of layer.features) {
      featureIndex++;

      const featureType = feature.type ?? 0;
      const featureTypeName = featureType === 0 ? 'unknown' :
        featureType === 1 ? 'point' :
        featureType === 2 ? 'lineString' :
        featureType === 3 ? 'polygon' : 'unknown';
      featureTypeCounter.set(featureTypeName, (featureTypeCounter.get(featureTypeName) ?? 0) + 1);
      const properties: TileProperties = new Map();
      for (let index = 0; index < feature.tags.length; index+=2) {
        const keyIndex = feature.tags[index];
        const valueIndex = feature.tags[index + 1];
        const key = layer.keys[keyIndex];
        const value = layer.values[valueIndex];
        properties.set(key, value);
        if (debug && key === 'type' && featureTypeName === 'polygon') {
          console.log(`      [TYPE]: ${value.stringValue}`);
        }
      }

      const category = propertiesToCategory(properties);
      const height = !category ? 0.0 : (category.height ? (category.height / 500.0) : (category.zIndex / 2000.0));
      const c = category ? category.color : Color.black();
      const cs: number[] = [c.r, c.g, c.b, c.a];

      const geometryLength = feature.geometry.length;
      let geometryIndex = 0;
      let cursorX = 0;
      let cursorY = 0;
      let path: [number, number][] = [];
      const threshold = 1000 * 1000 * 1000;
      // const f = 47;
      // const fMin = 47;
      // const fMax = 47;

      const nextParameter = (): number => {
        const parameterInteger = feature.geometry[geometryIndex];
        const value = (parameterInteger >> 1) ^ (-(parameterInteger & 1));
        geometryIndex++;
        return value;
      };

      // geometry
      // if (featureIndex === f) console.log(`feature ${featureTypeName}`);
      while (geometryIndex < geometryLength) {
        const commandInteger = feature.geometry[geometryIndex];
        const commandId = commandInteger & 0x7;
        const commandName = commandId === 1 ? 'moveTo' : commandId === 2 ? 'lineTo' : 'closePath';
        const commandCount = commandInteger >> 3;
        const commandSize = commandId === 7 ? 0 : 2;
        geometryIndex++;

        if (commandCount < 0) {
          console.log('ERROR', commandCount, commandSize);
          break;
        }

        // command
        if (commandName === 'moveTo') {
          // moveTo
          for (let vertexIndex = 0; vertexIndex < commandCount; vertexIndex++) {
            const diffX = nextParameter();
            const diffY = nextParameter();
            cursorX += diffX;
            cursorY += diffY;
            path = [];
            path.push([cursorX / extent - 0.5, 0.5 - cursorY / extent]);
            // if (featureIndex === f) console.log('moved', [cursorX / extent - 0.5, 0.5 - cursorY / extent]);
          }
        } else if (commandName === 'lineTo') {
          // lineTo
          const firstX = cursorX;
          const firstY = cursorY;
          for (let vertexIndex = 0; vertexIndex < commandCount; vertexIndex++) {
            const diffX = nextParameter();
            const diffY = nextParameter();
            const rotation = diffX === 0 ? (diffY > 0 ? -PI_HALF : PI_HALF) : Math.atan2(-diffY, diffX);
            const normal = [Math.cos(rotation), Math.sin(rotation + Math.PI * 0.0), 0.0];
            // if (featureTypeName === 'polygon' && height >= 0 && geometryIndex < threshold && (featureIndex === f || (featureIndex >= fMin && featureIndex <= fMax))) {
            if (featureTypeName === 'polygon' && height > 0) {
              // wall
              const v = allVertices.length / vertexSize;
              allIndices.push(v + 2, v + 1, v, v + 3, v + 1, v + 2);
              allVertices.push(
                cursorX / extent - 0.5, 0.5 - cursorY / extent, height, ...normal, ...cs,
                cursorX / extent - 0.5, 0.5 - cursorY / extent, 0.0, ...normal, ...cs,
                (cursorX + diffX) / extent - 0.5, 0.5 - (cursorY + diffY) / extent, height, ...normal, ...cs,
                (cursorX + diffX) / extent - 0.5, 0.5 - (cursorY + diffY) / extent, 0.0, ...normal, ...cs,
              );
              if (vertexIndex === commandCount - 1) {
                const dx = firstX - (cursorX + diffX);
                const dy = firstY - (cursorY + diffY);
                const r = dx === 0 ? (dy > 0 ? -PI_HALF : PI_HALF) : Math.atan2(-dy, dx);
                const n = [Math.cos(r + Math.PI * 0.0), Math.sin(r + Math.PI * 0.0), 0.0];
                allIndices.push(v + 2 + 4, v + 1 + 4, v + 4, v + 3 + 4, v + 1 + 4, v + 2 + 4);
                // allIndices.push(v + 2, v + 1, v, v + 3, v + 1, v + 2);
                allVertices.push(
                  (cursorX + diffX) / extent - 0.5, 0.5 - (cursorY + diffY) / extent, height, ...n, ...cs,
                  (cursorX + diffX) / extent - 0.5, 0.5 - (cursorY + diffY) / extent, 0.0, ...n, ...cs,
                  firstX / extent - 0.5, 0.5 - firstY / extent, height, ...n, ...cs,
                  firstX / extent - 0.5, 0.5 - firstY / extent, 0.0, ...n, ...cs,
                );
              }
            }
            cursorX += diffX;
            cursorY += diffY;
            path.push([cursorX / extent - 0.5, 0.5 - cursorY / extent]);
            // if (featureIndex === f) console.log('lined', [cursorX / extent - 0.5, 0.5 - cursorY / extent]);
          }
        } else {
          // closePath
          if (featureTypeName === 'polygon') {
            // if (category && geometryIndex < threshold && (featureIndex === f || (featureIndex >= fMin && featureIndex <= fMax))) {
            if (category) {
              // console.log(path);
              const normal: number[] = [0.0, 0.0, 1.0];
              const color = category.color;
              const colors: number[] = [color.r, color.g, color.b, color.a];
              const vs: number[] = path.flatMap((point) => [point[0], point[1], height, ...normal, ...colors]);
              const is: number[] = earcut(vs, undefined, vertexSize);
              const vlen = allVertices.length / vertexSize;
              allVertices.push(...vs);
              allIndices.push(...is.map((i) => (i + vlen)));
            }
          }
          // if (featureIndex === f) console.log('closed');
          path = [];
        }
      }
    }
  }

  const transform = Transform.identity();
  const geometry = new Geometry(allVertices, allIndices, ['position', 'normal', 'color']);
  const material = new PbrBaseMaterial(0.0, 0.0);
  const polygon = new Object3D(transform, geometry, material);
  objects.push(polygon);

  return objects;
};

/**
 * OneTilePolygonsScene
 */
class OneTilePolygonsScene implements Scene {
  private context: PoseidonContext;
  private polar: PolarCoordinate3;
  private camera: PerspectiveCamera;

  private objectMap: Map<string, Array<Object3D<PbrBaseMaterial>>>;
  private tileMap: Map<string, TileNumber>;

  private lineObject: Object3D<MultiLineStringMaterial>;

  private requestingTiles: string[];

  constructor(context: PoseidonContext) {
    this.context = context;
    const distance = 3.0;
    this.polar = new PolarCoordinate3(-90 * MathUtil.deg2rad, 30 * MathUtil.deg2rad, distance);
    const clientSize = context.clientSize;
    const aspect = clientSize.width / clientSize.height;
    const camera = PerspectiveCamera.createWithPolar(this.polar, 90 * MathUtil.deg2rad, aspect, 0.1, distance * 2.0);
    this.camera = camera;

    this.objectMap = new Map();
    this.tileMap = new Map();

    this.requestingTiles = [];

    const transform = Transform.identity();
    const geometry = MultiLineStringGeometry.create(
      [[[1024, 1024], [3072, 3072]]],
      4096
    );
    const material = new MultiLineStringMaterial(16);
    this.lineObject = new Object3D(transform, geometry, material);
    console.log(this.lineObject);
  }

  setup(): void {
    const status = this.context.status;

    let isMouseDown: boolean = false;
    let isControlDown: boolean = false;

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        isControlDown = true;
      }
    });

    document.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        isControlDown = false;
      }
    });

    document.addEventListener('mousedown', (event: MouseEvent) => {
      isMouseDown = true;
    });

    document.addEventListener('mouseup', (event: MouseEvent) => {
      isMouseDown = false;
    });

    document.addEventListener('mousemove', (event: MouseEvent) => {
      if (!isMouseDown) {
        return;
      }
      if (isControlDown) {
        this.polar.phi -= 0.002 * event.movementX;
        this.polar.theta -= 0.002 * event.movementY;
        this.camera.setPolar(this.polar);
        // this.update(this.context);
        return;
      }
      const width = 2 ** status.zoomLevel;
      const rotation = -(this.polar.phi + PI_HALF);
      const x = event.movementX / width;
      const y = event.movementY / width;
      status.centerLatLng.lng -= Math.cos(rotation) * x - Math.sin(rotation) * y;
      status.centerLatLng.lat += Math.sin(rotation) * x + Math.cos(rotation) * y;
      // status.centerLatLng.lng -= event.movementX / width;
      // status.centerLatLng.lat += event.movementY / width;
    });

    document.addEventListener('wheel', (event: WheelEvent) => {
      const magnification = event.deltaMode === 0 ? 1.0 :
        event.deltaMode === 1 ? 20.0 : 40.0;
      status.zoomLevel -= event.deltaY * magnification * 0.001;
      // this.update(this.context);
      console.log('zoom level', status.zoomLevel);
    });
  }

  private addTiles(context: PoseidonContext): void {
    const status = context.status;
    const zoomInt = Math.floor(status.zoomLevel);
    const centerTile = TileNumber.fromLatLng(status.centerLatLng, zoomInt);
    if (!centerTile) {
      return;
    }

    const requireTiles: string[] = [];
    const buffer = 1;
    for (let diffY = -buffer; diffY <= buffer; diffY++) {
      for (let diffX = -buffer; diffX <= buffer; diffX++) {
        const tile = new TileNumber(centerTile.x + diffX, centerTile.y - diffY, zoomInt);
        const cacheKey = tile.cacheKey;
        requireTiles.push(cacheKey);
        this.tileMap.set(cacheKey, tile);
      }
    }

    // delete object
    for (const tile of this.objectMap.keys()) {
      if (requireTiles.indexOf(tile) >= 0) {
        continue;
      }
      this.objectMap.delete(tile);
      this.tileMap.delete(tile);
    }

    // add object
    for (const cacheKey of requireTiles) {
      if (this.requestingTiles.indexOf(cacheKey) >= 0) {
        continue;
      }
      if (this.objectMap.has(cacheKey)) {
        continue;
      }
      this.requestingTiles.push(cacheKey);
      const tile = this.tileMap.get(cacheKey);
      if (!tile) {
        continue;
      }
      tileToObjects(tile).then((objects: Array<Object3D<PbrBaseMaterial>>) => {
        this.objectMap.set(cacheKey, objects);
        this.tileMap.set(cacheKey, tile);
        const index = this.requestingTiles.indexOf(tile.cacheKey);
        if (index >= 0) {
          this.requestingTiles.splice(index, 1);
        }
        console.log(tile.cacheKey, objects.length);
      });
    }
  }

  updateTiles(context: PoseidonContext): void {
    const status = context.status;
    const centerPosition = latLngToWorld(status.centerLatLng);
    const zoomInt = Math.floor(status.zoomLevel);
    const zoomFraction = status.zoomLevel - zoomInt;
    const scale = 1.0 + zoomFraction;
    for (const key of this.objectMap.keys()) {
      const tile = this.tileMap.get(key);
      const objects = this.objectMap.get(key);
      if (!tile || tile.z !== zoomInt || !objects || objects.length <= 0) {
        continue;
      }

      const tilePosition = tile.getCenterWorld();
      const division = 2 ** (MAX_ZOOM_LEVEL - status.zoomLevel) * 2 ** 8;
      const x = (tilePosition.x - centerPosition.x) / division;
      const y = (tilePosition.y - centerPosition.y) / division;
      for (const object3D of objects) {
        object3D.transform.position.setValues(x, y, 0.0);
        object3D.transform.scale.setValues(scale, scale, scale);
      }
    }
  }

  update(context: PoseidonContext): void {
    const gl = context.gl;
    const colorProgram = ProgramMap.color;
    const pbrBaseProgram = ProgramMap.pbrBase;
    const multiLineProgram = ProgramMap.multiLineString;

    const gray = 0.8;
    gl.clearColor(gray, gray, gray, 1.0);
    // gl.clearColor(0 / 255, 3 / 255, 24 / 255, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const clientSize = context.clientSize;
    this.camera.aspect = clientSize.width / clientSize.height;
    this.camera.updateMatrix();
    const viewMatrix = this.camera.getViewMatrix();
    const projectionMatrix = this.camera.getProjectionMatrix();

    this.addTiles(context);
    this.updateTiles(context);

    colorProgram.updateCamera(viewMatrix, projectionMatrix);
    pbrBaseProgram.updateCamera(viewMatrix, projectionMatrix);
    multiLineProgram.updateCamera(viewMatrix, projectionMatrix);

    const zoomInt = Math.floor(context.status.zoomLevel);
    for (const key of this.objectMap.keys()) {
      const tile = this.tileMap.get(key);
      const objects = this.objectMap.get(key);
      if (!tile || tile.z !== zoomInt || !objects || objects.length <= 0) {
        continue;
      }

      for (const object3D of objects) {
        // colorProgram.draw(object3D);
        pbrBaseProgram.draw(object3D);
      }
    }

    // multiLineProgram.draw(this.lineObject);

    gl.flush();
  }

  teardown(): void {

  }
}

export {OneTilePolygonsScene};
