import shaderSource from "./shaders/shader.wgsl?raw";
import { Texture } from "./texture";

export class SpritePipeline {
  public textureBindGroup!: GPUBindGroup;
  public projectionViewBindGroup!: GPUBindGroup;
  public pipeline!: GPURenderPipeline;

  public static create(
    device: GPUDevice,
    texture: Texture,
    projectionViewMatrixBuffer: GPUBuffer,
  ): SpritePipeline {
    const pipeline = new SpritePipeline();
    pipeline.initialize(device, texture, projectionViewMatrixBuffer);
    return pipeline;
  }
  public initialize(
    device: GPUDevice,
    texture: Texture,
    projectionViewMatrixBuffer: GPUBuffer,
  ): void {
    const shaderModule = device.createShaderModule({ code: shaderSource });

    const bufferLayout: GPUVertexBufferLayout = {
      arrayStride: 7 * 4,
      attributes: [
        { shaderLocation: 0, offset: 0, format: "float32x2" },
        { shaderLocation: 1, offset: 2 * 4, format: "float32x2" },
        { shaderLocation: 2, offset: 4 * 4, format: "float32x3" },
      ],
      stepMode: "vertex",
    };

    const vertexState: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [bufferLayout],
    };

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    };

    // Texture bind group
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      ],
    });
    const projectionViewBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: "uniform",
          },
        },
      ],
    });

    this.projectionViewBindGroup = device.createBindGroup({
      layout: projectionViewBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: projectionViewMatrixBuffer,
          },
        },
      ],
    });

    this.textureBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: texture.sampler },
        { binding: 1, resource: texture.texture.createView() },
      ],
    });

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [projectionViewBindGroupLayout, bindGroupLayout],
    });

    this.pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: vertexState,
      fragment: fragmentState,
      primitive: { topology: "triangle-list" },
    });
  }
}
