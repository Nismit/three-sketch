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

vec3 areaLightPos = vec3(2.3, 1.5, -0.5);

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
  float sphere = sdSphere(p - vec3(0.0, 0.9, 0.0), size);
  float sphereLight = sdSphere(p - areaLightPos, 0.5);

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

    if (ds.x < 0.001) {
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
    if (h.y > 1.0) break;

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

float specTrowbridgeReitz( float HoN, float a, float aP ) {
	float a2 = a * a;
	float aP2 = aP * aP;
	return ( a2 * aP2 ) / pow( HoN * HoN * ( a2 - 1.0 ) + 1.0, 2.0 );
}

float visSchlickSmithMod( float NoL, float NoV, float r ) {
	float k = pow( r * 0.5 + 0.5, 2.0 ) * 0.5;
	float l = NoL * ( 1.0 - k ) + k;
	float v = NoV * ( 1.0 - k ) + k;
	return 1.0 / ( 4.0 * l * v );
}

float fresSchlickSmith( float HoV, float f0 ) {
	return f0 + ( 1.0 - f0 ) * pow( 1.0 - HoV, 5.0 );
}

vec2 sphereLight(vec3 p, vec3 N, vec3 V, vec3 R, float f0, float roughness, float NoV) {
  vec2 result = vec2(0.);

  float sphereRadius = cos(0.) * 0.9;

  // Light position - p;
  vec3 L = areaLightPos - p;
  vec3 centerToRay = dot(L, R) * R - L;
  vec3 closetPoint = L + centerToRay * clamp(sphereRadius / length(centerToRay), 0.0, 1.0);
  vec3 l = normalize(closetPoint);
  vec3 h = normalize(V + l);

  float NoL = clamp(dot(N,l), 0.0, 1.0);
  float HoN = clamp(dot(h,N), 0.0, 1.0);
  float HoV = dot(h, V);

  float distL = length(L);
  float alpha = roughness * roughness;
  float alphaPrime = clamp(sphereRadius/(distL * 2.0) + alpha, 0.0, 1.0);

  float specD = specTrowbridgeReitz( HoN, alpha, alphaPrime );
	float specF	= fresSchlickSmith( HoV, f0 );
	float specV = visSchlickSmithMod( NoL, NoV, roughness );

  float combine = specD * specF * specV * NoL;
  result = vec2(combine, NoL);

  return result;
}

vec3 areaLights(vec3 p, vec3 normal, vec3 rd) {
  vec3 v = -normalize(rd);
  vec3 r = reflect(-v, normal);
  float NoV = clamp(dot(normal, v), 0.0, 1.0);

  float f0 = 0.3;
  float roughness = 0.08;

  vec2 specularSphere = sphereLight(p, normal, v, r, f0, roughness, NoV);

  vec3 color = vec3(0.0) * 0.3183 * specularSphere.y + specularSphere.x;
  return pow(color, vec3(1.0 / 2.2));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 ro = vec3(0.0, 1.5, -4.0);
  vec3 rd = normalize(vec3(uv, 1.0));

  vec2 result = raymarching(ro, rd);
  vec3 p = ro + rd * result.x;
  vec3 normal = calcNormal(p);

  // Light
  vec3  light = normalize( vec3(-0.2, 0.5, 0.3) );
  // 視点から見て光源に向かう中間の方向を表す(ハーフ)ベクトル
  vec3  halfVectorLightAndEye = normalize( light - rd );
  float diffuse = clamp(dot(normal, halfVectorLightAndEye), 0.0, 1.0) *
                  calcSoftshadow(p, light, 0.01, 3.0);
  float specular = pow(clamp(dot(normal, halfVectorLightAndEye), 0.0, 1.0), 10.0) *
                    diffuse;

  vec3 color = vec3(0.0);

  if (result.y > 1.0) {
    color += vec3(1.0, 1.0, 1.0);
  }

  color += vec3(0.5, 0.5, 0.5) * diffuse * specular;

  vec3 light2 = rotate(vec3(0.1, 0.5, 0.2), radians(60.0), vec3(0.2, 1.0, 0.2));
  light2 = normalize( light2 );
  vec3 halfVectorLightAndEye2 = normalize( light2 - rd );
  float diffuse2 = clamp(dot(normal, halfVectorLightAndEye2), 0.0, 1.0) *
                  calcSoftshadow(p, light2, 0.01, 3.0);
  float specular2 = pow(clamp(dot(normal, halfVectorLightAndEye2), 0.0, 1.0), 10.0) *
                    diffuse2;

  color += vec3(0.92, 0.33, 0.05) * diffuse2 * specular2;

  color += areaLights(p, normal, rd);

  gl_FragColor = vec4(color, 1.0);
}


