(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,90396,e=>{"use strict";var o=e.i(47662);let i="proceduralVertexShader",t=`attribute vec2 position;varying vec2 vPosition;varying vec2 vUV;const vec2 madd=vec2(0.5,0.5);
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
vPosition=position;vUV=position*madd+madd;gl_Position=vec4(position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;o.ShaderStore.ShadersStore[i]||(o.ShaderStore.ShadersStore[i]=t),e.s(["proceduralVertexShader",0,{name:i,shader:t}])}]);