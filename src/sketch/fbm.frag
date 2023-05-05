precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec3 lightPos;
uniform vec3 camPos;
uniform float emissionThreshold;
uniform float emissionPower;

const mat2 m = mat2(0.5, 0.5, -0.5, 0.5);
// const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

mat2 rotation(float a) {
  return mat2( cos(a), -sin(a), sin(a), cos(a) );
}

float noise( in vec2 p ) {
  return sin(p.x) * sin(p.y);
}

// For mobile
highp float random(vec2 co){
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt= dot(co.xy ,vec2(a,b));
  highp float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

// https://www.shadertoy.com/view/MsS3Wc
vec3 hsv2rgb_smooth( in vec3 c ) {
  vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing
	return c.z * mix( vec3(1.0), rgb, c.y);
}

#define NUM_OCTAVES 5

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.9;

  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * (1.5 + noise(p));
    p = rotation(0.5) * p * vec2(1.9);
    a *= 0.5;
  }
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;

  for (int i = 0; i < 3; ++i) {
    v += a * noise(p);
    p = rotation(0.5) * p * vec2(1.5);
    a *= 0.5;
  }
  return v;
}

// float fbm6(vec2 p) {
//   float v = 0.0;
//   float a = 0.5;

//   for (int i = 0; i < 6; ++i) {
//     v += a * noise(p);
//     p = rotation(0.5) * p * vec2(1.5);
//     a *= 0.5;
//   }
//   return v;
// }

float func(vec2 p) {
  // Add some spice into q
  float f = fbm3(p);
  f = f*f;

  return f;
}

void main( void ) {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  vec2 s = vec2(0.5, 0.2);
  vec2 q = vec2(0.);
  q = q + s;
  q.x = fbm( (uv * s) / 0.126 + sin(time / 191.0));
  q.y = fbm( (uv * s) / 0.589 + sin(time / 191.0));

  vec2 r = vec2(0.);
  r.x = fbm( uv + 10.0*q + vec2(1.0,9.2)+ 0.150);
  r.y = fbm( uv + 5.0*q + vec2(5.0,3.2)+ 0.126);

  float f = func(uv + 10.0*q + vec2(1.0,9.2)+ 0.150);

  vec3 col = vec3(0.0);
  col = mix(
    vec3(0.149,0.481,0.792),
    vec3(0.1,0.933,0.824),
  f);
  // col = mix(
  //     hsv2rgb_smooth(vec3(0.5870,0.6087,0.2065)),
  //     hsv2rgb_smooth(vec3(0.4565,0.7283,0.9348)),
  // f);

  // col = mix(
  //     hsv2rgb_smooth(vec3(0.5870,0.6087,0.2065)),
  //     hsv2rgb_smooth(vec3(0.4565,0.7283,0.9348)),
  // f);

  col = mix(
    col,
    hsv2rgb_smooth(vec3(0.4913,0.2000,0.9022)),
    dot(q.x * 0.1, q.y * 0.8)
  );

  // col = mix(col,
  //   vec3(0,0.1,0.164706),
  //   clamp(length(r),0.1,0.7)
  //   // dot(r.x,r.y)
  //   );

  // col = clamp( col*0.574, 0.0, 1.0 );

  gl_FragColor = vec4(col, 1.);
}
