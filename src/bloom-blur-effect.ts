import { BufferUtil } from "./buffer-util";
import { Texture } from "./texture";
import shaderSource from "./shaders/blur-effect.wgsl?raw";

export class BloomBlurEffect {
  private gpuBuffer!: GPUBuffer;
  private HorizontalPassPipeline!: GPURenderPipeline;
  private VerticalPassPipeline!: GPURenderPipeline;

  private pingPongTexture!: Texture;
  private pingPongBindGroup!: GPUBindGroup;
  private pingPongView!: GPUTextureView; // Cached view

  constructor(
    private device: GPUDevice,
    public width: number,
    public height: number,
  ) {}

  private createPipeline(
    shaderSource: string,
    textureBindGroupLayout: GPUBindGroupLayout,
    horizontal: boolean,
  ): GPURenderPipeline {
    const shaderModule = this.device.createShaderModule({ code: shaderSource });

    return this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [textureBindGroupLayout],
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
        entryPoint: horizontal
          ? "fragmentMainHorizontal"
          : "fragmentMainVertical",
        targets: [{ format: "bgra8unorm" }],
      },
      primitive: { topology: "triangle-list" },
    });
  }

  public async initialize() {
    this.pingPongTexture = await Texture.createEmptyTexture(
      this.device,
      this.width,
      this.height,
      "bgra8unorm",
    );
    this.pingPongView = this.pingPongTexture.texture.createView();

    this.gpuBuffer = BufferUtil.createVertexBuffer(
      new Float32Array([
        -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0,
        -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, 1.0, 1.0,
      ]),
      this.device,
    );

    const textureBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      ],
    });

    this.pingPongBindGroup = this.device.createBindGroup({
      layout: textureBindGroupLayout,
      entries: [
        { binding: 0, resource: this.pingPongTexture.sampler },
        { binding: 1, resource: this.pingPongView },
      ],
    });

    this.HorizontalPassPipeline = this.createPipeline(
      shaderSource,
      textureBindGroupLayout,
      true,
    );
    this.VerticalPassPipeline = this.createPipeline(
      shaderSource,
      textureBindGroupLayout,
      false,
    );
  }

  /**
   * Optimized: Records commands into the main encoder without submitting to queue
   */
  public recordDraw(
    commandEncoder: GPUCommandEncoder,
    targetTextureView: GPUTextureView,
    targetBindGroup: GPUBindGroup,
    iterations: number = 2,
  ) {
    for (let i = 0; i < iterations; i++) {
      // Pass 1: Horizontal (Target -> PingPong)
      const hPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: this.pingPongView,
            loadOp: "clear",
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: "store",
          },
        ],
      });
      hPass.setPipeline(this.HorizontalPassPipeline);
      hPass.setVertexBuffer(0, this.gpuBuffer);
      hPass.setBindGroup(0, targetBindGroup);
      hPass.draw(6);
      hPass.end();

      // Pass 2: Vertical (PingPong -> Target)
      const vPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: targetTextureView,
            loadOp: "clear",
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: "store",
          },
        ],
      });
      vPass.setPipeline(this.VerticalPassPipeline);
      vPass.setVertexBuffer(0, this.gpuBuffer);
      vPass.setBindGroup(0, this.pingPongBindGroup);
      vPass.draw(6);
      vPass.end();
    }
  }
}
