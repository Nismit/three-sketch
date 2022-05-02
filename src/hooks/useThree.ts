import { useRef, useEffect, useState } from "preact/hooks";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { useEventListener } from "./useEventListener";
import { boxObject } from "../utils/boxObject";
import { Pane } from "tweakpane";

type Props = {
  time: number;
  recording: boolean;
  setRecording: (value: boolean) => void;
};

const pane = new Pane();
const scene = new Scene();
const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new WebGLRenderer();

const PARAMS = {
  factor: 123,
  title: "hello",
  color: "#ff0055",
};

pane.addInput(PARAMS, "factor");
pane.addInput(PARAMS, "title");
pane.addInput(PARAMS, "color");

// Config
camera.position.z = 3;
const cube = boxObject();

export const useThree = ({ time, recording, setRecording }: Props) => {
  const threeRef = useRef<HTMLDivElement>(null);
  const [recordOptions, setRecordOptions] = useState({
    fps: 60,
    duration: 1000,
  });

  const resizeHandler = () => {
    if (threeRef.current) {
      const width = threeRef.current.clientWidth;
      const height = threeRef.current.clientHeight;
      // console.log(threeRef.current.clientHeight);

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const render = () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  };

  useEventListener("resize", resizeHandler);

  useEffect(() => {
    if (threeRef.current) {
      resizeHandler();
      threeRef.current.appendChild(renderer.domElement);
      scene.add(cube);
    }

    return () => {
      if (threeRef.current) {
        scene.remove(cube);
        renderer.dispose();
        threeRef.current.removeChild(renderer.domElement);
        pane.dispose();
      }
    };
  }, [threeRef]);

  useEffect(() => {
    render();
  }, [time]);

  useEffect(() => {
    if (recording) {
      console.log("Start Recording");

      console.log("Options", recordOptions);

      const framesData: any = {};
      const frameDuration = 1e3 / recordOptions.fps;
      const frames = Math.round(recordOptions.duration / frameDuration);
      const framesNameLength = Math.ceil(Math.log10(frames));

      for (let i = 0; i < frames; i++) {
        const timestamp = i * frameDuration;

        // This is the function to render to canvas
        render();

        const frameName = i.toString().padStart(framesNameLength, "0");
        framesData[frameName] = renderer.domElement.toDataURL("image/png");
      }

      const fileName = "capture.json";
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      const blob = new Blob([JSON.stringify(framesData)], {
        type: "application/json",
      });
      const jsonURL = URL.createObjectURL(blob);
      a.href = jsonURL;
      a.download = fileName;
      a.click();

      setRecording(false);
    }
  }, [recording]);

  return { threeRef, recordOptions, setRecordOptions };
};
