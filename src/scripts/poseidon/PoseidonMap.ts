import earcut from "earcut";
import { Tile } from "../proto/tile_pb";
import { PoseidonContext } from "./PoseidonContext";
import { Geometry } from "../engine/Geometry";
import { ScenePlayer } from "../player/ScenePlayer";
import { ProgramMap } from "../engine/program/ProgramMap";
import { LatLng } from "../model/LatLng";

type PoseidonMapInitOptions = {
  target: string;
  centerLatLng: LatLng;
  zoomLevel: number;
};

class PoseidonMap {
  readonly context: PoseidonContext;
  readonly scenePlayer: ScenePlayer;

  constructor(options: PoseidonMapInitOptions) {
    const context = PoseidonContext.create({
      target: options.target,
      centerLatLng: options.centerLatLng,
      zoomLevel: options.zoomLevel,
    });
    if (!context) {
      return;
    }

    this.context = context;
    ProgramMap.setup(context.gl);
    this.scenePlayer = new ScenePlayer(context);
  }
}

export {PoseidonMap};
