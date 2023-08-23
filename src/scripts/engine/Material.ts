interface Material {
  isDrawable(): boolean;
  prepare(gl: WebGL2RenderingContext, program: WebGLProgram): void;
  bind(gl: WebGL2RenderingContext): void;
}

export {Material};
