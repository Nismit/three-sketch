import {
  IconQuestionMark,
  IconFileDownload,
  IconSettings,
} from "@tabler/icons-preact";
import { KEYBOARD_KEYS } from "./const";
import { useThree } from "./hooks/useThree";
import { useTimeline } from "./hooks/useTimeline";
import { useEventListener } from "./hooks/useEventListener";
import { useToggle } from "./hooks/useToggle";
import { Timeline } from "./components/Timeline";
import { Modal } from "./components/Modal";
import { Help } from "./components/Help";
import { Download } from "./components/Download";
import { Config } from "./components/Config";

export function App() {
  const {
    time,
    totalFrames,
    isRunning,
    recording,
    changeTime,
    changeFrames,
    setIsRunning,
    setRecording,
  } = useTimeline();

  const { toggle: helpModalToggle, changeToggle: helpModalChangeToggle } =
    useToggle();
  const {
    toggle: downloadModalToggle,
    changeToggle: downloadModalChangeToggle,
  } = useToggle();
  const { toggle: configModalToggle, changeToggle: configModalChangeToggle } =
    useToggle();

  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === KEYBOARD_KEYS.SPACE) {
      setIsRunning(!isRunning);
    }

    if (event.code === KEYBOARD_KEYS.SLASH || event.code === KEYBOARD_KEYS.O) {
      helpModalChangeToggle(!helpModalToggle);
      downloadModalChangeToggle(false);
      configModalChangeToggle(false);
    }

    if (event.code === KEYBOARD_KEYS.D) {
      downloadModalChangeToggle(!downloadModalToggle);
      helpModalChangeToggle(false);
      configModalChangeToggle(false);
    }

    if (event.code === KEYBOARD_KEYS.C) {
      configModalChangeToggle(!configModalToggle);
      downloadModalChangeToggle(false);
      helpModalChangeToggle(false);
    }
  };
  useEventListener("keydown", keyHandler);

  const { threeRef, size, setSize, fps, setFps, progress, setScreenshot } =
    useThree({
      time,
      totalFrames,
      recording,
      setRecording,
    });

  return (
    <>
      <div className="icon_container">
        <button
          className="circle_icon"
          title="Help"
          onClick={() => helpModalChangeToggle(true)}
        >
          <IconQuestionMark size={19} />
        </button>
        <button
          className="circle_icon"
          title="Download"
          onClick={() => downloadModalChangeToggle(true)}
        >
          <IconFileDownload size={19} />
        </button>
        <button
          className="circle_icon"
          title="Config"
          onClick={() => configModalChangeToggle(true)}
        >
          <IconSettings size={19} />
        </button>
      </div>
      <div ref={threeRef} className="canvasContainer" />
      <Timeline
        time={time}
        totalFrames={totalFrames}
        changeTime={changeTime}
        // changeFrames={changeFrames}
      />
      <Modal isActive={helpModalToggle} toggleModal={helpModalChangeToggle}>
        <Help />
      </Modal>

      <Modal
        isActive={downloadModalToggle}
        toggleModal={downloadModalChangeToggle}
        preventClose={recording}
      >
        <Download
          recording={recording}
          totalFrames={totalFrames}
          fps={fps}
          size={size}
          progress={progress}
          setIsRunning={setIsRunning}
          setRecording={setRecording}
          changeFrames={changeFrames}
          setFps={setFps}
          setCaptureSize={setSize}
          setScreenshot={setScreenshot}
        />
      </Modal>

      <Modal
        isActive={configModalToggle}
        toggleModal={configModalChangeToggle}
        preventClose={recording}
      >
        <Config totalFrames={totalFrames} changeFrames={changeFrames} />
      </Modal>
    </>
  );
}
