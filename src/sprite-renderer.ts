import { vec2 } from "gl-matrix";
import { BufferUtil } from "./buffer-util";
import { Camera } from "./camera";
import { Color } from "./Color";
import { Rect } from "./rect";
import { SpritePipeline } from "./spite-pipeline"; // Note: Check if filename is 'spite' or 'sprite'
import { Texture } from "./texture";
import { SpriteFont } from "./sprite-font";

const MAX_NUMBER_OF_SPRITES = 1000;
const INDICES_PER_SPRITE = 6;
const VERTICES_PER_VERTEX = 7; // x, y, u, v, r, g, b
const FLOATS_PER_SPRITE = VERTICES_PER_VERTEX * 4;

export class BatchDrawCall {
  constructor(public pipeline: SpritePipeline) {}
  public vertexData = new Float32Array(
    FLOATS_PER_SPRITE * MAX_NUMBER_OF_SPRITES,
  );
  public instanceCount: number = 0;
}

export class SpriteRenderer {
  private defualtColor = new Color();
  private indexBuffer!: GPUBuffer;
  private camera!: Camera;
  private projectionViewMatrixBuffer!: GPUBuffer;
  private renderPass!: GPURenderPassEncoder;
  private currentTexture!: Texture | null;

  private canvasFormat!: GPUTextureFormat;
  private bloomFormat!: GPUTextureFormat;

  private pipelinePerTexture: { [id: string]: SpritePipeline } = {};
  private batchDrawCallsPerTexture: { [id: string]: Array<BatchDrawCall> } = {};
  private allocatedVertexBuffers: Array<GPUBuffer> = [];

  private v0 = vec2.create();
  private v1 = vec2.create();
  private v2 = vec2.create();
  private v3 = vec2.create();
  private rotationOrigin = vec2.create();

  constructor(
    private device: GPUDevice,
    private width: number,
    private height: number,
  ) {
    this.camera = new Camera(this.width, this.height);
  }

  public initialize(
    canvasFormat: GPUTextureFormat,
    bloomFormat: GPUTextureFormat,
  ) {
    this.canvasFormat = canvasFormat;
    this.bloomFormat = bloomFormat;
    this.setupIndexBuffer();
    this.projectionViewMatrixBuffer = BufferUtil.createUniformBuffer(
      new Float32Array(16),
      this.device,
    );
  }

  private setupIndexBuffer() {
    const data = new Uint16Array(MAX_NUMBER_OF_SPRITES * INDICES_PER_SPRITE);
    for (let i = 0; i < MAX_NUMBER_OF_SPRITES; i++) {
      let v = i * 4;
      data.set([v, v + 1, v + 2, v + 1, v + 2, v + 3], i * INDICES_PER_SPRITE);
    }
    this.indexBuffer = BufferUtil.createIndexBuffer(data, this.device);
  }

  public framepass(renderPass: GPURenderPassEncoder) {
    this.renderPass = renderPass;
    this.batchDrawCallsPerTexture = {};
    this.currentTexture = null;
    this.camera.update();
    const pv = new Float32Array(this.camera.projectionViewMatrix);
    this.device.queue.writeBuffer(this.projectionViewMatrixBuffer, 0, pv);
  }

  private getPipeline(texture: Texture): SpritePipeline {
    if (!this.pipelinePerTexture[texture.id]) {
      this.pipelinePerTexture[texture.id] = SpritePipeline.create(
        this.device,
        texture,
        this.projectionViewMatrixBuffer,
        this.canvasFormat,
        this.bloomFormat,
      );
    }
    return this.pipelinePerTexture[texture.id];
  }

  public drawSprite(
    texture: Texture,
    rect: Rect,
    color: Color = this.defualtColor,
  ) {
    this.drawSpriteSource(
      texture,
      rect,
      new Rect(0, 0, texture.width, texture.height),
      color,
    );
  }

