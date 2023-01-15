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

// https://iquilezles.org/articles/distfunctions/
// https://www.shadertoy.com/view/wsSGDG
float sdOctahedron( vec3 p, float s) {
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;

  float k = clamp(0.5*(q.z-q.y+s),0.0,s);
  return length(vec3(q.x,q.y-s+k,q.z-k));
}

float distFloor(vec3 p) {
  return dot(p, vec3(0.0, 1.0, 0.0)) + 1.0;
}

float getDistance(vec3 p, float size) {
  // sin(2.0 * PI * (time/300.0) ) -1 ~ 1
  // sin(PI * (time / totalFrames) ) 0 ~ 1
  float d = 0.;

  float easing = EaseInOutQuad( sin(PI * (time/300.0)) );

  vec3 octaPos = p + vec3(0., 0.4, 1.2);

  vec3 octaTranslate = translate(octaPos, vec3(0., 0.2 * easing, 0. ));
  vec3 octaRotate = rotate(octaTranslate, radians(180.0 * float(time)/300.0), vec3(0., 1., .0));
  float ab = sdOctahedron(octaRotate, 1.0);

  // d = smin(smin(d1, d2, 3.4), d3, 3.5);
  // d = smin(d, d4, 3.5);

  // d = distFloor(p);

  d = ab;

  // d = smin(d, p.y, 1.5);

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
  vec3 lightPos = vec3(-1.0, 1.0, 1.5);
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
  vec3 ro = vec3(0.0, 1.0, 4.0);
  // rd: ray direction
  vec3 rd = normalize(vec3(uv, 0) - ro);
  // vec3 rd = normalize(vec3(uv, -1.0 + 0.5 * length(uv)) - ro);

  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float diff = getLight(p);

  col = vec3(diff);

  gl_FragColor = vec4(col, 1.);
}

