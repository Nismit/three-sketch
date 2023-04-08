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

// vec3 areaLightPos = vec3(-1.5, 2.0, -0.5);
vec3 areaLightPos = vec3(1.8 * sin(time / (120.0 * 0.16)), 2.2, + cos(time / (120.0 * 0.16)));
// vec3 lightColor = vec3(.1, .1, .6);
vec3 lightColor = vec3(0.949,0.569,0.239);
// vec3 lightColor = vec3(.8);

// Utils
vec3 rotate(vec3 p, float angle, vec3 axis){
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

// TODO: replace to vec2 (distance, id)
vec2 map(vec3 p) {
  float size = 1.0;
  // float d = 0.0;

  vec2 res = vec2(-1.0, -1.0);

  float plane = sdPlane(p);
  float sphere = sdSphere(p - vec3(0.0, 0.99, 0.0), size);
  float sphereLight = sdSphere(p - areaLightPos, 0.1);

  // d = sdSphere(p, size);
  // d = sdBox(p, vec3(0.5));
  // d = min(sdPlane(p), sdSphere(p - vec3(0.0, 0.9, 0.0), size));
  // If combine more,
  // d = min(sdf3, min(sdf1, sdf2));
  // d = min(sdf4, min(sdf3, min(sdf1, sdf2)));

  res = plane < sphere ? vec2(plane, 0.) : vec2(sphere, 1.);
  res = res.x < sphereLight ? res : vec2(sphereLight, 2.);

  return res;
}

vec2 raymarching(vec3 ro, vec3 rd) {
  // x = distance, y = id
  vec2 result = vec2(-1.0, -1.0);

  float d = 0.0;
  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * d;
    // TODO: replace to vec2 (distance, id)
    vec2 ds = map(ro + rd * d);

    // ds.x < 0.01 -> 床が球体のように湾曲してしまう
    if (ds.x < (0.01 * d)) {
      result = vec2(d, ds.y);
      break;
    }

    d += ds.x;
  }

  return result;
}

// Ref: https://iquilezles.org/articles/normalsSDF
vec3 calcNormal(vec3 p) {
  float eps = 0.0001;
  vec2 h = vec2(eps, 0.0);
  return normalize(vec3(
    map(p+h.xyy).x - map(p-h.xyy).x,
    map(p+h.yxy).x - map(p-h.yxy).x,
    map(p+h.yyx).x - map(p-h.yyx).x
  ));
}

// Ref: https://iquilezles.org/articles/rmshadows
float calcSoftshadow(vec3 ro, vec3 rd, float mint, float tmax ) {
	float res = 1.0;
  float t = mint;
  float ph = 1e10; // big, such that y = 0 on the first iteration

  for(int i = 0; i < 32; i++) {
    vec2 h = map( ro + rd * t );

    // use this if you are getting artifact on the first iteration, or unroll the
    // first iteration out of the loop
    //float y = (i==0) ? 0.0 : h*h/(2.0*ph);

    // skip area light
    if (h.y == 2.0) break;

    float y = h.x*h.x/(2.0*ph);
    float d = sqrt(h.x*h.x-y*y);
    res = min( res, 10.0*d/max(0.0,t-y) );
    ph = h.x;

    t += h.x;

    if( res<0.0001 || t>tmax ) break;

  }

  res = clamp( res, 0.0, 1.0 );
  return res*res*(3.0-2.0*res);
}

// Ref: https://wgld.org/d/glsl/g020.html
float genShadow(vec3 ro, vec3 rd){
  vec2 h = vec2(0.0);
  float c = 0.001;
  float r = 1.0;
  float shadowCoef = 0.5;
  for (float t = 0.0; t < 50.0; t++) {
      h = map( ro + rd * c );

      if(h.y == 2.0) {
        break;
      }

      if(h.x < 0.001){
          return shadowCoef;
      }

      r = min(r, h.x * 16.0 / c);
      c += h.x;
  }
  return mix(shadowCoef, 1.0, r);
}

