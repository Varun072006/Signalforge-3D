(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88395,e=>{"use strict";var r=e.i(47662);e.i(87714);let t="rgbdEncodePixelShader",o=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=toRGBD(texture2D(textureSampler,vUV).rgb);}`;r.ShaderStore.ShadersStore[t]||(r.ShaderStore.ShadersStore[t]=o),e.s(["rgbdEncodePixelShader",0,{name:t,shader:o}])}]);