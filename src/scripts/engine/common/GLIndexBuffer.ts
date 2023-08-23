class GLIndexBuffer {
  readonly buffer: WebGLBuffer;
  readonly typedArray: Uint16Array;
 
  private constructor(buffer: WebGLBuffer, typedArray: Uint16Array) {
    this.buffer = buffer;
    this.typedArray = typedArray;
  }

  static create(
    gl: WebGL2RenderingContext,
    array: number[]
  ): GLIndexBuffer | undefined {
    const buffer = gl.createBuffer();
    if (!buffer) {
      console.error('[ERROR] GLIndexBuffer.create() could not create buffer');
      return undefined;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    const typedArray = new Uint16Array(array);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);

    return new GLIndexBuffer(buffer, typedArray);
  }

  bind(gl: WebGL2RenderingContext): void {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }
}

export {GLIndexBuffer};
