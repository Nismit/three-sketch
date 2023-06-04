precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec2 fbmParam1;
uniform vec2 fbmParam2;
uniform vec3 fbmColor1;
uniform vec3 fbmColor2;

// const mat2 m = mat2(-0.19, 0.175, -1.724, 0.296);
const mat2 m = mat2(0.3, 0.98, 0.059, 0.707);
// const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

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
  p *= 1.5;

  // vec2 xu = vec2(fbm6(p + vec2(-12.)), fbm3(p + vec2(10.)));
  vec2 xu = vec2(fbm6(p + fbmParam1), fbm3(p));
  xu += 0.05 * sin( vec2(0.5) + length(xu) * time);
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
    vec3(0.851,0.424,0.78),
    vec3(0.949,0.882,0.682),
    d
  );

  col = mix(
    col,
    vec3(0.949,0.882,0.682),
    clamp(length(ou.xy), 0.0, 1.0)
  );

  // col = mix(
  //   fbmColor1,
  //   fbmColor2,
  //   d
  // );

  col = mix(
    col,
    vec3(0.99,0.99,0.99),
    dot(ou.zw, ou.zw)
  );

  gl_FragColor = vec4(col, 1.);
}
