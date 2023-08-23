import { GLTexture } from "./GLTexture";
import { GLUniformInt1 } from "./uniform/GLUniformInt1";

class GLFramebuffer {
  readonly framebuffer: WebGLFramebuffer;
  readonly depthRenderBuffer: WebGLRenderbuffer;
  readonly glTexture: GLTexture;
  readonly width: number;
  readonly height: number;

  private constructor(
    framebuffer: WebGLFramebuffer,
    depthRenderBuffer: WebGLRenderbuffer,
    glTexture: GLTexture,
    width: number,
    height: number
  ) {
    this.framebuffer = framebuffer;
    this.depthRenderBuffer = depthRenderBuffer;
    this.glTexture = glTexture;
    this.width = width;
    this.height = height;
  }
  
  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    targetNumber: number,
    width: number,
    height: number
  ): GLFramebuffer | undefined {
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
      console.error('[ERROR] GLFramebuffer.create() could not create WebGLFramebuffer');
      return undefined;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const depthRenderBuffer = gl.createRenderbuffer();
    if (!depthRenderBuffer) {
      console.error('[ERROR] GLFramebuffer.create() could not create WebGLRenderBuffer');
      return undefined;
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'black';
      context.fillRect(0, 0, width, height);
    }
    const glTexture = GLTexture.create(gl, program, name, targetNumber, canvas);
    if (!glTexture) {
      console.error('[ERROR] GLFramebuffer.create() could not create WebGLTexture');
      return undefined;
    }

    glTexture.bind(gl);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture.texture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return new GLFramebuffer(framebuffer, depthRenderBuffer, glTexture, width, height);
  }

  bind(gl: WebGL2RenderingContext): void {
    this.glTexture.bind(gl);
  }
}

export {GLFramebuffer};
