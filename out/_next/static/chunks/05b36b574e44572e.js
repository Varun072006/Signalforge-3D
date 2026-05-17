(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,93198,e=>{"use strict";var r=e.i(47662);let t="kernelBlurVaryingDeclaration";r.ShaderStore.IncludesShadersStore[t]||(r.ShaderStore.IncludesShadersStore[t]="varying vec2 sampleCoord{X};"),e.s([])},33150,e=>{"use strict";var r=e.i(47662);e.i(93198);let t="kernelBlurVertex";r.ShaderStore.IncludesShadersStore[t]||(r.ShaderStore.IncludesShadersStore[t]="sampleCoord{X}=sampleCenter+delta*KERNEL_OFFSET{X};");let a="kernelBlurVertexShader",d=`attribute vec2 position;uniform vec2 delta;varying vec2 sampleCenter;
#include<kernelBlurVaryingDeclaration>[0..varyingCount]
const vec2 madd=vec2(0.5,0.5);
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
sampleCenter=(position*madd+madd);
#include<kernelBlurVertex>[0..varyingCount]
gl_Position=vec4(position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;r.ShaderStore.ShadersStore[a]||(r.ShaderStore.ShadersStore[a]=d),e.s(["kernelBlurVertexShader",0,{name:a,shader:d}],33150)}]);