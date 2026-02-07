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

var<private> weights : array<f32, 5> = array<f32, 5>(
    0.2270270270, //this is the center pixel weight,
    0.1862162162, //these are the neighboring pixel weights, which are the same for both sides
    0.1202702703, 
    0.0662162162, 
    0.0202702703);

@fragment
fn fragmentMainHorizontal(in : VertexOut) -> @location(0) vec4<f32> {
    // 1. Get dimensions as vec2<u32>
    let dims = textureDimensions(tex);
    
    // 2. Access the .x component FIRST, then cast to f32
    let horizontalTexel = 1.0 / f32(dims.x); 

    // 3. Initialize result with the center pixel (weight index 0)
    var result : vec3<f32> = textureSample(tex, texSampler, in.texCoords).rgb * weights[0];

    // 4. Loop through the rest of the weights (indices 1 to 4)
    for (var i = 1; i < 5; i = i + 1) {
        let offset = vec2<f32>(horizontalTexel * f32(i), 0.0);
        
        // Accumulate samples from both sides
        result += textureSample(tex, texSampler, in.texCoords + offset).rgb * weights[i];
        result += textureSample(tex, texSampler, in.texCoords - offset).rgb * weights[i];
    }
    
    return vec4<f32>(result, 1.0);
}

@fragment
fn fragmentMainVertical(in : VertexOut) -> @location(0) vec4<f32> {
    // 1. Get dimensions as vec2<u32>
    let dims = textureDimensions(tex);
    
    // 2. Access the .x component FIRST, then cast to f32
    let verticalTexel = 1.0 / f32(dims.y); 

    // 3. Initialize result with the center pixel (weight index 0)
    var result : vec3<f32> = textureSample(tex, texSampler, in.texCoords).rgb * weights[0];

    // 4. Loop through the rest of the weights (indices 1 to 4)
    for (var i = 1; i < 5; i = i + 1) {
        let offset = vec2<f32>(0.0, verticalTexel * f32(i));
        
        // Accumulate samples from both sides
        result += textureSample(tex, texSampler, in.texCoords + offset).rgb * weights[i];
        result += textureSample(tex, texSampler, in.texCoords - offset).rgb * weights[i];
    }
    
    
    return vec4<f32>(result, 1.0);
}
    