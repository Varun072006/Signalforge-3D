(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,81499,e=>{"use strict";var r=e.i(47662);let t="passPixelShader",a=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=textureSample(textureSampler,textureSamplerSampler,input.vUV);}`;r.ShaderStore.ShadersStoreWGSL[t]||(r.ShaderStore.ShadersStoreWGSL[t]=a),e.s(["passPixelShaderWGSL",0,{name:t,shader:a}])}]);