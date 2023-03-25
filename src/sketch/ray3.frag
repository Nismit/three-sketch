precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

float sphere(vec3 p, float size) {
  return length(p) - size;
}

vec3 getNormal(vec3 p, float size) {
  float delta = 0.0001;
  return normalize(vec3(
    sphere(p, size) - sphere(vec3(p.x - delta, p.y, p.z), size),
    sphere(p, size) - sphere(vec3(p.x, p.y - delta, p.z), size),
    sphere(p, size) - sphere(vec3(p.x, p.y, p.z - delta), size)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 col = vec3(0.);

  // ro: ray origin
  vec3 ro = vec3(0, 0, 1.0);
  // rd: ray direction
  vec3 rd = normalize(vec3(uv, 0) - ro);
  // cur: ray cursor
  vec3 cur = ro;
  // Light
  vec3 lightDirection = normalize(vec3(0.4, 1.0, 0.8)) * sin(PI * (time/300.0));
  vec3 lightColor = vec3(0.9);

  float size = 0.5;

  // marching loop
  for(int i = 0; i < 99; i++) {
    float d = sphere(cur, size);

    if (d < 0.01) {
      // col = vec3(1.);

      // レイが衝突した位置での法線ベクトルを取得
      vec3 normal = getNormal(cur, size);
      // 法線ベクトルとライトのベクトルでの内積をとる (ランバート反射)
      float diff = dot(normal, lightDirection);

      col = vec3(diff) * lightColor;
      break;
    }

    cur += rd * d;
  }

  gl_FragColor = vec4(col, 1.);
}
