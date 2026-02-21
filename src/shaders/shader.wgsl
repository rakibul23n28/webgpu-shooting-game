struct VertexOut {
    @builtin(position) position : vec4<f32>,
    @location(0) texCoords : vec2<f32>,
    @location(1) fragColor : vec4<f32>,
};

@group(0) @binding(0)
var<uniform> projectionViewMatrix : mat4x4<f32>;

@vertex
fn vertexMain(
    @location(0) position : vec2<f32>,
    @location(1) texCoords : vec2<f32>,
    @location(2) color : vec3<f32>
) -> VertexOut {
    var output : VertexOut;
    
    // Using 0.0 for Z to ensure it stays within the standard clip space
    let pos4 : vec4<f32> = vec4<f32>(position.x, position.y, 0.0, 1.0);
    
    output.position = projectionViewMatrix * pos4;
    output.texCoords = texCoords;
    output.fragColor = vec4<f32>(color, 1.0);
    return output;
}

@group(1) @binding(0) var texSampler : sampler;
@group(1) @binding(1) var tex : texture_2d<f32>;

struct FragmentOut {
    @location(0) color : vec4<f32>,
    @location(1) brightness : vec4<f32>,
};

// Threshold for what gets a "glow"
const brightnessThreshold : f32 = 0.4;

@fragment
fn fragmentMain(in : VertexOut) -> FragmentOut {
    let textureColor : vec4<f32> = textureSample(tex, texSampler, in.texCoords) * in.fragColor;
    
    // Discard transparent pixels so they don't write to the brightness buffer at all
    if (textureColor.a < 0.01) {
        discard;
    }

    var output : FragmentOut;
    output.color = textureColor;

    // Calculate relative luminance
    let l = dot(textureColor.rgb, vec3<f32>(0.299, 0.587, 0.114));

    if (l > brightnessThreshold) {
        output.brightness = textureColor;
    } else {
        // Output completely transparent black for non-glowing areas
        output.brightness = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
    
    return output;
}