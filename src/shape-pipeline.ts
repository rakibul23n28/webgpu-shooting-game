import { BufferUtil } from "./buffer-util";

export class ShapePipeline {
  constructor(
    public pipeline: GPURenderPipeline,
    public projectionViewBindGroup: GPUBindGroup,
    public sampler: GPUSampler,
  ) {}

  static create(
    device: GPUDevice,
    projectionBuffer: GPUBuffer,
    canvasFormat: GPUTextureFormat,
    bloomFormat: GPUTextureFormat,
  ): ShapePipeline {
    const shaderSource = `
        struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec3f,
            @location(1) localPos: vec2f,
            @location(2) @interpolate(flat) shapeType: f32, 
        };

        struct FragmentOutput {
            @location(0) color: vec4f,
            @location(1) brightness: vec4f,
        };

        @group(0) @binding(0) var<uniform> projectionView: mat4x4f;
        @group(1) @binding(0) var mySampler: sampler;
        @group(1) @binding(1) var myTexture: texture_2d<f32>;

        @vertex
        fn vs_main(
            @location(0) pos: vec2f,
            @location(1) localPos: vec2f,
            @location(2) color: vec3f,
            @location(3) shapeType: f32
        ) -> VertexOutput {
            var out: VertexOutput;
            out.position = projectionView * vec4f(pos, 0.0, 1.0);
            out.color = color;
            out.localPos = localPos;
            out.shapeType = shapeType;
            return out;
        }

    @fragment
        fn fs_main(in: VertexOutput) -> FragmentOutput {
            let texColor = textureSample(myTexture, mySampler, in.localPos);
            
            // 1. Calculate circle alpha OUTSIDE the if-statement
            let dist = length(in.localPos - vec2f(0.5, 0.5));
            let edge = fwidth(dist);
            let circleAlpha = 1.0 - smoothstep(0.5 - edge, 0.5, dist);

            // 2. Use the shapeType to decide which alpha to use
            var finalAlpha: f32 = 1.0;
            if (in.shapeType > 0.5) { 
                finalAlpha = circleAlpha;
            }

            let finalColor = texColor * vec4f(in.color, finalAlpha);
            
            if (finalColor.a <= 0.01) { discard; }

            var res: FragmentOutput;
            res.color = finalColor;

            let l = dot(finalColor.rgb, vec3f(0.299, 0.587, 0.114));
            if (l > 0.4) {
                res.brightness = finalColor;
            } else {
                res.brightness = vec4f(0.0, 0.0, 0.0, 0.0);
            }

            return res;
        }
        `;

    const shaderModule = device.createShaderModule({ code: shaderSource });
    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });

    const blend: GPUBlendState = {
      color: {
        srcFactor: "one",
        dstFactor: "one-minus-src-alpha",
        operation: "add",
      },
      alpha: {
        srcFactor: "one",
        dstFactor: "one-minus-src-alpha",
        operation: "add",
      },
    };

    const pipeline = device.createRenderPipeline({
      label: "Textured Shape Pipeline",
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 32, // 8 floats * 4 bytes
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" }, // pos
              { shaderLocation: 1, offset: 8, format: "float32x2" }, // localPos
              { shaderLocation: 2, offset: 16, format: "float32x3" }, // color
              { shaderLocation: 3, offset: 28, format: "float32" }, // shapeType
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [
          { format: canvasFormat, blend },
          { format: bloomFormat, blend },
        ],
      },
      primitive: { topology: "triangle-list" },
    });

    const projectionViewBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: projectionBuffer } }],
    });

    return new ShapePipeline(pipeline, projectionViewBindGroup, sampler);
  }
}
