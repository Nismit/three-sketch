precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec3 lightPos;
uniform vec3 camPos;

const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

float sdSphere(vec3 p, float size) {
  return length(p) - size;
}

float sdPlane(vec3 p) {
  return p.y;
}

float getDistance(vec3 p) {
  float size = 1.0;
  float d = 0.0;

  d = min(sdPlane(p), sdSphere(p - vec3(0.0, 1.1, 0.0), size));
  // If combine more,
  // d = min(sdf3, min(sdf1, sdf2));
  // d = min(sdf4, min(sdf3, min(sdf1, sdf2)));

  return d;
}

// Ref:https://wgld.org/d/glsl/g010.html
vec3 getNormal(vec3 p) {
  float d = 0.0001;
  return normalize(vec3(
      getDistance(p + vec3(  d, 0.0, 0.0)) - getDistance(p + vec3( -d, 0.0, 0.0)),
      getDistance(p + vec3(0.0,   d, 0.0)) - getDistance(p + vec3(0.0,  -d, 0.0)),
      getDistance(p + vec3(0.0, 0.0,   d)) - getDistance(p + vec3(0.0, 0.0,  -d))
  ));
}

// Ref: https://wgld.org/d/glsl/g020.html
float genShadow(vec3 ro, vec3 rd){
  float h = 0.0;
  float c = 0.001;
  float r = 1.0;
  float shadowCoef = 0.5;
  for (float t = 0.0; t < 50.0; t++) {
      h = getDistance(ro + rd * c);
      if(h < 0.001){
          return shadowCoef;
      }
      r = min(r, h * 16.0 / c);
      c += h;
  }
  return mix(shadowCoef, 1.0, r);
}

vec3 phongContribForLight(vec3 k_d, vec3 k_s, float shininess, vec3 p, vec3 ro, vec3 phongLightPos, vec3 lightIntensity) {
  // 表面上の点における法線
  vec3 N = getNormal(p);
  // ライトからの入射ベクトル
  vec3 L = normalize(phongLightPos - p);
  // レイの原点に戻るベクトル
  vec3 V = normalize(ro - p);
  // 反射ベクトル
  vec3 R = normalize(reflect(-L, N));

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  if (dotLN < 0.0) {
      // Light not visible from this point on the surface
      return vec3(0.0, 0.0, 0.0);
  }

  if (dotRV < 0.0) {
      // Light reflection in opposite direction as viewer, apply only diffuse
      // component
      return lightIntensity * (k_d * dotLN);
  }
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, shininess));
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float shininess, vec3 p, vec3 ro, float timer) {
    vec3 ambientLight = vec3(0.494,0.651,0.161) * 0.5;
    // アンビエント照明 * 環境反射係数
    vec3 color = ambientLight * k_a;

    // Phongの反射モデルは全てのライトの合算となる
    vec3 light1Pos = vec3(2.0 * sin(timer),
                          5.0,
                          4.0 * cos(timer));
    // ライトの強度
    vec3 light1Intensity = vec3(0.4);

    color += phongContribForLight(k_d, k_s, shininess, p, ro,
                                  light1Pos,
                                  light1Intensity);

    // vec3 light2Pos = vec3(0.1 + 4.0 * sin(timer),
    //                       0.1 + 2.0 * cos(timer),
    //                       3.0);
    // vec3 light2Intensity = vec3(0.8);

    // color += phongContribForLight(k_d, k_s, shininess, p, ro,
    //                               light2Pos,
    //                               light2Intensity);
    return color;
}

// Ref: https://inspirnathan.com/posts/57-shadertoy-tutorial-part-11/
// Phong Reflection = k_a * i_a + (k_d * (L dot N) * i_d + k_s * (R dot V) ^ alpha * i_s)
// _a = ambient, _d = diffuse, _s = specular
// floatで定義されている係数を使うかvec3で定義されている係数を使うかで
// 表示結果は大きく異なる
// floatの場合は画面全体に対しvec3の場合は奥行きも再現される
vec3 phongReflection(vec3 p, vec3 ro, vec3 rd, float timer) {
  // Ambient
  // float k_a = 0.6; // range [0-1]
  vec3 k_a = vec3(0.24, 0.24, 0.24);
  vec3 i_a = vec3(0.494,0.651,0.161); // ambient light color
  float ambientIntensity = 0.5; // 無くても良い係数 アンビエントの強さ
  vec3 ambient = k_a * i_a * ambientIntensity;

  // Diffuse
  // p はレイマーチングでヒットした物体の表面 (surface)を表す
  vec3 N = getNormal(p); // 物体の法線 (Normal)
  vec3 lightPosition = vec3(2.0 * sin(timer),
                          5.0,
                          4.0 * cos(timer));
  vec3 L = normalize(lightPosition - p); // ライトからの入射ベクトル
  float dotLN = dot(L, N);
  // float k_d = 0.5; // range [0-1]
  vec3 k_d = vec3(0.3, 0.4, 0.5);
  // vec3 i_d = vec3(0.3, 0.1, 0.1); // Intensity
  vec3 i_d = vec3(0.4);

  vec3 diffuse = (k_d * dotLN) * i_d;

  // Light not visible from this point on the surface
  if (dotLN < 0.0) {
    return ambient;
  }

  // Specular
  // float k_s = 0.6;
  vec3 k_s = vec3(0.7, 0.7, 0.7);
  // vec3 R = reflect(L, N);
  vec3 R = reflect(-L, N);
  // vec3 V = -rd; // カメラへ戻るベクトル
  vec3 V = normalize(ro - p); // カメラへ戻るベクトル
  float dotRV = dot(R, V);
  vec3 i_s = vec3(0.4); // スペキュラー(反射の光の色味とか強さ)
  float alpha = 10.; // 光沢度
  vec3 specular = k_s * pow(dotRV, alpha) * i_s;

  // Light reflection in opposite direction as viewer, apply only diffuse
  if (dotRV < 0.0) {
    return ambient + diffuse;
  }

  return ambient + diffuse + specular;
}


void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 ro = vec3(0.0, 1.5, -4.0);
  vec3 rd = normalize(vec3(uv, 1.0));

  float d = 0.0;
  vec3 p;
  for (int i = 0; i < 100; i++) {
    p = ro + rd * d;
    float ds = getDistance(p);
    d += ds;

    if (d > 100.0 || ds < 0.001) {
      break;
    }
  }

  float loopTimer = 2.0 * 3.1415 * 0.5 * time / 60.0;
  float shadow = 1.0;
  vec3 light = normalize(
      vec3(
        2.0 * sin(loopTimer),
        5.0,
        4.0 * cos(loopTimer)
      )
  );

  vec3 normal = getNormal(p);
  vec3 halfLE = normalize(light - ro);
  float diff = clamp(dot(light, normal), 0.1, 1.0);
  float spec = pow(clamp(dot(halfLE, normal), 0.0, 1.0), 10.0);

  shadow = genShadow(p + normal * 0.001, light);

  vec3 K_s = vec3(0.7, 0.7, 0.7); // 鏡面反射係数
  vec3 K_d = vec3(0.3, 0.4, 0.5); // 拡散反射係数
  vec3 K_a = vec3(0.24, 0.24, 0.24); // 環境反射係数
  float shininess = 10.0; // 光沢度

  // vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, ro, loopTimer) * diff + vec3(spec);
  vec3 color = phongReflection(p, ro, rd, loopTimer) * diff + vec3(spec);

  gl_FragColor = vec4(color * max(0.3, shadow), 1.0);
}


