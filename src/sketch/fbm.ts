import { Vector2, Vector3 } from "three";
import { Parameter } from "../types/Parameter";
import fbm from "./fbm.frag";

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
  {
    fbmColor1: {
      value: { x: 0.2, y: 0.1, z: 0.4 },
    },
    config: { min: 0.0, max: 1.0, step: 0.001 },
  },
  {
    fbmColor2: {
      value: { x: 0.569, y: 0.718, z: 0.851 },
    },
    config: { min: 0.0, max: 1.0, step: 0.001 },
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
    fbmColor1: {
      value: new Vector3(0.2, 0.1, 0.4),
    },
    fbmColor2: {
      value: new Vector3(0.569, 0.718, 0.851),
    },
  },
  parameters: params,
};

export default fbmObject;
