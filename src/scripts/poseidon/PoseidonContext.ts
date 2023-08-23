import { LatLng } from "../model/LatLng";
import { Size } from "../model/Size";
import { PoseidonStatus } from "./PoseidonStatus";

type PoseidonContextInitOptions = {
  target: string;
  centerLatLng: LatLng;
  zoomLevel: number;
};

class PoseidonContext {
  readonly baseElement: HTMLDivElement;
  readonly canvasElement: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly status: PoseidonStatus;
  readonly clientSize: Size;

  private constructor(
    baseElement: HTMLDivElement,
    canvasElement: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    status: PoseidonStatus,
    clientSize: Size
  ) {
    this.baseElement = baseElement;
    this.canvasElement = canvasElement;
    this.gl = gl;
    this.status = status;
    this.clientSize = clientSize;
  }

  static create(options: PoseidonContextInitOptions): PoseidonContext | undefined {
    const baseElement = document.querySelector(options.target) as HTMLDivElement;
    if (!baseElement) {
      console.error('[poseidon] PoseidonContext error. base element not found. target:', options.target);
      return undefined;
    }

    const clientSize = new Size(baseElement.clientWidth, baseElement.clientHeight);

    const canvasElement = document.createElement('canvas');
    canvasElement.width = clientSize.width;
    canvasElement.height = clientSize.height;
    baseElement.appendChild(canvasElement);

    const gl = canvasElement.getContext('webgl2');
    if (!gl) {
      console.error('[poseidon] PoseidonContext error. no webgl2 context. check your browser.');
      return undefined;
    }

    const status = new PoseidonStatus(options.centerLatLng, options.zoomLevel);
    const context = new PoseidonContext(baseElement, canvasElement, gl, status, clientSize);

    baseElement.onresize = context.resize.bind(context);
    window.onresize = context.resize.bind(context);

    return context;
  }

  setClientSize(width: number, height: number): void {
    console.log('[poseidon] context set client size', width, height);
    this.clientSize.setSize(width, height);
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  resize(): void {
    const width = this.baseElement.clientWidth;
    const height = this.baseElement.clientHeight;
    this.setClientSize(width, height);
  }
}

export {PoseidonContext};
