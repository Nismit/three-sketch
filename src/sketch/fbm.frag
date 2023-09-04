precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;
uniform vec2 fbmParam1;
uniform vec2 fbmParam2;
uniform vec3 fbmColor1;
uniform vec3 fbmColor2;

const mat2 m = mat2(0.5, 0.60, -0.60, 0.80 );

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

float fbm4( vec2 p )
{
    float f = 0.0;
    f += 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );
    return f/0.9375;
}

float fbm6( vec2 p )
{
    float f = 0.0;
    f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
    f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
    f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
    f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
    f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
    f += 0.015625*(0.5+0.5*noise( p ));
    return f/0.96875;
}

vec2 fbm4_2( vec2 p )
{
    return vec2(fbm4(p), fbm4(p+vec2(7.8)));
}

vec2 fbm6_2( vec2 p )
{
    return vec2(fbm6(p+vec2(16.8)), fbm6(p+vec2(11.5)));
}

float domainWarp( vec2 p, out vec4 u) {
  // p /= 4.0;

  // vec2 xu = vec2(fbm6((p * vec2(2.0) + fbmParam1) + fbm3(p + 15.0)), fbm3(p + fbm3(p + 123.0)));
  // xu += 0.05 * sin( vec2(0.9) + length(xu) * time);
  // vec2 yu = vec2(fbm3(13.0 * xu), fbm6(fbmParam2 * xu));
  // yu += 0.05 * sin( vec2(0.1) + length(yu) * time);
  // u = vec4(xu, yu);

  // float f = fbm3(p) * fbm6(p) * fbm6(p + vec2(6.));

  // return mix(f, f*f*f, f*abs(yu.x));

  p += p * fbmParam1;

  p += 0.03*sin( vec2(0.27, 0.23) * time + length(p)*vec2(4.1,4.3));

	vec2 o = fbm4_2( 0.9*p );

  o += 0.06 * sin( vec2(0.15, 0.09)*time + length(o));

  vec2 n = fbm6_2( 3.0*o );

  u = vec4( o, n );

  float f = 0.5 + 0.5*fbm6( 1.8*p + 6.0*n );

  return mix( f, f*f*f*3.5, f*abs(n.x) );
}

void main( void ) {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  vec4 ou = vec4(0.);
  float d = domainWarp(uv, ou);

  vec3 col = vec3(0.0);
  col = mix(
    vec3(-0.299,0.999,0.149),
    // vec3(1.0),
    vec3(0.359,0.49,0.722),
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
    vec3(0.0786,0.0865,0.0976),
    // dot(abs(ou.zw), abs(ou.zw) * 1.0)
    dot(ou.zw, ou.zw)
    // smoothstep(0.2, 5.8, abs(ou.z)+abs(ou.w))
  );

  col = 1.5 * col;

  gl_FragColor = vec4(col, 1.);
}
