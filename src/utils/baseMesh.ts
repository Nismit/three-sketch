import {
  IUniform,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Mesh,
  Vector2,
} from "three";
import { Pane } from "tweakpane";
import type { Parameter, float, vec2 } from "../types/Parameter";
import vertexTemplate from "../glsl/main.vert";

const getObjectKey = (obj: Record<string, float | vec2>, omit: string) => {
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

export default class baseMesh {
  private _mesh: Mesh;
  private _geometry: PlaneBufferGeometry;
  private _material: RawShaderMaterial;
  private _uniform: { [key: string]: IUniform<any> };
  private _pane: Pane;

  constructor(props: {
    vertex?: string;
    fragment: string;
    uniform: { [key: string]: IUniform<any> };
    parameters?: Parameter[];
  }) {
    const { vertex, fragment, uniform, parameters } = props;
    this._pane = new Pane();
    this._uniform = uniform;
    this._geometry = new PlaneBufferGeometry(2, 2);
    this._material = new RawShaderMaterial({
      uniforms: this._uniform,
      vertexShader: vertex ?? vertexTemplate,
      fragmentShader: fragment,
      transparent: true,
    });
    this._mesh = new Mesh(this._geometry, this._material);

    if (parameters && parameters?.length > 0) {
      parameters.forEach((parameter) => {
        const { config, ...withoutConfig } = parameter;
        if (!Object.keys(withoutConfig).length) {
          return;
        }
        const key = getObjectKey(
          <{ [key: string]: float | vec2 }>withoutConfig,
          "config"
        );
        if (!key) return;
        const values = searchObjectFromKey(
          <{ [key: string]: float | vec2 }>withoutConfig,
          [key, "value"]
        );
        if (values === undefined) return;
        const newParam = { [key]: values };
        this._pane.addInput(newParam, key, parameter.config);
        this._pane.on("change", (ev) => {
          // console.log("changed:", ev.value);
          this._uniform[key].value = ev.value;
        });
      });
    } else {
      this._pane.dispose();
    }
  }

  get mesh() {
    return this._mesh;
  }

  set resolution(value: { x: number; y: number }) {
    this._uniform.resolution.value = new Vector2(value.x, value.y);
  }

  set time(value: number) {
    this._uniform.time.value = value;
  }

  dispose() {
    console.log("dispose");
    this._pane.dispose();
    this._uniform = {};
    this.mesh.clear();
    this._geometry.dispose();
    this._material.dispose();
  }
}
