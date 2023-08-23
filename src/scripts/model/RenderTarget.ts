import { GLFramebuffer } from "../engine/common/GLFramebuffer";

type ClientSize = {
  width: number;
  height: number;
}

type DefaultRenderTarget = {
  type: 'default';
  clientSize: ClientSize;
}

type FramebufferRenderTarget = {
  type: 'framebuffer';
  clientSize: ClientSize;
  target: GLFramebuffer;
}

type RenderTarget = DefaultRenderTarget | FramebufferRenderTarget;

export {ClientSize, DefaultRenderTarget, FramebufferRenderTarget, RenderTarget};
