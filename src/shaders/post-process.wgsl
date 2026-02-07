// post-process.wgsl

struct VertexOut {
  @builtin(position) position : vec4<f32>,
  @location(0) texCoords : vec2<f32>,
};


// Vertex
@vertex
fn vertexMain(
  @location(0) position : vec2<f32>,
  @location(1) texCoords : vec2<f32>,
) -> VertexOut {
  var output : VertexOut;
  let pos4 : vec4<f32> = vec4<f32>(position.x, position.y, 0.0, 1.0);
  // For post-processing, we want to render a full-screen quad without any transformations
  output.position =  pos4   ; 
  output.texCoords = texCoords;

  return output;
}

// Texture bindings are group 1 (match pipeline bind group 1)
@group(0) @binding(0) var texSampler : sampler;
@group(0) @binding(1) var tex : texture_2d<f32>;

@fragment
fn fragmentMain(in : VertexOut) -> @location(0) vec4<f32> {
  var screenTexture : vec4<f32> = textureSample(tex, texSampler, in.texCoords);
  var average = (screenTexture.r + screenTexture.g + screenTexture.b) / 3.0;
  screenTexture = vec4<f32>(average, average, average, 1.0);
  return screenTexture;
}
