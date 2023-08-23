import { mat4 } from "gl-matrix";
import { Program } from "../../Program";
import { GLCamera } from "../../common/GLCamera";
import { GLProgram } from "../../common/GLProgram";
import { Object3D } from "../../Object3D";
import { PbrBaseMaterial } from "./PbrBaseMaterial";

const vertexShaderSource = `#version 300 es
in vec3 position;
in vec3 normal;
in vec4 color;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 vPosition;
out vec3 vViewPosition;
out vec3 vNormal;
out mat4 vMat;
out vec3 vAlbedo;

void main() {
  vPosition = position;

  mat4 modelView = view * model;
  vec4 mvPosition = modelView * vec4(position, 1.0);

  gl_Position = projection * mvPosition;

  // vViewPosition = -mvPosition.xyz;
  vViewPosition = -(view * model * vec4(position, 1.0)).xyz;

  mat3 normalMatrix = transpose(inverse(mat3(modelView)));
  vNormal = (normalMatrix * normal);

  vMat = view;

  vAlbedo = color.rgb;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

#define PI 3.14159265359
#define EPSILON 1e-6

in vec3 vPosition;
in vec3 vViewPosition;
in vec3 vNormal;
in mat4 vMat;
in vec3 vAlbedo;

uniform float metallic;
uniform float roughness;
// uniform vec3 albedo;

struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};

// 計算結果を足していくための構造体
// * indirect: 間接光による拡散反射成分と鏡面反射成分
struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};

// 今見ている物質の表面の点を表す構造体
struct GeometricContext {
  vec3 position;
  vec3 normal;
  vec3 viewDir;
};

struct Material {
  vec3 diffuseColor;
  float specularRoughness;
  vec3 specularColor;
};

// lights

// lights util

float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

// 光源が範囲内にあるかどうかをチェックする
// * 入力を破壊的に変更することはない
bool testLightInRange(const in float lightDistance, const in float cutoffDistance) {
  return any(bvec2(cutoffDistance == 0.0, lightDistance < cutoffDistance));
}

// 光の強度を放射照度に変換する
// * 入力を破壊的に変更することはない
// * saturate(x): clamp(x, 0.0, 1.0)
float punctualLightIntensityToIrradianceFactor(const in float lightDistance, const in float cutoffDistance, const in float decayExponent) {
  if (decayExponent > 0.0) {
    return pow(saturate(-lightDistance / cutoffDistance + 1.0), decayExponent);
  }

  return 1.0;
}

// 以下、いろいろな種類の光源における放射照度の計算を定義

// Directional Light
struct DirectionalLight {
  vec3 direction;
  vec3 color;
};

// Directional Light の放射照度を計算する関数
// * directLight を破壊的に変更して返す
void getDirectionalDirectLightIrradiance(
  const in DirectionalLight directionalLight,
  const in GeometricContext geometry,
  out IncidentLight directLight
) {
  directLight.color = directionalLight.color;
  directLight.direction = (vMat * vec4(directionalLight.direction, 0.0)).xyz;
  directLight.visible = true;
}

// Point Light
struct PointLight {
  vec3 position;
  vec3 color;
  float distance;
  float decay;
};

// Point Light の放射照度を計算する関数
// * directLight を破壊的に変更して返す
void getPointDirectLightIrradiance(
  const in PointLight pointLight,
  const in GeometricContext geometry,
  out IncidentLight directLight
) {
  vec3 L = pointLight.position - geometry.position;
  directLight.direction = normalize(L);

  float lightDistance = length(L);
  if (testLightInRange(lightDistance, pointLight.distance)) {
    directLight.color = pointLight.color;
    directLight.color *= punctualLightIntensityToIrradianceFactor(lightDistance, pointLight.distance, pointLight.decay);
    directLight.visible = true;
  } else {
    directLight.color = vec3(0.0);
    directLight.visible = false;
  }
}

// Spot Light
struct SpotLight {
  vec3 position;
  vec3 direction;
  vec3 color;
  float distance;
  float decay;
  float coneCos;
  float penumbraCos;
};

// Spot Light の放射照度を計算する関数
// * directLight を破壊的に変更して返す
void getSpotDirectLightIrradiance(
  const in SpotLight spotLight,
  const in GeometricContext geometry,
  out IncidentLight directLight
) {
  vec3 L = spotLight.position - geometry.position;
  directLight.direction = normalize(L);

  float lightDistance = length(L);
  float angleCos = dot(directLight.direction, spotLight.direction);

  if (all(bvec2(angleCos > spotLight.coneCos, testLightInRange(lightDistance, spotLight.distance)))) {
    float spotEffect = smoothstep(spotLight.coneCos, spotLight.penumbraCos, angleCos);
    directLight.color = spotLight.color;
    directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor(lightDistance, spotLight.distance, spotLight.decay);
    directLight.visible = true;
  } else {
    directLight.color = vec3(0.0);
    directLight.visible = false;
  }
}

// light uniforms
#define LIGHT_MAX 4
uniform DirectionalLight directionalLights[LIGHT_MAX];
uniform PointLight pointLights[LIGHT_MAX];
uniform SpotLight spotLights[LIGHT_MAX];
uniform int numDirectionalLights;
uniform int numPointLights;
uniform int numSpotLights;

// BRDFs

// Normalized Lambert: 正規化ランバート反射モデルを使用した拡散反射
// * オーレンネイヤー反射モデルに拡張するともっと自然になるかもしれない
// * 戻り値で計算結果を返す、引数の破壊的変更や返却はなし
vec3 DiffuseBRDF(vec3 diffuseColor) {
  return diffuseColor / PI;
}

// F: フレネル項（フレネル：反射や屈折の振る舞いをあらわす）
vec3 F_Schlick(vec3 specularColor, vec3 H, vec3 V) {
  return (specularColor + (1.0 - specularColor) * pow(1.0 - saturate(dot(V,H)), 5.0));
}

// D: 微小面の方線分布関数, GGX: モデルの名前
float D_GGX(float a, float dotNH) {
  float a2 = a * a;
  float dotNH2 = dotNH * dotNH;
  float d = dotNH2 * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d);
}

// G: 幾何減衰項（マイクロファセットつまり微小面におけるシャドウイングとマスキングによる遮断で照度がどれくらい減衰するか）
// smith schlick: SmithモデルのSchlick近似による計算
float G_Smith_Schlick_GGX(float a, float dotNV, float dotNL) {
  float k = a * a * 0.5 + EPSILON;
  float gl = dotNL / (dotNL * (1.0 - k) + k);
  float gv = dotNV / (dotNV * (1.0 - k) + k);
  return gl * gv;
}

// Cook-Torrance

// Cook-Torranceモデルによる鏡面反射のモデル
// 戻り値で計算結果を返す、引数の破壊的変更や返却はなし
vec3 SpecularBRDF(
  const in IncidentLight directLight,
  const in GeometricContext geometry,
  vec3 specularColor,
  float roughnessFactor
) {

  vec3 N = geometry.normal;
  vec3 V = geometry.viewDir;
  vec3 L = directLight.direction;

  float dotNL = saturate(dot(N,L));
  float dotNV = saturate(dot(N,V));
  vec3 H = normalize(L+V);
  float dotNH = saturate(dot(N,H));
  float dotVH = saturate(dot(V,H));
  float dotLV = saturate(dot(L,V));
  float a = roughnessFactor * roughnessFactor;

  float D = D_GGX(a, dotNH);
  float G = G_Smith_Schlick_GGX(a, dotNV, dotNL);
  vec3 F = F_Schlick(specularColor, V, H);
  return (F * (G * D)) / (4.0 * dotNL * dotNV + EPSILON);
}

// RenderEquations(RE): レンダリング方程式
// * reflectedLight を入力時にコピーした上で破壊的に変更して返す(indirect成分は変更しないというか、間接光の処理が実装されていない)
void RE_Direct(
  const in IncidentLight directLight,
  const in GeometricContext geometry,
  const in Material material,
  inout ReflectedLight reflectedLight
) {
  float dotNL = saturate(dot(geometry.normal, directLight.direction));
  vec3 irradiance = dotNL * directLight.color;

  // punctual light
  irradiance *= PI;

  reflectedLight.directDiffuse += irradiance * DiffuseBRDF(material.diffuseColor);
  reflectedLight.directSpecular += irradiance * SpecularBRDF(directLight, geometry, material.specularColor, material.specularRoughness);

  // TODO: 間接光の計算を追加してreflectedLightのindirect成分2つを更新する
}

out vec4 fragmentColor;

void main() {
  if (vPosition.x >= 0.5 || vPosition.x < -0.5 || vPosition.y >= 0.5 || vPosition.y < -0.5) {
    discard;
  }

  GeometricContext geometry;
  geometry.position = -vViewPosition;
  geometry.normal = normalize(vNormal);
  geometry.viewDir = normalize(vViewPosition);

  Material material;
  material.diffuseColor = mix(vAlbedo, vec3(0.0), metallic);
  material.specularColor = mix(vec3(0.04), vAlbedo, metallic);
  material.specularRoughness = roughness;

  // Lighting

  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));

  // 自身の発光は0で固定
  vec3 emissive = vec3(0.0);

  // 透明度は1で固定
  float opacity = 1.0;

  IncidentLight directLight;

  // point light
  for (int i=0; i<LIGHT_MAX; ++i) {
    if (i >= numPointLights) break;
    // PointLight の照度を計算する。 directLight に結果が格納される
    getPointDirectLightIrradiance(pointLights[i], geometry, directLight);
    if (directLight.visible) {
      // レンダリング方程式でdiffuse(拡散)とspecular(鏡面)の反射を計算して reflectedLightに照度を足して更新する
      RE_Direct(directLight, geometry, material, reflectedLight);
    }
  }

  // spot light
  for (int i=0; i<LIGHT_MAX; ++i) {
    if (i >= numSpotLights) break;
    // SpotLight の照度を計算する。 directLight に結果が格納される
    getSpotDirectLightIrradiance(spotLights[i], geometry, directLight);
    if (directLight.visible) {
      // レンダリング方程式でdiffuse(拡散)とspecular(鏡面)の反射を計算して reflectedLightに照度を足して更新する
      RE_Direct(directLight, geometry, material, reflectedLight);
    }
  }

  // directional light
  for (int i=0; i<LIGHT_MAX; ++i) {
    if (i >= numDirectionalLights) break;
    // DirectionalLight の照度を計算する。 directLight に結果が格納される
    getDirectionalDirectLightIrradiance(directionalLights[i], geometry, directLight);
    // レンダリング方程式でdiffuse(拡散)とspecular(鏡面)の反射を計算して reflectedLightに照度を足して更新する
    RE_Direct(directLight, geometry, material, reflectedLight);
  }

  vec3 outgoingLight = emissive + reflectedLight.directDiffuse + reflectedLight.directSpecular + reflectedLight.indirectDiffuse + reflectedLight.indirectSpecular;

  // 暗すぎる場合は勝手に調整
  outgoingLight += (vec3(1.0) - outgoingLight) * 0.3;

  fragmentColor = vec4(outgoingLight, opacity);
}
`;

