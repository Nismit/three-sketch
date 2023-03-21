precision highp float;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359

const float sphereSize = 1.6;

float sphere(vec3 p) {
  return length(p) - sphereSize;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  // ro: ray origin
  // vec3 ro = vec3(0, 0, 0.01);
  // rd: ray direction
  // vec3 rd = normalize(vec3(p, 0.) - ro);

  vec3 pos = vec3(0, 0, 3.0);
  vec3 direction = vec3(0, 0, -1.0);
  vec3 up = vec3(0, 1.0, 0);
  vec3 side = cross(direction, up);
  float depth = 0.1;

  vec3 ray = normalize(side * p.x + up * p.y + direction * depth);

  gl_FragColor = vec4(ray.xy, -ray.z, 1.0);
}
