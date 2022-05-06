import {
  IUniform,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Mesh,
  Vector2,
} from "three";
import { Pane } from "tweakpane";

const getObjectKey = (obj: Record<string, unknown>, omit: string) => {
  return Object.keys(obj)
    .filter((key) => key !== omit)
    .at(0);
};

const searchObjectFromKey = (obj: Record<string, unknown>, keys: string[]) =>
  keys.reduce((acc: any, cur) => {
    try {
      return acc[cur];
    } catch (e) {
      return;
    }
  }, obj) as Record<string, number> | undefined;

type Parameter = {
  [key: string]: { [key: string]: number | { [key: string]: number } };
};

export default class baseMesh {
  _mesh: Mesh;
  _geometry: PlaneBufferGeometry;
  _material: RawShaderMaterial;
  // _uniform: { [key: string]: IUniform<any> };
  _pane: Pane;

  constructor() {
    this._pane = new Pane();
    this._geometry = new PlaneBufferGeometry(2, 2);
    this._material = new RawShaderMaterial({
      uniforms: {},
      vertexShader: Vertex,
      fragmentShader: fbmFragment,
      transparent: true,
    });
    this._mesh = new Mesh(this._geometry, this._material);

    const PARAMS = {
      factor: 123,
      title: "hello",
      color: "#ff0055",
    };

    this._pane.addInput(PARAMS, "factor");
    this._pane.addInput(PARAMS, "title");
    this._pane.addInput(PARAMS, "color");

    const parameters: Parameter[] = [
      {
        offset: {
          value: {
            x: 0,
            y: 0,
          },
        },
        config: {
          x: { step: 2 },
          y: { min: 0, max: 100, step: 1 },
        },
      },
    ];

    parameters.forEach((parameter) => {
      const { config, ...withoutConfig } = parameter;
      const key = getObjectKey(withoutConfig, "config");
      if (!key) return;
      const values = searchObjectFromKey(withoutConfig, [key, "value"]);
      if (!values) return;
      const newParam = { [key]: values };
      this._pane.addInput(newParam, key, parameter.config);
    });

    this._pane.on("change", (ev) => {
      console.log("changed: " + JSON.stringify(ev.value));
    });
  }

  get mesh() {
    return this._mesh;
  }

  dispose() {
    this._pane.dispose();
    this.mesh.clear();
    this._geometry.dispose();
    this._material.dispose();
  }

  resolution(value: { [key: string]: number }) {
    // this._uniform.u_resolution.value = value;
  }

  time(value: number) {
    // this._uniform.u_time.value += value;
  }
}

const Vertex = `
  precision highp float;
  attribute vec2 uv;
  attribute vec3 position;
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
`;

const fbmFragment = `
#ifdef GL_ES
precision highp float;
#endif

void main() {
	gl_FragColor = vec4(1.0,0.0,0.75,1.0);
}
`;
