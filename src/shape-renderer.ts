import { BufferUtil } from "./buffer-util";
import { Camera } from "./camera";
import { Color } from "./Color";
import { Rect } from "./rect";
import { ShapePipeline } from "./shape-pipeline";
import { Texture } from "./texture";

const MAX_SHAPES = 12000;
const FLOATS_PER_VERTEX = 8;
const FLOATS_PER_SHAPE = FLOATS_PER_VERTEX * 4;

export class ShapeRenderer {
  private pipeline!: ShapePipeline;
  private indexBuffer!: GPUBuffer;
  private camera!: Camera;
  private projectionBuffer!: GPUBuffer;
  private renderPass!: GPURenderPassEncoder;

  private vertexData = new Float32Array(MAX_SHAPES * FLOATS_PER_SHAPE);
  private shapeCount = 0;
  private vertexBuffers: GPUBuffer[] = [];

  private currentTexture: Texture | null = null;
  private textureBindGroups: Map<string, GPUBindGroup> = new Map();

  constructor(
    private device: GPUDevice,
    width: number,
    height: number,
  ) {
    this.camera = new Camera(width, height);
  }

  public initialize(
    canvasFormat: GPUTextureFormat,
    bloomFormat: GPUTextureFormat,
  ) {
    this.projectionBuffer = BufferUtil.createUniformBuffer(
      new Float32Array(16),
      this.device,
    );
    this.pipeline = ShapePipeline.create(
      this.device,
      this.projectionBuffer,
      canvasFormat,
      bloomFormat,
    );

    const indices = new Uint16Array(MAX_SHAPES * 6);
    for (let i = 0; i < MAX_SHAPES; i++) {
      let v = i * 4;
      indices.set([v, v + 1, v + 2, v + 1, v + 2, v + 3], i * 6);
    }
    this.indexBuffer = BufferUtil.createIndexBuffer(indices, this.device);
  }

  public begin(renderPass: GPURenderPassEncoder) {
    this.renderPass = renderPass;
    this.shapeCount = 0;
    this.currentTexture = null;
    this.camera.update();
    this.device.queue.writeBuffer(
      this.projectionBuffer,
      0,
      this.camera.projectionViewMatrix as Float32Array,
    );
  }

  private getTextureBindGroup(texture: Texture): GPUBindGroup {
    if (!this.textureBindGroups.has(texture.id)) {
      const bindGroup = this.device.createBindGroup({
        layout: this.pipeline.pipeline.getBindGroupLayout(1),
        entries: [
          { binding: 0, resource: this.pipeline.sampler },
          { binding: 1, resource: texture.texture.createView() },
        ],
      });

      this.textureBindGroups.set(texture.id, bindGroup);
    }
    return this.textureBindGroups.get(texture.id)!;
  }

  private addGenericShape(
    texture: Texture,
    rect: Rect,
    color: Color,
    type: number,
  ) {
    // If texture changes or buffer is full, flush existing data
    if (
      (this.currentTexture !== texture && this.currentTexture !== null) ||
      this.shapeCount >= MAX_SHAPES
    ) {
      this.flush();
    }

    this.currentTexture = texture;

    let i = this.shapeCount * FLOATS_PER_SHAPE;
    const { x, y, width: w, height: h } = rect;

    // Local coordinates for the fragment shader to calculate SDFs (Circles)
    const vertices = [
      x,
      y,
      0,
      0, // Pos, LocalUV
      x + w,
      y,
      1,
      0,
      x,
      y + h,
      0,
      1,
      x + w,
      y + h,
      1,
      1,
    ];

    for (let j = 0; j < 4; j++) {
      let offset = i + j * FLOATS_PER_VERTEX;
      this.vertexData[offset + 0] = vertices[j * 4 + 0];
      this.vertexData[offset + 1] = vertices[j * 4 + 1];
      this.vertexData[offset + 2] = vertices[j * 4 + 2];
      this.vertexData[offset + 3] = vertices[j * 4 + 3];
      this.vertexData[offset + 4] = color.r;
      this.vertexData[offset + 5] = color.g;
      this.vertexData[offset + 6] = color.b;
      this.vertexData[offset + 7] = type;
    }
    this.shapeCount++;
  }

  public drawTexturedRect(
    texture: Texture,
    rect: Rect,
    color: Color = new Color(1, 1, 1),
  ) {
    this.addGenericShape(texture, rect, color, 0.0);
  }

  public drawTexturedCircle(
    texture: Texture,
    rect: Rect,
    color: Color = new Color(1, 1, 1),
  ) {
    this.addGenericShape(texture, rect, color, 1.0);
  }

  public flush() {
    if (this.shapeCount === 0 || !this.currentTexture) return;

    // 1. Always create or grab a buffer specifically for THIS draw call
    let vBuffer = this.vertexBuffers.pop();
    if (!vBuffer) {
      // Use the full size for the GPU buffer to ensure it fits MAX_SHAPES
      vBuffer = BufferUtil.createVertexBuffer(this.vertexData, this.device);
    }

    // 2. Upload only the data we just filled
    this.device.queue.writeBuffer(
      vBuffer,
      0,
      this.vertexData.subarray(0, this.shapeCount * FLOATS_PER_SHAPE),
    );

    this.renderPass.setPipeline(this.pipeline.pipeline);
    this.renderPass.setBindGroup(0, this.pipeline.projectionViewBindGroup);
    this.renderPass.setBindGroup(
      1,
      this.getTextureBindGroup(this.currentTexture),
    );
    this.renderPass.setVertexBuffer(0, vBuffer);
    this.renderPass.setIndexBuffer(this.indexBuffer, "uint16");
    this.renderPass.drawIndexed(this.shapeCount * 6);

    // 3. IMPORTANT: Reset shapeCount after the draw call is issued
    this.shapeCount = 0;

    // Note: Do not push vBuffer back immediately if you are
    // doing multiple flushes in one frame, as it might be in use.
    // However, for standard WebGPU usage, the queue handles this.
    this.vertexBuffers.push(vBuffer);
  }
}
