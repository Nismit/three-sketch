precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

float sphere(vec3 p, float size) {
  return length(p) - size;
}

float getDistance(vec3 p, float size) {
  vec4 s = vec4(0, 0.35, 0, 0.05);
  float sphereDist = sphere(p - s.xyz, size) - s.w;
  float planeDist = p.y;
  return min(sphereDist, planeDist);
}

vec3 getNormal(vec3 p, float size) {
  float d = getDistance(p, size);
  vec2 e = vec2(.01, 0); // e === delta
  // float delta = 0.0001;
  vec3 n = d - vec3(
    getDistance(p - e.xyy, size),
    getDistance(p - e.yxy, size),
    getDistance(p - e.yyx, size)
  );

  return normalize(n);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution.xy - 1.0) / vec2(resolution.y / resolution.x , 1);
  vec3 col = vec3(0.);

  // ro: ray origin
  vec3 ro = vec3(0, 0.2, 1.0);
  // rd: ray direction
  vec3 rd = normalize(vec3(uv, 0) - ro);
  // cur: ray cursor
  vec3 cur = ro;
  // Light
  vec3 lightPos = vec3(5.0, 5.0, 5.0 * sin(PI * (time/300.0)));
  vec3 lightDirection = normalize(lightPos); // * sin(PI * (time/300.0))
  vec3 lightColor = vec3(0.9);

  float size = 0.3;

  // marching loop
  for(int i = 0; i < 99; i++) {
    float d = getDistance(cur, size);

    if (d < 0.01) {
      // col = vec3(1.);

      // レイが衝突した位置での法線ベクトルを取得
      vec3 normal = getNormal(cur, size);
      vec3 l = normalize(lightDirection - cur);
      float diff = dot(normal, l);
      diff = clamp(diff, 0., 1.);

      col = vec3(diff) * lightColor;
      break;
    }

    cur += rd * d;
  }

  gl_FragColor = vec4(col, 1.);
}
