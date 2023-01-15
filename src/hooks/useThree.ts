import { useRef, useEffect, useState } from "preact/hooks";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { useEventListener } from "./useEventListener";
// import { boxObject } from "../utils/boxObject";
import sketch from "../sketch";

type Props = {
  time: number;
  totalFrames: number;
  recording: boolean;
  setRecording: (value: boolean) => void;
};

const scene = new Scene();
const camera = new PerspectiveCamera(75, 1, 0.1, 10);
const renderer = new WebGLRenderer();

// Config
camera.position.z = 1;
// const cube = boxObject();

export const useThree = ({
  time,
  totalFrames,
  recording,
  setRecording,
}: Props) => {
  const threeRef = useRef<HTMLDivElement>(null);
  const [recordOptions, setRecordOptions] = useState({
    fps: 60,
    frame: totalFrames,
  });

  const resizeHandler = () => {
    if (threeRef.current) {
      const width = threeRef.current.clientWidth;
      const height = threeRef.current.clientHeight;

      sketch.resolution = { x: width, y: height };

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const render = (frame?: number) => {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    sketch.time = frame ?? time;
    renderer.render(scene, camera);
  };

  useEventListener("resize", resizeHandler);

  useEffect(() => {
    if (threeRef.current) {
      resizeHandler();
      threeRef.current.appendChild(renderer.domElement);
      // scene.add(cube);
      scene.add(sketch.mesh);
    }

    return () => {
      if (threeRef.current) {
        sketch.dispose();
        scene.remove(sketch.mesh);
        renderer.dispose();
        threeRef.current.removeChild(renderer.domElement);
      }
    };
  }, [threeRef]);

  useEffect(() => {
    render();
  }, [time]);

  const handleSave = async (data: Blob) => {
    try {
      await fetch("http://localhost:8080", {
        method: "POST",
        mode: "cors",
        body: data,
      });
    } catch (err: Error | unknown) {
      console.log("Err:", err);
    }
  };

  useEffect(() => {
    if (recording) {
      console.log("Options", recordOptions);

      const framesData: any = {};
      const frames = recordOptions.frame;
      const framesNameLength = Math.ceil(Math.log10(frames));

      for (let i = 0; i < frames; i++) {
        render(i);
        const frameName = i.toString().padStart(framesNameLength, "0");
        framesData[frameName] = renderer.domElement.toDataURL("image/png");
      }

      const blob = new Blob([JSON.stringify(framesData)], {
        type: "application/json",
      });

      handleSave(blob);

      // const fileName = "capture.json";
      // const a = document.createElement("a");
      // document.body.appendChild(a);
      // a.style.display = "none";
      // const jsonURL = URL.createObjectURL(blob);
      // a.href = jsonURL;
      // a.download = fileName;
      // a.click();

      setRecording(false);
    }
  }, [recording]);

  return { threeRef, recordOptions, setRecordOptions };
};
