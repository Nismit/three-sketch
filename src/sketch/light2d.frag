precision highp float;
uniform float time;
uniform float pixelRatio;
uniform vec2 resolution;

#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))

const float PI = acos(-1.);
const float TAU = PI * 2.0;
const float MAX_SAMPLING = 32.0;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 opUnion(vec2 a, vec2 b) {
  return a.x < b.x ? a : b;
}

// Ref: https://iquilezles.org/articles/palettes/
vec3 palette( float t, vec3 a, vec3 b, vec3 c, vec3 d ) {
  return a + b*cos( 6.28318*(c*t+d) );
}

// Ref: https://iquilezles.org/articles/distfunctions2d/
float sdSegment( vec2 p, vec2 a, vec2 b, float r ) {
  vec2 pa = p-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

float disSeg(vec2 o, vec2 d, vec2 a, vec2 b) {
  vec2 e=a-b;
  vec2 f=a-o;

  if(f.y * e.x < f.x * e.y) {
    return 2.0;
  }

  float det = d.x * e.y - d.y * e.x;

  if(det == 0.) {
    return 2.0;
  }

  float s = (f.x * e.y - f.y * e.x) / det;
  float t = (d.x * f.y - d.y * f.x) / det;

  if(t >= 0. && t <= 1. && s > 0.) {
    return s;
  }

  return 2.0;
}

vec2 map(vec2 p) {
  vec2 res = vec2(0., 0.);
  res = vec2(sdSegment(p, vec2(0.,0.), vec2(0.5, 0.6), 0.01), 1.0);
  res = opUnion(res, vec2(sdSegment(p, vec2(0.55, 0.85), vec2(0.9,0.8), 0.01), 1.0));

  return res;
}

vec3 sampling(vec2 uv, vec2 d) {
  vec3 red = vec3(0.9, 0., 0.);
  vec3 green = vec3(0.761, 0.941, 0.596);
  vec3 blue = vec3(0.376, 0.302, 0.855);
  vec3 white = vec3(1.);
  vec3 col = vec3(0.);

  // 光の強度
  float strength = 3.;
  // 減衰率
  float attenuation = -5.;

  float t;
  if((  t = disSeg(uv, d, vec2(.1,.5), vec2(.4, 1.5))  ) < 2.0) {
    // 緑をベースに青を少し混ぜている
    col = (green * (strength + .5) * exp(attenuation * t) + blue * .5 * exp(-.001 * t));
  }
  else if ((  t = disSeg(uv, d, vec2(.4, .7), vec2(.5, .0))  ) < 2.0) {
    col = white * strength * exp(attenuation * t);
  }
  else if ((  t = disSeg(uv, d, vec2(-1., .0), vec2(1., -1.))  ) < 2.0) {
    col = blue * strength * exp(attenuation * t);
  }
  else if ((  t = disSeg(uv, d, vec2(1., -1.0), vec2(-1.0, .0))  ) < 2.0) {
    col = blue * strength * exp(attenuation * t);
  }


  return col;
}

void main( void ) {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  vec2 uv = p * 2.;

  vec3 red = vec3(0.9, 0., 0.);
  vec3 blue = vec3(0., 1., 0.);

  vec3 finalColor = vec3(0.);

  float n = rand(uv + time) * 5.;
  vec3 d;
  for(float i = 0.0; i < MAX_SAMPLING; i++) {
    d = sampling(
      uv,
      vec2(
        sin(n + (i * TAU) / MAX_SAMPLING),
        cos(n + (i * TAU) / MAX_SAMPLING)
      )
    );
    finalColor += d;
  }

  finalColor = finalColor / MAX_SAMPLING;

  gl_FragColor = vec4(finalColor, 1.0);
}
