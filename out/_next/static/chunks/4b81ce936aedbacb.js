(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,16121,r=>{"use strict";var e=r.i(47662);let o="bloomMergePixelShader",l=`uniform sampler2D textureSampler;uniform sampler2D bloomBlur;varying vec2 vUV;uniform float bloomWeight;
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{gl_FragColor=texture2D(textureSampler,vUV);vec3 blurred=texture2D(bloomBlur,vUV).rgb;gl_FragColor.rgb=gl_FragColor.rgb+(blurred.rgb*bloomWeight); }
`;e.ShaderStore.ShadersStore[o]||(e.ShaderStore.ShadersStore[o]=l),r.s(["bloomMergePixelShader",0,{name:o,shader:l}])}]);