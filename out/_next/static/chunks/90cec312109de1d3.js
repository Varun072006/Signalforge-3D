(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,21813,e=>{"use strict";var i=e.i(47662);let r="hdrFilteringVertexShader",t=`attribute vec2 position;varying vec3 direction;uniform vec3 up;uniform vec3 right;uniform vec3 front;
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
mat3 view=mat3(up,right,front);direction=view*vec3(position,1.0);gl_Position=vec4(position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;i.ShaderStore.ShadersStore[r]||(i.ShaderStore.ShadersStore[r]=t),e.s(["hdrFilteringVertexShader",0,{name:r,shader:t}])}]);