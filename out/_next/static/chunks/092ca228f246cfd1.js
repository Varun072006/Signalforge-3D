(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,24588,e=>{"use strict";var r=e.i(47662);e.i(87714);let o="rgbdDecodePixelShader",t=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;r.ShaderStore.ShadersStore[o]||(r.ShaderStore.ShadersStore[o]=t),e.s(["rgbdDecodePixelShader",0,{name:o,shader:t}])}]);