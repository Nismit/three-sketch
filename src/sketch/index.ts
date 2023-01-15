import { Vector2 } from "three";
import { Parameter } from "../types/Parameter";
// import baseMesh from "../utils/baseMesh";
import mainFragment from "./fragment.frag";
import fbmFragment from "./fbm.frag";

import practicebject from "./practice";

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

// const planeObject = new baseMesh({
//   fragment: fbmFragment,
//   uniform: {
//     resolution: {
//       value: new Vector2(),
//     },
//     time: {
//       value: 0,
//     },
//     // offset: {
//     //   value: 0.75,
//     // },
//     seed: {
//       value: new Vector2(-0.345, 0.654),
//     },
//   },
//   parameters: params,
// });

export default practicebject;
