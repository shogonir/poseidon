import { ColorProgram } from "./color/ColorProgram";
import { MultiLineStringProgram } from "./multiLineString/MultiLineStringProgram";
import { PbrBaseProgram } from "./pbrBase/PbrBaseProgram";

class ProgramMap {
  private static _color: ColorProgram;
  private static _multiLineString: MultiLineStringProgram;
  private static _pbrBase: PbrBaseProgram;
  
  static get color(): ColorProgram {
    return ProgramMap._color;
  }

  static get multiLineString(): MultiLineStringProgram {
    return ProgramMap._multiLineString;
  }

  static get pbrBase(): PbrBaseProgram {
    return ProgramMap._pbrBase;
  }

  static setup(gl: WebGL2RenderingContext): boolean {
    console.log('program map setup() start');
    const startTime = performance.now();

    const color = ColorProgram.create(gl);
    const multiLineString = MultiLineStringProgram.create(gl);
    const pbrBase = PbrBaseProgram.create(gl);

    if (
      !color ||
      !multiLineString ||
      !pbrBase
    ) {
      console.error('[ERROR] ProgramMap.setup() could not create Program');
      return false;
    }

    ProgramMap._color = color;
    ProgramMap._multiLineString = multiLineString;
    ProgramMap._pbrBase = pbrBase;

    const passTime = performance.now() - startTime;
    console.log(`shader compile tooks ${Math.round(passTime)} ms`);

    return true;
  }
}

export {ProgramMap};
