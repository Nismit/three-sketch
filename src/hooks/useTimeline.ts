import { useState, useRef, useEffect, useCallback } from "preact/hooks";
import { KEY_TOTAL_FRAMES } from "../const";

// Update frame per frame
// when drag range input, the frame update should be stopped
export const useTimeline = () => {
  const [time, setTime] = useState(0);
  const [recording, setRecording] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const rafRef = useRef<number>();

  const changeTime = useCallback(
    (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        setIsRunning(false);
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
        localStorage.setItem(KEY_TOTAL_FRAMES, integer.toString());
      }
    },
    [setTotalFrames]
  );

  const loop = useCallback(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(loop);
      setTime((prevCount) => {
        if (prevCount !== totalFrames) {
          return ++prevCount;
        }

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

  useEffect(() => {
    const totalFramesData = localStorage.getItem(KEY_TOTAL_FRAMES);
    const totalFramesCounts = totalFramesData ? Number(totalFramesData) : 60;
    setTotalFrames(totalFramesCounts);
  }, []);

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
