import { BufferUtil } from "./buffer-util";
import { Texture } from "./texture";
import shaderSource from "./shaders/bloom-effect.wgsl?raw";
import { BloomBlurEffect } from "./bloom-blur-effect";

export class BloomEffect {
  private gpuBuffer!: GPUBuffer;
  private gpuPipeline!: GPURenderPipeline;

  public sceneTexture!: Texture;
  private sceneView!: GPUTextureView;
  private sceneTextureBindGroup!: GPUBindGroup;

  public brightnessTexture!: Texture;
  private brightnessView!: GPUTextureView;
  private brightnessTextureBindGroup!: GPUBindGroup;

  private blurEffect!: BloomBlurEffect;

  constructor(
    private device: GPUDevice,
    public width: number,
    public height: number,
  ) {}

  public async initialize() {
    this.sceneTexture = await Texture.createEmptyTexture(
      this.device,
      this.width,
      this.height,
      "bgra8unorm",
    );
    this.brightnessTexture = await Texture.createEmptyTexture(
      this.device,
      this.width,
      this.height,
      "bgra8unorm",
    );

    this.sceneView = this.sceneTexture.texture.createView();
    this.brightnessView = this.brightnessTexture.texture.createView();

    this.gpuBuffer = BufferUtil.createVertexBuffer(
      new Float32Array([
        -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0,
        -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, 1.0, 1.0,
      ]),
      this.device,
    );

    const layout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      ],
    });

    this.sceneTextureBindGroup = this.device.createBindGroup({
      layout: layout,
      entries: [
        { binding: 0, resource: this.sceneTexture.sampler },
        { binding: 1, resource: this.sceneView },
      ],
    });

    this.brightnessTextureBindGroup = this.device.createBindGroup({
      layout: layout,
      entries: [
        { binding: 0, resource: this.brightnessTexture.sampler },
        { binding: 1, resource: this.brightnessView },
      ],
    });

    const shaderModule = this.device.createShaderModule({ code: shaderSource });

    this.gpuPipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [layout, layout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" },
              {
                shaderLocation: 1,
                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                format: "float32x2",
              },
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format: "bgra8unorm" }],
      },
      primitive: { topology: "triangle-list" },
    });

    this.blurEffect = new BloomBlurEffect(this.device, this.width, this.height);
    await this.blurEffect.initialize();
  }

  public draw(
    destinationTextureView: GPUTextureView,
    commandEncoder: GPUCommandEncoder,
  ) {
    commandEncoder = this.device.createCommandEncoder();

    // 1. Record Blur commands (reuses the commandEncoder)
    // this.blurEffect.recordDraw(
    //   commandEncoder,
    //   this.brightnessView,
    //   this.brightnessTextureBindGroup,
    //   2, // iterations
    // );

    // 2. Final Bloom Composition
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: destinationTextureView,
          loadOp: "clear",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: "store",
        },
      ],
    });

    passEncoder.setPipeline(this.gpuPipeline);
    passEncoder.setVertexBuffer(0, this.gpuBuffer);
    passEncoder.setBindGroup(0, this.sceneTextureBindGroup);
    passEncoder.setBindGroup(1, this.brightnessTextureBindGroup);
    passEncoder.draw(6);
    passEncoder.end();

    // 3. Single Submit for the whole frame
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
