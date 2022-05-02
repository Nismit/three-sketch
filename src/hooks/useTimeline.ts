import { useState, useRef, useEffect, useCallback } from "preact/hooks";
<<<<<<< HEAD
=======
import { RECORDING_STATUS, RECORDING } from "./const";
>>>>>>> ac3eb05 (First commit)

const TOTAL_FRAMES = 600;

// Update frame per frame
// when drag range input, the frame update should be stopped
export const useTimeline = () => {
  const [time, setTime] = useState(0);
<<<<<<< HEAD
  const [recording, setRecording] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFrames, setTotalFrames] = useState(TOTAL_FRAMES);
=======
  const [recording, setRecording] = useState<RECORDING>(
    RECORDING_STATUS.INITIAL
  );
  const [isRunning, setIsRunning] = useState(false);
  const [totalFrames, setTotalFrames] = useState(TOTAL_FRAMES);
  // const inputRef = useRef<HTMLInputElement>(null);
>>>>>>> ac3eb05 (First commit)
  const rafRef = useRef<number>();

  const changeTime = useCallback(
    (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        setIsRunning(false);
        // console.log(parseInt(e.target.value, 10));
        setTime(parseInt(e.target.value, 10));
      }
    },
    [setTime]
  );

  const changeFrames = useCallback(
    (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        setIsRunning(false);
        if (!e.target.value) {
          setTotalFrames(1);
          return;
        }

        const integer =
          parseInt(e.target.value, 10) <= 0 ? 1 : parseInt(e.target.value, 10);
        setTotalFrames(integer);
      }
    },
    [setTotalFrames]
  );

<<<<<<< HEAD
=======
  // useEffect(() => {
  //   if (inputRef.current) {
  //     // const canvas = inputRef.current;
  //     // console.log("useEffect - canvas", canvas);
  //     // console.log("useEffect - useTimeline", inputRef.current);
  //   }
  // }, [inputRef]);

>>>>>>> ac3eb05 (First commit)
  const loop = useCallback(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(loop);
      setTime((prevCount) => {
        if (prevCount !== totalFrames) {
          return ++prevCount;
        }

<<<<<<< HEAD
=======
        if (recording === RECORDING_STATUS.RECORDING) {
          setIsRunning(false);
          setRecording(RECORDING_STATUS.RECORDED);
          return totalFrames;
        }

>>>>>>> ac3eb05 (First commit)
        return 0;
      });
    }
  }, [isRunning]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [loop]);

  return {
    time,
    totalFrames,
    isRunning,
    recording,
    changeTime,
    changeFrames,
    setIsRunning,
    setRecording,
  };
};
