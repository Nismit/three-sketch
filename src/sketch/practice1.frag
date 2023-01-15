precision highp float;
uniform vec2 resolution;
uniform float time;

void main() {
  vec2 st = (gl_FragCoord.xy / resolution.xy) / 2.0;
  vec3 color = vec3(0.0);

  // Each result will return 1.0 (white) or 0.0 (black).
  float border;
  vec2 bl = step(vec2(0.1), st);
  vec2 tr = step(vec2(0.1), 1.0-st);
  border = bl.x * bl.y;
  border *= tr.x * tr.y;

  float borderInner;
  vec2 bli = 1.0 - step(vec2(0.2), st);
  vec2 tri = 1.0 - step(vec2(0.2), 1.0 - st);
  borderInner = bli.x - bli.y;
  borderInner += tri.x - tri.y;

  float borderInner2;
  vec2 bli2 = 1.0 - step(vec2(0.4), st);
  vec2 tri2 = 1.0 - step(vec2(0.4), 1.0 - st);
  borderInner2 = bli2.x - bli2.y;
  borderInner2 += tri2.x - tri2.y;

  // The multiplication of left*bottom will be similar to the logical AND.
  color = vec3( border * borderInner / borderInner2 );

  gl_FragColor = vec4(color,1.0);
}
