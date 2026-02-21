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
    canvasFormat: GPUTextureFormat,
    bloomFormat: GPUTextureFormat,
  ): SpritePipeline {
    const pipeline = new SpritePipeline();
    pipeline.initialize(
      device,
      texture,
      projectionViewMatrixBuffer,
      canvasFormat,
      bloomFormat,
    );
    return pipeline;
  }

  public initialize(
    device: GPUDevice,
    texture: Texture,
    projectionViewMatrixBuffer: GPUBuffer,
    canvasFormat: GPUTextureFormat,
    bloomFormat: GPUTextureFormat,
  ): void {
    const shaderModule = device.createShaderModule({ code: shaderSource });

    const bufferLayout: GPUVertexBufferLayout = {
      arrayStride: 7 * 4, // 7 floats (x,y,u,v,r,g,b) * 4 bytes
      attributes: [
        { shaderLocation: 0, offset: 0, format: "float32x2" }, // position
        { shaderLocation: 1, offset: 2 * 4, format: "float32x2" }, // uv
        { shaderLocation: 2, offset: 4 * 4, format: "float32x3" }, // color
      ],
      stepMode: "vertex",
    };

    const blendState: GPUBlendState = {
      color: {
        srcFactor: "src-alpha",
        dstFactor: "one-minus-src-alpha",
        operation: "add",
      },
      alpha: {
        srcFactor: "one",
        dstFactor: "one-minus-src-alpha",
        operation: "add",
      },
    };

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: canvasFormat,
          blend: blendState,
        },
        {
          format: bloomFormat,
          blend: blendState,
        },
      ],
    };

    // Bind Group Layouts
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
          buffer: { type: "uniform" },
        },
      ],
    });

    // Create Bind Groups
    this.projectionViewBindGroup = device.createBindGroup({
      layout: projectionViewBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: projectionViewMatrixBuffer } },
      ],
    });

    this.textureBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: texture.sampler },
        { binding: 1, resource: texture.texture.createView() },
      ],
    });

    // Pipeline Layout and Pipeline
    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [projectionViewBindGroupLayout, bindGroupLayout],
    });

    this.pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [bufferLayout],
      },
      fragment: fragmentState,
      primitive: { topology: "triangle-list" },
    });
  }
}
