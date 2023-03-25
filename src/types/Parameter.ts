export type float = {
  value: number;
};

export type vec2 = {
  value: {
    x: number;
    y: number;
  };
};

export type vec3 = {
  value: {
    x: number;
    y: number;
    z: number;
  };
};

type floatConfig = {
  min?: number;
  max?: number;
  step?: number;
};

type vec2Config = {
  x: {
    min?: number;
    max?: number;
    step?: number;
  };
  y: {
    min?: number;
    max?: number;
    step?: number;
  };
};

type vec3Config = {
  x: {
    min?: number;
    max?: number;
    step?: number;
  };
  y: {
    min?: number;
    max?: number;
    step?: number;
  };
  z: {
    min?: number;
    max?: number;
    step?: number;
  };
};

type unionGeneral = { [key: string]: float | vec2 | vec3 };
type unionConfig = { config: floatConfig | vec2Config | vec3Config };

export type Parameter = unionGeneral | unionConfig;
