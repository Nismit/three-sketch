precision highp float;
attribute vec2 uv;
attribute vec3 position;

void main() {
  vec4 retinaPos = vec4(position, 1.0);
  retinaPos.xy = retinaPos.xy * 2.0 - 1.0;
  gl_Position = retinaPos;
}
