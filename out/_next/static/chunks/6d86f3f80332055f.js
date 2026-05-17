(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,35779,e=>{"use strict";var r=e.i(47662);let c="taaPixelShader",t=`varying vec2 vUV;uniform sampler2D textureSampler;uniform sampler2D historySampler;
#ifdef TAA_REPROJECT_HISTORY
uniform sampler2D velocitySampler;
#endif
uniform float factor;void main() {ivec2 pos=ivec2(gl_FragCoord.xy);vec4 c=texelFetch(textureSampler,pos,0);
#ifdef TAA_REPROJECT_HISTORY
vec4 v=texelFetch(velocitySampler,pos,0);vec4 h=texture2D(historySampler,vUV+v.xy);
#else
vec4 h=texelFetch(historySampler,pos,0);
#endif
#ifdef TAA_CLAMP_HISTORY
vec4 cmin=vec4(1);vec4 cmax=vec4(0);for (int x=-1; x<=1; x+=1) {for (int y=-1; y<=1; y+=1) {vec4 c=texelFetch(textureSampler,pos+ivec2(x,y),0);cmin=min(cmin,c);cmax=max(cmax,c);}}
h=clamp(h,cmin,cmax);
#endif
gl_FragColor=mix(h,c,factor);}
`;r.ShaderStore.ShadersStore[c]||(r.ShaderStore.ShadersStore[c]=t),e.s(["taaPixelShader",0,{name:c,shader:t}])}]);