import { JSXInternal } from "preact/src/jsx";

type Props = {
  recording: boolean;
  totalFrames: number;
  fps: number;
  size: Record<"width" | "height", number>;
  progress: number;
  setIsRunning: (value: boolean) => void;
  setRecording: (value: boolean) => void;
  changeFrames: (e: Event) => void;
  setFps: (value: number) => void;
  setCaptureSize: (value: Record<"width" | "height", number>) => void;
};

export const Download = ({
  recording,
  totalFrames,
  fps,
  size,
  progress,
  setIsRunning,
  setRecording,
  changeFrames,
  setFps,
  setCaptureSize,
}: Props) => {
  const onChangeSize = (e: JSXInternal.TargetedEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const newValue = { [target.id]: Number(target.value) };
    setCaptureSize({ ...size, ...newValue });
  };

  const onChangeSelect = (e: JSXInternal.TargetedEvent<HTMLSelectElement>) => {
    const target = e.target as HTMLSelectElement;

    if (!target.value) {
      return;
    }

    const newValue = Number(target.value);
    setCaptureSize({ width: newValue, height: newValue });
  };

  const onChangeFps = (e: JSXInternal.TargetedEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const newValue = Number(target.value);
    setFps(newValue);
  };

  return (
    <div>
      <h2>Download</h2>
      <form className="form__download">
        <div className="form__row">
          <label for="frames">Frames (Override)</label>
          <input
            type="number"
            id="frames"
            value={totalFrames}
            onChange={changeFrames}
          />
        </div>
        <div className="form__row">
          <label for="outputSize">Output Size</label>
          <select name="outputSize" onInput={onChangeSelect}>
            <option value="">-- Select Preset Size --</option>
            <option value="500">500x500</option>
            <option value="1000">1000x1000</option>
            <option value="1024">1024x1024</option>
            <option value="2000">2000x2000</option>
            <option value="2048">2048x2048</option>
          </select>
        </div>
        <div className="form__row">
          <div>
            <label for="width">Width</label>
            <input
              type="number"
              id="width"
              step="1"
              min="1"
              value={size.width}
              onInput={onChangeSize}
            />
          </div>
        </div>
        <div className="form__row">
          <div>
            <label for="height">Height</label>
            <input
              type="number"
              id="height"
              step="1"
              min="1"
              value={size.height}
              onChange={onChangeSize}
            />
          </div>
        </div>
        <div>
          <div className="form__row">
            <label for="fps">FPS</label>
            <input
              type="number"
              id="fps"
              step="1"
              min="1"
              value={fps}
              onInput={onChangeFps}
            />
          </div>
        </div>
        <div>
          <button
            className="button__record"
            type="submit"
            onClick={() => {
              setIsRunning(false);
              setRecording(true);
            }}
            disabled={recording ? true : false}
          >
            {recording ? "Recording..." : "Record"}
          </button>
        </div>
      </form>
      <div className="indicator" style={{ width: `${progress * 100}%` }} />
    </div>
  );
};
