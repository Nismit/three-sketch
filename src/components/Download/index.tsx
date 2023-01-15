import { useRef } from "preact/hooks";

type Options = {
  fps: number;
  frame: number;
};

type Props = {
  recording: boolean;
  totalFrames: number;
  recordOptions: Options;
  setIsRunning: (value: boolean) => void;
  setRecording: (value: boolean) => void;
  changeFrames: (e: Event) => void;
  setRecordOptions: ({ fps, frame }: Options) => void;
};

export const Download = ({
  recording,
  totalFrames,
  recordOptions,
  setIsRunning,
  setRecording,
  changeFrames,
  setRecordOptions,
}: Props) => {
  const fpsRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h2>Download</h2>
      <div>
        <label for="frames">Frames</label>
        <input
          type="number"
          id="frames"
          value={totalFrames}
          onChange={changeFrames}
        />
      </div>
      <div>
        <label for="fps">FPS</label>
        <input ref={fpsRef} type="number" id="fps" value={recordOptions.fps} />
      </div>
      <div>
        <label for="duration">Duration</label>
        <input
          ref={durationRef}
          type="number"
          id="duration"
          value={recordOptions.frame}
        />
      </div>
      <div>
        <button
          onClick={() => {
            if (fpsRef.current && durationRef.current) {
              setRecordOptions({
                fps: parseInt(fpsRef.current.value),
                frame: parseInt(durationRef.current.value),
              });
            }
            setIsRunning(false);
            setRecording(true);
          }}
        >
          {recording ? "Recording..." : "Record"}
        </button>
      </div>
    </div>
  );
};
