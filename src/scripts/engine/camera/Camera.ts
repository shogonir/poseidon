import { mat4 } from 'gl-matrix';

interface Camera {
  updateMatrix(): void;
  getViewMatrix(): mat4;
  getProjectionMatrix(): mat4;
}

export {Camera};
