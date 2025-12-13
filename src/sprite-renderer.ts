import { vec2 } from "gl-matrix";
import { BufferUtil } from "./buffer-util";
import { Camera } from "./camera";
import { Color } from "./Color";
import { Rect } from "./rect";
import { SpritePipeline } from "./spite-pipeline";
import { Texture } from "./texture";

const MAX_NUMBER_OF_SPRITES = 1000;
const INDICES_PER_SPRITE = 6; // 2 triangles per sprite
const VERTICES_PER_VERTEX = 7; // x, y, u, v, r, g, b
const FLOATS_PER_SPRITE = VERTICES_PER_VERTEX * 4; // 4 vertices per sprite, 7 floats per vertex

export class BatchDrawCall {
  constructor(public pipeline: SpritePipeline) {}

  public vertexData = new Float32Array(
    FLOATS_PER_SPRITE * MAX_NUMBER_OF_SPRITES
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

  /*
    Pipeline created for each texture 
   */
  private pipelinePerTexture: { [id: string]: SpritePipeline } = {};
  /**
   * Batch draw calls per texture
   */
  private batchDrawCallsPerTexture: { [id: string]: Array<BatchDrawCall> } = {};
  /**
   * Allocated vertex buffers for batch draw calls
   */

  private allocatedVertexBuffers: Array<GPUBuffer> = [];

  private v0 = vec2.create();
  private v1 = vec2.create();
  private v2 = vec2.create();
  private v3 = vec2.create();
  private rotationOrigin = vec2.create();

  constructor(
    private device: GPUDevice,
    private width: number,
    private height: number
  ) {
    this.camera = new Camera(this.width, this.height);
  }

  public framepass(renderPass: GPURenderPassEncoder) {
    this.renderPass = renderPass;
    // reset batch draw calls
    this.batchDrawCallsPerTexture = {};
    this.currentTexture = null;
    //update camera
    this.camera.update();

    // update projection view matrix buffer

    const pv = new Float32Array(this.camera.projectionViewMatrix);
    this.device.queue.writeBuffer(this.projectionViewMatrixBuffer, 0, pv);
  }

  //indexbuffer setup
  public setupIndexBuffer() {
    const data = new Uint16Array(MAX_NUMBER_OF_SPRITES * INDICES_PER_SPRITE);

    for (let i = 0; i < MAX_NUMBER_OF_SPRITES; i++) {
      data[i * INDICES_PER_SPRITE + 0] = i * 4 + 0;
      data[i * INDICES_PER_SPRITE + 1] = i * 4 + 1;
      data[i * INDICES_PER_SPRITE + 2] = i * 4 + 2;
      data[i * INDICES_PER_SPRITE + 3] = i * 4 + 1;
      data[i * INDICES_PER_SPRITE + 4] = i * 4 + 2;
      data[i * INDICES_PER_SPRITE + 5] = i * 4 + 3;
    }
    this.indexBuffer = BufferUtil.createIndexBuffer(data, this.device);
  }

  //initialize resources

  public initialize() {
    //indexbuffer
    this.setupIndexBuffer();

    //uniform buffer
    this.projectionViewMatrixBuffer = BufferUtil.createUniformBuffer(
      new Float32Array(16),
      this.device
    );
  }
  public drawSprite(texture: Texture, rect: Rect) {
    if (this.currentTexture != texture) {
      this.currentTexture = texture;
      let pipeline = this.pipelinePerTexture[texture.id];
      if (!pipeline) {
        pipeline = SpritePipeline.create(
          this.device,
          texture,
          this.projectionViewMatrixBuffer
        );
        this.pipelinePerTexture[texture.id] = pipeline;
      }

      let batchDrawCalls = this.batchDrawCallsPerTexture[texture.id];
      if (!batchDrawCalls) {
        this.batchDrawCallsPerTexture[texture.id] = [];
      }
    }

    const arrayOfBatchDrawCalls = this.batchDrawCallsPerTexture[texture.id];

    let batchDrawCall = arrayOfBatchDrawCalls[arrayOfBatchDrawCalls.length - 1];
    if (!batchDrawCall) {
      batchDrawCall = new BatchDrawCall(this.pipelinePerTexture[texture.id]);
      this.batchDrawCallsPerTexture[texture.id].push(batchDrawCall);
    }

    let i = batchDrawCall.instanceCount * FLOATS_PER_SPRITE;

    batchDrawCall.vertexData[i + 0] = rect.x;
    batchDrawCall.vertexData[i + 1] = rect.y;
    batchDrawCall.vertexData[i + 2] = 0;
    batchDrawCall.vertexData[i + 3] = 0;
    batchDrawCall.vertexData[i + 4] = batchDrawCall.vertexData[i + 5] = 1;
    batchDrawCall.vertexData[i + 6] = 1; // vertex 0

    batchDrawCall.vertexData[i + 7] = rect.x + rect.width;
    batchDrawCall.vertexData[i + 8] = rect.y;
    batchDrawCall.vertexData[i + 9] = 1;
    batchDrawCall.vertexData[i + 10] = 0;
    batchDrawCall.vertexData[i + 11] = 1;
    batchDrawCall.vertexData[i + 12] = 1;
    batchDrawCall.vertexData[i + 13] = 1; // vertex 1

    batchDrawCall.vertexData[i + 14] = rect.x;
    batchDrawCall.vertexData[i + 15] = rect.y + rect.height;
    batchDrawCall.vertexData[i + 16] = 0;
    batchDrawCall.vertexData[i + 17] = 1;
    batchDrawCall.vertexData[i + 18] = 1;
    batchDrawCall.vertexData[i + 19] = 1;
    batchDrawCall.vertexData[i + 20] = 1; // vertex 2

    batchDrawCall.vertexData[i + 21] = rect.x + rect.width;
    batchDrawCall.vertexData[i + 22] = rect.y + rect.height;
    batchDrawCall.vertexData[i + 23] = 1;
    batchDrawCall.vertexData[i + 24] = 1;
    batchDrawCall.vertexData[i + 25] = 1;
    batchDrawCall.vertexData[i + 26] = 1;
    batchDrawCall.vertexData[i + 27] = 1; // vertex 3

    batchDrawCall.instanceCount++;

    if (batchDrawCall.instanceCount >= MAX_NUMBER_OF_SPRITES) {
      const newBatchDrawCall = new BatchDrawCall(
        this.pipelinePerTexture[texture.id]
      );
      this.batchDrawCallsPerTexture[texture.id].push(newBatchDrawCall);
    }
  }

  public drawSpriteSource(
    texture: Texture,
    rect: Rect,
    sourceRect: Rect,
    color: Color = this.defualtColor,
    rotation: number = 0,
    rotationAnchor: vec2 | null = null
  ) {
    if (this.currentTexture != texture) {
      this.currentTexture = texture;
      let pipeline = this.pipelinePerTexture[texture.id];
      if (!pipeline) {
        pipeline = SpritePipeline.create(
          this.device,
          texture,
          this.projectionViewMatrixBuffer
        );
        this.pipelinePerTexture[texture.id] = pipeline;
      }

      let batchDrawCalls = this.batchDrawCallsPerTexture[texture.id];
      if (!batchDrawCalls) {
        this.batchDrawCallsPerTexture[texture.id] = [];
      }
    }

    const arrayOfBatchDrawCalls = this.batchDrawCallsPerTexture[texture.id];

    let batchDrawCall = arrayOfBatchDrawCalls[arrayOfBatchDrawCalls.length - 1];
    if (!batchDrawCall) {
      batchDrawCall = new BatchDrawCall(this.pipelinePerTexture[texture.id]);
      this.batchDrawCallsPerTexture[texture.id].push(batchDrawCall);
    }

    let i = batchDrawCall.instanceCount * FLOATS_PER_SPRITE;

    let u0 = sourceRect.x / texture.width;
    let v0 = sourceRect.y / texture.height;
    let u1 = (sourceRect.x + sourceRect.width) / texture.width;
    let v1 = (sourceRect.y + sourceRect.height) / texture.height;

    //add rotation vector

    this.v0[0] = rect.x;
    this.v0[1] = rect.y;
    this.v1[0] = rect.x + rect.width;
    this.v1[1] = rect.y;
    this.v2[0] = rect.x;
    this.v2[1] = rect.y + rect.height;
    this.v3[0] = rect.x + rect.width;
    this.v3[1] = rect.y + rect.height;

    if (rotation != 0) {
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

    batchDrawCall.vertexData[i + 0] = this.v0[0];
    batchDrawCall.vertexData[i + 1] = this.v0[1];
    batchDrawCall.vertexData[i + 2] = u0;
    batchDrawCall.vertexData[i + 3] = v0;
    batchDrawCall.vertexData[i + 4] = color.r;
    batchDrawCall.vertexData[i + 5] = color.g;
    batchDrawCall.vertexData[i + 6] = color.b; // vertex 0

    batchDrawCall.vertexData[i + 7] = this.v1[0];
    batchDrawCall.vertexData[i + 8] = this.v1[1];
    batchDrawCall.vertexData[i + 9] = u1;
    batchDrawCall.vertexData[i + 10] = v0;
    batchDrawCall.vertexData[i + 11] = color.r;
    batchDrawCall.vertexData[i + 12] = color.g;
    batchDrawCall.vertexData[i + 13] = color.b; // vertex 1

    batchDrawCall.vertexData[i + 14] = this.v2[0];
    batchDrawCall.vertexData[i + 15] = this.v2[1];
    batchDrawCall.vertexData[i + 16] = u0;
    batchDrawCall.vertexData[i + 17] = v1;
    batchDrawCall.vertexData[i + 18] = color.r;
    batchDrawCall.vertexData[i + 19] = color.g;
    batchDrawCall.vertexData[i + 20] = color.b; // vertex 2

    batchDrawCall.vertexData[i + 21] = this.v3[0];
    batchDrawCall.vertexData[i + 22] = this.v3[1];
    batchDrawCall.vertexData[i + 23] = u1;
    batchDrawCall.vertexData[i + 24] = v1;
    batchDrawCall.vertexData[i + 25] = color.r;
    batchDrawCall.vertexData[i + 26] = color.g;
    batchDrawCall.vertexData[i + 27] = color.b; // vertex 3

    batchDrawCall.instanceCount++;

    if (batchDrawCall.instanceCount >= MAX_NUMBER_OF_SPRITES) {
      const newBatchDrawCall = new BatchDrawCall(
        this.pipelinePerTexture[texture.id]
      );
      this.batchDrawCallsPerTexture[texture.id].push(newBatchDrawCall);
    }
  }

  public flameEnd() {
    let usedVertexBuffers = [];

    for (const key in this.batchDrawCallsPerTexture) {
      const arrayOfBatchDrawCalls = this.batchDrawCallsPerTexture[key];

      for (let batchDrawCall of arrayOfBatchDrawCalls) {
        if (batchDrawCall.instanceCount == 0) continue;

        /**
         * Draw the batch
         */

        let vertexBuffer = this.allocatedVertexBuffers.pop();

        if (!vertexBuffer) {
          vertexBuffer = BufferUtil.createVertexBuffer(
            batchDrawCall.vertexData,
            this.device
          );
        } else {
          this.device.queue.writeBuffer(
            vertexBuffer,
            0,
            batchDrawCall.vertexData
          );
        }
        /**
         * Draw the batch
         */

        usedVertexBuffers.push(vertexBuffer);

        const spritePipeline = batchDrawCall.pipeline;

        this.renderPass.setPipeline(spritePipeline.pipeline);
        this.renderPass.setVertexBuffer(0, vertexBuffer); //.verticesBuffer);
        this.renderPass.setIndexBuffer(this.indexBuffer, "uint16");
        this.renderPass.setBindGroup(0, spritePipeline.projectionViewBindGroup);
        this.renderPass.setBindGroup(1, spritePipeline.textureBindGroup);
        this.renderPass.drawIndexed(6 * batchDrawCall.instanceCount); // 6 indices per sprite
      }
    }
    for (let vertexBuffer of usedVertexBuffers) {
      this.allocatedVertexBuffers.push(vertexBuffer);
    }
  }
}
