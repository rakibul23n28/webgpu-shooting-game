// shader.wgsl

struct VertexOut {
  @builtin(position) position : vec4<f32>,
  @location(0) texCoords : vec2<f32>,
  @location(1) fragColor : vec4<f32>,
};

@group(0) @binding(0)
var<uniform> projectionViewMatrix : mat4x4<f32>;

// Vertex
@vertex
fn vertexMain(
  @location(0) position : vec2<f32>,
  @location(1) texCoords : vec2<f32>,
  @location(2) color : vec3<f32>
) -> VertexOut {
  var output : VertexOut;
  // Convert 2D position to vec4 and transform with projectionViewMatrix
  let pos4 : vec4<f32> = vec4<f32>(position.x, position.y, 0.9, 1.0);
  output.position = projectionViewMatrix * pos4   ; //projectionViewMatrix * pos4;
  output.texCoords = texCoords;
  output.fragColor = vec4<f32>(color, 1.0);
  return output;
}

// Texture bindings are group 1 (match pipeline bind group 1)
@group(1) @binding(0) var texSampler : sampler;
@group(1) @binding(1) var tex : texture_2d<f32>;

@fragment
fn fragmentMain(in : VertexOut) -> @location(0) vec4<f32> {
  let textureColor : vec4<f32> = textureSample(tex, texSampler, in.texCoords);
  return in.fragColor * textureColor;
}
