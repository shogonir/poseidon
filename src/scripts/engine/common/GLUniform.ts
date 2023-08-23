class GLUniform {
  readonly location: WebGLUniformLocation;

  private constructor(location: WebGLUniformLocation) {
    this.location = location;
  }

  static create(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string
  ): GLUniform | undefined {
    const location = gl.getUniformLocation(program, name);
    if (location === null) {
      console.error('[ERROR] could not create GLUniform');
      return undefined;
    }

    return new GLUniform(location);
  }
}

export {GLUniform};
