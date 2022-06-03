import { Vector2 } from "three";
import { Parameter } from "../types/Parameter";
import baseMesh from "../utils/baseMesh";
// import practice1 from "./practice1.frag";
// import practice2 from "./practice2.frag";
// import ray1 from "./ray1.frag";
// import ray2 from "./ray2.frag";
// import ray3 from "./ray3.frag";
// import ray4 from "./ray4.frag";
// import ray5 from "./ray5.frag";
// import ray6 from "./ray6.frag";
// mod + cam rotate = too heavy
// import ray7 from "./ray7.frag";
// import ray8 from "./ray8.frag";
// import ray9 from "./ray9.frag";
import raya from "./raya.frag";

const params: Parameter[] = [
  // {
  //   offset: {
  //     value: 0.75,
  //   },
  //   config: { min: 0, max: 1, step: 0.01 },
  // },
  {
    seed: {
      value: { x: -0.345, y: 0.654 },
    },
    config: {
      x: {
        step: 0.0001,
        min: -2,
        max: 2,
      },
      y: {
        step: 0.0001,
        min: -2,
        max: 2,
      },
    },
  },
];

const practicebject = new baseMesh({
  fragment: raya,
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
    // offset: {
    //   value: 0.75,
    // },
    seed: {
      value: new Vector2(-0.345, 0.654),
    },
  },
  parameters: params,
});

export default practicebject;
