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

// this is out scene texture, which is bound to group 0 (match pipeline bind group 0)
@group(0) @binding(0) var texSampler0 : sampler;
@group(0) @binding(1) var tex0 : texture_2d<f32>;

// this is our brightness blur texture, which is bound to group 1 (match pipeline bind group 1)
@group(1) @binding(0) var texSampler1 : sampler;
@group(1) @binding(1) var tex1 : texture_2d<f32>;


@fragment
fn fragmentMain(in : VertexOut) -> @location(0) vec4<f32> {
  var screenTexture : vec4<f32> = textureSample(tex0, texSampler0, in.texCoords);
  var brightnessBlurTexture : vec4<f32> = textureSample(tex1, texSampler1, in.texCoords);
  //dampen color
  
// FIX: Apply the multiplication only to the .rgb components
    let darkenedScreen : vec3<f32> = screenTexture.rgb * (vec3f(1.0) - clamp(brightnessBlurTexture.rgb, vec3f(0.0), vec3f(1.0)));

    // Add the modified screen color and the bloom/blur color together
    let resultColor : vec3<f32> = darkenedScreen + brightnessBlurTexture.rgb;



    // Return the combined RGB with a solid alpha of 1.0
    return vec4<f32>(resultColor, 1.0);
}