float distanceToLine(vec3 origin, vec3 dir, vec3 point) {
	vec3 pointToOrigin = point - origin;
  float pointToOriginLength = length(pointToOrigin);
  vec3 pointToOriginNorm = normalize(pointToOrigin);
  float theta = dot(dir, pointToOriginNorm);
  return pointToOriginLength * sqrt(1. - theta * theta);
}

vec3 emissiveLight(vec3 lightPos, vec3 lightColor, float lightIntensity, vec3 normal, vec3 p, float d, vec3 ro, vec3 rd) {
  vec3 eyeDirection = ro + rd;
  float lightEmissive = pow(distanceToLine(eyeDirection, rd, lightPos) + .95, -2.);
  float c = dot(normal, normalize(lightPos - p));
  c = clamp(c, 0., 1.);
  float em = 0.;
  // float farClip = 80.;
  em = c + (1. - c) * step(80., d);

  // float shadow = calcSoftshadow(p, areaLightPos, 0.01, 3.0);
  float shadow = genShadow(p, areaLightPos);

  return lightEmissive * lightColor * lightIntensity * em * shadow;
}

vec3 emissiveLights(vec3 normal, vec3 p, float d, vec3 ro, vec3 rd) {
  vec3 lightPos = areaLightPos;
  // vec3 lightColor = vec3(1., .1, .1);
  float lightIntensity = 2.0;

  vec3 color = vec3(0.);
  color += emissiveLight(
    lightPos,
    lightColor,
    lightIntensity,
    normal,
    p,
    d,
    ro,
    rd
  );
  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 ro = vec3(0.0, 1.2, -4.0);
  vec3 rd = normalize(vec3(uv, 1.0));

  vec2 result = raymarching(ro, rd);
  vec3 p = ro + rd * result.x;

  // skip calc normal
  if (result.y > 1.0) {
    p = ro + rd;
  }

  vec3 normal = calcNormal(p);

  vec3 color = vec3(0.0);

  // adding color for point light sphere
  if (result.y > 1.0) {
    color += lightColor;
  }

  // 床の色
  // if (result.y == .0) {
  //   color += vec3(0., .5, 0.);
  // }

  if (result.x < .0) {
    color += vec3(0.);
  }

  // Light
  // vec3  light = normalize( vec3(-0.2, 0.5, 0.3) );
  // // 視点から見て光源に向かう中間の方向を表す(ハーフ)ベクトル
  // vec3  halfVectorLightAndEye = normalize( light - rd );
  // float diffuse = clamp(dot(normal, halfVectorLightAndEye), 0.0, 1.0) *
  //                 calcSoftshadow(p, light, 0.01, 3.0);
  // float specular = pow(clamp(dot(normal, halfVectorLightAndEye), 0.0, 1.0), 10.0) *
  //                   diffuse;

  // color += vec3(0.5, 0.5, 0.5) * diffuse * specular;

  // vec3 light2 = rotate(vec3(0.1, 0.5, 0.2), radians(60.0), vec3(0.2, 1.0, 0.2));
  // light2 = normalize( light2 );
  // vec3 halfVectorLightAndEye2 = normalize( light2 - rd );
  // float diffuse2 = clamp(dot(normal, halfVectorLightAndEye2), 0.0, 1.0) *
  //                 calcSoftshadow(p, light2, 0.01, 3.0);
  // float specular2 = pow(clamp(dot(normal, halfVectorLightAndEye2), 0.0, 1.0), 10.0) *
  //                   diffuse2;

  // color += vec3(0.92, 0.33, 0.05) * diffuse2 * specular2;

  color += emissiveLights(normal, p, result.x, ro, rd);

  // vec3 light3 = areaLightPos;
  // light3 = normalize( light3 );
  // vec3 halfVectorLightAndEye3 = normalize( light3 - rd );
  // float diffuse3 = clamp(dot(normal, halfVectorLightAndEye3), 0.0, 1.0) *
  //                 calcSoftshadow(p, light3, 0.01, 3.0);
  // float specular3 = pow(clamp(dot(normal, halfVectorLightAndEye3), 0.0, 1.0), 10.0) *
  //                   diffuse3;

  // color += vec3(1.) * exp(-length(halfVectorLightAndEye3)) * diffuse3 * specular3;

  gl_FragColor = vec4(color, 1.0);
}


