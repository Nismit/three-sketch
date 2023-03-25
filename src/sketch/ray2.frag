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

  // Camera
  vec3 pos = vec3(0, 0, 2.0);
  vec3 direction = vec3(0, 0, -1.0);
  vec3 up = vec3(0, 1.0, 0);
  vec3 side = cross(direction, up);
  float depth = 0.5;

  vec3 ray = normalize(side * p.x + up * p.y + direction * depth);

  // marching loop
  float rayDistance = 0.; // レイとオブジェクトの最短距離
  float rayLength = 0.; // レイに継ぎ足す長さ
  vec3 rayPosition = pos; // レイの先端位置 -> これを当たるまで足していく
  for(int i = 0; i < 99; i++) {
    rayDistance = sphere(rayPosition); // オブジェクトの距離
    rayLength += rayDistance; // レイにオブジェクトまでの距離を足す
    rayPosition = pos + ray * rayLength; // レイの先端位置を進めていく
  }

  if(abs(rayDistance) < 0.001) {
    gl_FragColor = vec4(vec3(1.), 1.0);
  } else {
    gl_FragColor = vec4(vec3(0), 1.0);
  }
}
