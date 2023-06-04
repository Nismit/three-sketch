precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec2 fbmParam1;
uniform vec2 fbmParam2;

const mat2 m = mat2(0.5, 0.5, -0.5, 0.5);
// const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float noise( vec2 p ) {
  return sin(p.x) * sin(p.y);
}

float fbm3(vec2 p) {
  float f = 0.0;
  float coefficient = 0.5;

  for (int i = 0; i < 3; ++i) {
    f += coefficient * noise(p);
    p = m * p * (2.0 + coefficient);
    coefficient *= 0.5;
  }
  return f/0.9;
}

float fbm5(vec2 p) {
  float f = 0.0;
  float coefficient = 0.5;

  for (int i = 0; i < 5; ++i) {
    f += coefficient * noise(p);
    p = m * p * (2.0 + coefficient);
    coefficient *= 0.5;
  }
  return f/0.9;
}

float fbm6(vec2 p) {
  float f = 0.0;
  float coefficient = 0.5;

  for (int i = 0; i < 6; ++i) {
    f += coefficient * noise(p);
    p = m * p * (2.0 + coefficient);
    coefficient *= 0.5;
  }
  return f/0.9;
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
  vec2 xu = vec2(fbm6(p + fbmParam1), fbm3(p + fbmParam2));
  xu += 0.05 * sin( vec2(0.5, 1.0) + length(xu) * time);
  vec2 yu = vec2(fbm3(3.0 * xu), fbm6(4.5 * xu));
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
    vec3(0.2,0.1,0.4),
    vec3(0.569,0.718,0.851),
    d
  );

  col = mix(
    col,
    vec3(0.9,0.9,0.9),
    dot(ou.zw, ou.zw)
  );

  gl_FragColor = vec4(col, 1.);
}
