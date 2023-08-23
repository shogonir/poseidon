class GLProgram {
  readonly vertexShader: WebGLShader;
  readonly fragmentShader: WebGLShader;
  readonly program: WebGLProgram;

  private constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader, program: WebGLProgram) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.program = program;
  }

  static create(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    name: string
  ): GLProgram | undefined {
    const vertexShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
    if (vertexShader === null) {
      console.error(`[ERROR] GLProgram.create() could not create vertex shader. name: ${name}`);
      return undefined;
    }
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const vertexShaderCompileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!vertexShaderCompileStatus) {
      const info = gl.getShaderInfoLog(vertexShader);
      console.warn(info);
      return undefined;
    }

    const fragmentShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader === null) {
      console.error(`[ERROR] GLProgram.create() could not create fragment shader. name: ${name}`);
      return undefined;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const fragmentShaderCompileStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!fragmentShaderCompileStatus) {
      const info = gl.getShaderInfoLog(fragmentShader);
      console.warn(info);
      return undefined;
    }

    const program = gl.createProgram();
    if (program === null) {
      console.error(`[ERROR] GLProgram.create() could not create program. name: ${name}`);
      return
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linkStatus) {
      const info = gl.getProgramInfoLog(program);
      console.warn(info);
      return undefined;
    }

    gl.useProgram(program);

    return new GLProgram(vertexShader, fragmentShader, program);
  }
}

export {GLProgram};
