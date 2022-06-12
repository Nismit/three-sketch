precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

float EaseInOutQuad(float x) {
  //x < 0.5f ? 2 * x* x : 1 - pow(-2 * x + 2,2) /2;
  float inValue = 2.0 * x  *x;
  float outValue = 1.0- pow(-2.0 * x + 2.0,2.0) / 2.0;
  float inStep = step(inValue,0.5) * inValue;
  float outStep = step(0.5 , outValue ) * outValue;

  return inStep + outStep;
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

// ref: https://physkorimath.xyz/polar-coordinates/
// 球面座標
// r = 球の半径
// x = r * sin * cos
// y = r * sin * sin
// z = r * cons
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
  float d = 0.;

  float easing = EaseInOutQuad( sin(PI * (time/300.0)) );

  // vec3 p1 = sphericalPolarCoord(
  //   sin(PI * (time/300.0)),
  //   cos(PI * (time/300.0)),
  //   cos(PI * (time/300.0))
  // );
  // vec3 p1 = translate(p, vec3(0.5, -1.5 + (time/100.0), 0.0));
  float d1 = sphere(p, size);

  // vec3 p2 = sphericalPolarCoord(
  //   sin(PI * (time/300.0)),
  //   cos(PI * (time/300.0)),
  //   cos(PI * (time/300.0))
  // );
  vec3 p2 = translate(p, vec3(0.5 * (easing - 1.0), -2.5 * (easing - 1.0) , 0.0));
  float d2 = sphere(p + p2, size);

  // vec3 p3 = sphericalPolarCoord(
  //   sin(PI * (time/300.0)),
  //   cos(PI * (time/300.0)),
  //   cos(PI * (time/300.0))
  // );
  vec3 p3 = translate(p, vec3(-1.8 * (easing - 1.0), 1.287 * (easing - 1.0) , 0.0));
  float d3 = sphere(p + p3, size);

  vec3 p4 = translate(p, vec3(2.3 * (easing - 1.0), 1.587 * (easing - 1.0) , 0.0));
  float d4 = sphere(p + p4, size);

  d = smin(smin(d1, d2, 3.4), d3, 3.5);
  d = smin(d, d4, 3.5);

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
  float d;
  // marching loop
  for(int i = 0; i < 64; i++) {
    vec3 p = ro + rd * d;
    float ds = getDistance(p, size);
    d += ds; // forward ray

    // Hit a object
    if (ds < 0.0001) {
      break;
    }
  }

  return d;
}

float getLight(vec3 p) {
  float size = 0.3;
  // * sin(PI * (time/300.0))
  // Light
  vec3 lightPos = vec3(-1.0, 1.0, 1.0);
  vec3 lightDirection = normalize(lightPos - p);
  vec3 n = getNormal(p, size);

  float diff = dot(n, lightDirection);
  diff = clamp(diff, 0., 1.);

  // Shadow ray march starts from light direction
  // float shadow = rayMarch(p + n * 0.01, lightDirection);
  // if (shadow < length(lightPos - p)) diff *= .1;
  return diff;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution.xy - 1.0) / vec2(resolution.y / resolution.x , 1);
  vec3 col = vec3(0.);

  // ro: ray origin
  vec3 ro = vec3(0.0, 0.0, 3.0);
  // rd: ray direction
  // vec3 rd = normalize(vec3(uv, 0) - ro);
  vec3 rd = normalize(vec3(uv, -1.0 + 0.5 * length(uv)) - ro);

  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float diff = getLight(p);

  col = vec3(diff);

  gl_FragColor = vec4(col, 1.);
}

