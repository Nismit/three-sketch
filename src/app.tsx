import {
  IconQuestionMark,
  IconFileDownload,
  IconSettings,
} from "@tabler/icons";
import { useThree } from "./hooks/useThree";
import { useTimeline } from "./hooks/useTimeline";
import { useEventListener } from "./hooks/useEventListener";
import { useToggle } from "./hooks/useToggle";
import { Timeline } from "./components/Timeline";
import { Modal } from "./components/Modal";
import { Help } from "./components/Help";
import { Download } from "./components/Download";
import { Config } from "./components/Config";

const SPACE_CODE = "Space";
const SLASH_CODE = "Slash";
const KEY_O = "KeyO";
const KEY_D = "KeyD";
const KEY_C = "KeyC";

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
    if (event.code === SPACE_CODE) {
      setIsRunning(!isRunning);
    }

    if (event.code === SLASH_CODE || event.code === KEY_O) {
      helpModalChangeToggle(!helpModalToggle);
      downloadModalChangeToggle(false);
      configModalChangeToggle(false);
    }

    if (event.code === KEY_D) {
      downloadModalChangeToggle(!downloadModalToggle);
      helpModalChangeToggle(false);
      configModalChangeToggle(false);
    }

    if (event.code === KEY_C) {
      configModalChangeToggle(!configModalToggle);
      downloadModalChangeToggle(false);
      helpModalChangeToggle(false);
    }
  };
  useEventListener("keydown", keyHandler);

  const { threeRef, recordOptions, setRecordOptions } = useThree({
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
          recordOptions={recordOptions}
          setIsRunning={setIsRunning}
          setRecording={setRecording}
          changeFrames={changeFrames}
          setRecordOptions={setRecordOptions}
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