class PbrBaseProgram implements Program {
  readonly gl: WebGL2RenderingContext;
  readonly glProgram: GLProgram;
  readonly glCamera: GLCamera;

  private constructor(
    gl: WebGL2RenderingContext,
    glProgram: GLProgram,
    glCamera: GLCamera
  ) {
    this.gl = gl;
    this.glProgram = glProgram;
    this.glCamera = glCamera;
  }

  static create (
    gl: WebGL2RenderingContext
  ): PbrBaseProgram | undefined {
    const glProgram = GLProgram.create(gl, vertexShaderSource, fragmentShaderSource, 'PbrBaseProgram');
    if (!glProgram) {
      console.error('[ERROR] PbrBaseProgram.create() could not create GLProgram');
      return undefined;
    }

    const glCamera = GLCamera.create(gl, glProgram.program);
    if (!glCamera) {
      console.error('[ERROR] PbrBaseProgram.create() could not create GLCamera');
      return undefined;
    }

    return new PbrBaseProgram(gl, glProgram, glCamera);
  }

  updateCamera(viewMatrix: mat4, projectionMatrix: mat4): void {
    const gl = this.gl;
    const program = this.glProgram.program;
    gl.useProgram(program);

    this.glCamera.update(gl, viewMatrix, projectionMatrix);
  }

  draw(object3D: Object3D<PbrBaseMaterial>): void {
    const gl = this.gl;
    const program = this.glProgram.program;

    gl.useProgram(program);

    const geometry = object3D.geometry;
    if (!geometry.isDrawable()) {
      geometry.prepare(gl, program);
    }
    geometry.bind(gl);

    const transform = object3D.transform;
    if (!transform.isDrawable()) {
      transform.prepare(gl, program);
    }
    transform.update();
    transform.bind(gl);

    gl.useProgram(program);
    const material = object3D.material;
    if (!material.isDrawable()) {
      material.prepare(gl, program);
    }
    material.bind(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.drawElements(gl.TRIANGLES, geometry.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
  }
}

export {PbrBaseProgram};
