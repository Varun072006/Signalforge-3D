(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88314,a=>{"use strict";var r=a.i(47662);let e="shadowMapFragmentSoftTransparentShadow",t=`#if SM_SOFTTRANSPARENTSHADOW==1
if ((bayerDither8(floor(((fragmentInputs.position.xy)%(8.0)))))/64.0>=uniforms.softTransparentShadowSM.x*alpha) {discard;}
#endif
`;r.ShaderStore.IncludesShadersStoreWGSL[e]||(r.ShaderStore.IncludesShadersStoreWGSL[e]=t),a.s(["shadowMapFragmentSoftTransparentShadowWGSL",0,{name:e,shader:t}])}]);