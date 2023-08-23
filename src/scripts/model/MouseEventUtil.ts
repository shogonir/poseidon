import { PerspectiveCamera } from "../engine/camera/PerspectiveCamera";
import { PolarCoordinate3 } from "../math/PolarCoordinate3";
import { PoseidonStatus } from "../poseidon/PoseidonStatus";

type EventListener = (event: Event) => void;
type MouseEventListener = (event: MouseEvent) => void;

class MouseEventUtil {

  static moveCameraOnPolar(
    camera: PerspectiveCamera,
    polar: PolarCoordinate3
  ): Map<keyof DocumentEventMap, EventListener>  {
    const eventMap: Map<keyof DocumentEventMap, EventListener> = new Map();
    let isMouseDown = false;

    eventMap.set('mousedown', (event: Event) => {
      isMouseDown = true;
    });
    
    eventMap.set('mouseup', (event: Event) => {
      isMouseDown = false;
    });
    
    eventMap.set('mousemove', (event: Event) => {
      if (!isMouseDown) {
        return;
      }
      const mouseEvent = event as MouseEvent;
      polar.phi -= 0.002 * mouseEvent.movementX;
      polar.theta -= 0.002 * mouseEvent.movementY;
      camera.setPolar(polar);
    });

    return eventMap;
  }
}

export {MouseEventUtil, EventListener};
