(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,96094,e=>{"use strict";var r=e.i(47662);let t="kernelBlurVaryingDeclaration";r.ShaderStore.IncludesShadersStoreWGSL[t]||(r.ShaderStore.IncludesShadersStoreWGSL[t]="varying sampleCoord{X}: vec2f;"),e.s([])},98137,e=>{"use strict";var r=e.i(47662);e.i(96094);let t="kernelBlurVertex";r.ShaderStore.IncludesShadersStoreWGSL[t]||(r.ShaderStore.IncludesShadersStoreWGSL[t]="vertexOutputs.sampleCoord{X}=vertexOutputs.sampleCenter+uniforms.delta*KERNEL_OFFSET{X};");let n="kernelBlurVertexShader",a=`attribute position: vec2f;uniform delta: vec2f;varying sampleCenter: vec2f;
#include<kernelBlurVaryingDeclaration>[0..varyingCount]
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {const madd: vec2f= vec2f(0.5,0.5);
#define CUSTOM_VERTEX_MAIN_BEGIN
vertexOutputs.sampleCenter=(vertexInputs.position*madd+madd);
#include<kernelBlurVertex>[0..varyingCount]
vertexOutputs.position= vec4f(vertexInputs.position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;r.ShaderStore.ShadersStoreWGSL[n]||(r.ShaderStore.ShadersStoreWGSL[n]=a),e.s(["kernelBlurVertexShaderWGSL",0,{name:n,shader:a}],98137)}]);