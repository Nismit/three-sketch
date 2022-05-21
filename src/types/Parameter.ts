export type float = {
  value: number;
};

export type vec2 = {
  value: {
    x: number;
    y: number;
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

type unionGeneral = { [key: string]: float | vec2 };
type unionConfig = { config: floatConfig | vec2Config };

export type Parameter = unionGeneral | unionConfig;
