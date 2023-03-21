precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

float sphere(vec3 p, float size) {
  return length(p) - size;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float getDistance(vec3 p, float size) {
  float d = 0.;
  vec4 s = vec4(0.5, 0.35, 0., 0.);
  float sphereDist = sphere(p - s.xyz, size) - s.w;
  d = sphereDist;
  vec3 boxPos = vec3(-0.2, 0., 0.2);
  float boxDist = sdBox(p - boxPos, vec3(0.2, 0.2, 0.2));
  d = min(d, boxDist);
  float planeDist = p.y;
  d = min(d, planeDist);
  return d;
}

vec3 getNormal(vec3 p, float size) {
  float d = getDistance(p, size);
  vec2 e = vec2(.001, 0); // e === delta
  // float delta = 0.0001;
  vec3 n = d - vec3(
    getDistance(p - e.xyy, size),
    getDistance(p - e.yxy, size),
    getDistance(p - e.yyx, size)
  );

  return normalize(n);
}

float rayMarch(vec3 ro, vec3 rd) {
  float size = 0.3;
  float d = 0.;
  // marching loop
  for(int i = 0; i < 99; i++) {
    vec3 p = ro + rd * d;
    float ds = getDistance(p, size);
    d += ds;
    if (d > 99. || ds < 0.01) {
      break;
    }
  }

  return d;
}

float getLight(vec3 p) {
  float size = 0.3;
  // Light
  vec3 lightPos = vec3(5.0, 3.5, 3.0 * sin(PI * (time/300.0)));
  vec3 lightDirection = normalize(lightPos - p);
  vec3 n = getNormal(p, size);

  float diff = dot(n, lightDirection);
  diff = clamp(diff, 0., 1.);

  // Shadow ray march starts from light direction
  float shadow = rayMarch(p + n*0.01*1.1, lightDirection);
  if (shadow < length(lightPos - p)) diff *= .1;
  return diff;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 col = vec3(0.);

  // ro: ray origin
  vec3 ro = vec3(0, 0.4, 1.0);
  // rd: ray direction
  vec3 rd = normalize(vec3(uv, 0) - ro);

  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float diff = getLight(p);
  d *= .2;

  col = vec3(diff);

  gl_FragColor = vec4(col, 1.);
}
