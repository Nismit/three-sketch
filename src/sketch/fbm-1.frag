precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec2 fbmParam1;
uniform vec2 fbmParam2;
uniform vec3 fbmColor1;
uniform vec3 fbmColor2;

// const mat2 m = mat2(-0.19, 0.575, -1.924, -0.096);
// const mat2 m = mat2(0.3, 0.98, 0.159, 0.707);
// const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );
const mat2 m = mat2(0.09, 0.175, 0.224, -0.7896);

float noise( vec2 p ) {
  return sin(p.x) * sin(p.y);
}

float fbm3(vec2 p) {
  float f = 0.0;
  float amplitude = 0.5;
  float coefficient = 0.;

  for (int i = 0; i < 3; ++i) {
    f += amplitude * noise(p);
    p = m * p * (2.0125 + amplitude);
    coefficient += amplitude;
    amplitude *= 0.5;
  }
  return f/coefficient;
}

float fbm5(vec2 p) {
  float f = 0.0;
  float amplitude = 0.5;
  float coefficient = 0.;

  for (int i = 0; i < 5; ++i) {
    f += amplitude * noise(p);
    p = m * p * (2.0615 + amplitude);
    coefficient += amplitude;
    amplitude *= 0.5;
  }
  return f/coefficient;
}

float fbm6(vec2 p) {
  float f = 0.0;
  float amplitude = 0.5;
  float coefficient = 0.;

  for (int i = 0; i < 6; ++i) {
    f += amplitude * noise(p);
    p = m * p * (2.0901 + amplitude);
    coefficient += amplitude;
    amplitude *= 0.5;
  }
  return f/coefficient;
}

// float fbm(vec2 p, float frequency, float amplitude, int octaves) {
//   float f = 0.0;
//   float coefficient = 0.5;

//   for (int i = 0; i < octaves; ++i) {
//     f += noise(p * frequency) * amplitude;
//     frequency *= 2.0;
//     amplitude *= coefficient;
//   }
//   return f;
// }

float domainWarp( vec2 p, out vec4 u) {
  // p *= 2.0;
  p /= 4.0;

  // vec2 xu = vec2(fbm6(p + vec2(-12.)), fbm3(p + vec2(10.)));
  vec2 xu = vec2(fbm6((p * vec2(2.0) + fbmParam1) + fbm5(p + 15.0)), fbm3(p + fbm5(p + 123.0)));
  xu += 0.05 * sin( vec2(0.9) + length(xu) * time);
  vec2 yu = vec2(fbm3(13.0 * xu), fbm6(fbmParam2 * xu));
  yu += 0.05 * sin( vec2(0.1) + length(yu) * time);
  u = vec4(xu, yu);

  float f = fbm3(p) * fbm5(p) * fbm6(p + vec2(6.));

  return mix(f, f*f*f, f*abs(yu.x));
}

void main( void ) {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  vec4 ou = vec4(0.);
  float d = domainWarp(uv, ou);

  vec3 col = vec3(0.0);
  col = mix(
    vec3(-0.299,0.099,0.149),
    vec3(0.),
    d
  );

  // col = mix(
  //   col,
  //   vec3(0.959,0.049,0.722),
  //   clamp(length(ou.xy), 0.0, 1.0)
  // );

  // col = mix(
  //   fbmColor1,
  //   fbmColor2,
  //   d
  // );

  col = mix(
    col,
    // vec3(0.),
    vec3(0.686,0.765,0.776),
    dot(abs(ou.zw), abs(ou.zw) * 12.0)
  );

  col = 0.5 * col * col;

  gl_FragColor = vec4(col, 1.);
}
