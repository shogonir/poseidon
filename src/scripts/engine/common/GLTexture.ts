import { GLUniform } from "./GLUniform";
import { GLUniformInt1 } from "./uniform/GLUniformInt1";

const DEFAULT_TEXTURE_PARAMETER_MAP = new Map([
  [WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR],
  [WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR],
  [WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE],
  [WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE]
]);

const Texture00 = 33984;
const Texture01 = 33985;
const Texture02 = 33986;
const Texture03 = 33987;
const Texture04 = 33988;
const Texture05 = 33989;
const Texture06 = 33990;
const Texture07 = 33991;
const Texture08 = 33992;
const Texture09 = 33993;
const Texture10 = 33994;
const Texture11 = 33995;
const Texture12 = 33996;
const Texture13 = 33997;
const Texture14 = 33998;
const Texture15 = 33999;
const Texture16 = 34000;
const Texture17 = 34001;
const Texture18 = 34002;
const Texture19 = 34003;
const Texture20 = 34004;
const Texture21 = 34005;
const Texture22 = 34006;
const Texture23 = 34007;
const Texture24 = 34008;
const Texture25 = 34009;
const Texture26 = 34010;
const Texture27 = 34011;
const Texture28 = 34012;
const Texture29 = 34013;
const Texture30 = 34014;
const Texture31 = 34015;

type TextureTarget =
  typeof Texture00 |
  typeof Texture01 |
  typeof Texture02 |
  typeof Texture03 |
  typeof Texture04 |
  typeof Texture05 |
  typeof Texture06 |
  typeof Texture07 |
  typeof Texture08 |
  typeof Texture09 |
  typeof Texture10 |
  typeof Texture11 |
  typeof Texture12 |
  typeof Texture13 |
  typeof Texture14 |
  typeof Texture15 |
  typeof Texture16 |
  typeof Texture17 |
  typeof Texture18 |
  typeof Texture19 |
  typeof Texture20 |
  typeof Texture21 |
  typeof Texture22 |
  typeof Texture23 |
  typeof Texture24 |
  typeof Texture25 |
  typeof Texture26 |
  typeof Texture27 |
  typeof Texture28 |
  typeof Texture29 |
  typeof Texture30 |
  typeof Texture31;

const numberToTarget = (targetNumber: number): TextureTarget => {
  switch (targetNumber) {
    case 1:
      return Texture01;
    case 2:
      return Texture02;
    case 3:
      return Texture03;
    case 4:
      return Texture04;
    case 5:
      return Texture05;
    case 6:
      return Texture06;
    case 7:
      return Texture07;
    case 8:
      return Texture08;
    case 9:
      return Texture09;
    case 10:
      return Texture10;
    case 11:
      return Texture11;
    case 12:
      return Texture12;
    case 13:
      return Texture13;
    case 14:
      return Texture14;
    case 15:
      return Texture15;
    case 16:
      return Texture16;
    case 17:
      return Texture17;
    case 18:
      return Texture18;
    case 19:
      return Texture19;
    case 20:
      return Texture20;
    case 21:
      return Texture21;
    case 22:
      return Texture22;
    case 23:
      return Texture23;
    case 24:
      return Texture24;
    case 25:
      return Texture25;
    case 26:
      return Texture26;
    case 27:
      return Texture27;
    case 28:
      return Texture28;
    case 29:
      return Texture29;
    case 30:
      return Texture30;
    case 31:
      return Texture31;
    default:
      return Texture00;
  }
}

class GLTexture {
  readonly texture: WebGLTexture;
  readonly target: TextureTarget;
  readonly source: TexImageSource;
  readonly textureParameterMap: Map<number, number>;
  readonly glUniform: GLUniformInt1;

  private constructor(
    texture: WebGLTexture,
    target: TextureTarget,
    source: TexImageSource,
    textureParameterMap: Map<number, number>,
    glUniform: GLUniformInt1
  ) {
    this.texture = texture;
    this.target = target;
    this.source = source;
    this.textureParameterMap = textureParameterMap;
    this.glUniform = glUniform;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
    targetNumber: number,
    source: TexImageSource,
    textureParameterMap = DEFAULT_TEXTURE_PARAMETER_MAP
  ): GLTexture | undefined {
    const texture = gl.createTexture();
    if (!texture) {
      console.error('[ERROR] GLTexture.create() could not create WebGLTexture');
      return undefined;
    }

    const target = numberToTarget(targetNumber);
    const glUniform = GLUniformInt1.create(gl, program, name, targetNumber);
    if (!glUniform) {
      console.error('[ERROR] GLTexture.create() could not create GLUniform');
      return undefined;
    }
    
    glUniform.uniform(gl);
    gl.activeTexture(target);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    for (const [key, value] of textureParameterMap.entries()) {
      gl.texParameteri(gl.TEXTURE_2D, key, value);
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    return new GLTexture(texture, target, source, textureParameterMap, glUniform);
  }

  bind(gl: WebGL2RenderingContext): void {
    this.glUniform.uniform(gl);
    gl.activeTexture(this.target);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }
}

export {GLTexture, TextureTarget, numberToTarget};
