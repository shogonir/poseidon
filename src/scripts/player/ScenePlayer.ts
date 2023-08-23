import { DefaultRenderTarget } from "../model/RenderTarget";
import { PoseidonContext } from "../poseidon/PoseidonContext";
import { OneTilePolygonsScene } from "../scene/OneTilePolygonsScene";
import { Scene } from "../scene/Scene";

class ScenePlayer {
  static defaultRenderTarget: DefaultRenderTarget;

  private context: PoseidonContext;
  private sceneList: Scene[];
  private sceneIndex: number;

  constructor(context: PoseidonContext) {
    console.log('scene player constructor');

    ScenePlayer.defaultRenderTarget = {
      type: 'default',
      clientSize: {
        width: context.clientSize.width,
        height: context.clientSize.height,
      },
    };

    this.context = context;
    this.sceneList = [
      new OneTilePolygonsScene(context),
    ];
    this.sceneIndex = 0;
    this.sceneList[this.sceneIndex].setup();

    let frameCount = 0;
    const updateFunction = () => {
      const width = this.context.clientSize.width;
      const height = this.context.clientSize.height;
      ScenePlayer.defaultRenderTarget.clientSize.width = width;
      ScenePlayer.defaultRenderTarget.clientSize.height = height;

      const scene = this.sceneList[this.sceneIndex];
      frameCount++;
      if (frameCount % 5 === 0) {
        scene.update(this.context);
      }
      requestAnimationFrame(updateFunction);
    }

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const index = this.sceneIndex;
      const length = this.sceneList.length;
      if (event.key === 'ArrowRight') {
        if (index === length - 1) {
          return;
        }
        this.sceneList[this.sceneIndex].teardown();
        this.sceneIndex += 1;
        this.sceneList[this.sceneIndex].setup();
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (index === 0) {
          return;
        }
        this.sceneList[this.sceneIndex].teardown();
        this.sceneIndex -= 1;
        this.sceneList[this.sceneIndex].setup();
        return;
      }
    });
    
    updateFunction();
  }
}

export {ScenePlayer};
