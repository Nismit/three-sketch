precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec3 lightPos;
uniform vec3 camPos;
uniform float emissionThreshold;
uniform float emissionPower;

const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

const float EMISSION_THRESHOLD = 5.0;
const float EMISSION_POWER = -2.0;

float sdSphere(vec3 p, float size) {
  return length(p) - size;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdPlane(vec3 p) {
  return p.y;
}

float getDistance(vec3 p) {
  float size = 1.0;
  float d = 0.0;

  d = sdSphere(p, size);
  // d = sdBox(p, vec3(0.5));
  // d = min(sdPlane(p), sdSphere(p - vec3(0.0, 1.1, 0.0), size));
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


void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 ro = vec3(0.0, 1.5, -4.0);
  vec3 rd = normalize(vec3(uv, 1.0));

  float d = 0.0;
  float n = 4.5;
  vec3 p;
  for (int i = 0; i < 100; i++) {
    p = ro + rd * d;
    float ds = getDistance(p);
    d += ds;

    if (ds < n) {
      n = ds;
    }

    if (d > 100.0 || ds < 0.001) {
      break;
    }
  }

  // float loopTimer = 2.0 * 3.1415 * 0.5 * time / 60.0;
  // float shadow = 1.0;
  // vec3 light = normalize(
  //     vec3(
  //       2.0 * sin(loopTimer),
  //       5.0,
  //       4.0 * cos(loopTimer)
  //     )
  // );

  vec3 normal = getNormal(p);
  // vec3 halfLE = normalize(light - ro);
  // float diff = clamp(dot(light, normal), 0.1, 1.0);
  // float spec = pow(clamp(dot(halfLE, normal), 0.0, 1.0), 10.0);

  // shadow = genShadow(p + normal * 0.001, light);

  vec3 emission_color = vec3(0.0, 0.9, 0.0); // 球体の発光色
  float em = pow(n + 1.0, float(emissionPower));
  vec3 color = vec3(0.0, 0.0, 0.0);
  color += em * emission_color;

  // gl_FragColor = vec4(color, 1.0);

  if (d < MAX_DIST) {
    gl_FragColor = vec4(emission_color, 1.0);
    return;
  }

  gl_FragColor = vec4(color, 1.0);
}


