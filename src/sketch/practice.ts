import { Vector2, Vector3 } from "three";
import { Parameter } from "../types/Parameter";
// import baseMesh from "../utils/baseMesh";
// import practice1 from "./practice1.frag";
// import practice2 from "./practice2.frag";
// import ray from "./ray1.frag";
// import ray from "./ray2.frag";
// import ray from "./ray3.frag";
// import ray from "./ray4.frag";
// import ray from "./ray5.frag";
// import ray from "./ray6.frag";
// mod + cam rotate = too heavy
// import ray from "./ray7.frag";
// import ray from "./ray8.frag";
// import ray from "./ray9.frag";
// import ray from "./raya.frag";
// import ray from "./rayb.frag";
// import ray from "./rayc.frag";
// fav
// import ray from "./rayd.frag";
// import ray from "./raye.frag";
// Phong Reflect + Soft Shadow
import ray from "./rayf.frag";

const params: Parameter[] = [
  {
    lightPos: {
      value: { x: 1.0, y: 1.0, z: 1.0 },
    },
    config: {
      x: {
        step: 0.01,
        min: 0.0,
        max: 1.0,
      },
      y: {
        step: 0.01,
        min: 0.0,
        max: 1.0,
      },
      z: {
        step: 0.01,
        min: 0.0,
        max: 1.0,
      },
    },
  },
  {
    camPos: {
      value: { x: 0.001, y: 1.5, z: -4.0 },
    },
    config: {
      x: {
        step: 0.1,
        min: 0.0,
        max: 10.0,
      },
      y: {
        step: 0.1,
        min: 0.1,
        max: 10.0,
      },
      z: {
        step: 0.1,
        min: -10.0,
        max: 0.0,
      },
    },
  },
];

const practicebject = {
  fragment: ray,
  uniform: {
    pixelRatio: {
      value: window.devicePixelRatio,
    },
    resolution: {
      value: new Vector2(),
    },
    time: {
      value: 0,
    },
    lightPos: {
      value: new Vector3(1.0, 1.0, 1.0),
    },
    camPos: {
      value: new Vector3(0.001, 1.5, -4.0),
    },
  },
  parameters: params,
};

export default practicebject;