  public drawSpriteSource(
    texture: Texture,
    rect: Rect,
    sourceRect: Rect,
    color: Color = this.defualtColor,
    rotation: number = 0,
    rotationAnchor: vec2 | null = null,
  ) {
    const pipeline = this.getPipeline(texture);

    if (!this.batchDrawCallsPerTexture[texture.id]) {
      this.batchDrawCallsPerTexture[texture.id] = [];
    }

    const batchCalls = this.batchDrawCallsPerTexture[texture.id];
    let batch = batchCalls[batchCalls.length - 1];

    if (!batch || batch.instanceCount >= MAX_NUMBER_OF_SPRITES) {
      batch = new BatchDrawCall(pipeline);
      batchCalls.push(batch);
    }

    let i = batch.instanceCount * FLOATS_PER_SPRITE;

    const u0 = sourceRect.x / texture.width;
    const v0 = sourceRect.y / texture.height;
    const u1 = (sourceRect.x + sourceRect.width) / texture.width;
    const v1 = (sourceRect.y + sourceRect.height) / texture.height;

    // Corner positions
    vec2.set(this.v0, rect.x, rect.y);
    vec2.set(this.v1, rect.x + rect.width, rect.y);
    vec2.set(this.v2, rect.x, rect.y + rect.height);
    vec2.set(this.v3, rect.x + rect.width, rect.y + rect.height);

    if (rotation !== 0) {
      if (rotationAnchor == null) {
        vec2.copy(this.rotationOrigin, this.v0);
      } else {
        this.rotationOrigin[0] = this.v0[0] + rotationAnchor[0] * rect.width;
        this.rotationOrigin[1] = this.v0[1] + rotationAnchor[1] * rect.height;
      }
      vec2.rotate(this.v0, this.v0, this.rotationOrigin, rotation);
      vec2.rotate(this.v1, this.v1, this.rotationOrigin, rotation);
      vec2.rotate(this.v2, this.v2, this.rotationOrigin, rotation);
      vec2.rotate(this.v3, this.v3, this.rotationOrigin, rotation);
    }

    const verts = [
      { p: this.v0, u: u0, v: v0 },
      { p: this.v1, u: u1, v: v0 },
      { p: this.v2, u: u0, v: v1 },
      { p: this.v3, u: u1, v: v1 },
    ];

    for (let j = 0; j < 4; j++) {
      let offset = i + j * VERTICES_PER_VERTEX;
      batch.vertexData[offset + 0] = verts[j].p[0];
      batch.vertexData[offset + 1] = verts[j].p[1];
      batch.vertexData[offset + 2] = verts[j].u;
      batch.vertexData[offset + 3] = verts[j].v;
      batch.vertexData[offset + 4] = color.r;
      batch.vertexData[offset + 5] = color.g;
      batch.vertexData[offset + 6] = color.b;
    }

    batch.instanceCount++;
  }

  public drawString(
    spriteFont: SpriteFont,
    text: string,
    position: vec2,
    color: Color = this.defualtColor,
    scale = 1,
  ) {
    let advanceChar = 0;
    for (let j = 0; j < text.length; j++) {
      const charCode = text[j].charCodeAt(0);
      const spriteFontChar = spriteFont.getChar(charCode);
      if (!spriteFontChar) continue;

      const x = position[0] + (spriteFontChar.offset[0] + advanceChar) * scale;
      const y = position[1] + spriteFontChar.offset[1] * scale;
      const width = spriteFontChar.size[0] * scale;
      const height = spriteFontChar.size[1] * scale;

      this.drawSpriteSource(
        spriteFont.texture,
        new Rect(x, y, width, height),
        new Rect(
          spriteFontChar.textureCoords.topLeft[0] * spriteFont.texture.width,
          spriteFontChar.textureCoords.topLeft[1] * spriteFont.texture.height,
          spriteFontChar.size[0],
          spriteFontChar.size[1],
        ),
        color,
      );

      advanceChar += spriteFontChar.advance;
    }
  }

  public flameEnd() {
    let usedBuffers: GPUBuffer[] = [];

    for (const key in this.batchDrawCallsPerTexture) {
      for (const batch of this.batchDrawCallsPerTexture[key]) {
        if (batch.instanceCount === 0) continue;

        let vBuffer = this.allocatedVertexBuffers.pop();
        if (!vBuffer) {
          vBuffer = BufferUtil.createVertexBuffer(
            batch.vertexData,
            this.device,
          );
        } else {
          this.device.queue.writeBuffer(vBuffer, 0, batch.vertexData);
        }

        usedBuffers.push(vBuffer);

        this.renderPass.setPipeline(batch.pipeline.pipeline);
        this.renderPass.setBindGroup(0, batch.pipeline.projectionViewBindGroup);
        this.renderPass.setBindGroup(1, batch.pipeline.textureBindGroup);
        this.renderPass.setVertexBuffer(0, vBuffer);
        this.renderPass.setIndexBuffer(this.indexBuffer, "uint16");
        this.renderPass.drawIndexed(batch.instanceCount * 6);
      }
    }

    this.allocatedVertexBuffers.push(...usedBuffers);
  }
}
