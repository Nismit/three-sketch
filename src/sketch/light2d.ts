import { Vector2 } from "three";
import { Parameter } from "../types/Parameter";
import light2d from "./light2d.frag";

const params: Parameter[] = [
  {
    fbmParam1: {
      value: { x: 0.0, y: 0.0 },
    },
    config: { min: -10.0, max: 10.0, step: 0.001 },
  },
  {
    fbmParam2: {
      value: { x: 0.0, y: 0.0 },
    },
    config: { min: 0.0, max: 100.0, step: 1.0 },
  },
];

const light2dObject = {
  fragment: light2d,
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

export default light2dObject;
