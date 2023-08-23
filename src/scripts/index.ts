import { LatLng } from "./model/LatLng";
import { PoseidonMap } from "./poseidon/PoseidonMap";

console.log('index.ts');

const map = new PoseidonMap({
  target: '#map',
  centerLatLng: new LatLng(35.680959106959, 139.76730676352),
  zoomLevel: 16,
});
