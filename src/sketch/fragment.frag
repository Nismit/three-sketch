#ifdef GL_ES
precision highp float;
#endif

uniform float offset;

void main() {
	gl_FragColor = vec4(1.0,offset,0.75, 1.0);
}
