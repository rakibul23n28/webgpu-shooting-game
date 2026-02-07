import { BufferUtil } from "./buffer-util";
import { Texture } from "./texture";
import shaderSource from "./shaders/blur-effect.wgsl?raw";

export class BlurEffect {
  private gpuBuffer!: GPUBuffer;

  private horizontalPassRenderTexture!: Texture;
  private HorizontalPassPipeline!: GPURenderPipeline;
  private horizontalPassBindGroup!: GPUBindGroup;

  private verticalPassRenderTexture!: Texture;
  private VerticalPassPipeline!: GPURenderPipeline;
  private verticalPassBindGroup!: GPUBindGroup;

  public doHorizontalPass = true;
  public doVerticalPass = true;

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

  public getRenderTexture(): Texture | null {
    if (this.doHorizontalPass) return this.horizontalPassRenderTexture;
    if (this.doVerticalPass) return this.verticalPassRenderTexture;

    return null;
  }

  constructor(
    private device: GPUDevice,
    public width: number,
    public height: number,
  ) {}

  public async initialize() {
    this.horizontalPassRenderTexture = await Texture.createEmptyTexture(
      this.device,
      this.width,
      this.height,
      "bgra8unorm",
    );

    this.verticalPassRenderTexture = await Texture.createEmptyTexture(
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

    this.horizontalPassBindGroup = this.device.createBindGroup({
      layout: textureBlindGroupLayout,
      entries: [
        { binding: 0, resource: this.horizontalPassRenderTexture.sampler },
        {
          binding: 1,
          resource: this.horizontalPassRenderTexture.texture.createView(),
        },
      ],
    });

    this.verticalPassBindGroup = this.device.createBindGroup({
      layout: textureBlindGroupLayout,
      entries: [
        { binding: 0, resource: this.verticalPassRenderTexture.sampler },
        {
          binding: 1,
          resource: this.verticalPassRenderTexture.texture.createView(),
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

  public draw(destinationTextureView: GPUTextureView) {
    //horizontal pass
    if (this.doHorizontalPass) {
      const textureView = this.doVerticalPass
        ? this.verticalPassRenderTexture.texture.createView()
        : destinationTextureView;
      const commandEncoder = this.device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      passEncoder.setPipeline(this.HorizontalPassPipeline);

      passEncoder.setVertexBuffer(0, this.gpuBuffer);
      passEncoder.setBindGroup(0, this.horizontalPassBindGroup);
      passEncoder.draw(6, 1, 0, 0);
      passEncoder.end();
      this.device.queue.submit([commandEncoder.finish()]);
    }

    //vertical pass
    if (this.doVerticalPass) {
      const commandEncoder = this.device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: destinationTextureView,
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      passEncoder.setPipeline(this.VerticalPassPipeline);

      passEncoder.setVertexBuffer(0, this.gpuBuffer);
      passEncoder.setBindGroup(0, this.verticalPassBindGroup);
      passEncoder.draw(6, 1, 0, 0);
      passEncoder.end();
      this.device.queue.submit([commandEncoder.finish()]);
    }
  }
}
