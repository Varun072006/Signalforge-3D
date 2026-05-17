(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,93199,a=>{"use strict";var r=a.i(47662);let e="shadowMapFragmentSoftTransparentShadow",o=`#if SM_SOFTTRANSPARENTSHADOW==1
if ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM.x*alpha) discard;
#endif
`;r.ShaderStore.IncludesShadersStore[e]||(r.ShaderStore.IncludesShadersStore[e]=o),a.s(["shadowMapFragmentSoftTransparentShadow",0,{name:e,shader:o}])}]);