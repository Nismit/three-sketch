precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

vec3 rotate(vec3 p, float angle, vec3 axis) {
  vec3 a = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float r = 1.0 - c;
  mat3 m = mat3(
      a.x * a.x * r + c,
      a.y * a.x * r + a.z * s,
      a.z * a.x * r - a.y * s,
      a.x * a.y * r - a.z * s,
      a.y * a.y * r + c,
      a.z * a.y * r + a.x * s,
      a.x * a.z * r + a.y * s,
      a.y * a.z * r - a.x * s,
      a.z * a.z * r + c
  );
  return m * p;
}

vec3 translate(vec3 p, vec3 t) {
  mat4 m = mat4(vec4(1.0, 0.0, 0.0, 0.0),
                vec4(0.0, 1.0, 0.0, 0.0),
                vec4(0.0, 0.0, 1.0, 0.0),
                vec4(-t.x, -t.y, -t.z, 1.0));

  return (m * vec4(p, 1.0)).xyz;
}

float smin(float d1, float d2, float k){
  float h = exp(-k * d1) + exp(-k * d2);
  return -log(h) / k;
}

float sphere(vec3 p, float size) {
  return length(p) - size;
}

vec3 sphericalPolarCoord(float radius, float rad1, float rad2){
  return vec3(
    sin(rad1) * cos(rad2) * radius,
    sin(rad1) * sin(rad2) * radius,
    cos(rad1) * radius
  );
}

float getDistance(vec3 p, float size) {
  // sin(2.0 * PI * (time/300.0) ) -1 ~ 1
  // sin(PI * (time / totalFrames) ) 0 ~ 1
  vec3 q = rotate(p, (2.0 * PI * (time/300.0)), vec3(0., 1.0, 0.));
  float d = 0.7;

  vec3 p1 = sphericalPolarCoord(
    sin(2.0 * PI * (time/300.0)),
    cos(2.0 * PI * (time/300.0)),
    radians(
      sin(2.0 * PI * (time/300.0))
    ) + 0.5
  );
  float d1 = sphere(p + p1, size);

  vec3 p2 = sphericalPolarCoord(
    sin(2.0 * PI * (time/300.0)) * 0.5 + 1.25,
    sin(2.0 * PI * (time/300.0)) * 1.34 + 0.5,
    radians(2.0 * PI * (time/300.0))
  );
  float d2 = sphere(p + p2, size);

  vec3 p3 = sphericalPolarCoord(
    1.2,
    radians(
      10.0 * cos(2.0 * PI * (time/300.0))
    ) + 0.5,
    sin(2.0 * PI * (time/300.0)) * 0.82 + 0.5
  );
  float d3 = sphere(p + p3, size);

  d = smin(smin(d1, d2, 2.4), d3, 2.4);

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
  float size = 0.2;
  float d = 0.;
  // marching loop
  for(int i = 0; i < 64; i++) {
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
  // * sin(PI * (time/300.0))
  // Light
  vec3 lightPos = vec3(5.0, 3.5, 3.0);
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
  vec2 uv = (gl_FragCoord.xy / resolution.xy - 1.0) / vec2(resolution.y / resolution.x , 1);
  vec3 col = vec3(0.);

  // ro: ray origin
  vec3 ro = vec3(0.0, 0.0, 3.0);
  // rd: ray direction
  vec3 rd = normalize(vec3(uv, 0) - ro);

  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float diff = getLight(p);
  d *= .2;

  col = vec3(diff);

  gl_FragColor = vec4(col, 1.);
}

