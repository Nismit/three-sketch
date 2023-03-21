import { useRef, useEffect, useState } from "preact/hooks";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { useEventListener } from "./useEventListener";
// import { boxObject } from "../utils/boxObject";
import sketchObject from "../sketch/practice";
import baseMesh from "../utils/baseMesh";

type Props = {
  time: number;
  totalFrames: number;
  recording: boolean;
  setRecording: (value: boolean) => void;
};

const scene = new Scene();
const camera = new PerspectiveCamera(75, 1, 0.1, 10);
const renderer = new WebGLRenderer();
const captureRenderer = new WebGLRenderer();
const sketch = new baseMesh(sketchObject);

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
  const [fps, setFps] = useState(30);
  const [size, setSize] = useState({ width: 500, height: 500 });
  const [progress, setProgress] = useState(0);

  const resizeHandler = () => {
    if (threeRef.current) {
      const width = threeRef.current.clientWidth;
      const height = threeRef.current.clientHeight;

      sketch.resolution = { x: width, y: height };

      renderer.setSize(width, height);
      renderer.setPixelRatio(1.0);
      // renderer.setPixelRatio(window.devicePixelRatio);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const render = () => {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    sketch.time = time;
    renderer.render(scene, camera);
  };

  const captureRender = (frame: number) => {
    sketch.time = frame;
    captureRenderer.render(scene, camera);
  };

  const loadFFmpeg = async () => {
    if (!("FFmpeg" in window)) {
      console.log("Does not load FFmpeg");
      return;
    }

    if (!("SharedArrayBuffer" in window)) {
      console.log("Does not support SharedArrayBuffer");
      return;
    }

    const option = import.meta.env.PROD
      ? {
          corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
          log: false,
        }
      : {
          log: true,
        };

    const ffmpeg = (window as any).FFmpeg.createFFmpeg(option);

    return ffmpeg;
  };

  const createPngToGif = async () => {
    try {
      const frames = totalFrames;
      const framesNameLength = Math.ceil(Math.log10(frames));

      const ffmpeg = await loadFFmpeg();
      await ffmpeg.load();

      ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
        setProgress(ratio);
      });

      // Resize
      captureRenderer.setSize(size.width, size.height);
      captureRenderer.setPixelRatio(1.0);
      sketch.resolution = { x: size.width, y: size.height };
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();

      for (let i = 0; i < frames; i++) {
        captureRender(i);
        const frameName = i.toString().padStart(framesNameLength, "0");
        const data = captureRenderer.domElement.toDataURL("image/png");
        const encoded = atob(data.split(",")[1])
          .split("")
          .map((c) => c.charCodeAt(0));
        ffmpeg.FS("writeFile", `tmp.${frameName}.png`, new Uint8Array(encoded));
      }

      resizeHandler();

      await ffmpeg.run(
        "-framerate",
        `${fps}`,
        "-pattern_type",
        "glob",
        "-i",
        "*.png",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-pix_fmt",
        "yuv420p",
        "out.mp4"
      );
      const data = ffmpeg.FS("readFile", "out.mp4");

      for (let i = 0; i < frames; i++) {
        const frameName = i.toString().padStart(framesNameLength, "0");
        ffmpeg.FS("unlink", `tmp.${frameName}.png`);
      }

      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      const jsonURL = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      a.href = jsonURL;
      a.download = "output.mp4";
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      if (e instanceof Error) {
        console.log("Err:", e.message);
      } else {
        console.log("Something went wrong", JSON.stringify(e));
      }
    } finally {
      setRecording(false);
      setProgress(0);
    }
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
        threeRef.current.removeChild(renderer.domElement);
        renderer.dispose();
        captureRenderer.dispose();
      }
    };
  }, [threeRef]);

  useEffect(() => {
    render();
  }, [time]);

  useEffect(() => {
    if (recording) {
      createPngToGif();
    }
  }, [recording]);

  return { threeRef, size, setSize, fps, setFps, progress };
};
