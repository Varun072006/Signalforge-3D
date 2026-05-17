(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,47662,e=>{"use strict";class t{static GetShadersRepository(e=0){return 0===e?t.ShadersRepository:t.ShadersRepositoryWGSL}static GetShadersStore(e=0){return 0===e?t.ShadersStore:t.ShadersStoreWGSL}static GetIncludesShadersStore(e=0){return 0===e?t.IncludesShadersStore:t.IncludesShadersStoreWGSL}}t.ShadersRepository="src/Shaders/",t.ShadersStore={},t.IncludesShadersStore={},t.ShadersRepositoryWGSL="src/ShadersWGSL/",t.ShadersStoreWGSL={},t.IncludesShadersStoreWGSL={},e.s(["ShaderStore",()=>t])},87714,e=>{"use strict";var t=e.i(47662);let r="helperFunctions",a=`const float PI=3.1415926535897932384626433832795;const float TWO_PI=6.283185307179586;const float HALF_PI=1.5707963267948966;const float RECIPROCAL_PI=0.3183098861837907;const float RECIPROCAL_PI2=0.15915494309189535;const float RECIPROCAL_PI4=0.07957747154594767;const float HALF_MIN=5.96046448e-08; 
const float LinearEncodePowerApprox=2.2;const float GammaEncodePowerApprox=1.0/LinearEncodePowerApprox;const vec3 LuminanceEncodeApprox=vec3(0.2126,0.7152,0.0722);const float Epsilon=0.0000001;
#define saturate(x) clamp(x,0.0,1.0)
#define absEps(x) abs(x)+Epsilon
#define maxEps(x) max(x,Epsilon)
#define saturateEps(x) clamp(x,Epsilon,1.0)
mat3 transposeMat3(mat3 inMatrix) {vec3 i0=inMatrix[0];vec3 i1=inMatrix[1];vec3 i2=inMatrix[2];mat3 outMatrix=mat3(
vec3(i0.x,i1.x,i2.x),
vec3(i0.y,i1.y,i2.y),
vec3(i0.z,i1.z,i2.z)
);return outMatrix;}
mat3 inverseMat3(mat3 inMatrix) {float a00=inMatrix[0][0],a01=inMatrix[0][1],a02=inMatrix[0][2];float a10=inMatrix[1][0],a11=inMatrix[1][1],a12=inMatrix[1][2];float a20=inMatrix[2][0],a21=inMatrix[2][1],a22=inMatrix[2][2];float b01=a22*a11-a12*a21;float b11=-a22*a10+a12*a20;float b21=a21*a10-a11*a20;float det=a00*b01+a01*b11+a02*b21;return mat3(b01,(-a22*a01+a02*a21),(a12*a01-a02*a11),
b11,(a22*a00-a02*a20),(-a12*a00+a02*a10),
b21,(-a21*a00+a01*a20),(a11*a00-a01*a10))/det;}
#if USE_EXACT_SRGB_CONVERSIONS
vec3 toLinearSpaceExact(vec3 color)
{vec3 nearZeroSection=0.0773993808*color;vec3 remainingSection=pow(0.947867299*(color+vec3(0.055)),vec3(2.4));
#if defined(WEBGL2) || defined(WEBGPU) || defined(NATIVE)
return mix(remainingSection,nearZeroSection,lessThanEqual(color,vec3(0.04045)));
#else
return
vec3(
color.r<=0.04045 ? nearZeroSection.r : remainingSection.r,
color.g<=0.04045 ? nearZeroSection.g : remainingSection.g,
color.b<=0.04045 ? nearZeroSection.b : remainingSection.b);
#endif
}
vec3 toGammaSpaceExact(vec3 color)
{vec3 nearZeroSection=12.92*color;vec3 remainingSection=1.055*pow(color,vec3(0.41666))-vec3(0.055);
#if defined(WEBGL2) || defined(WEBGPU) || defined(NATIVE)
return mix(remainingSection,nearZeroSection,lessThanEqual(color,vec3(0.0031308)));
#else
return
vec3(
color.r<=0.0031308 ? nearZeroSection.r : remainingSection.r,
color.g<=0.0031308 ? nearZeroSection.g : remainingSection.g,
color.b<=0.0031308 ? nearZeroSection.b : remainingSection.b);
#endif
}
#endif
float toLinearSpace(float color)
{
#if USE_EXACT_SRGB_CONVERSIONS
float nearZeroSection=0.0773993808*color;float remainingSection=pow(0.947867299*(color+0.055),2.4);return color<=0.04045 ? nearZeroSection : remainingSection;
#else
return pow(color,LinearEncodePowerApprox);
#endif
}
vec3 toLinearSpace(vec3 color)
{
#if USE_EXACT_SRGB_CONVERSIONS
return toLinearSpaceExact(color);
#else
return pow(color,vec3(LinearEncodePowerApprox));
#endif
}
vec4 toLinearSpace(vec4 color)
{
#if USE_EXACT_SRGB_CONVERSIONS
return vec4(toLinearSpaceExact(color.rgb),color.a);
#else
return vec4(pow(color.rgb,vec3(LinearEncodePowerApprox)),color.a);
#endif
}
float toGammaSpace(float color)
{
#if USE_EXACT_SRGB_CONVERSIONS
float nearZeroSection=12.92*color;float remainingSection=1.055*pow(color,0.41666)-0.055;return color<=0.0031308 ? nearZeroSection : remainingSection;
#else
return pow(color,GammaEncodePowerApprox);
#endif
}
vec3 toGammaSpace(vec3 color)
{
#if USE_EXACT_SRGB_CONVERSIONS
return toGammaSpaceExact(color);
#else
return pow(color,vec3(GammaEncodePowerApprox));
#endif
}
vec4 toGammaSpace(vec4 color)
{
#if USE_EXACT_SRGB_CONVERSIONS
return vec4(toGammaSpaceExact(color.rgb),color.a);
#else
return vec4(pow(color.rgb,vec3(GammaEncodePowerApprox)),color.a);
#endif
}
float square(float value)
{return value*value;}
vec3 square(vec3 value)
{return value*value;}
float pow5(float value) {float sq=value*value;return sq*sq*value;}
vec3 double_refract(vec3 I,vec3 N,float eta) {vec3 Tfront=refract(I,N,1.0/eta);vec3 Nback=normalize(reflect(N,Tfront));return refract(Tfront,-Nback,eta);}
float getLuminanceUnclamped(vec3 color)
{return dot(color,LuminanceEncodeApprox);}
float getLuminance(vec3 color)
{return saturate(getLuminanceUnclamped(color));}
float getRand(vec2 seed) {return fract(sin(dot(seed.xy ,vec2(12.9898,78.233)))*43758.5453);}
float dither(vec2 seed,float varianceAmount) {float rand=getRand(seed);float normVariance=varianceAmount/255.0;float dither=mix(-normVariance,normVariance,rand);return dither;}
const float rgbdMaxRange=255.;vec4 toRGBD(vec3 color) {float maxRGB=maxEps(max(color.r,max(color.g,color.b)));float D =max(rgbdMaxRange/maxRGB,1.);D =saturate(floor(D)/255.);vec3 rgb=color.rgb*D;rgb=toGammaSpace(rgb);return vec4(saturate(rgb),D);}
vec3 fromRGBD(vec4 rgbd) {rgbd.rgb=toLinearSpace(rgbd.rgb);return rgbd.rgb/rgbd.a;}
vec3 parallaxCorrectNormal( vec3 vertexPos,vec3 origVec,vec3 cubeSize,vec3 cubePos ) {vec3 invOrigVec=vec3(1.)/origVec;vec3 halfSize=cubeSize*0.5;vec3 intersecAtMaxPlane=(cubePos+halfSize-vertexPos)*invOrigVec;vec3 intersecAtMinPlane=(cubePos-halfSize-vertexPos)*invOrigVec;vec3 largestIntersec=max(intersecAtMaxPlane,intersecAtMinPlane);float distance=min(min(largestIntersec.x,largestIntersec.y),largestIntersec.z);vec3 intersectPositionWS=vertexPos+origVec*distance;return intersectPositionWS-cubePos;}
vec3 equirectangularToCubemapDirection(vec2 uv) {float longitude=uv.x*TWO_PI-PI;float latitude=HALF_PI-uv.y*PI;vec3 direction;direction.x=cos(latitude)*sin(longitude);direction.y=sin(latitude);direction.z=cos(latitude)*cos(longitude);return direction;}
float sqrtClamped(float value) {return sqrt(max(value,0.));}
float avg(vec3 value) {return dot(value,vec3(0.333333333));}
#if defined(WEBGL2) || defined(WEBGPU) || defined(NATIVE) 
uint extractBits(uint value,int offset,int width) {return (value>>offset) & ((1u<<width)-1u);}
int onlyBitPosition(uint value) {return (floatBitsToInt(float(value))>>23)-0x7f;}
vec3 singleScatterToMultiScatterAlbedo(vec3 rho_ss) {vec3 s=sqrt(max(vec3(1.0)-rho_ss,vec3(0.0)));return (vec3(1.0)-s)*(vec3(1.0)-vec3(0.139)*s)/(vec3(1.0)+vec3(1.17)*s);}
float min3(vec3 v) {return min(v.x,min(v.y,v.z));}
float max3(vec3 v) {return max(v.x,max(v.y,v.z));}
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},57325,77772,e=>{"use strict";var t=e.i(47662);let r="imageProcessingDeclaration",a=`#ifdef EXPOSURE
uniform float exposureLinear;
#endif
#ifdef CONTRAST
uniform float contrast;
#endif
#if defined(VIGNETTE) || defined(DITHER)
uniform vec2 vInverseScreenSize;
#endif
#ifdef VIGNETTE
uniform vec4 vignetteSettings1;uniform vec4 vignetteSettings2;
#endif
#ifdef COLORCURVES
uniform vec4 vCameraColorCurveNegative;uniform vec4 vCameraColorCurveNeutral;uniform vec4 vCameraColorCurvePositive;
#endif
#ifdef COLORGRADING
#ifdef COLORGRADING3D
uniform highp sampler3D txColorTransform;
#else
uniform sampler2D txColorTransform;
#endif
uniform vec4 colorTransformSettings;
#endif
#ifdef DITHER
uniform float ditherIntensity;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],57325);let i="imageProcessingFunctions",n=`#if defined(COLORGRADING) && !defined(COLORGRADING3D)
/** 
* Polyfill for SAMPLE_TEXTURE_3D,which is unsupported in WebGL.
* sampler3dSetting.x=textureOffset (0.5/textureSize).
* sampler3dSetting.y=textureSize.
*/
#define inline
vec3 sampleTexture3D(sampler2D colorTransform,vec3 color,vec2 sampler3dSetting)
{float sliceSize=2.0*sampler3dSetting.x; 
#ifdef SAMPLER3DGREENDEPTH
float sliceContinuous=(color.g-sampler3dSetting.x)*sampler3dSetting.y;
#else
float sliceContinuous=(color.b-sampler3dSetting.x)*sampler3dSetting.y;
#endif
float sliceInteger=floor(sliceContinuous);float sliceFraction=sliceContinuous-sliceInteger;
#ifdef SAMPLER3DGREENDEPTH
vec2 sliceUV=color.rb;
#else
vec2 sliceUV=color.rg;
#endif
sliceUV.x*=sliceSize;sliceUV.x+=sliceInteger*sliceSize;sliceUV=saturate(sliceUV);vec4 slice0Color=texture2D(colorTransform,sliceUV);sliceUV.x+=sliceSize;sliceUV=saturate(sliceUV);vec4 slice1Color=texture2D(colorTransform,sliceUV);vec3 result=mix(slice0Color.rgb,slice1Color.rgb,sliceFraction);
#ifdef SAMPLER3DBGRMAP
color.rgb=result.rgb;
#else
color.rgb=result.bgr;
#endif
return color;}
#endif
#if TONEMAPPING==3
const float PBRNeutralStartCompression=0.8-0.04;const float PBRNeutralDesaturation=0.15;vec3 PBRNeutralToneMapping( vec3 color ) {float x=min(color.r,min(color.g,color.b));float offset=x<0.08 ? x-6.25*x*x : 0.04;color-=offset;float peak=max(color.r,max(color.g,color.b));if (peak<PBRNeutralStartCompression) return color;float d=1.-PBRNeutralStartCompression;float newPeak=1.-d*d/(peak+d-PBRNeutralStartCompression);color*=newPeak/peak;float g=1.-1./(PBRNeutralDesaturation*(peak-newPeak)+1.);return mix(color,newPeak*vec3(1,1,1),g);}
#endif
#if TONEMAPPING==2
const mat3 ACESInputMat=mat3(
vec3(0.59719,0.07600,0.02840),
vec3(0.35458,0.90834,0.13383),
vec3(0.04823,0.01566,0.83777)
);const mat3 ACESOutputMat=mat3(
vec3( 1.60475,-0.10208,-0.00327),
vec3(-0.53108, 1.10813,-0.07276),
vec3(-0.07367,-0.00605, 1.07602)
);vec3 RRTAndODTFit(vec3 v)
{vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}
vec3 ACESFitted(vec3 color)
{color=ACESInputMat*color;color=RRTAndODTFit(color);color=ACESOutputMat*color;color=saturate(color);return color;}
#endif
#define CUSTOM_IMAGEPROCESSINGFUNCTIONS_DEFINITIONS
vec4 applyImageProcessing(vec4 result) {
#define CUSTOM_IMAGEPROCESSINGFUNCTIONS_UPDATERESULT_ATSTART
#ifdef EXPOSURE
result.rgb*=exposureLinear;
#endif
#ifdef VIGNETTE
vec2 viewportXY=gl_FragCoord.xy*vInverseScreenSize;viewportXY=viewportXY*2.0-1.0;vec3 vignetteXY1=vec3(viewportXY*vignetteSettings1.xy+vignetteSettings1.zw,1.0);float vignetteTerm=dot(vignetteXY1,vignetteXY1);float vignette=pow(vignetteTerm,vignetteSettings2.w);vec3 vignetteColor=vignetteSettings2.rgb;
#ifdef VIGNETTEBLENDMODEMULTIPLY
vec3 vignetteColorMultiplier=mix(vignetteColor,vec3(1,1,1),vignette);result.rgb*=vignetteColorMultiplier;
#endif
#ifdef VIGNETTEBLENDMODEOPAQUE
result.rgb=mix(vignetteColor,result.rgb,vignette);
#endif
#endif
#if TONEMAPPING==3
result.rgb=PBRNeutralToneMapping(result.rgb);
#elif TONEMAPPING==2
result.rgb=ACESFitted(result.rgb);
#elif TONEMAPPING==1
const float tonemappingCalibration=1.590579;result.rgb=1.0-exp2(-tonemappingCalibration*result.rgb);
#endif
result.rgb=toGammaSpace(result.rgb);result.rgb=saturate(result.rgb);
#ifdef CONTRAST
vec3 resultHighContrast=result.rgb*result.rgb*(3.0-2.0*result.rgb);if (contrast<1.0) {result.rgb=mix(vec3(0.5,0.5,0.5),result.rgb,contrast);} else {result.rgb=mix(result.rgb,resultHighContrast,contrast-1.0);}
result.rgb=max(result.rgb,0.);
#endif
#ifdef COLORGRADING
vec3 colorTransformInput=result.rgb*colorTransformSettings.xxx+colorTransformSettings.yyy;
#ifdef COLORGRADING3D
vec3 colorTransformOutput=texture(txColorTransform,colorTransformInput).rgb;
#else
vec3 colorTransformOutput=sampleTexture3D(txColorTransform,colorTransformInput,colorTransformSettings.yz).rgb;
#endif
result.rgb=mix(result.rgb,colorTransformOutput,colorTransformSettings.www);
#endif
#ifdef COLORCURVES
float luma=getLuminance(result.rgb);vec2 curveMix=clamp(vec2(luma*3.0-1.5,luma*-3.0+1.5),vec2(0.0),vec2(1.0));vec4 colorCurve=vCameraColorCurveNeutral+curveMix.x*vCameraColorCurvePositive-curveMix.y*vCameraColorCurveNegative;result.rgb*=colorCurve.rgb;result.rgb=mix(vec3(luma),result.rgb,colorCurve.a);
#endif
#ifdef DITHER
float rand=getRand(gl_FragCoord.xy*vInverseScreenSize);float dither=mix(-ditherIntensity,ditherIntensity,rand);result.rgb=saturate(result.rgb+vec3(dither));
#endif
#define CUSTOM_IMAGEPROCESSINGFUNCTIONS_UPDATERESULT_ATEND
return result;}`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],77772)},49426,e=>{"use strict";var t=e.i(47662);let r="logDepthFragment",a=`#ifdef LOGARITHMICDEPTH
gl_FragDepthEXT=log2(vFragmentDepth)*logarithmicDepthConstant*0.5;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},81239,79939,e=>{"use strict";var t=e.i(47662);let r="clipPlaneFragmentDeclaration",a=`#ifdef CLIPPLANE
varying float fClipDistance;
#endif
#ifdef CLIPPLANE2
varying float fClipDistance2;
#endif
#ifdef CLIPPLANE3
varying float fClipDistance3;
#endif
#ifdef CLIPPLANE4
varying float fClipDistance4;
#endif
#ifdef CLIPPLANE5
varying float fClipDistance5;
#endif
#ifdef CLIPPLANE6
varying float fClipDistance6;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],81239);let i="clipPlaneFragment",n=`#if defined(CLIPPLANE) || defined(CLIPPLANE2) || defined(CLIPPLANE3) || defined(CLIPPLANE4) || defined(CLIPPLANE5) || defined(CLIPPLANE6)
if (false) {}
#endif
#ifdef CLIPPLANE
else if (fClipDistance>0.0)
{discard;}
#endif
#ifdef CLIPPLANE2
else if (fClipDistance2>0.0)
{discard;}
#endif
#ifdef CLIPPLANE3
else if (fClipDistance3>0.0)
{discard;}
#endif
#ifdef CLIPPLANE4
else if (fClipDistance4>0.0)
{discard;}
#endif
#ifdef CLIPPLANE5
else if (fClipDistance5>0.0)
{discard;}
#endif
#ifdef CLIPPLANE6
else if (fClipDistance6>0.0)
{discard;}
#endif
`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],79939)},71154,72079,e=>{"use strict";var t=e.i(47662);let r="fogFragmentDeclaration",a=`#ifdef FOG
#define FOGMODE_NONE 0.
#define FOGMODE_EXP 1.
#define FOGMODE_EXP2 2.
#define FOGMODE_LINEAR 3.
#define E 2.71828
uniform vec4 vFogInfos;uniform vec3 vFogColor;varying vec3 vFogDistance;float CalcFogFactor()
{float fogCoeff=1.0;float fogStart=vFogInfos.y;float fogEnd=vFogInfos.z;float fogDensity=vFogInfos.w;float fogDistance=length(vFogDistance);if (FOGMODE_LINEAR==vFogInfos.x)
{fogCoeff=(fogEnd-fogDistance)/(fogEnd-fogStart);}
else if (FOGMODE_EXP==vFogInfos.x)
{fogCoeff=1.0/pow(E,fogDistance*fogDensity);}
else if (FOGMODE_EXP2==vFogInfos.x)
{fogCoeff=1.0/pow(E,fogDistance*fogDistance*fogDensity*fogDensity);}
return clamp(fogCoeff,0.0,1.0);}
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],71154);let i="fogFragment",n=`#ifdef FOG
float fog=CalcFogFactor();
#ifdef PBR
fog=toLinearSpace(fog);
#endif
color.rgb=mix(vFogColor,color.rgb,fog);
#endif
`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],72079)},80315,e=>{"use strict";var t=e.i(47662);let r="packingFunctions",a=`vec4 pack(float depth)
{const vec4 bit_shift=vec4(255.0*255.0*255.0,255.0*255.0,255.0,1.0);const vec4 bit_mask=vec4(0.0,1.0/255.0,1.0/255.0,1.0/255.0);vec4 res=fract(depth*bit_shift);res-=res.xxyz*bit_mask;return res;}
float unpack(vec4 color)
{const vec4 bit_shift=vec4(1.0/(255.0*255.0*255.0),1.0/(255.0*255.0),1.0/255.0,1.0);return dot(color,bit_shift);}`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},37187,e=>{"use strict";var t=e.i(47662);let r="bumpFragmentMainFunctions",a=`#if defined(BUMP) || defined(CLEARCOAT_BUMP) || defined(ANISOTROPIC) || defined(DETAIL)
#if defined(TANGENT) && defined(NORMAL) 
varying mat3 vTBN;
#endif
#ifdef OBJECTSPACE_NORMALMAP
uniform mat4 normalMatrix;
#if defined(WEBGL2) || defined(WEBGPU)
mat4 toNormalMatrix(mat4 wMatrix)
{mat4 ret=inverse(wMatrix);ret=transpose(ret);ret[0][3]=0.;ret[1][3]=0.;ret[2][3]=0.;ret[3]=vec4(0.,0.,0.,1.);return ret;}
#else
mat4 toNormalMatrix(mat4 m)
{float
a00=m[0][0],a01=m[0][1],a02=m[0][2],a03=m[0][3],
a10=m[1][0],a11=m[1][1],a12=m[1][2],a13=m[1][3],
a20=m[2][0],a21=m[2][1],a22=m[2][2],a23=m[2][3],
a30=m[3][0],a31=m[3][1],a32=m[3][2],a33=m[3][3],
b00=a00*a11-a01*a10,
b01=a00*a12-a02*a10,
b02=a00*a13-a03*a10,
b03=a01*a12-a02*a11,
b04=a01*a13-a03*a11,
b05=a02*a13-a03*a12,
b06=a20*a31-a21*a30,
b07=a20*a32-a22*a30,
b08=a20*a33-a23*a30,
b09=a21*a32-a22*a31,
b10=a21*a33-a23*a31,
b11=a22*a33-a23*a32,
det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;mat4 mi=mat4(
a11*b11-a12*b10+a13*b09,
a02*b10-a01*b11-a03*b09,
a31*b05-a32*b04+a33*b03,
a22*b04-a21*b05-a23*b03,
a12*b08-a10*b11-a13*b07,
a00*b11-a02*b08+a03*b07,
a32*b02-a30*b05-a33*b01,
a20*b05-a22*b02+a23*b01,
a10*b10-a11*b08+a13*b06,
a01*b08-a00*b10-a03*b06,
a30*b04-a31*b02+a33*b00,
a21*b02-a20*b04-a23*b00,
a11*b07-a10*b09-a12*b06,
a00*b09-a01*b07+a02*b06,
a31*b01-a30*b03-a32*b00,
a20*b03-a21*b01+a22*b00)/det;return mat4(mi[0][0],mi[1][0],mi[2][0],mi[3][0],
mi[0][1],mi[1][1],mi[2][1],mi[3][1],
mi[0][2],mi[1][2],mi[2][2],mi[3][2],
mi[0][3],mi[1][3],mi[2][3],mi[3][3]);}
#endif
#endif
vec3 perturbNormalBase(mat3 cotangentFrame,vec3 normal,float scale)
{
#ifdef NORMALXYSCALE
normal=normalize(normal*vec3(scale,scale,1.0));
#endif
return normalize(cotangentFrame*normal);}
vec3 perturbNormal(mat3 cotangentFrame,vec3 textureSample,float scale)
{return perturbNormalBase(cotangentFrame,textureSample*2.0-1.0,scale);}
mat3 cotangent_frame(vec3 normal,vec3 p,vec2 uv,vec2 tangentSpaceParams)
{vec3 dp1=dFdx(p);vec3 dp2=dFdy(p);vec2 duv1=dFdx(uv);vec2 duv2=dFdy(uv);vec3 dp2perp=cross(dp2,normal);vec3 dp1perp=cross(normal,dp1);vec3 tangent=dp2perp*duv1.x+dp1perp*duv2.x;vec3 bitangent=dp2perp*duv1.y+dp1perp*duv2.y;tangent*=tangentSpaceParams.x;bitangent*=tangentSpaceParams.y;float det=max(dot(tangent,tangent),dot(bitangent,bitangent));float invmax=det==0.0 ? 0.0 : inversesqrt(det);return mat3(tangent*invmax,bitangent*invmax,normal);}
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},30550,e=>{"use strict";var t=e.i(47662);let r="samplerFragmentDeclaration",a=`#ifdef _DEFINENAME_
#if _DEFINENAME_DIRECTUV==1
#define v_VARYINGNAME_UV vMainUV1
#elif _DEFINENAME_DIRECTUV==2
#define v_VARYINGNAME_UV vMainUV2
#elif _DEFINENAME_DIRECTUV==3
#define v_VARYINGNAME_UV vMainUV3
#elif _DEFINENAME_DIRECTUV==4
#define v_VARYINGNAME_UV vMainUV4
#elif _DEFINENAME_DIRECTUV==5
#define v_VARYINGNAME_UV vMainUV5
#elif _DEFINENAME_DIRECTUV==6
#define v_VARYINGNAME_UV vMainUV6
#else
varying vec2 v_VARYINGNAME_UV;
#endif
uniform sampler2D _SAMPLERNAME_Sampler;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},610,87126,e=>{"use strict";var t=e.i(47662);e.i(30550);let r="bumpFragmentFunctions",a=`#if defined(BUMP)
#include<samplerFragmentDeclaration>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump,_SAMPLERNAME_,bump)
#endif
#if defined(DETAIL)
#include<samplerFragmentDeclaration>(_DEFINENAME_,DETAIL,_VARYINGNAME_,Detail,_SAMPLERNAME_,detail)
#endif
#if defined(BUMP) && defined(PARALLAX)
const float minSamples=4.;const float maxSamples=15.;const int iMaxSamples=15;vec2 parallaxOcclusion(vec3 vViewDirCoT,vec3 vNormalCoT,vec2 texCoord,float parallaxScale) {float parallaxLimit=length(vViewDirCoT.xy)/vViewDirCoT.z;parallaxLimit*=parallaxScale;vec2 vOffsetDir=normalize(vViewDirCoT.xy);vec2 vMaxOffset=vOffsetDir*parallaxLimit;float numSamples=maxSamples+(dot(vViewDirCoT,vNormalCoT)*(minSamples-maxSamples));float stepSize=1.0/numSamples;float currRayHeight=1.0;vec2 vCurrOffset=vec2(0,0);vec2 vLastOffset=vec2(0,0);float lastSampledHeight=1.0;float currSampledHeight=1.0;bool keepWorking=true;for (int i=0; i<iMaxSamples; i++)
{currSampledHeight=texture2D(bumpSampler,texCoord+vCurrOffset).w;if (!keepWorking)
{}
else if (currSampledHeight>currRayHeight)
{float delta1=currSampledHeight-currRayHeight;float delta2=(currRayHeight+stepSize)-lastSampledHeight;float ratio=delta1/(delta1+delta2);vCurrOffset=(ratio)* vLastOffset+(1.0-ratio)*vCurrOffset;keepWorking=false;}
else
{currRayHeight-=stepSize;vLastOffset=vCurrOffset;
#ifdef PARALLAX_RHS
vCurrOffset-=stepSize*vMaxOffset;
#else
vCurrOffset+=stepSize*vMaxOffset;
#endif
lastSampledHeight=currSampledHeight;}}
return vCurrOffset;}
vec2 parallaxOffset(vec3 viewDir,float heightScale)
{float height=texture2D(bumpSampler,vBumpUV).w;vec2 texCoordOffset=heightScale*viewDir.xy*height;
#ifdef PARALLAX_RHS
return texCoordOffset;
#else
return -texCoordOffset;
#endif
}
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],610);let i="bumpFragment",n=`vec2 uvOffset=vec2(0.0,0.0);
#if defined(BUMP) || defined(PARALLAX) || defined(DETAIL)
#ifdef NORMALXYSCALE
float normalScale=1.0;
#elif defined(BUMP)
float normalScale=vBumpInfos.y;
#else
float normalScale=1.0;
#endif
#if defined(TANGENT) && defined(NORMAL)
mat3 TBN=vTBN;
#elif defined(BUMP)
vec2 TBNUV=gl_FrontFacing ? vBumpUV : -vBumpUV;mat3 TBN=cotangent_frame(normalW*normalScale,vPositionW,TBNUV,vTangentSpaceParams);
#else
vec2 TBNUV=gl_FrontFacing ? vDetailUV : -vDetailUV;mat3 TBN=cotangent_frame(normalW*normalScale,vPositionW,TBNUV,vec2(1.,1.));
#endif
#elif defined(ANISOTROPIC)
#if defined(TANGENT) && defined(NORMAL)
mat3 TBN=vTBN;
#else
vec2 TBNUV=gl_FrontFacing ? vMainUV1 : -vMainUV1;mat3 TBN=cotangent_frame(normalW,vPositionW,TBNUV,vec2(1.,1.));
#endif
#endif
#ifdef PARALLAX
mat3 invTBN=transposeMat3(TBN);
#ifdef PARALLAXOCCLUSION
uvOffset=parallaxOcclusion(invTBN*-viewDirectionW,invTBN*normalW,vBumpUV,vBumpInfos.z);
#else
uvOffset=parallaxOffset(invTBN*viewDirectionW,vBumpInfos.z);
#endif
#endif
#ifdef DETAIL
vec4 detailColor=texture2D(detailSampler,vDetailUV+uvOffset);vec2 detailNormalRG=detailColor.wy*2.0-1.0;float detailNormalB=sqrt(1.-saturate(dot(detailNormalRG,detailNormalRG)));vec3 detailNormal=vec3(detailNormalRG,detailNormalB);
#endif
#ifdef BUMP
#ifdef OBJECTSPACE_NORMALMAP
#define CUSTOM_FRAGMENT_BUMP_FRAGMENT
normalW=normalize(texture2D(bumpSampler,vBumpUV).xyz *2.0-1.0);normalW=normalize(mat3(normalMatrix)*normalW);
#elif !defined(DETAIL)
normalW=perturbNormal(TBN,texture2D(bumpSampler,vBumpUV+uvOffset).xyz,vBumpInfos.y);
#else
vec3 bumpNormal=texture2D(bumpSampler,vBumpUV+uvOffset).xyz*2.0-1.0;
#if DETAIL_NORMALBLENDMETHOD==0 
detailNormal.xy*=vDetailInfos.z;vec3 blendedNormal=normalize(vec3(bumpNormal.xy+detailNormal.xy,bumpNormal.z*detailNormal.z));
#elif DETAIL_NORMALBLENDMETHOD==1 
detailNormal.xy*=vDetailInfos.z;bumpNormal+=vec3(0.0,0.0,1.0);detailNormal*=vec3(-1.0,-1.0,1.0);vec3 blendedNormal=bumpNormal*dot(bumpNormal,detailNormal)/bumpNormal.z-detailNormal;
#endif
normalW=perturbNormalBase(TBN,blendedNormal,vBumpInfos.y);
#endif
#elif defined(DETAIL)
detailNormal.xy*=vDetailInfos.z;normalW=perturbNormalBase(TBN,detailNormal,vDetailInfos.z);
#endif
`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],87126)},99385,e=>{"use strict";var t=e.i(76504),r=e.i(16139),a=e.i(1622),i=e.i(86956),n=e.i(10421),o=e.i(4527),s=e.i(60421),l=e.i(98583);let d=null;async function f(){let t=n.EngineStore.LastCreatedEngine?.createCanvas(100,100)??new OffscreenCanvas(100,100);t instanceof OffscreenCanvas&&o.Logger.Warn("DumpData: OffscreenCanvas will be used for dumping data. This may result in lossy alpha values.");let{ThinEngine:a}=await e.A(18612);if(!a.IsSupported)throw Error("DumpData: No WebGL context available. Cannot dump data.");let i=new a(t,!1,{preserveDrawingBuffer:!0,depth:!1,stencil:!1,alpha:!0,premultipliedAlpha:!1,antialias:!1,failIfMajorPerformanceCaveat:!1});n.EngineStore.Instances.pop(),n.EngineStore.OnEnginesDisposedObservable.add(e=>{i&&e!==i&&!i.isDisposed&&0===n.EngineStore.Instances.length&&h()}),i.getCaps().parallelShaderCompile=void 0;let s=new r.EffectRenderer(i),{passPixelShader:l}=await e.A(20798),d=new r.EffectWrapper({engine:i,name:l.name,fragmentShader:l.shader,samplerNames:["textureSampler"]});return{canvas:t,dumpEngine:{engine:i,renderer:s,wrapper:d}}}async function c(){return d||(d=f()),await d}class m{static async EncodeImageAsync(e,t,r,i,n,o){let s=await c(),l=s.dumpEngine;l.engine.setSize(t,r,!0);let d=l.engine.createRawTexture(e,t,r,5,!1,!n,1);return l.renderer.setViewport(),l.renderer.applyEffectWrapper(l.wrapper),l.wrapper.effect._bindTexture("textureSampler",d),l.renderer.draw(),d.dispose(),await new Promise((e,t)=>{a.Tools.ToBlob(s.canvas,r=>{r?e(r):t(Error("EncodeImageAsync: Failed to convert canvas to blob."))},i,o)})}}(0,t.__decorate)([l.nativeOverride],m,"EncodeImageAsync",null);let u=m.EncodeImageAsync;async function v(e,t,r,a,i="image/png",n,o){let s=new Uint8Array((await r.readPixels(0,0,e,t)).buffer);p(e,t,s,a,i,n,!0,void 0,o)}async function S(e,t,r,n="image/png",l,d=!1,f=!1,c){if(r instanceof Float32Array){let e=new Uint8Array(r.length),t=r.length;for(;t--;){let a=r[t];e[t]=Math.round(255*(0,i.Clamp)(a))}r=e}let u=await m.EncodeImageAsync(r,e,t,n,d,c);void 0!==l&&a.Tools.DownloadBlob(u,l),u.type!==n&&o.Logger.Warn(`DumpData: The requested mimeType '${n}' is not supported. The result has mimeType '${u.type}' instead.`);let v=await u.arrayBuffer();return f?v:`data:${n};base64,${(0,s.EncodeArrayBufferToBase64)(v)}`}function p(e,t,r,a,i="image/png",n,o=!1,s=!1,l){void 0!==n||a||(n=""),S(e,t,r,i,n,o,s,l).then(e=>{a&&a(e)})}function h(){d&&(d?.then(e=>{e.canvas instanceof HTMLCanvasElement&&e.canvas.remove(),e.dumpEngine&&(e.dumpEngine.engine.dispose(),e.dumpEngine.renderer.dispose(),e.dumpEngine.wrapper.dispose())}),d=null)}a.Tools.DumpData=p,a.Tools.DumpDataAsync=S,a.Tools.DumpFramebuffer=v,e.s(["Dispose",()=>h,"DumpData",()=>p,"DumpDataAsync",()=>S,"DumpFramebuffer",()=>v,"DumpTools",0,{DumpData:p,DumpDataAsync:S,DumpFramebuffer:v,Dispose:h},"EncodeImageAsync",0,u])},45224,e=>{"use strict";var t=e.i(47662);let r="logDepthDeclaration",a=`#ifdef LOGARITHMICDEPTH
uniform float logarithmicDepthConstant;varying float vFragmentDepth;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},84972,e=>{"use strict";var t=e.i(47662);let r="sceneUboDeclaration",a=`layout(std140,column_major) uniform;uniform Scene {mat4 viewProjection;
#ifdef MULTIVIEW
mat4 viewProjectionR;
#endif 
mat4 view;mat4 projection;vec4 vEyePosition;};
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},41746,e=>{"use strict";var t=e.i(47662);let r="logDepthVertex",a=`#ifdef LOGARITHMICDEPTH
vFragmentDepth=1.0+gl_Position.w;gl_Position.z=log2(max(0.000001,vFragmentDepth))*logarithmicDepthConstant;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},91999,e=>{"use strict";var t=e.i(47662);let r="fogVertexDeclaration",a=`#ifdef FOG
varying vec3 vFogDistance;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},3011,e=>{"use strict";var t=e.i(47662);let r="fogVertex",a=`#ifdef FOG
vFogDistance=(view*worldPos).xyz;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},59092,34760,e=>{"use strict";var t=e.i(47662);let r="clipPlaneVertexDeclaration",a=`#ifdef CLIPPLANE
uniform vec4 vClipPlane;varying float fClipDistance;
#endif
#ifdef CLIPPLANE2
uniform vec4 vClipPlane2;varying float fClipDistance2;
#endif
#ifdef CLIPPLANE3
uniform vec4 vClipPlane3;varying float fClipDistance3;
#endif
#ifdef CLIPPLANE4
uniform vec4 vClipPlane4;varying float fClipDistance4;
#endif
#ifdef CLIPPLANE5
uniform vec4 vClipPlane5;varying float fClipDistance5;
#endif
#ifdef CLIPPLANE6
uniform vec4 vClipPlane6;varying float fClipDistance6;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],59092);let i="clipPlaneVertex",n=`#ifdef CLIPPLANE
fClipDistance=dot(worldPos,vClipPlane);
#endif
#ifdef CLIPPLANE2
fClipDistance2=dot(worldPos,vClipPlane2);
#endif
#ifdef CLIPPLANE3
fClipDistance3=dot(worldPos,vClipPlane3);
#endif
#ifdef CLIPPLANE4
fClipDistance4=dot(worldPos,vClipPlane4);
#endif
#ifdef CLIPPLANE5
fClipDistance5=dot(worldPos,vClipPlane5);
#endif
#ifdef CLIPPLANE6
fClipDistance6=dot(worldPos,vClipPlane6);
#endif
`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],34760)},68489,58483,32817,59862,2947,e=>{"use strict";var t=e.i(47662);let r="bonesDeclaration",a=`#if NUM_BONE_INFLUENCERS>0
attribute vec4 matricesIndices;attribute vec4 matricesWeights;
#if NUM_BONE_INFLUENCERS>4
attribute vec4 matricesIndicesExtra;attribute vec4 matricesWeightsExtra;
#endif
#ifndef BAKED_VERTEX_ANIMATION_TEXTURE
#ifdef BONETEXTURE
uniform highp sampler2D boneSampler;
#if !defined(WEBGL2) && !defined(WEBGPU)
uniform float boneTextureWidth;
#endif
#else
uniform mat4 mBones[BonesPerMesh];
#endif
#ifdef BONES_VELOCITY_ENABLED
uniform mat4 mPreviousBones[BonesPerMesh];
#endif
#ifdef BONETEXTURE
#define inline
mat4 readMatrixFromRawSampler(sampler2D smp,float index)
{
#if defined(WEBGL2) || defined(WEBGPU)
int offset=int(index) *4; 
vec4 m0=texelFetch(smp,ivec2(offset+0,0),0);vec4 m1=texelFetch(smp,ivec2(offset+1,0),0);vec4 m2=texelFetch(smp,ivec2(offset+2,0),0);vec4 m3=texelFetch(smp,ivec2(offset+3,0),0);return mat4(m0,m1,m2,m3);
#else
float offset=index *4.0;float dx=1.0/boneTextureWidth;vec4 m0=texture2D(smp,vec2(dx*(offset+0.5),0.));vec4 m1=texture2D(smp,vec2(dx*(offset+1.5),0.));vec4 m2=texture2D(smp,vec2(dx*(offset+2.5),0.));vec4 m3=texture2D(smp,vec2(dx*(offset+3.5),0.));return mat4(m0,m1,m2,m3);
#endif
}
#endif
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],68489);let i="bakedVertexAnimationDeclaration",n=`#ifdef BAKED_VERTEX_ANIMATION_TEXTURE
uniform float bakedVertexAnimationTime;
#if !defined(WEBGL2) && !defined(WEBGPU)
uniform vec2 bakedVertexAnimationTextureSizeInverted;
#endif
uniform vec4 bakedVertexAnimationSettings;uniform sampler2D bakedVertexAnimationTexture;
#ifdef INSTANCES
attribute vec4 bakedVertexAnimationSettingsInstanced;
#endif
#define inline
mat4 readMatrixFromRawSamplerVAT(sampler2D smp,float index,float frame)
{
#if defined(WEBGL2) || defined(WEBGPU)
int offset=int(index)*4;int frameUV=int(frame);vec4 m0=texelFetch(smp,ivec2(offset+0,frameUV),0);vec4 m1=texelFetch(smp,ivec2(offset+1,frameUV),0);vec4 m2=texelFetch(smp,ivec2(offset+2,frameUV),0);vec4 m3=texelFetch(smp,ivec2(offset+3,frameUV),0);return mat4(m0,m1,m2,m3);
#else
float offset=index*4.0;float frameUV=(frame+0.5)*bakedVertexAnimationTextureSizeInverted.y;float dx=bakedVertexAnimationTextureSizeInverted.x;vec4 m0=texture2D(smp,vec2(dx*(offset+0.5),frameUV));vec4 m1=texture2D(smp,vec2(dx*(offset+1.5),frameUV));vec4 m2=texture2D(smp,vec2(dx*(offset+2.5),frameUV));vec4 m3=texture2D(smp,vec2(dx*(offset+3.5),frameUV));return mat4(m0,m1,m2,m3);
#endif
}
#endif
`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],58483);let o="instancesVertex",s=`#ifdef INSTANCES
mat4 finalWorld=mat4(world0,world1,world2,world3);
#if defined(PREPASS_VELOCITY) || defined(VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
mat4 finalPreviousWorld=mat4(previousWorld0,previousWorld1,
previousWorld2,previousWorld3);
#endif
#ifdef THIN_INSTANCES
finalWorld=world*finalWorld;
#if defined(PREPASS_VELOCITY) || defined(VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
finalPreviousWorld=previousWorld*finalPreviousWorld;
#endif
#endif
#else
mat4 finalWorld=world;
#if defined(PREPASS_VELOCITY) || defined(VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
mat4 finalPreviousWorld=previousWorld;
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[o]||(t.ShaderStore.IncludesShadersStore[o]=s),e.s([],32817);let l="bonesVertex",d=`#ifndef BAKED_VERTEX_ANIMATION_TEXTURE
#if NUM_BONE_INFLUENCERS>0
mat4 influence;
#ifdef BONETEXTURE
influence=readMatrixFromRawSampler(boneSampler,matricesIndices[0])*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
influence+=readMatrixFromRawSampler(boneSampler,matricesIndices[1])*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
influence+=readMatrixFromRawSampler(boneSampler,matricesIndices[2])*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
influence+=readMatrixFromRawSampler(boneSampler,matricesIndices[3])*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[0])*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[1])*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[2])*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[3])*matricesWeightsExtra[3];
#endif
#else
influence=mBones[int(matricesIndices[0])]*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
influence+=mBones[int(matricesIndices[1])]*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
influence+=mBones[int(matricesIndices[2])]*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
influence+=mBones[int(matricesIndices[3])]*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
influence+=mBones[int(matricesIndicesExtra[0])]*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
influence+=mBones[int(matricesIndicesExtra[1])]*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
influence+=mBones[int(matricesIndicesExtra[2])]*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
influence+=mBones[int(matricesIndicesExtra[3])]*matricesWeightsExtra[3];
#endif
#endif
finalWorld=finalWorld*influence;
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[l]||(t.ShaderStore.IncludesShadersStore[l]=d),e.s([],59862);let f="bakedVertexAnimation",c=`#ifdef BAKED_VERTEX_ANIMATION_TEXTURE
{
#ifdef INSTANCES
#define BVASNAME bakedVertexAnimationSettingsInstanced
#else
#define BVASNAME bakedVertexAnimationSettings
#endif
float VATStartFrame=BVASNAME.x;float VATEndFrame=BVASNAME.y;float VATOffsetFrame=BVASNAME.z;float VATSpeed=BVASNAME.w;float totalFrames=VATEndFrame-VATStartFrame+1.0;float time=bakedVertexAnimationTime*VATSpeed/totalFrames;float frameCorrection=time<1.0 ? 0.0 : 1.0;float numOfFrames=totalFrames-frameCorrection;float VATFrameNum=fract(time)*numOfFrames;VATFrameNum=mod(VATFrameNum+VATOffsetFrame,numOfFrames);VATFrameNum=floor(VATFrameNum);VATFrameNum+=VATStartFrame+frameCorrection;mat4 VATInfluence;VATInfluence=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndices[0],VATFrameNum)*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndices[1],VATFrameNum)*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndices[2],VATFrameNum)*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndices[3],VATFrameNum)*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndicesExtra[0],VATFrameNum)*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndicesExtra[1],VATFrameNum)*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndicesExtra[2],VATFrameNum)*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
VATInfluence+=readMatrixFromRawSamplerVAT(bakedVertexAnimationTexture,matricesIndicesExtra[3],VATFrameNum)*matricesWeightsExtra[3];
#endif
finalWorld=finalWorld*VATInfluence;}
#endif
`;t.ShaderStore.IncludesShadersStore[f]||(t.ShaderStore.IncludesShadersStore[f]=c),e.s([],2947)},8559,e=>{"use strict";var t=e.i(47662);let r="instancesDeclaration",a=`#ifdef INSTANCES
attribute vec4 world0;attribute vec4 world1;attribute vec4 world2;attribute vec4 world3;
#ifdef INSTANCESCOLOR
attribute vec4 instanceColor;
#endif
#if defined(THIN_INSTANCES) && !defined(WORLD_UBO)
uniform mat4 world;
#endif
#if defined(VELOCITY) || defined(PREPASS_VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
attribute vec4 previousWorld0;attribute vec4 previousWorld1;attribute vec4 previousWorld2;attribute vec4 previousWorld3;
#ifdef THIN_INSTANCES
uniform mat4 previousWorld;
#endif
#endif
#else
#if !defined(WORLD_UBO)
uniform mat4 world;
#endif
#if defined(VELOCITY) || defined(PREPASS_VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
uniform mat4 previousWorld;
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},52690,10370,88335,16389,e=>{"use strict";var t=e.i(47662);let r="morphTargetsVertexGlobalDeclaration",a=`#ifdef MORPHTARGETS
uniform float morphTargetInfluences[NUM_MORPH_INFLUENCERS];
#ifdef MORPHTARGETS_TEXTURE 
uniform float morphTargetTextureIndices[NUM_MORPH_INFLUENCERS];uniform vec3 morphTargetTextureInfo;uniform highp sampler2DArray morphTargets;vec3 readVector3FromRawSampler(int targetIndex,float vertexIndex)
{ 
#if defined(WEBGL2) || defined(WEBGPU)
int textureWidth=int(morphTargetTextureInfo.y);int y=int(vertexIndex)/textureWidth;int x=int(vertexIndex) % textureWidth;return texelFetch(morphTargets,ivec3(x,y,int(morphTargetTextureIndices[targetIndex])),0).xyz;
#else
float y=floor(vertexIndex/morphTargetTextureInfo.y);float x=vertexIndex-y*morphTargetTextureInfo.y;vec3 textureUV=vec3((x+0.5)/morphTargetTextureInfo.y,(y+0.5)/morphTargetTextureInfo.z,morphTargetTextureIndices[targetIndex]);return texture(morphTargets,textureUV).xyz;
#endif
}
vec4 readVector4FromRawSampler(int targetIndex,float vertexIndex)
{ 
#if defined(WEBGL2) || defined(WEBGPU)
int textureWidth=int(morphTargetTextureInfo.y);int y=int(vertexIndex)/textureWidth;int x=int(vertexIndex) % textureWidth;return texelFetch(morphTargets,ivec3(x,y,int(morphTargetTextureIndices[targetIndex])),0);
#else
float y=floor(vertexIndex/morphTargetTextureInfo.y);float x=vertexIndex-y*morphTargetTextureInfo.y;vec3 textureUV=vec3((x+0.5)/morphTargetTextureInfo.y,(y+0.5)/morphTargetTextureInfo.z,morphTargetTextureIndices[targetIndex]);return texture(morphTargets,textureUV);
#endif
}
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([],52690);let i="morphTargetsVertexDeclaration",n=`#ifdef MORPHTARGETS
#ifndef MORPHTARGETS_TEXTURE
#ifdef MORPHTARGETS_POSITION
attribute vec3 position{X};
#endif
#ifdef MORPHTARGETS_NORMAL
attribute vec3 normal{X};
#endif
#ifdef MORPHTARGETS_TANGENT
attribute vec3 tangent{X};
#endif
#ifdef MORPHTARGETS_UV
attribute vec2 uv_{X};
#endif
#ifdef MORPHTARGETS_UV2
attribute vec2 uv2_{X};
#endif
#ifdef MORPHTARGETS_COLOR
attribute vec4 color{X};
#endif
#elif {X}==0
uniform float morphTargetCount;
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[i]||(t.ShaderStore.IncludesShadersStore[i]=n),e.s([],10370);let o="morphTargetsVertexGlobal",s=`#ifdef MORPHTARGETS
#ifdef MORPHTARGETS_TEXTURE
float vertexID;
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[o]||(t.ShaderStore.IncludesShadersStore[o]=s),e.s([],88335);let l="morphTargetsVertex",d=`#ifdef MORPHTARGETS
#ifdef MORPHTARGETS_TEXTURE
#if {X}==0
for (int i=0; i<NUM_MORPH_INFLUENCERS; i++) {if (float(i)>=morphTargetCount) break;vertexID=float(gl_VertexID)*morphTargetTextureInfo.x;
#ifdef MORPHTARGETS_POSITION
positionUpdated+=(readVector3FromRawSampler(i,vertexID)-position)*morphTargetInfluences[i];
#endif
#ifdef MORPHTARGETTEXTURE_HASPOSITIONS
vertexID+=1.0;
#endif
#ifdef MORPHTARGETS_NORMAL
normalUpdated+=(readVector3FromRawSampler(i,vertexID) -normal)*morphTargetInfluences[i];
#endif
#ifdef MORPHTARGETTEXTURE_HASNORMALS
vertexID+=1.0;
#endif
#ifdef MORPHTARGETS_UV
uvUpdated+=(readVector3FromRawSampler(i,vertexID).xy-uv)*morphTargetInfluences[i];
#endif
#ifdef MORPHTARGETTEXTURE_HASUVS
vertexID+=1.0;
#endif
#ifdef MORPHTARGETS_TANGENT
tangentUpdated.xyz+=(readVector3FromRawSampler(i,vertexID) -tangent.xyz)*morphTargetInfluences[i];
#endif
#ifdef MORPHTARGETTEXTURE_HASTANGENTS
vertexID+=1.0;
#endif
#ifdef MORPHTARGETS_UV2
uv2Updated+=(readVector3FromRawSampler(i,vertexID).xy-uv2)*morphTargetInfluences[i];
#endif
#ifdef MORPHTARGETTEXTURE_HASUV2S
vertexID+=1.0;
#endif
#ifdef MORPHTARGETS_COLOR
colorUpdated+=(readVector4FromRawSampler(i,vertexID)-color)*morphTargetInfluences[i];
#endif
}
#endif
#else
#ifdef MORPHTARGETS_POSITION
positionUpdated+=(position{X}-position)*morphTargetInfluences[{X}];
#endif
#ifdef MORPHTARGETS_NORMAL
normalUpdated+=(normal{X}-normal)*morphTargetInfluences[{X}];
#endif
#ifdef MORPHTARGETS_TANGENT
tangentUpdated.xyz+=(tangent{X}-tangent.xyz)*morphTargetInfluences[{X}];
#endif
#ifdef MORPHTARGETS_UV
uvUpdated+=(uv_{X}-uv)*morphTargetInfluences[{X}];
#endif
#ifdef MORPHTARGETS_UV2
uv2Updated+=(uv2_{X}-uv2)*morphTargetInfluences[{X}];
#endif
#ifdef MORPHTARGETS_COLOR
colorUpdated+=(color{X}-color)*morphTargetInfluences[{X}];
#endif
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[l]||(t.ShaderStore.IncludesShadersStore[l]=d),e.s([],16389)},76154,e=>{"use strict";var t=e.i(47662);let r="bumpVertex",a=`#if defined(BUMP) || defined(PARALLAX) || defined(CLEARCOAT_BUMP) || defined(ANISOTROPIC)
#if defined(TANGENT) && defined(NORMAL)
vec3 tbnNormal=normalize(normalUpdated);vec3 tbnTangent=normalize(tangentUpdated.xyz);vec3 tbnBitangent=cross(tbnNormal,tbnTangent)*tangentUpdated.w;vTBN=mat3(finalWorld)*mat3(tbnTangent,tbnBitangent,tbnNormal);
#endif
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},83918,e=>{e.v("/_next/static/media/HavokPhysics.9647938c.wasm")},69559,e=>{"use strict";var t=e.i(47662);let r="imageProcessingCompatibility",a=`#ifdef IMAGEPROCESSINGPOSTPROCESS
gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(2.2));
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},28748,e=>{"use strict";var t=e.i(47662);let r="sharpenPixelShader",a=`varying vec2 vUV;uniform sampler2D textureSampler;uniform vec2 screenSize;uniform vec2 sharpnessAmounts;
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{vec2 onePixel=vec2(1.0,1.0)/screenSize;vec4 color=texture2D(textureSampler,vUV);vec4 edgeDetection=texture2D(textureSampler,vUV+onePixel*vec2(0,-1)) +
texture2D(textureSampler,vUV+onePixel*vec2(-1,0)) +
texture2D(textureSampler,vUV+onePixel*vec2(1,0)) +
texture2D(textureSampler,vUV+onePixel*vec2(0,1)) -
color*4.0;gl_FragColor=max(vec4(color.rgb*sharpnessAmounts.y,color.a)-(sharpnessAmounts.x*vec4(edgeDetection.rgb,0)),0.);}`;t.ShaderStore.ShadersStore[r]||(t.ShaderStore.ShadersStore[r]=a),e.s(["sharpenPixelShader",0,{name:r,shader:a}])},81923,e=>{"use strict";var t=e.i(47662);e.i(81239),e.i(80315),e.i(79939);let r="depthPixelShader",a=`#ifdef ALPHATEST
varying vec2 vUV;uniform sampler2D diffuseSampler;
#endif
#include<clipPlaneFragmentDeclaration>
varying float vDepthMetric;
#ifdef PACKED
#include<packingFunctions>
#endif
#ifdef STORE_CAMERASPACE_Z
varying vec4 vViewPos;
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{
#include<clipPlaneFragment>
#ifdef ALPHATEST
if (texture2D(diffuseSampler,vUV).a<0.4)
discard;
#endif
#ifdef STORE_CAMERASPACE_Z
#ifdef PACKED
gl_FragColor=pack(vViewPos.z);
#else
gl_FragColor=vec4(vViewPos.z,0.0,0.0,1.0);
#endif
#else
#ifdef NONLINEARDEPTH
#ifdef PACKED
gl_FragColor=pack(gl_FragCoord.z);
#else
gl_FragColor=vec4(gl_FragCoord.z,0.0,0.0,0.0);
#endif
#else
#ifdef PACKED
gl_FragColor=pack(vDepthMetric);
#else
gl_FragColor=vec4(vDepthMetric,0.0,0.0,1.0);
#endif
#endif
#endif
}`;t.ShaderStore.ShadersStore[r]||(t.ShaderStore.ShadersStore[r]=a),e.s(["depthPixelShader",0,{name:r,shader:a}])},64029,e=>{"use strict";var t=e.i(47662);let r="minmaxReduxPixelShader",a=`varying vUV: vec2f;var textureSampler: texture_2d<f32>;
#if defined(INITIAL)
uniform texSize: vec2f;@fragment
fn main(input: FragmentInputs)->FragmentOutputs {let coord=vec2i(fragmentInputs.vUV*(uniforms.texSize-1.0));let f1=textureLoad(textureSampler,coord,0).r;let f2=textureLoad(textureSampler,coord+vec2i(1,0),0).r;let f3=textureLoad(textureSampler,coord+vec2i(1,1),0).r;let f4=textureLoad(textureSampler,coord+vec2i(0,1),0).r;
#ifdef DEPTH_REDUX
#ifdef VIEW_DEPTH
var minz=3.4e38;if (f1 != 0.0) { minz=f1; }
if (f2 != 0.0) { minz=min(minz,f2); }
if (f3 != 0.0) { minz=min(minz,f3); }
if (f4 != 0.0) { minz=min(minz,f4); }
let maxz=max(max(max(f1,f2),f3),f4);
#else
let minz=min(min(min(f1,f2),f3),f4);let maxz=max(max(max(sign(1.0-f1)*f1,sign(1.0-f2)*f2),sign(1.0-f3)*f3),sign(1.0-f4)*f4);
#endif
#else
let minz=min(min(min(f1,f2),f3),f4);let maxz=max(max(max(f1,f2),f3),f4);
#endif
fragmentOutputs.color=vec4f(minz,maxz,0.,0.);}
#elif defined(MAIN)
uniform texSize: vec2f;@fragment
fn main(input: FragmentInputs)->FragmentOutputs {let coord=vec2i(fragmentInputs.vUV*(uniforms.texSize-1.0));let f1=textureLoad(textureSampler,coord,0).rg;let f2=textureLoad(textureSampler,coord+vec2i(1,0),0).rg;let f3=textureLoad(textureSampler,coord+vec2i(1,1),0).rg;let f4=textureLoad(textureSampler,coord+vec2i(0,1),0).rg;let minz=min(min(min(f1.x,f2.x),f3.x),f4.x);let maxz=max(max(max(f1.y,f2.y),f3.y),f4.y);fragmentOutputs.color=vec4(minz,maxz,0.,0.);}
#elif defined(ONEBEFORELAST)
uniform texSize: vec2i;@fragment
fn main(input: FragmentInputs)->FragmentOutputs {let coord=vec2i(fragmentInputs.vUV*vec2f(uniforms.texSize-1));let f1=textureLoad(textureSampler,coord % uniforms.texSize,0).rg;let f2=textureLoad(textureSampler,(coord+vec2i(1,0)) % uniforms.texSize,0).rg;let f3=textureLoad(textureSampler,(coord+vec2i(1,1)) % uniforms.texSize,0).rg;let f4=textureLoad(textureSampler,(coord+vec2i(0,1)) % uniforms.texSize,0).rg;let minz=min(min(min(f1.x,f2.x),f3.x),f4.x);let maxz=max(max(max(f1.y,f2.y),f3.y),f4.y);fragmentOutputs.color=vec4(minz,maxz,0.,0.);}
#elif defined(LAST)
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=vec4f(0.);if (true) { 
discard;}}
#endif
`;t.ShaderStore.ShadersStoreWGSL[r]||(t.ShaderStore.ShadersStoreWGSL[r]=a),e.s(["minmaxReduxPixelShaderWGSL",0,{name:r,shader:a}])},51419,e=>{"use strict";var t=e.i(47662);let r="minmaxReduxPixelShader",a=`varying vec2 vUV;uniform sampler2D textureSampler;
#if defined(INITIAL)
uniform vec2 texSize;void main(void)
{ivec2 coord=ivec2(vUV*(texSize-1.0));float f1=texelFetch(textureSampler,coord,0).r;float f2=texelFetch(textureSampler,coord+ivec2(1,0),0).r;float f3=texelFetch(textureSampler,coord+ivec2(1,1),0).r;float f4=texelFetch(textureSampler,coord+ivec2(0,1),0).r;
#ifdef DEPTH_REDUX
#ifdef VIEW_DEPTH
float minz=3.4e38;if (f1 != 0.0) { minz=f1; }
if (f2 != 0.0) { minz=min(minz,f2); }
if (f3 != 0.0) { minz=min(minz,f3); }
if (f4 != 0.0) { minz=min(minz,f4); }
float maxz=max(max(max(f1,f2),f3),f4);
#else
float minz=min(min(min(f1,f2),f3),f4);float maxz=max(max(max(sign(1.0-f1)*f1,sign(1.0-f2)*f2),sign(1.0-f3)*f3),sign(1.0-f4)*f4);
#endif
#else
float minz=min(min(min(f1,f2),f3),f4);float maxz=max(max(max(f1,f2),f3),f4);
#endif
glFragColor=vec4(minz,maxz,0.,0.);}
#elif defined(MAIN)
uniform vec2 texSize;void main(void)
{ivec2 coord=ivec2(vUV*(texSize-1.0));vec2 f1=texelFetch(textureSampler,coord,0).rg;vec2 f2=texelFetch(textureSampler,coord+ivec2(1,0),0).rg;vec2 f3=texelFetch(textureSampler,coord+ivec2(1,1),0).rg;vec2 f4=texelFetch(textureSampler,coord+ivec2(0,1),0).rg;float minz=min(min(min(f1.x,f2.x),f3.x),f4.x);float maxz=max(max(max(f1.y,f2.y),f3.y),f4.y);glFragColor=vec4(minz,maxz,0.,0.);}
#elif defined(ONEBEFORELAST)
uniform ivec2 texSize;void main(void)
{ivec2 coord=ivec2(vUV*vec2(texSize-1));vec2 f1=texelFetch(textureSampler,coord % texSize,0).rg;vec2 f2=texelFetch(textureSampler,(coord+ivec2(1,0)) % texSize,0).rg;vec2 f3=texelFetch(textureSampler,(coord+ivec2(1,1)) % texSize,0).rg;vec2 f4=texelFetch(textureSampler,(coord+ivec2(0,1)) % texSize,0).rg;float minz=min(min(min(f1.x,f2.x),f3.x),f4.x);float maxz=max(max(max(f1.y,f2.y),f3.y),f4.y);glFragColor=vec4(minz,maxz,0.,0.);}
#elif defined(LAST)
void main(void)
{glFragColor=vec4(0.);if (true) { 
discard;}}
#endif
`;t.ShaderStore.ShadersStore[r]||(t.ShaderStore.ShadersStore[r]=a),e.s(["minmaxReduxPixelShader",0,{name:r,shader:a}])},90142,e=>{"use strict";var t=e.i(47662);let r="pointCloudVertex",a=`#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.s([])},97913,e=>{"use strict";var t=e.i(47662);e.i(68489),e.i(58483),e.i(52690),e.i(10370),e.i(59092),e.i(8559);let r="pointCloudVertexDeclaration",a=`#ifdef POINTSIZE
uniform float pointSize;
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.i(88335),e.i(16389),e.i(32817),e.i(59862),e.i(2947),e.i(34760),e.i(90142);let i="depthVertexShader",n=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform mat4 viewProjection;uniform vec2 depthValues;
#if defined(ALPHATEST) || defined(NEED_UV)
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#ifdef STORE_CAMERASPACE_Z
uniform mat4 view;varying vec4 vViewPos;
#endif
#include<pointCloudVertexDeclaration>
varying float vDepthMetric;
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);
#include<clipPlaneVertex>
gl_Position=viewProjection*worldPos;
#ifdef STORE_CAMERASPACE_Z
vViewPos=view*worldPos;
#else
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric=((-gl_Position.z+depthValues.x)/(depthValues.y));
#else
vDepthMetric=((gl_Position.z+depthValues.x)/(depthValues.y));
#endif
#endif
#if defined(ALPHATEST) || defined(BASIC_RENDER)
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#include<pointCloudVertex>
}
`;t.ShaderStore.ShadersStore[i]||(t.ShaderStore.ShadersStore[i]=n),e.s(["depthVertexShader",0,{name:i,shader:n}],97913)},89108,e=>{"use strict";var t=e.i(47662);e.i(81239);let r="mrtFragmentDeclaration",a=`#if defined(WEBGL2) || defined(WEBGPU) || defined(NATIVE)
layout(location=0) out vec4 glFragData[{X}];
#endif
`;t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]=a),e.i(37187),e.i(610),e.i(87714),e.i(79939),e.i(87126);let i="geometryPixelShader",n=`#extension GL_EXT_draw_buffers : require
#if defined(BUMP) || !defined(NORMAL)
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
#ifdef BUMP
varying mat4 vWorldView;varying vec3 vNormalW;
#else
varying vec3 vNormalV;
#endif
varying vec4 vViewPos;
#if defined(POSITION) || defined(BUMP)
varying vec3 vPositionW;
#endif
#if defined(VELOCITY) || defined(VELOCITY_LINEAR)
varying vec4 vCurrentPosition;varying vec4 vPreviousPosition;
#endif
#ifdef NEED_UV
varying vec2 vUV;
#endif
#ifdef BUMP
uniform vec3 vBumpInfos;uniform vec2 vTangentSpaceParams;
#endif
#if defined(REFLECTIVITY)
#if defined(ORMTEXTURE) || defined(SPECULARGLOSSINESSTEXTURE) || defined(REFLECTIVITYTEXTURE)
uniform sampler2D reflectivitySampler;varying vec2 vReflectivityUV;
#else
#ifdef METALLIC_TEXTURE
uniform sampler2D metallicSampler;varying vec2 vMetallicUV;
#endif
#ifdef ROUGHNESS_TEXTURE
uniform sampler2D roughnessSampler;varying vec2 vRoughnessUV;
#endif
#endif
#ifdef ALBEDOTEXTURE
varying vec2 vAlbedoUV;uniform sampler2D albedoSampler;
#endif
#ifdef REFLECTIVITYCOLOR
uniform vec3 reflectivityColor;
#endif
#ifdef ALBEDOCOLOR
uniform vec3 albedoColor;
#endif
#ifdef METALLIC
uniform float metallic;
#endif
#if defined(ROUGHNESS) || defined(GLOSSINESS)
uniform float glossiness;
#endif
#endif
#if defined(ALPHATEST) && defined(NEED_UV)
uniform sampler2D diffuseSampler;
#endif
#include<clipPlaneFragmentDeclaration>
#include<mrtFragmentDeclaration>[SCENE_MRT_COUNT]
#include<bumpFragmentMainFunctions>
#include<bumpFragmentFunctions>
#include<helperFunctions>
void main() {
#include<clipPlaneFragment>
#ifdef ALPHATEST
if (texture2D(diffuseSampler,vUV).a<0.4)
discard;
#endif
vec3 normalOutput;
#ifdef BUMP
vec3 normalW=normalize(vNormalW);
#include<bumpFragment>
#ifdef NORMAL_WORLDSPACE
normalOutput=normalW;
#else
normalOutput=normalize(vec3(vWorldView*vec4(normalW,0.0)));
#endif
#elif defined(HAS_NORMAL_ATTRIBUTE)
normalOutput=normalize(vNormalV);
#elif defined(POSITION)
normalOutput=normalize(-cross(dFdx(vPositionW),dFdy(vPositionW)));
#endif
#ifdef ENCODE_NORMAL
normalOutput=normalOutput*0.5+0.5;
#endif
#ifdef DEPTH
gl_FragData[DEPTH_INDEX]=vec4(vViewPos.z/vViewPos.w,0.0,0.0,1.0);
#endif
#ifdef NORMAL
gl_FragData[NORMAL_INDEX]=vec4(normalOutput,1.0);
#endif
#ifdef SCREENSPACE_DEPTH
gl_FragData[SCREENSPACE_DEPTH_INDEX]=vec4(gl_FragCoord.z,0.0,0.0,1.0);
#endif
#ifdef POSITION
gl_FragData[POSITION_INDEX]=vec4(vPositionW,1.0);
#endif
#ifdef VELOCITY
vec2 a=(vCurrentPosition.xy/vCurrentPosition.w)*0.5+0.5;vec2 b=(vPreviousPosition.xy/vPreviousPosition.w)*0.5+0.5;vec2 velocity=abs(a-b);velocity=vec2(pow(velocity.x,1.0/3.0),pow(velocity.y,1.0/3.0))*sign(a-b)*0.5+0.5;gl_FragData[VELOCITY_INDEX]=vec4(velocity,0.0,1.0);
#endif
#ifdef VELOCITY_LINEAR
vec2 velocity=vec2(0.5)*((vPreviousPosition.xy/vPreviousPosition.w) -
(vCurrentPosition.xy/vCurrentPosition.w));gl_FragData[VELOCITY_LINEAR_INDEX]=vec4(velocity,0.0,1.0);
#endif
#ifdef REFLECTIVITY
vec4 reflectivity=vec4(0.0,0.0,0.0,1.0);
#ifdef METALLICWORKFLOW
float metal=1.0;float roughness=1.0;
#ifdef ORMTEXTURE
metal*=texture2D(reflectivitySampler,vReflectivityUV).b;roughness*=texture2D(reflectivitySampler,vReflectivityUV).g;
#else
#ifdef METALLIC_TEXTURE
metal*=texture2D(metallicSampler,vMetallicUV).r;
#endif
#ifdef ROUGHNESS_TEXTURE
roughness*=texture2D(roughnessSampler,vRoughnessUV).r;
#endif
#endif
#ifdef METALLIC
metal*=metallic;
#endif
#ifdef ROUGHNESS
roughness*=(1.0-glossiness); 
#endif
reflectivity.a-=roughness;vec3 color=vec3(1.0);
#ifdef ALBEDOTEXTURE
color=texture2D(albedoSampler,vAlbedoUV).rgb;
#ifdef GAMMAALBEDO
color=toLinearSpace(color);
#endif
#endif
#ifdef ALBEDOCOLOR
color*=albedoColor.xyz;
#endif
reflectivity.rgb=mix(vec3(0.04),color,metal);
#else
#if defined(SPECULARGLOSSINESSTEXTURE) || defined(REFLECTIVITYTEXTURE)
reflectivity=texture2D(reflectivitySampler,vReflectivityUV);
#ifdef GAMMAREFLECTIVITYTEXTURE
reflectivity.rgb=toLinearSpace(reflectivity.rgb);
#endif
#else 
#ifdef REFLECTIVITYCOLOR
reflectivity.rgb=toLinearSpace(reflectivityColor.xyz);reflectivity.a=1.0;
#endif
#endif
#ifdef GLOSSINESSS
reflectivity.a*=glossiness; 
#endif
#endif
gl_FragData[REFLECTIVITY_INDEX]=reflectivity;
#endif
}
`;t.ShaderStore.ShadersStore[i]||(t.ShaderStore.ShadersStore[i]=n),e.s(["geometryPixelShader",0,{name:i,shader:n}],89108)},7751,e=>{"use strict";var t=e.i(47662);e.i(68489),e.i(58483),e.i(52690),e.i(10370),e.i(8559);let r="geometryVertexDeclaration";t.ShaderStore.IncludesShadersStore[r]||(t.ShaderStore.IncludesShadersStore[r]="uniform mat4 viewProjection;uniform mat4 view;"),e.i(84972);let a="geometryUboDeclaration",i=`#include<sceneUboDeclaration>
`;t.ShaderStore.IncludesShadersStore[a]||(t.ShaderStore.IncludesShadersStore[a]=i),e.i(59092),e.i(88335),e.i(16389),e.i(32817),e.i(59862),e.i(2947),e.i(34760),e.i(76154);let n="geometryVertexShader",o=`precision highp float;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
#include<__decl__geometryVertex>
#include<clipPlaneVertexDeclaration>
attribute vec3 position;
#ifdef HAS_NORMAL_ATTRIBUTE
attribute vec3 normal;
#endif
#ifdef NEED_UV
varying vec2 vUV;
#ifdef ALPHATEST
uniform mat4 diffuseMatrix;
#endif
#ifdef BUMP
uniform mat4 bumpMatrix;varying vec2 vBumpUV;
#endif
#ifdef REFLECTIVITY
uniform mat4 reflectivityMatrix;uniform mat4 albedoMatrix;varying vec2 vReflectivityUV;varying vec2 vAlbedoUV;
#endif
#ifdef METALLIC_TEXTURE
varying vec2 vMetallicUV;uniform mat4 metallicMatrix;
#endif
#ifdef ROUGHNESS_TEXTURE
varying vec2 vRoughnessUV;uniform mat4 roughnessMatrix;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#ifdef BUMP
varying mat4 vWorldView;
#endif
#ifdef BUMP
varying vec3 vNormalW;
#else
varying vec3 vNormalV;
#endif
varying vec4 vViewPos;
#if defined(POSITION) || defined(BUMP)
varying vec3 vPositionW;
#endif
#if defined(VELOCITY) || defined(VELOCITY_LINEAR)
uniform mat4 previousViewProjection;varying vec4 vCurrentPosition;varying vec4 vPreviousPosition;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef HAS_NORMAL_ATTRIBUTE
vec3 normalUpdated=normal;
#else
vec3 normalUpdated=vec3(0.0,0.0,0.0);
#endif
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#if (defined(VELOCITY) || defined(VELOCITY_LINEAR)) && !defined(BONES_VELOCITY_ENABLED)
vCurrentPosition=viewProjection*finalWorld*vec4(positionUpdated,1.0);vPreviousPosition=previousViewProjection*finalPreviousWorld*vec4(positionUpdated,1.0);
#endif
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=vec4(finalWorld*vec4(positionUpdated,1.0));
#ifdef BUMP
vWorldView=view*finalWorld;mat3 normalWorld=mat3(finalWorld);vNormalW=normalize(normalWorld*normalUpdated);
#else
#ifdef NORMAL_WORLDSPACE
vNormalV=normalize(vec3(finalWorld*vec4(normalUpdated,0.0)));
#else
vNormalV=normalize(vec3((view*finalWorld)*vec4(normalUpdated,0.0)));
#endif
#endif
vViewPos=view*worldPos;
#if (defined(VELOCITY) || defined(VELOCITY_LINEAR)) && defined(BONES_VELOCITY_ENABLED)
vCurrentPosition=viewProjection*finalWorld*vec4(positionUpdated,1.0);
#if NUM_BONE_INFLUENCERS>0
mat4 previousInfluence;previousInfluence=mPreviousBones[int(matricesIndices[0])]*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
previousInfluence+=mPreviousBones[int(matricesIndices[1])]*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
previousInfluence+=mPreviousBones[int(matricesIndices[2])]*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
previousInfluence+=mPreviousBones[int(matricesIndices[3])]*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[0])]*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[1])]*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[2])]*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
previousInfluence+=mPreviousBones[int(matricesIndicesExtra[3])]*matricesWeightsExtra[3];
#endif
vPreviousPosition=previousViewProjection*finalPreviousWorld*previousInfluence*vec4(positionUpdated,1.0);
#else
vPreviousPosition=previousViewProjection*finalPreviousWorld*vec4(positionUpdated,1.0);
#endif
#endif
#if defined(POSITION) || defined(BUMP)
vPositionW=worldPos.xyz/worldPos.w;
#endif
gl_Position=viewProjection*finalWorld*vec4(positionUpdated,1.0);
#include<clipPlaneVertex>
#ifdef NEED_UV
#ifdef UV1
#if defined(ALPHATEST) && defined(ALPHATEST_UV1)
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#else
vUV=uvUpdated;
#endif
#ifdef BUMP_UV1
vBumpUV=vec2(bumpMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef REFLECTIVITY_UV1
vReflectivityUV=vec2(reflectivityMatrix*vec4(uvUpdated,1.0,0.0));
#else
#ifdef METALLIC_UV1
vMetallicUV=vec2(metallicMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef ROUGHNESS_UV1
vRoughnessUV=vec2(roughnessMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#endif
#ifdef ALBEDO_UV1
vAlbedoUV=vec2(albedoMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#endif
#ifdef UV2
#if defined(ALPHATEST) && defined(ALPHATEST_UV2)
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#else
vUV=uv2Updated;
#endif
#ifdef BUMP_UV2
vBumpUV=vec2(bumpMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#ifdef REFLECTIVITY_UV2
vReflectivityUV=vec2(reflectivityMatrix*vec4(uv2Updated,1.0,0.0));
#else
#ifdef METALLIC_UV2
vMetallicUV=vec2(metallicMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#ifdef ROUGHNESS_UV2
vRoughnessUV=vec2(roughnessMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef ALBEDO_UV2
vAlbedoUV=vec2(albedoMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#endif
#include<bumpVertex>
}
`;t.ShaderStore.ShadersStore[n]||(t.ShaderStore.ShadersStore[n]=o),e.s(["geometryVertexShader",0,{name:n,shader:o}],7751)},92921,e=>{"use strict";var t=e.i(39018);class r{static ConvertPanoramaToCubemap(e,t,r,a,i=!1,n=!0){let o;if(!e)throw"ConvertPanoramaToCubemap: input cannot be null";if(e.length!=t*r*3)if(e.length!=t*r*4)throw"ConvertPanoramaToCubemap: input size is wrong";else o=4;else o=3;return{front:this.CreateCubemapTexture(a,this.FACE_FRONT,e,t,r,i,n,o),back:this.CreateCubemapTexture(a,this.FACE_BACK,e,t,r,i,n,o),left:this.CreateCubemapTexture(a,this.FACE_LEFT,e,t,r,i,n,o),right:this.CreateCubemapTexture(a,this.FACE_RIGHT,e,t,r,i,n,o),up:this.CreateCubemapTexture(a,this.FACE_UP,e,t,r,i,n,o),down:this.CreateCubemapTexture(a,this.FACE_DOWN,e,t,r,i,n,o),size:a,type:1,format:4,gammaSpace:!1}}static CreateCubemapTexture(e,t,r,a,i,n,o,s){let l=new Float32Array(new ArrayBuffer(e*e*12)),d=n?Math.max(1,Math.round(a/4/e)):1,f=1/d,c=f*f,m=t[1].subtract(t[0]).scale(f/e),u=t[3].subtract(t[2]).scale(f/e),v=1/e,S=0;for(let n=0;n<e;n++)for(let p=0;p<d;p++){let p=t[0],h=t[2];for(let t=0;t<e;t++)for(let f=0;f<d;f++){let d=h.subtract(p).scale(S).add(p);d.normalize();let f=this.CalcProjectionSpherical(d,r,a,i,s,o);l[n*e*3+3*t+0]+=f.r*c,l[n*e*3+3*t+1]+=f.g*c,l[n*e*3+3*t+2]+=f.b*c,p=p.add(m),h=h.add(u)}S+=v*f}return l}static CalcProjectionSpherical(e,t,r,a,i,n){let o=Math.atan2(e.z,e.x),s=Math.acos(e.y);for(;o<-Math.PI;)o+=2*Math.PI;for(;o>Math.PI;)o-=2*Math.PI;let l=o/Math.PI,d=s/Math.PI,f=Math.round((l=.5*l+.5)*r);f<0?f=0:f>=r&&(f=r-1);let c=Math.round(d*a);c<0?c=0:c>=a&&(c=a-1);let m=n?a-c-1:c;return{r:t[m*r*i+f*i+0],g:t[m*r*i+f*i+1],b:t[m*r*i+f*i+2]}}}function a(e,t,r,a,i,n){if(i>0){var o;i=(o=i-136)>1023?898846567431158e293*Math.pow(2,o-1023):o<-1074?5e-324*Math.pow(2,o+1074):+Math.pow(2,o),e[n+0]=t*i,e[n+1]=r*i,e[n+2]=a*i}else e[n+0]=0,e[n+1]=0,e[n+2]=0}function i(e,t){let r,a="";for(let i=t;i<e.length-t&&"\n"!=(r=String.fromCharCode(e[i]));i++)a+=r;return a}function n(e){let t=i(e,0);if("#"!=t[0]||"?"!=t[1])throw"Bad HDR Format.";let r=!1,a=!1,n=0;do n+=t.length+1,"FORMAT=32-bit_rle_rgbe"==(t=i(e,n))?a=!0:0==t.length&&(r=!0);while(!r)if(!a)throw"HDR Bad header format, unsupported FORMAT";n+=t.length+1,t=i(e,n);let o=/^-Y (.*) \+X (.*)$/g.exec(t);if(!o||o.length<3)throw"HDR Bad header format, no size";let s=parseInt(o[2]),l=parseInt(o[1]);if(s<8||s>32767)throw"HDR Bad header format, unsupported size";return{height:l,width:s,dataPosition:n+=t.length+1}}function o(e,t,a=!1){let i=new Uint8Array(e),s=n(i),d=l(i,s);return r.ConvertPanoramaToCubemap(d,s.width,s.height,t,a)}function s(e,t){return l(e,t)}function l(e,t){let r,i,n,o,s,l,d,f,c=t.height,m=t.width,u=t.dataPosition,v=new Uint8Array(new ArrayBuffer(4*m)),S=new Float32Array(new ArrayBuffer(t.width*t.height*12));for(;c>0;){if(r=e[u++],i=e[u++],n=e[u++],o=e[u++],2!=r||2!=i||128&n||t.width<8||t.width>32767)return function(e,t){let r,i,n,o=t.height,s=t.width,l=t.dataPosition,d=new Float32Array(new ArrayBuffer(t.width*t.height*12));for(;o>0;){for(n=0;n<t.width;n++)r=e[l++],i=e[l++],a(d,r,i,e[l++],e[l++],(t.height-o)*s*3+3*n);o--}return d}(e,t);if((n<<8|o)!=m)throw"HDR Bad header format, wrong scan line width";for(f=0,l=0;f<4;f++)for(d=(f+1)*m;l<d;)if(r=e[u++],i=e[u++],r>128){if(0==(s=r-128)||s>d-l)throw"HDR Bad Format, bad scanline data (run)";for(;s-- >0;)v[l++]=i}else{if(0==(s=r)||s>d-l)throw"HDR Bad Format, bad scanline data (non-run)";if(v[l++]=i,--s>0)for(let t=0;t<s;t++)v[l++]=e[u++]}for(f=0;f<m;f++)r=v[f],i=v[f+m],a(S,r,i,n=v[f+2*m],o=v[f+3*m],(t.height-c)*m*3+3*f);c--}return S}r.FACE_LEFT=[new t.Vector3(-1,-1,-1),new t.Vector3(1,-1,-1),new t.Vector3(-1,1,-1),new t.Vector3(1,1,-1)],r.FACE_RIGHT=[new t.Vector3(1,-1,1),new t.Vector3(-1,-1,1),new t.Vector3(1,1,1),new t.Vector3(-1,1,1)],r.FACE_FRONT=[new t.Vector3(1,-1,-1),new t.Vector3(1,-1,1),new t.Vector3(1,1,-1),new t.Vector3(1,1,1)],r.FACE_BACK=[new t.Vector3(-1,-1,1),new t.Vector3(-1,-1,-1),new t.Vector3(-1,1,1),new t.Vector3(-1,1,-1)],r.FACE_DOWN=[new t.Vector3(1,1,-1),new t.Vector3(1,1,1),new t.Vector3(-1,1,-1),new t.Vector3(-1,1,1)],r.FACE_UP=[new t.Vector3(-1,-1,-1),new t.Vector3(-1,-1,1),new t.Vector3(1,-1,-1),new t.Vector3(1,-1,1)],e.s(["GetCubeMapTextureData",()=>o,"RGBE_ReadHeader",()=>n,"RGBE_ReadPixels",()=>s],92921)},21981,54434,e=>{"use strict";var t=e.i(86956),r=e.i(4527),a=e.i(95374),i=e.i(42938),n=e.i(71733),o=e.i(90815),s=e.i(23432),l=e.i(16073),d=e.i(3312);function f(e){return e.charCodeAt(0)+(e.charCodeAt(1)<<8)+(e.charCodeAt(2)<<16)+(e.charCodeAt(3)<<24)}l.AbstractEngine.prototype._partialLoadFile=function(e,t,r,a,i=null){this._loadFile(e,e=>{r[t]=e,r._internalCount++,6===r._internalCount&&a(r)},void 0,void 0,!0,(e,t)=>{i&&e&&i(e.status+" "+e.statusText,t)})},l.AbstractEngine.prototype._cascadeLoadFiles=function(e,t,r,a=null){let i=[];i._internalCount=0;for(let e=0;e<6;e++)this._partialLoadFile(r[e],e,i,t,a)},l.AbstractEngine.prototype._cascadeLoadImgs=function(e,t,r,a,i=null,n){let o=[];o._internalCount=0;for(let s=0;s<6;s++)this._partialLoadImg(a[s],s,o,e,t,r,i,n)},l.AbstractEngine.prototype._partialLoadImg=function(e,t,r,a,i,n,l=null,d){let f=(0,s.RandomGUID)();(0,o.LoadImage)(e,e=>{r[t]=e,r._internalCount++,a&&a.removePendingData(f),6===r._internalCount&&n&&n(i,r)},(e,t)=>{a&&a.removePendingData(f),l&&l(e,t)},a?a.offlineProvider:null,d),a&&a.addPendingData(f)},l.AbstractEngine.prototype.createCubeTextureBase=function(e,t,a,i,o=null,s=null,l,f=null,c=!1,m=0,u=0,v=null,S=null,p=null,h=!1,T=null){let E,g,A=v||new n.InternalTexture(this,7);A.isCube=!0,A.url=e,A.generateMipMaps=!i,A._lodGenerationScale=m,A._lodGenerationOffset=u,A._useSRGBBuffer=!!h&&this._caps.supportSRGBBuffers&&(this.version>1||this.isWebGPU||!!i),A!==v&&(A.label=e.substring(0,60)),this._doNotHandleContextLost||(A._extension=f,A._files=a,A._buffer=T);let x=e;this._transformTextureUrl&&!v&&(e=this._transformTextureUrl(e));let C=f??((g=(E=e.split("?")[0]).lastIndexOf("."))>-1?E.substring(g).toLowerCase():""),_=(0,d._GetCompatibleTextureLoader)(C),R=(e,t)=>{A.dispose(),s?s(e,t):e&&r.Logger.Warn(e)},P=(n,s)=>{e===x?n&&R(n.status+" "+n.statusText,s):(r.Logger.Warn(`Failed to load ${e}, falling back to the ${x}`),this.createCubeTextureBase(x,t,a,!!i,o,R,l,f,c,m,u,A,S,p,h,T))};if(_)_.then(r=>{let i=e=>{S&&S(A,e),r.loadCubeData(e,A,c,o,(e,t)=>{R(e,t)})};T?i(T):a&&6===a.length?r.supportCascades?this._cascadeLoadFiles(t,e=>i(e.map(e=>new Uint8Array(e))),a,R):R("Textures type does not support cascades."):this._loadFile(e,e=>i(new Uint8Array(e)),void 0,t?t.offlineProvider||null:void 0,!0,P)});else{if(!a||0===a.length)throw Error("Cannot load cubemap because files were not defined, or the correct loader was not found.");this._cascadeLoadImgs(t,A,(e,t)=>{p&&p(e,t)},a,R)}return this._internalTexturesCache.push(A),A},e.s([],54434);let c=f("DXT1"),m=f("DXT3"),u=f("DXT5"),v=f("DX10");class S{static GetDDSInfo(e){let t=new Int32Array(e.buffer,e.byteOffset,31),r=new Int32Array(e.buffer,e.byteOffset,35),a=1;131072&t[2]&&(a=Math.max(1,t[7]));let i=t[21],n=i===v?r[32]:0,o=0;switch(i){case 113:o=2;break;case 116:o=1;break;case v:if(10===n){o=2;break}2===n&&(o=1)}return{width:t[4],height:t[3],mipmapCount:a,isFourCC:(4&t[20])==4,isRGB:(64&t[20])==64,isLuminance:(131072&t[20])==131072,isCube:(512&t[28])==512,isCompressed:i===c||i===m||i===u,dxgiFormat:n,textureType:o}}static _GetHalfFloatAsFloatRGBAArrayBuffer(e,t,r,a,n,o){let s=new Float32Array(a),l=new Uint16Array(n,r),d=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++){let a=(t+r*e)*4;s[d]=(0,i.FromHalfFloat)(l[a]),s[d+1]=(0,i.FromHalfFloat)(l[a+1]),s[d+2]=(0,i.FromHalfFloat)(l[a+2]),S.StoreLODInAlphaChannel?s[d+3]=o:s[d+3]=(0,i.FromHalfFloat)(l[a+3]),d+=4}return s}static _GetHalfFloatRGBAArrayBuffer(e,t,r,a,n,o){if(S.StoreLODInAlphaChannel){let s=new Uint16Array(a),l=new Uint16Array(n,r),d=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++){let a=(t+r*e)*4;s[d]=l[a],s[d+1]=l[a+1],s[d+2]=l[a+2],s[d+3]=(0,i.ToHalfFloat)(o),d+=4}return s}return new Uint16Array(n,r,a)}static _GetFloatRGBAArrayBuffer(e,t,r,a,i,n){if(S.StoreLODInAlphaChannel){let o=new Float32Array(a),s=new Float32Array(i,r),l=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++){let a=(t+r*e)*4;o[l]=s[a],o[l+1]=s[a+1],o[l+2]=s[a+2],o[l+3]=n,l+=4}return o}return new Float32Array(i,r,a)}static _GetFloatAsHalfFloatRGBAArrayBuffer(e,t,r,a,n,o){let s=new Uint16Array(a),l=new Float32Array(n,r),d=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++)s[d]=(0,i.ToHalfFloat)(l[d]),s[d+1]=(0,i.ToHalfFloat)(l[d+1]),s[d+2]=(0,i.ToHalfFloat)(l[d+2]),S.StoreLODInAlphaChannel?s[d+3]=(0,i.ToHalfFloat)(o):s[d+3]=(0,i.ToHalfFloat)(l[d+3]),d+=4;return s}static _GetFloatAsUIntRGBAArrayBuffer(e,r,a,i,n,o){let s=new Uint8Array(i),l=new Float32Array(n,a),d=0;for(let a=0;a<r;a++)for(let r=0;r<e;r++){let i=(r+a*e)*4;s[d]=255*(0,t.Clamp)(l[i]),s[d+1]=255*(0,t.Clamp)(l[i+1]),s[d+2]=255*(0,t.Clamp)(l[i+2]),S.StoreLODInAlphaChannel?s[d+3]=o:s[d+3]=255*(0,t.Clamp)(l[i+3]),d+=4}return s}static _GetHalfFloatAsUIntRGBAArrayBuffer(e,r,a,n,o,s){let l=new Uint8Array(n),d=new Uint16Array(o,a),f=0;for(let a=0;a<r;a++)for(let r=0;r<e;r++){let n=(r+a*e)*4;l[f]=255*(0,t.Clamp)((0,i.FromHalfFloat)(d[n])),l[f+1]=255*(0,t.Clamp)((0,i.FromHalfFloat)(d[n+1])),l[f+2]=255*(0,t.Clamp)((0,i.FromHalfFloat)(d[n+2])),S.StoreLODInAlphaChannel?l[f+3]=s:l[f+3]=255*(0,t.Clamp)((0,i.FromHalfFloat)(d[n+3])),f+=4}return l}static _GetRGBAArrayBuffer(e,t,r,a,i,n,o,s,l){let d=new Uint8Array(a),f=new Uint8Array(i,r),c=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++){let a=(t+r*e)*4;d[c]=f[a+n],d[c+1]=f[a+o],d[c+2]=f[a+s],d[c+3]=f[a+l],c+=4}return d}static _ExtractLongWordOrder(e){return 0===e||255===e||-0x1000000===e?0:1+S._ExtractLongWordOrder(e>>8)}static _GetRGBArrayBuffer(e,t,r,a,i,n,o,s){let l=new Uint8Array(a),d=new Uint8Array(i,r),f=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++){let a=(t+r*e)*3;l[f]=d[a+n],l[f+1]=d[a+o],l[f+2]=d[a+s],f+=3}return l}static _GetLuminanceArrayBuffer(e,t,r,a,i){let n=new Uint8Array(a),o=new Uint8Array(i,r),s=0;for(let r=0;r<t;r++)for(let t=0;t<e;t++){let a=t+r*e;n[s]=o[a],s++}return n}static UploadDDSLevels(e,t,i,n,o,s,l=-1,d,f=!0){let p,h,T,E=null;n.sphericalPolynomial&&(E=[]);let g=!!e.getCaps().s3tc;t.generateMipMaps=o;let A=new Int32Array(i.buffer,i.byteOffset,31),x,C,_,R=0,P,I=0,b=1;if(0x20534444!==A[0])return void r.Logger.Error("Invalid magic number in DDS header");if(!n.isFourCC&&!n.isRGB&&!n.isLuminance)return void r.Logger.Error("Unsupported format, must contain a FourCC, RGB or LUMINANCE code");if(n.isCompressed&&!g)return void r.Logger.Error("Compressed textures are not supported on this platform.");let U=A[22];P=A[1]+4;let N=!1;if(n.isFourCC)switch(x=A[21]){case c:b=8,I=33777;break;case m:b=16,I=33778;break;case u:b=16,I=33779;break;case 113:N=!0,U=64;break;case 116:N=!0,U=128;break;case v:{P+=20;let e=!1;switch(n.dxgiFormat){case 10:N=!0,U=64,e=!0;break;case 2:N=!0,U=128,e=!0;break;case 88:n.isRGB=!0,n.isFourCC=!1,U=32,e=!0}if(e)break}default:r.Logger.Error(["Unsupported FourCC code:",String.fromCharCode(255&x,x>>8&255,x>>16&255,x>>24&255)]);return}let D=S._ExtractLongWordOrder(A[23]),O=S._ExtractLongWordOrder(A[24]),M=S._ExtractLongWordOrder(A[25]),L=S._ExtractLongWordOrder(A[26]);N&&(I=e._getRGBABufferInternalSizedFormat(n.textureType)),h=1,131072&A[2]&&!1!==o&&(h=Math.max(1,A[7]));let B=d||0,y=e.getCaps();for(let r=B;r<s;r++){for(T=0,C=A[4],_=A[3];T<h;++T){if(-1===l||l===T){let a=-1===l?T:0;if(!n.isCompressed&&n.isFourCC){t.format=5,R=C*_*4;let n=null;if(e._badOS||e._badDesktopOS||!y.textureHalfFloat&&!y.textureFloat)128===U?(n=S._GetFloatAsUIntRGBAArrayBuffer(C,_,i.byteOffset+P,R,i.buffer,a),E&&0==a&&E.push(S._GetFloatRGBAArrayBuffer(C,_,i.byteOffset+P,R,i.buffer,a))):64===U&&(n=S._GetHalfFloatAsUIntRGBAArrayBuffer(C,_,i.byteOffset+P,R,i.buffer,a),E&&0==a&&E.push(S._GetHalfFloatAsFloatRGBAArrayBuffer(C,_,i.byteOffset+P,R,i.buffer,a))),t.type=0;else{let e,r=y.textureFloat&&(f&&y.textureFloatLinearFiltering||!f),o=y.textureHalfFloat&&(f&&y.textureHalfFloatLinearFiltering||!f),s=(128===U||64===U&&!o)&&r?1:(64===U||128===U&&!r)&&o?2:0,l=null;if(128===U)switch(s){case 1:e=S._GetFloatRGBAArrayBuffer,l=null;break;case 2:e=S._GetFloatAsHalfFloatRGBAArrayBuffer,l=S._GetFloatRGBAArrayBuffer;break;case 0:e=S._GetFloatAsUIntRGBAArrayBuffer,l=S._GetFloatRGBAArrayBuffer}else switch(s){case 1:e=S._GetHalfFloatAsFloatRGBAArrayBuffer,l=null;break;case 2:e=S._GetHalfFloatRGBAArrayBuffer,l=S._GetHalfFloatAsFloatRGBAArrayBuffer;break;case 0:e=S._GetHalfFloatAsUIntRGBAArrayBuffer,l=S._GetHalfFloatAsFloatRGBAArrayBuffer}t.type=s,n=e(C,_,i.byteOffset+P,R,i.buffer,a),E&&0==a&&E.push(l?l(C,_,i.byteOffset+P,R,i.buffer,a):n)}n&&e._uploadDataToTextureDirectly(t,n,r,a)}else if(n.isRGB)t.type=0,24===U?(t.format=4,R=C*_*3,p=S._GetRGBArrayBuffer(C,_,i.byteOffset+P,R,i.buffer,D,O,M)):(t.format=5,R=C*_*4,p=S._GetRGBAArrayBuffer(C,_,i.byteOffset+P,R,i.buffer,D,O,M,L)),e._uploadDataToTextureDirectly(t,p,r,a);else if(n.isLuminance){let n=e._getUnpackAlignement(),o=C;R=Math.floor((C+n-1)/n)*n*(_-1)+o,p=S._GetLuminanceArrayBuffer(C,_,i.byteOffset+P,R,i.buffer),t.format=1,t.type=0,e._uploadDataToTextureDirectly(t,p,r,a)}else R=Math.max(4,C)/4*Math.max(4,_)/4*b,p=new Uint8Array(i.buffer,i.byteOffset+P,R),t.type=0,e._uploadCompressedDataToTextureDirectly(t,I,C,_,p,r,a)}P+=U?C*_*(U/8):R,C*=.5,_*=.5,C=Math.max(1,C),_=Math.max(1,_)}if(void 0!==d)break}E&&E.length>0?n.sphericalPolynomial=a.CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial({size:A[4],right:E[0],left:E[1],up:E[2],down:E[3],front:E[4],back:E[5],format:5,type:1,gammaSpace:!1}):n.sphericalPolynomial=void 0}}S.StoreLODInAlphaChannel=!1,e.s(["DDSTools",()=>S],21981)},66382,e=>{"use strict";var t=e.i(22840),r=e.i(21981);class a{constructor(){this.supportCascades=!0}loadCubeData(e,a,i,n){let o,s=a.getEngine(),l=!1,d=1e3;if(Array.isArray(e))for(let t=0;t<e.length;t++){let i=e[t];a.width=(o=r.DDSTools.GetDDSInfo(i)).width,a.height=o.height,l=(o.isRGB||o.isLuminance||o.mipmapCount>1)&&a.generateMipMaps,s._unpackFlipY(o.isCompressed),r.DDSTools.UploadDDSLevels(s,a,i,o,l,6,-1,t),o.isFourCC||1!==o.mipmapCount?d=o.mipmapCount-1:s.generateMipMapsForCubemap(a)}else a.width=(o=r.DDSTools.GetDDSInfo(e)).width,a.height=o.height,i&&(o.sphericalPolynomial=new t.SphericalPolynomial),l=(o.isRGB||o.isLuminance||o.mipmapCount>1)&&a.generateMipMaps,s._unpackFlipY(o.isCompressed),r.DDSTools.UploadDDSLevels(s,a,e,o,l,6),o.isFourCC||1!==o.mipmapCount?d=o.mipmapCount-1:s.generateMipMapsForCubemap(a,!1);s._setCubeMapTextureParams(a,l,d),a.isReady=!0,a.onLoadedObservable.notifyObservers(a),a.onLoadedObservable.clear(),n&&n({isDDS:!0,width:a.width,info:o,data:e,texture:a})}loadData(e,t,a){let i=r.DDSTools.GetDDSInfo(e),n=(i.isRGB||i.isLuminance||i.mipmapCount>1)&&t.generateMipMaps&&Math.max(i.width,i.height)>>i.mipmapCount-1==1;a(i.width,i.height,n,i.isFourCC,()=>{r.DDSTools.UploadDDSLevels(t.getEngine(),t,e,i,n,1)})}}e.s(["_DDSTextureLoader",()=>a])},97374,e=>{"use strict";var t,r,a,i,n,o,s=e.i(4527);class l{constructor(e,t){if(this.data=e,this.isInvalid=!1,!l.IsValid(e)){this.isInvalid=!0,s.Logger.Error("texture missing KTX identifier");return}const r=Uint32Array.BYTES_PER_ELEMENT,a=new DataView(this.data.buffer,this.data.byteOffset+12,13*r),i=0x4030201===a.getUint32(0,!0);if(this.glType=a.getUint32(+r,i),this.glTypeSize=a.getUint32(2*r,i),this.glFormat=a.getUint32(3*r,i),this.glInternalFormat=a.getUint32(4*r,i),this.glBaseInternalFormat=a.getUint32(5*r,i),this.pixelWidth=a.getUint32(6*r,i),this.pixelHeight=a.getUint32(7*r,i),this.pixelDepth=a.getUint32(8*r,i),this.numberOfArrayElements=a.getUint32(9*r,i),this.numberOfFaces=a.getUint32(10*r,i),this.numberOfMipmapLevels=a.getUint32(11*r,i),this.bytesOfKeyValueData=a.getUint32(12*r,i),0!==this.glType){s.Logger.Error("only compressed formats currently supported"),this.isInvalid=!0;return}if(this.numberOfMipmapLevels=Math.max(1,this.numberOfMipmapLevels),0===this.pixelHeight||0!==this.pixelDepth){s.Logger.Error("only 2D textures currently supported"),this.isInvalid=!0;return}if(0!==this.numberOfArrayElements){s.Logger.Error("texture arrays not currently supported"),this.isInvalid=!0;return}if(this.numberOfFaces!==t){s.Logger.Error("number of faces expected"+t+", but found "+this.numberOfFaces),this.isInvalid=!0;return}this.loadType=l.COMPRESSED_2D}uploadLevels(e,t){switch(this.loadType){case l.COMPRESSED_2D:this._upload2DCompressedLevels(e,t);case l.TEX_2D:case l.COMPRESSED_3D:case l.TEX_3D:}}_upload2DCompressedLevels(e,t){let r=l.HEADER_LEN+this.bytesOfKeyValueData,a=this.pixelWidth,i=this.pixelHeight,n=t?this.numberOfMipmapLevels:1;for(let t=0;t<n;t++){let n=new Int32Array(this.data.buffer,this.data.byteOffset+r,1)[0];r+=4;for(let o=0;o<this.numberOfFaces;o++){let s=new Uint8Array(this.data.buffer,this.data.byteOffset+r,n);e.getEngine()._uploadCompressedDataToTextureDirectly(e,e.format,a,i,s,o,t),r+=n,r+=3-(n+3)%4}a=Math.max(1,.5*a),i=Math.max(1,.5*i)}}static IsValid(e){if(e.byteLength>=12){let t=new Uint8Array(e.buffer,e.byteOffset,12);if(171===t[0]&&75===t[1]&&84===t[2]&&88===t[3]&&32===t[4]&&49===t[5]&&49===t[6]&&187===t[7]&&13===t[8]&&10===t[9]&&26===t[10]&&10===t[11])return!0}return!1}}l.HEADER_LEN=64,l.COMPRESSED_2D=0,l.COMPRESSED_3D=1,l.TEX_2D=2,l.TEX_3D=3;class d{constructor(e){this._pendingActions=[],this._workerInfos=e.map(e=>({workerPromise:Promise.resolve(e),idle:!0}))}dispose(){for(let e of this._workerInfos)e.workerPromise.then(e=>{e.terminate()});this._workerInfos.length=0,this._pendingActions.length=0}push(e){this._executeOnIdleWorker(e)||this._pendingActions.push(e)}_executeOnIdleWorker(e){for(let t of this._workerInfos)if(t.idle)return this._execute(t,e),!0;return!1}_execute(e,t){e.idle=!1,e.workerPromise.then(r=>{t(r,()=>{let t=this._pendingActions.shift();t?this._execute(e,t):e.idle=!0})})}}class f extends d{constructor(e,t,r=f.DefaultOptions){super([]),this._maxWorkers=e,this._createWorkerAsync=t,this._options=r}push(e){if(!this._executeOnIdleWorker(e))if(this._workerInfos.length<this._maxWorkers){let t={workerPromise:this._createWorkerAsync(),idle:!1};this._workerInfos.push(t),this._execute(t,e)}else this._pendingActions.push(e)}_execute(e,t){e.timeoutId&&(clearTimeout(e.timeoutId),delete e.timeoutId),super._execute(e,(r,a)=>{t(r,()=>{a(),e.idle&&(e.timeoutId=setTimeout(()=>{e.workerPromise.then(e=>{e.terminate()});let t=this._workerInfos.indexOf(e);-1!==t&&this._workerInfos.splice(t,1)},this._options.idleTimeElapsedBeforeRelease))})})}}f.DefaultOptions={idleTimeElapsedBeforeRelease:1e3};var c=e.i(1622);function m(e,t){let r=t?.jsDecoderModule||KTX2DECODER;e&&(e.wasmBaseUrl&&(r.Transcoder.WasmBaseUrl=e.wasmBaseUrl),e.wasmUASTCToASTC&&(r.LiteTranscoder_UASTC_ASTC.WasmModuleURL=e.wasmUASTCToASTC),e.wasmUASTCToBC7&&(r.LiteTranscoder_UASTC_BC7.WasmModuleURL=e.wasmUASTCToBC7),e.wasmUASTCToRGBA_UNORM&&(r.LiteTranscoder_UASTC_RGBA_UNORM.WasmModuleURL=e.wasmUASTCToRGBA_UNORM),e.wasmUASTCToRGBA_SRGB&&(r.LiteTranscoder_UASTC_RGBA_SRGB.WasmModuleURL=e.wasmUASTCToRGBA_SRGB),e.wasmUASTCToR8_UNORM&&(r.LiteTranscoder_UASTC_R8_UNORM.WasmModuleURL=e.wasmUASTCToR8_UNORM),e.wasmUASTCToRG8_UNORM&&(r.LiteTranscoder_UASTC_RG8_UNORM.WasmModuleURL=e.wasmUASTCToRG8_UNORM),e.jsMSCTranscoder&&(r.MSCTranscoder.JSModuleURL=e.jsMSCTranscoder),e.wasmMSCTranscoder&&(r.MSCTranscoder.WasmModuleURL=e.wasmMSCTranscoder),e.wasmZSTDDecoder&&(r.ZSTDDecoder.WasmModuleURL=e.wasmZSTDDecoder)),t&&(t.wasmUASTCToASTC&&(r.LiteTranscoder_UASTC_ASTC.WasmBinary=t.wasmUASTCToASTC),t.wasmUASTCToBC7&&(r.LiteTranscoder_UASTC_BC7.WasmBinary=t.wasmUASTCToBC7),t.wasmUASTCToRGBA_UNORM&&(r.LiteTranscoder_UASTC_RGBA_UNORM.WasmBinary=t.wasmUASTCToRGBA_UNORM),t.wasmUASTCToRGBA_SRGB&&(r.LiteTranscoder_UASTC_RGBA_SRGB.WasmBinary=t.wasmUASTCToRGBA_SRGB),t.wasmUASTCToR8_UNORM&&(r.LiteTranscoder_UASTC_R8_UNORM.WasmBinary=t.wasmUASTCToR8_UNORM),t.wasmUASTCToRG8_UNORM&&(r.LiteTranscoder_UASTC_RG8_UNORM.WasmBinary=t.wasmUASTCToRG8_UNORM),t.jsMSCTranscoder&&(r.MSCTranscoder.JSModule=t.jsMSCTranscoder),t.wasmMSCTranscoder&&(r.MSCTranscoder.WasmBinary=t.wasmMSCTranscoder),t.wasmZSTDDecoder&&(r.ZSTDDecoder.WasmBinary=t.wasmZSTDDecoder))}function u(e){let t;void 0===e&&"u">typeof KTX2DECODER&&(e=KTX2DECODER),onmessage=r=>{if(r.data)switch(r.data.action){case"init":{let a=r.data.urls;a&&(a.jsDecoderModule&&void 0===e&&(importScripts(a.jsDecoderModule),e=KTX2DECODER),m(a)),r.data.wasmBinaries&&m(void 0,{...r.data.wasmBinaries,jsDecoderModule:e}),t=new e.KTX2Decoder,postMessage({action:"init"});break}case"setDefaultDecoderOptions":e.KTX2Decoder.DefaultDecoderOptions=r.data.options;break;case"decode":t.decode(r.data.data,r.data.caps,r.data.options).then(e=>{let t=[];for(let r=0;r<e.mipmaps.length;++r){let a=e.mipmaps[r];a&&a.data&&t.push(a.data.buffer)}postMessage({action:"decoded",success:!0,decodedData:e},t)}).catch(e=>{postMessage({action:"decoded",success:!1,msg:e})})}}}async function v(e,t,r){return await new Promise((a,i)=>{let n=t=>{e.removeEventListener("error",n),e.removeEventListener("message",o),i(t)},o=t=>{"init"===t.data.action&&(e.removeEventListener("error",n),e.removeEventListener("message",o),a(e))};e.addEventListener("error",n),e.addEventListener("message",o),e.postMessage({action:"init",urls:r,wasmBinaries:t})})}(t=i||(i={}))[t.ETC1S=0]="ETC1S",t[t.UASTC4x4=1]="UASTC4x4",(r=n||(n={}))[r.ASTC_4X4_RGBA=0]="ASTC_4X4_RGBA",r[r.ASTC_4x4_RGBA=0]="ASTC_4x4_RGBA",r[r.BC7_RGBA=1]="BC7_RGBA",r[r.BC3_RGBA=2]="BC3_RGBA",r[r.BC1_RGB=3]="BC1_RGB",r[r.PVRTC1_4_RGBA=4]="PVRTC1_4_RGBA",r[r.PVRTC1_4_RGB=5]="PVRTC1_4_RGB",r[r.ETC2_RGBA=6]="ETC2_RGBA",r[r.ETC1_RGB=7]="ETC1_RGB",r[r.RGBA32=8]="RGBA32",r[r.R8=9]="R8",r[r.RG8=10]="RG8",(a=o||(o={}))[a.COMPRESSED_RGBA_BPTC_UNORM_EXT=36492]="COMPRESSED_RGBA_BPTC_UNORM_EXT",a[a.COMPRESSED_RGBA_ASTC_4X4_KHR=37808]="COMPRESSED_RGBA_ASTC_4X4_KHR",a[a.COMPRESSED_RGB_S3TC_DXT1_EXT=33776]="COMPRESSED_RGB_S3TC_DXT1_EXT",a[a.COMPRESSED_RGBA_S3TC_DXT5_EXT=33779]="COMPRESSED_RGBA_S3TC_DXT5_EXT",a[a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG=35842]="COMPRESSED_RGBA_PVRTC_4BPPV1_IMG",a[a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG=35840]="COMPRESSED_RGB_PVRTC_4BPPV1_IMG",a[a.COMPRESSED_RGBA8_ETC2_EAC=37496]="COMPRESSED_RGBA8_ETC2_EAC",a[a.COMPRESSED_RGB8_ETC2=37492]="COMPRESSED_RGB8_ETC2",a[a.COMPRESSED_RGB_ETC1_WEBGL=36196]="COMPRESSED_RGB_ETC1_WEBGL",a[a.RGBA8Format=32856]="RGBA8Format",a[a.R8Format=33321]="R8Format",a[a.RG8Format=33323]="RG8Format";class S{static GetDefaultNumWorkers(){return"object"==typeof navigator&&navigator.hardwareConcurrency?Math.min(Math.floor(.5*navigator.hardwareConcurrency),4):1}static _Initialize(e){if(S._WorkerPoolPromise||S._DecoderModulePromise)return;let t={wasmBaseUrl:c.Tools.ScriptBaseUrl,jsDecoderModule:c.Tools.GetBabylonScriptURL(this.URLConfig.jsDecoderModule,!0),wasmUASTCToASTC:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToASTC,!0),wasmUASTCToBC7:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToBC7,!0),wasmUASTCToRGBA_UNORM:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_UNORM,!0),wasmUASTCToRGBA_SRGB:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_SRGB,!0),wasmUASTCToR8_UNORM:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToR8_UNORM,!0),wasmUASTCToRG8_UNORM:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRG8_UNORM,!0),jsMSCTranscoder:c.Tools.GetBabylonScriptURL(this.URLConfig.jsMSCTranscoder,!0),wasmMSCTranscoder:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmMSCTranscoder,!0),wasmZSTDDecoder:c.Tools.GetBabylonScriptURL(this.URLConfig.wasmZSTDDecoder,!0)};e&&"function"==typeof Worker&&"u">typeof URL?S._WorkerPoolPromise=new Promise(r=>{let a=`${m}(${u})()`,i=URL.createObjectURL(new Blob([a],{type:"application/javascript"}));r(new f(e,async()=>await v(new Worker(i),void 0,t)))}):void 0===S._KTX2DecoderModule?S._DecoderModulePromise=c.Tools.LoadBabylonScriptAsync(t.jsDecoderModule).then(()=>(S._KTX2DecoderModule=KTX2DECODER,S._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread=!1,S._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread=!0,m(t,S._KTX2DecoderModule),new S._KTX2DecoderModule.KTX2Decoder)):(S._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread=!1,S._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread=!0,S._DecoderModulePromise=Promise.resolve(new S._KTX2DecoderModule.KTX2Decoder))}constructor(e,t=S.DefaultNumWorkers){this._engine=e;const r="object"==typeof t&&t.workerPool||S.WorkerPool;if(r)S._WorkerPoolPromise=Promise.resolve(r);else{"object"==typeof t?S._KTX2DecoderModule=t?.binariesAndModulesContainer?.jsDecoderModule:"u">typeof KTX2DECODER&&(S._KTX2DecoderModule=KTX2DECODER);const e="number"==typeof t?t:t.numWorkers??S.DefaultNumWorkers;S._Initialize(e)}}async _uploadAsync(e,t,r){let a=this._engine.getCaps(),i={astc:!!a.astc,bptc:!!a.bptc,s3tc:!!a.s3tc,pvrtc:!!a.pvrtc,etc2:!!a.etc2,etc1:!!a.etc1};if(S._WorkerPoolPromise){let a=await S._WorkerPoolPromise;return await new Promise((n,o)=>{a.push((a,s)=>{let l=e=>{a.removeEventListener("error",l),a.removeEventListener("message",d),o(e),s()},d=e=>{if("decoded"===e.data.action){if(a.removeEventListener("error",l),a.removeEventListener("message",d),e.data.success)try{this._createTexture(e.data.decodedData,t,r),n()}catch(e){o({message:e})}else o({message:e.data.msg});s()}};a.addEventListener("error",l),a.addEventListener("message",d),a.postMessage({action:"setDefaultDecoderOptions",options:S.DefaultDecoderOptions._getKTX2DecoderOptions()});let f=new Uint8Array(e.byteLength);f.set(new Uint8Array(e.buffer,e.byteOffset,e.byteLength)),a.postMessage({action:"decode",data:f,caps:i,options:r},[f.buffer])})})}if(S._DecoderModulePromise){let r=await S._DecoderModulePromise;return S.DefaultDecoderOptions.isDirty&&(S._KTX2DecoderModule.KTX2Decoder.DefaultDecoderOptions=S.DefaultDecoderOptions._getKTX2DecoderOptions()),await new Promise((i,n)=>{r.decode(e,a).then(e=>{this._createTexture(e,t),i()}).catch(e=>{n({message:e})})})}throw Error("KTX2 decoder module is not available")}_createTexture(e,t,r){this._engine._bindTextureDirectly(3553,t),r&&(r.transcodedFormat=e.transcodedFormat,r.isInGammaSpace=e.isInGammaSpace,r.hasAlpha=e.hasAlpha,r.transcoderName=e.transcoderName);let a=!0;switch(e.transcodedFormat){case 32856:t.type=0,t.format=5;break;case 33321:t.type=0,t.format=6;break;case 33323:t.type=0,t.format=7;break;default:t.format=e.transcodedFormat,a=!1}if(t._gammaSpace=e.isInGammaSpace,t.generateMipMaps=e.mipmaps.length>1,t.width=e.mipmaps[0].width,t.height=e.mipmaps[0].height,e.errors)throw Error("KTX2 container - could not transcode the data. "+e.errors);for(let r=0;r<e.mipmaps.length;++r){let i=e.mipmaps[r];if(!i||!i.data)throw Error("KTX2 container - could not transcode one of the image");a?(t.width=i.width,t.height=i.height,this._engine._uploadDataToTextureDirectly(t,i.data,0,r,void 0,!0)):this._engine._uploadCompressedDataToTextureDirectly(t,e.transcodedFormat,i.width,i.height,i.data,0,r)}t._extension=".ktx2",t.isReady=!0,this._engine._bindTextureDirectly(3553,null)}static IsValid(e){if(e.byteLength>=12){let t=new Uint8Array(e.buffer,e.byteOffset,12);if(171===t[0]&&75===t[1]&&84===t[2]&&88===t[3]&&32===t[4]&&50===t[5]&&48===t[6]&&187===t[7]&&13===t[8]&&10===t[9]&&26===t[10]&&10===t[11])return!0}return!1}}S.URLConfig={jsDecoderModule:"https://cdn.babylonjs.com/babylon.ktx2Decoder.js",wasmUASTCToASTC:null,wasmUASTCToBC7:null,wasmUASTCToRGBA_UNORM:null,wasmUASTCToRGBA_SRGB:null,wasmUASTCToR8_UNORM:null,wasmUASTCToRG8_UNORM:null,jsMSCTranscoder:null,wasmMSCTranscoder:null,wasmZSTDDecoder:null},S.DefaultNumWorkers=S.GetDefaultNumWorkers(),S.DefaultDecoderOptions=new class{constructor(){this._isDirty=!0,this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC=!0,this._ktx2DecoderOptions={}}get isDirty(){return this._isDirty}get useRGBAIfASTCBC7NotAvailableWhenUASTC(){return this._useRGBAIfASTCBC7NotAvailableWhenUASTC}set useRGBAIfASTCBC7NotAvailableWhenUASTC(e){this._useRGBAIfASTCBC7NotAvailableWhenUASTC!==e&&(this._useRGBAIfASTCBC7NotAvailableWhenUASTC=e,this._isDirty=!0)}get useRGBAIfOnlyBC1BC3AvailableWhenUASTC(){return this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC}set useRGBAIfOnlyBC1BC3AvailableWhenUASTC(e){this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC!==e&&(this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC=e,this._isDirty=!0)}get forceRGBA(){return this._forceRGBA}set forceRGBA(e){this._forceRGBA!==e&&(this._forceRGBA=e,this._isDirty=!0)}get forceR8(){return this._forceR8}set forceR8(e){this._forceR8!==e&&(this._forceR8=e,this._isDirty=!0)}get forceRG8(){return this._forceRG8}set forceRG8(e){this._forceRG8!==e&&(this._forceRG8=e,this._isDirty=!0)}get bypassTranscoders(){return this._bypassTranscoders}set bypassTranscoders(e){this._bypassTranscoders!==e&&(this._bypassTranscoders=e,this._isDirty=!0)}_getKTX2DecoderOptions(){if(!this._isDirty)return this._ktx2DecoderOptions;this._isDirty=!1;let e={};return void 0!==this._useRGBAIfASTCBC7NotAvailableWhenUASTC&&(e.useRGBAIfASTCBC7NotAvailableWhenUASTC=this._useRGBAIfASTCBC7NotAvailableWhenUASTC),void 0!==this._forceRGBA&&(e.forceRGBA=this._forceRGBA),void 0!==this._forceR8&&(e.forceR8=this._forceR8),void 0!==this._forceRG8&&(e.forceRG8=this._forceRG8),void 0!==this._bypassTranscoders&&(e.bypassTranscoders=this._bypassTranscoders),this.useRGBAIfOnlyBC1BC3AvailableWhenUASTC&&(e.transcodeFormatDecisionTree={UASTC:{transcodeFormat:[n.BC1_RGB,n.BC3_RGBA],yes:{transcodeFormat:n.RGBA32,engineFormat:32856,roundToMultiple4:!1}}}),this._ktx2DecoderOptions=e,e}};class p{constructor(){this.supportCascades=!1}loadCubeData(e,t,r,a){if(Array.isArray(e))return;t._invertVScale=!t.invertY;let i=t.getEngine(),n=new l(e,6),o=n.numberOfMipmapLevels>1&&t.generateMipMaps;i._unpackFlipY(!0),n.uploadLevels(t,t.generateMipMaps),t.width=n.pixelWidth,t.height=n.pixelHeight,i._setCubeMapTextureParams(t,o,n.numberOfMipmapLevels-1),t.isReady=!0,t.onLoadedObservable.notifyObservers(t),t.onLoadedObservable.clear(),a&&a()}loadData(e,t,r,a){if(l.IsValid(e)){t._invertVScale=!t.invertY;let a=new l(e,1),i=function(e){switch(e){case 35916:return 33776;case 35918:return 33778;case 35919:return 33779;case 37493:return 37492;case 37497:return 37496;case 37495:return 37494;case 37840:return 37808;case 36493:return 36492}return null}(a.glInternalFormat);i?(t.format=i,t._useSRGBBuffer=t.getEngine()._getUseSRGBBuffer(!0,t.generateMipMaps),t._gammaSpace=!0):t.format=a.glInternalFormat,r(a.pixelWidth,a.pixelHeight,t.generateMipMaps,!0,()=>{a.uploadLevels(t,t.generateMipMaps)},a.isInvalid)}else S.IsValid(e)?new S(t.getEngine())._uploadAsync(e,t,a).then(()=>{r(t.width,t.height,t.generateMipMaps,!0,()=>{},!1)},e=>{s.Logger.Warn(`Failed to load KTX2 texture data: ${e.message}`),r(0,0,!1,!1,()=>{},!0)}):(s.Logger.Error("texture missing KTX identifier"),r(0,0,!1,!1,()=>{},!0))}}e.s(["_KTXTextureLoader",()=>p],97374)},39520,e=>{e.v(e=>Promise.resolve().then(()=>e(21981)))},14343,e=>{e.v(t=>Promise.all(["static/chunks/a555efe8a08a9069.js"].map(t=>e.l(t))).then(()=>t(36549)))},21727,e=>{e.v(e=>Promise.resolve().then(()=>e(66382)))},5081,e=>{e.v(t=>Promise.all(["static/chunks/d579d384817bc032.js"].map(t=>e.l(t))).then(()=>t(55316)))},17088,e=>{e.v(e=>Promise.resolve().then(()=>e(33621)))},84687,e=>{e.v(t=>Promise.all(["static/chunks/d3f423e899d34121.js"].map(t=>e.l(t))).then(()=>t(72193)))},5014,e=>{e.v(e=>Promise.resolve().then(()=>e(97374)))},91294,e=>{e.v(t=>Promise.all(["static/chunks/e6377e998294dd42.js"].map(t=>e.l(t))).then(()=>t(61694)))},60150,e=>{e.v(t=>Promise.all(["static/chunks/6df62aef75f940c1.js"].map(t=>e.l(t))).then(()=>t(73753)))},75356,e=>{e.v(t=>Promise.all(["static/chunks/6f5eebed0438cbf5.js"].map(t=>e.l(t))).then(()=>t(77070)))},97532,e=>{e.v(t=>Promise.all(["static/chunks/90cec312109de1d3.js"].map(t=>e.l(t))).then(()=>t(21813)))},54381,e=>{e.v(t=>Promise.all(["static/chunks/1c5791e334519d6a.js"].map(t=>e.l(t))).then(()=>t(7948)))},29785,e=>{e.v(t=>Promise.all(["static/chunks/a370dc878b658538.js"].map(t=>e.l(t))).then(()=>t(87361)))},56277,e=>{e.v(t=>Promise.all(["static/chunks/14d0e1dbd1beef14.js"].map(t=>e.l(t))).then(()=>t(8689)))},38426,e=>{e.v(e=>Promise.resolve().then(()=>e(99385)))},4427,e=>{e.v(t=>Promise.all(["static/chunks/bdad2d1420866707.js"].map(t=>e.l(t))).then(()=>t(90396)))},47921,e=>{e.v(t=>Promise.all(["static/chunks/ae96967834ffa19a.js"].map(t=>e.l(t))).then(()=>t(31329)))},47848,e=>{e.v(e=>Promise.resolve().then(()=>e(40958)))},4688,e=>{e.v(e=>Promise.resolve().then(()=>e(13236)))},80370,e=>{e.v(t=>Promise.all(["static/chunks/381bc23b16b04c35.js"].map(t=>e.l(t))).then(()=>t(85741)))},14423,e=>{e.v(t=>Promise.all(["static/chunks/0ee4a7b0bbcca07b.js"].map(t=>e.l(t))).then(()=>t(75691)))},60468,e=>{e.v(t=>Promise.all(["static/chunks/74c7ddfb91ba62ab.js"].map(t=>e.l(t))).then(()=>t(62176)))},70847,e=>{e.v(t=>Promise.all(["static/chunks/595553e0fb041afc.js"].map(t=>e.l(t))).then(()=>t(51964)))},20953,e=>{e.v(t=>Promise.all(["static/chunks/36c104cc0b8078d6.js"].map(t=>e.l(t))).then(()=>t(52118)))},41025,e=>{e.v(t=>Promise.all(["static/chunks/7e995caaaf324c17.js"].map(t=>e.l(t))).then(()=>t(90512)))},17047,e=>{e.v(t=>Promise.all(["static/chunks/b17f6e52024aff57.js"].map(t=>e.l(t))).then(()=>t(41101)))},72148,e=>{e.v(t=>Promise.all(["static/chunks/1d19093865e2787c.js"].map(t=>e.l(t))).then(()=>t(90480)))},36372,e=>{e.v(t=>Promise.all(["static/chunks/2a1932aee94d490c.js"].map(t=>e.l(t))).then(()=>t(44067)))},83758,e=>{e.v(t=>Promise.all(["static/chunks/fb2c962030bb68b0.js"].map(t=>e.l(t))).then(()=>t(50820)))},7720,e=>{e.v(t=>Promise.all(["static/chunks/4827b76da54fc193.js"].map(t=>e.l(t))).then(()=>t(54737)))},83296,e=>{e.v(t=>Promise.all(["static/chunks/cee20a7fc3268dbf.js"].map(t=>e.l(t))).then(()=>t(55870)))},92078,e=>{e.v(t=>Promise.all(["static/chunks/69d75800f07c2e9a.js"].map(t=>e.l(t))).then(()=>t(98234)))},91153,e=>{e.v(t=>Promise.all(["static/chunks/b708aa3836af8dd6.js"].map(t=>e.l(t))).then(()=>t(49306)))},96660,e=>{e.v(t=>Promise.all(["static/chunks/aa002316ac93df2a.js"].map(t=>e.l(t))).then(()=>t(46182)))},66362,e=>{e.v(t=>Promise.all(["static/chunks/3acd6bdcc87f8090.js"].map(t=>e.l(t))).then(()=>t(88915)))},20798,e=>{e.v(t=>Promise.all(["static/chunks/51b48657cf466095.js"].map(t=>e.l(t))).then(()=>t(42646)))},79832,e=>{e.v(t=>Promise.all(["static/chunks/3e100fec55aaa705.js"].map(t=>e.l(t))).then(()=>t(81499)))},50773,e=>{e.v(t=>Promise.all(["static/chunks/44c9505584773a3c.js"].map(t=>e.l(t))).then(()=>t(34508)))},58375,e=>{e.v(t=>Promise.all(["static/chunks/67d549743be82917.js"].map(t=>e.l(t))).then(()=>t(64284)))},52260,e=>{e.v(t=>Promise.all(["static/chunks/360b7501df7b2974.js"].map(t=>e.l(t))).then(()=>t(18377)))},9625,e=>{e.v(t=>Promise.all(["static/chunks/1e541f17ef849279.js"].map(t=>e.l(t))).then(()=>t(17416)))},81340,e=>{e.v(t=>Promise.all(["static/chunks/7a3439586256d81c.js"].map(t=>e.l(t))).then(()=>t(88587)))},86737,e=>{e.v(t=>Promise.all(["static/chunks/e3c865bf1c78bcc2.js"].map(t=>e.l(t))).then(()=>t(33615)))},23862,e=>{e.v(t=>Promise.all(["static/chunks/691241776c839196.js"].map(t=>e.l(t))).then(()=>t(40167)))},33275,e=>{e.v(t=>Promise.all(["static/chunks/30ea27cb69e4741a.js"].map(t=>e.l(t))).then(()=>t(81174)))},81648,e=>{e.v(t=>Promise.all(["static/chunks/3da012e896bb41ab.js"].map(t=>e.l(t))).then(()=>t(39363)))},93908,e=>{e.v(t=>Promise.all(["static/chunks/559d8a13dcca3eea.js"].map(t=>e.l(t))).then(()=>t(8885)))},69777,e=>{e.v(t=>Promise.all(["static/chunks/b18073f6ab46c1bd.js"].map(t=>e.l(t))).then(()=>t(70181)))},49308,e=>{e.v(t=>Promise.all(["static/chunks/b1efcae71587c732.js"].map(t=>e.l(t))).then(()=>t(12998)))},80,e=>{e.v(t=>Promise.all(["static/chunks/5e02a23de12392c6.js"].map(t=>e.l(t))).then(()=>t(12931)))},54788,e=>{e.v(t=>Promise.all(["static/chunks/80f097279e74ba72.js"].map(t=>e.l(t))).then(()=>t(13743)))},34046,e=>{e.v(t=>Promise.all(["static/chunks/8535a95d60c018ec.js"].map(t=>e.l(t))).then(()=>t(88983)))},94637,e=>{e.v(t=>Promise.all(["static/chunks/75c825e955be8ac8.js","static/chunks/d552e3ae66c50129.js"].map(t=>e.l(t))).then(()=>t(4733)))},63409,e=>{e.v(t=>Promise.all(["static/chunks/1fb80584f2fcf9dd.js"].map(t=>e.l(t))).then(()=>t(87873)))},96551,e=>{e.v(t=>Promise.all(["static/chunks/18b1ff9ee100c7f1.js","static/chunks/2144db703b5c0610.js"].map(t=>e.l(t))).then(()=>t(54229)))},74724,e=>{e.v(t=>Promise.all(["static/chunks/092ca228f246cfd1.js"].map(t=>e.l(t))).then(()=>t(24588)))},94164,e=>{e.v(t=>Promise.all(["static/chunks/5301a4dd58196bfe.js"].map(t=>e.l(t))).then(()=>t(90919)))},39545,e=>{e.v(t=>Promise.all(["static/chunks/1f07106708a82771.js"].map(t=>e.l(t))).then(()=>t(43291)))},28216,e=>{e.v(t=>Promise.all(["static/chunks/a6805f9ba5cb8dc6.js"].map(t=>e.l(t))).then(()=>t(88395)))},9150,e=>{e.v(t=>Promise.all(["static/chunks/85518d3729487db6.js"].map(t=>e.l(t))).then(()=>t(91473)))},90286,e=>{e.v(t=>Promise.all(["static/chunks/3aa633c82c291f61.js","static/chunks/f98e6934cc458d8b.js","static/chunks/339e9f874e230043.js"].map(t=>e.l(t))).then(()=>t(48721)))},94244,e=>{e.v(t=>Promise.all(["static/chunks/15723495cadc58b3.js"].map(t=>e.l(t))).then(()=>t(68446)))},54172,e=>{e.v(t=>Promise.all(["static/chunks/53e74d2366cdffd5.js","static/chunks/0bb20aa5ecca290b.js","static/chunks/f2ccb2d0b908e1e7.js"].map(t=>e.l(t))).then(()=>t(5285)))},35832,e=>{e.v(t=>Promise.all(["static/chunks/fdd21f2c94d39c3f.js"].map(t=>e.l(t))).then(()=>t(36442)))},5246,e=>{e.v(t=>Promise.all(["static/chunks/05b36b574e44572e.js"].map(t=>e.l(t))).then(()=>t(33150)))},44583,e=>{e.v(t=>Promise.all(["static/chunks/85609c4a84676e1d.js"].map(t=>e.l(t))).then(()=>t(59633)))},36018,e=>{e.v(t=>Promise.all(["static/chunks/16ac84c3ddb76219.js"].map(t=>e.l(t))).then(()=>t(98137)))},26574,e=>{e.v(t=>Promise.all(["static/chunks/018f1ff2755b9041.js"].map(t=>e.l(t))).then(()=>t(75036)))},86001,e=>{e.v(t=>Promise.all(["static/chunks/85cfcc9dfbcd18dd.js","static/chunks/e4bf91febc85c3c5.js"].map(t=>e.l(t))).then(()=>t(35142)))},56595,e=>{e.v(t=>Promise.all(["static/chunks/0c43ff8d004935c5.js"].map(t=>e.l(t))).then(()=>t(30444)))},73039,e=>{e.v(t=>Promise.all(["static/chunks/7fddda69ea94a74c.js","static/chunks/b6a8e6d4e0225457.js"].map(t=>e.l(t))).then(()=>t(11238)))},3762,e=>{e.v(t=>Promise.all(["static/chunks/bcbc609a84844352.js"].map(t=>e.l(t))).then(()=>t(45841)))},78693,e=>{e.v(t=>Promise.all(["static/chunks/7556e27966dd87b5.js"].map(t=>e.l(t))).then(()=>t(92242)))},18612,e=>{e.v(e=>Promise.resolve().then(()=>e(47902)))},72769,e=>{e.v(t=>Promise.all(["static/chunks/1185ae551d37574f.js"].map(t=>e.l(t))).then(()=>t(98846)))},16752,e=>{e.v(t=>Promise.all(["static/chunks/449335e2ef7d1818.js"].map(t=>e.l(t))).then(()=>t(12730)))},9454,e=>{e.v(t=>Promise.all(["static/chunks/201fa04a8e49a2c2.js"].map(t=>e.l(t))).then(()=>t(62610)))},25636,e=>{e.v(t=>Promise.all(["static/chunks/0941438b19c1ba64.js"].map(t=>e.l(t))).then(()=>t(93199)))},64258,e=>{e.v(t=>Promise.all(["static/chunks/9aa669d38a96725a.js"].map(t=>e.l(t))).then(()=>t(96960)))},18250,e=>{e.v(t=>Promise.all(["static/chunks/17e6f3cfbbf3583d.js"].map(t=>e.l(t))).then(()=>t(48066)))},20494,e=>{e.v(t=>Promise.all(["static/chunks/7d7d413810cf44e6.js"].map(t=>e.l(t))).then(()=>t(75002)))},80264,e=>{e.v(t=>Promise.all(["static/chunks/4abb411355c5f5de.js"].map(t=>e.l(t))).then(()=>t(88314)))},65145,e=>{e.v(e=>Promise.resolve().then(()=>e(97913)))},87365,e=>{e.v(e=>Promise.resolve().then(()=>e(81923)))},34123,e=>{e.v(t=>Promise.all(["static/chunks/bc08b243725d27dc.js"].map(t=>e.l(t))).then(()=>t(56224)))},10227,e=>{e.v(t=>Promise.all(["static/chunks/adeb5b22e7425c6f.js"].map(t=>e.l(t))).then(()=>t(73761)))},7087,e=>{e.v(e=>Promise.resolve().then(()=>e(51419)))},65473,e=>{e.v(e=>Promise.resolve().then(()=>e(64029)))},93443,e=>{e.v(t=>Promise.all(["static/chunks/a5502b8b9feec041.js"].map(t=>e.l(t))).then(()=>t(83645)))},58910,e=>{e.v(t=>Promise.all(["static/chunks/a992b92e7712beb4.js"].map(t=>e.l(t))).then(()=>t(62222)))},3868,e=>{e.v(e=>Promise.resolve().then(()=>e(7751)))},11418,e=>{e.v(e=>Promise.resolve().then(()=>e(89108)))},72440,e=>{e.v(t=>Promise.all(["static/chunks/bab91122295504ac.js"].map(t=>e.l(t))).then(()=>t(38141)))},41600,e=>{e.v(t=>Promise.all(["static/chunks/9856b8f07926e7b6.js"].map(t=>e.l(t))).then(()=>t(87268)))},98369,e=>{e.v(t=>Promise.all(["static/chunks/1359ed8be09e8477.js"].map(t=>e.l(t))).then(()=>t(26542)))},29008,e=>{e.v(t=>Promise.all(["static/chunks/2b81bded9d345abe.js"].map(t=>e.l(t))).then(()=>t(7495)))},24662,e=>{e.v(t=>Promise.all(["static/chunks/2defd1e5a3496410.js"].map(t=>e.l(t))).then(()=>t(13387)))},56597,e=>{e.v(t=>Promise.all(["static/chunks/93e838f05a8f9e98.js"].map(t=>e.l(t))).then(()=>t(78714)))},63783,e=>{e.v(t=>Promise.all(["static/chunks/ae02bcd0366c8b71.js"].map(t=>e.l(t))).then(()=>t(2661)))},79325,e=>{e.v(t=>Promise.all(["static/chunks/3e3955d808ac0c44.js"].map(t=>e.l(t))).then(()=>t(33952)))},78779,e=>{e.v(t=>Promise.all(["static/chunks/6d86f3f80332055f.js"].map(t=>e.l(t))).then(()=>t(35779)))},59643,e=>{e.v(t=>Promise.all(["static/chunks/480cec464536ddc4.js"].map(t=>e.l(t))).then(()=>t(63800)))},98615,e=>{e.v(t=>Promise.all(["static/chunks/f5d36a5225bd50e2.js"].map(t=>e.l(t))).then(()=>t(55334)))},53009,e=>{e.v(t=>Promise.all(["static/chunks/987e9fdd90b7d578.js"].map(t=>e.l(t))).then(()=>t(74324)))},88372,e=>{e.v(t=>Promise.all(["static/chunks/f1b94ff79a89a33d.js"].map(t=>e.l(t))).then(()=>t(2430)))},79860,e=>{e.v(t=>Promise.all(["static/chunks/af89b91dfde97deb.js"].map(t=>e.l(t))).then(()=>t(82850)))},44350,e=>{e.v(t=>Promise.all(["static/chunks/e9b95f6e49a6459a.js"].map(t=>e.l(t))).then(()=>t(85671)))},3829,e=>{e.v(t=>Promise.all(["static/chunks/3231edeb1aab179a.js"].map(t=>e.l(t))).then(()=>t(69853)))},2763,e=>{e.v(t=>Promise.all(["static/chunks/e00ce8aec780ab5a.js"].map(t=>e.l(t))).then(()=>t(28277)))},44550,e=>{e.v(t=>Promise.all(["static/chunks/aaf6cfd7f3cc4f0e.js"].map(t=>e.l(t))).then(()=>t(25251)))},4001,e=>{e.v(t=>Promise.all(["static/chunks/c4bd2d7c67b245ed.js"].map(t=>e.l(t))).then(()=>t(10952)))},63324,e=>{e.v(t=>Promise.all(["static/chunks/420af0dc2a21e785.js"].map(t=>e.l(t))).then(()=>t(37827)))},16530,e=>{e.v(t=>Promise.all(["static/chunks/2d6f758b0de3ef6e.js"].map(t=>e.l(t))).then(()=>t(62725)))},3145,e=>{e.v(t=>Promise.all(["static/chunks/877dbad3c033d26e.js"].map(t=>e.l(t))).then(()=>t(7822)))},89269,e=>{e.v(t=>Promise.all(["static/chunks/20d67e87ad0b1414.js"].map(t=>e.l(t))).then(()=>t(26515)))},33217,e=>{e.v(t=>Promise.all(["static/chunks/b49311d398126507.js"].map(t=>e.l(t))).then(()=>t(42767)))},32970,e=>{e.v(t=>Promise.all(["static/chunks/ed6e749d2d0816a8.js"].map(t=>e.l(t))).then(()=>t(41766)))},89331,e=>{e.v(t=>Promise.all(["static/chunks/53fc4e71a98eaca8.js"].map(t=>e.l(t))).then(()=>t(73504)))},96358,e=>{e.v(e=>Promise.resolve().then(()=>e(28748)))},69197,e=>{e.v(t=>Promise.all(["static/chunks/de2d6d22177adaf7.js"].map(t=>e.l(t))).then(()=>t(77464)))},60128,e=>{e.v(t=>Promise.all(["static/chunks/08fa8b2e5b41a7ae.js"].map(t=>e.l(t))).then(()=>t(71057)))},83755,e=>{e.v(t=>Promise.all(["static/chunks/1288b11f101dd2be.js"].map(t=>e.l(t))).then(()=>t(59592)))},4852,e=>{e.v(t=>Promise.all(["static/chunks/1883e3bb801d2725.js"].map(t=>e.l(t))).then(()=>t(51032)))},79558,e=>{e.v(t=>Promise.all(["static/chunks/ec81f9d2e859c915.js"].map(t=>e.l(t))).then(()=>t(24048)))},99812,e=>{e.v(t=>Promise.all(["static/chunks/29275921f3e15f6b.js"].map(t=>e.l(t))).then(()=>t(30409)))},56303,e=>{e.v(t=>Promise.all(["static/chunks/855e2a20e6f7a159.js"].map(t=>e.l(t))).then(()=>t(98551)))},14594,e=>{e.v(t=>Promise.all(["static/chunks/8f101a93612318a2.js"].map(t=>e.l(t))).then(()=>t(93359)))},80914,e=>{e.v(t=>Promise.all(["static/chunks/95c2ceb6507e74bc.js"].map(t=>e.l(t))).then(()=>t(46270)))},23790,e=>{e.v(t=>Promise.all(["static/chunks/b64c136329f7b3ed.js"].map(t=>e.l(t))).then(()=>t(32712)))},71073,e=>{e.v(t=>Promise.all(["static/chunks/e98d3fe881269043.js"].map(t=>e.l(t))).then(()=>t(32992)))},26134,e=>{e.v(t=>Promise.all(["static/chunks/1a7e0017e30b05cb.js"].map(t=>e.l(t))).then(()=>t(28183)))},80509,e=>{e.v(t=>Promise.all(["static/chunks/ed9aa9fb587559ff.js"].map(t=>e.l(t))).then(()=>t(24335)))},48038,e=>{e.v(t=>Promise.all(["static/chunks/fa0f184ae9f26bbe.js"].map(t=>e.l(t))).then(()=>t(88955)))},64878,e=>{e.v(t=>Promise.all(["static/chunks/d618d48e3db1f95a.js"].map(t=>e.l(t))).then(()=>t(44383)))},24842,e=>{e.v(t=>Promise.all(["static/chunks/4b81ce936aedbacb.js"].map(t=>e.l(t))).then(()=>t(16121)))},67178,e=>{e.v(t=>Promise.all(["static/chunks/4be15e815362dc63.js"].map(t=>e.l(t))).then(()=>t(30967)))},55788,e=>{e.v(t=>Promise.all(["static/chunks/1d318a0ee593007e.js"].map(t=>e.l(t))).then(()=>t(84383)))},78703,e=>{e.v(t=>Promise.all(["static/chunks/5e1f3c5484741867.js"].map(t=>e.l(t))).then(()=>t(2541)))},68865,e=>{e.v(t=>Promise.all(["static/chunks/763244e04fdc180d.js"].map(t=>e.l(t))).then(()=>t(30885)))},83347,e=>{e.v(t=>Promise.all(["static/chunks/bcf598ec42b6caa3.js"].map(t=>e.l(t))).then(()=>t(60723)))},56044,e=>{e.v(t=>Promise.all(["static/chunks/30366eb0a3abaf97.js"].map(t=>e.l(t))).then(()=>t(45761)))},14009,e=>{e.v(t=>Promise.all(["static/chunks/c8ec5000ec7730e0.js"].map(t=>e.l(t))).then(()=>t(73502)))},886,e=>{e.v(t=>Promise.all(["static/chunks/85427ea57d60330b.js"].map(t=>e.l(t))).then(()=>t(34228)))},5121,e=>{e.v(t=>Promise.all(["static/chunks/51bb9a4e6ab15d8e.js"].map(t=>e.l(t))).then(()=>t(56216)))}]);