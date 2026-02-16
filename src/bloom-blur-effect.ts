import { BufferUtil } from "./buffer-util";
import { Texture } from "./texture";
import shaderSource from "./shaders/blur-effect.wgsl?raw";

export class BloomBlurEffect {
  private gpuBuffer!: GPUBuffer;

  private HorizontalPassPipeline!: GPURenderPipeline;
  private VerticalPassPipeline!: GPURenderPipeline;

  private pingPongTexture!: Texture;
  private pingPongBindGroup!: GPUBindGroup;

  private createPipeline(
    shaderSource: string,
    textureBlindGroupLayout: GPUBindGroupLayout,
    horizontal: boolean,
  ): GPURenderPipeline {
    const shaderModule = this.device.createShaderModule({ code: shaderSource });

    const desc: GPURenderPipelineDescriptor = {
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [textureBlindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
              },
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
      primitive: {
        topology: "triangle-list",
      },
    };
    return this.device.createRenderPipeline(desc);
  }

  constructor(
    private device: GPUDevice,
    public width: number,
    public height: number,
  ) {}

  public async initialize() {
    this.pingPongTexture = await Texture.createEmptyTexture(
      this.device,
      this.width,
      this.height,
      "bgra8unorm",
    );

    this.gpuBuffer = BufferUtil.createVertexBuffer(
      new Float32Array([
        // positions   // texCoords
        //top left
        -1.0, 1.0, 0.0, 0.0,
        //top right
        1.0, 1.0, 1.0, 0.0,
        //bottom left
        -1.0, -1.0, 0.0, 1.0,

        //second triangle
        //bottom left
        -1.0, -1.0, 0.0, 1.0,
        //top right
        1.0, 1.0, 1.0, 0.0,
        //bottom right
        1.0, -1.0, 1.0, 1.0,
      ]),
      this.device,
    );

    const textureBlindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      ],
    });

    this.pingPongBindGroup = this.device.createBindGroup({
      layout: textureBlindGroupLayout,
      entries: [
        { binding: 0, resource: this.pingPongTexture.sampler },
        {
          binding: 1,
          resource: this.pingPongTexture.texture.createView(),
        },
      ],
    });

    this.HorizontalPassPipeline = this.createPipeline(
      shaderSource,
      textureBlindGroupLayout,
      true,
    );
    this.VerticalPassPipeline = this.createPipeline(
      shaderSource,
      textureBlindGroupLayout,
      false,
    );
  }

  public draw(
    textureToApplyEffectTo: GPUTextureView,
    textureToApplyEffectToBindGroup: GPUBindGroup,
  ) {
    //horizontal pass

    const horizontalCommandEncoder = this.device.createCommandEncoder();
    const horizontalPassEncoder = horizontalCommandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.pingPongTexture.texture.createView(),
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    horizontalPassEncoder.setPipeline(this.HorizontalPassPipeline);

    horizontalPassEncoder.setVertexBuffer(0, this.gpuBuffer);
    horizontalPassEncoder.setBindGroup(0, textureToApplyEffectToBindGroup);
    horizontalPassEncoder.draw(6, 1, 0, 0);
    horizontalPassEncoder.end();
    this.device.queue.submit([horizontalCommandEncoder.finish()]);

    const verticalCommandEncoder = this.device.createCommandEncoder();
    const verticalPassEncoder = verticalCommandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureToApplyEffectTo,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    verticalPassEncoder.setPipeline(this.VerticalPassPipeline);

    verticalPassEncoder.setVertexBuffer(0, this.gpuBuffer);
    verticalPassEncoder.setBindGroup(0, this.pingPongBindGroup);
    verticalPassEncoder.draw(6, 1, 0, 0);
    verticalPassEncoder.end();
    this.device.queue.submit([verticalCommandEncoder.finish()]);
  }
}
