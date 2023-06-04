import { Vector2 } from "three";
import { Parameter } from "../types/Parameter";
import fbm from "./fbm.frag";

const params: Parameter[] = [
  {
    fbmParam1: {
      value: { x: 0.0, y: 0.0 },
    },
    config: { min: 0.0, max: 100.0, step: 1.0 },
  },
  {
    fbmParam2: {
      value: { x: 0.0, y: 0.0 },
    },
    config: { min: 0.0, max: 100.0, step: 1.0 },
  },
];

const fbmObject = {
  fragment: fbm,
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
    fbmParam1: {
      value: new Vector2(0.0, 0.0),
    },
    fbmParam2: {
      value: new Vector2(0.0, 0.0),
    },
  },
  parameters: params,
};

export default fbmObject;
