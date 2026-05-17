(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,73504,e=>{"use strict";var t=e.i(47662);let r="glowMapMergeVertexShader",o=`attribute position: vec2f;varying vUV: vec2f;
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {const madd: vec2f= vec2f(0.5,0.5);
#define CUSTOM_VERTEX_MAIN_BEGIN
vertexOutputs.vUV=vertexInputs.position*madd+madd;vertexOutputs.position= vec4f(vertexInputs.position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;t.ShaderStore.ShadersStoreWGSL[r]||(t.ShaderStore.ShadersStoreWGSL[r]=o),e.s(["glowMapMergeVertexShaderWGSL",0,{name:r,shader:o}])}]);