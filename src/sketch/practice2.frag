precision highp float;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

// https://www.shadertoy.com/view/MsS3Wc
// Smooth HSV to RGB conversion
vec3 hsv2rgb_smooth( in vec3 c ) {
  vec3 rgb = clamp(abs(mod( c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) -3.0) -1.0, 0.0, 1.0 );
  rgb = rgb * rgb * (3.0 - 2.0*rgb); // cubic smoothing
  return c.z * mix( vec3(1.0), rgb, c.y);
}

mat2 rotate2d(float _angle) {
  return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

float box(in vec2 _st, in vec2 _size) {
  _size = vec2(0.5) - _size*0.5;
  vec2 uv = smoothstep(_size,
                      _size+vec2(0.001),
                      _st);
  uv *= smoothstep(_size,
                  _size+vec2(0.001),
                  vec2(1.0)-_st);
  return uv.x*uv.y;
}

float stroke(float x, float s, float w) {
  float d = step(s, x+w * .5) - step(s, x-w * .5);
  return clamp(d, 0., 1.);
}

float cross(in vec2 _st, float _size){
  return  box(_st, vec2(_size,_size/8.)) +
          box(_st, vec2(_size/8.,_size));
}

float circleSDF(vec2 st) {
  return length(st-.5) * 2.;
}

void main() {
  vec2 st = (gl_FragCoord.xy / resolution.xy) - 1.0;
    st.x *= resolution.x / resolution.y;
  vec3 color = vec3(0.0);

  // move space from the center to the vec2(0.0)
  // st -= vec2(0.);
  st = mat2(0.5, 0.0, 0.0, 0.5) * st;
  // rotate the space
  st = rotate2d( PI * (time/300.0) ) * st;
  // move it back to the original place
  st += vec2(0.5);

  // Show the coordinates of the space on the background
  color = hsv2rgb_smooth( vec3(0.149, 0.212, 0.401) );

  // Add the shape on the foreground
  color += vec3(cross(st, 0.5));

  color += stroke(circleSDF(st), 0.5, .05);
  color += stroke(circleSDF(st), 0.95, .05);

  gl_FragColor = vec4(color, 1.0);
}
