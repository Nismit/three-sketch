type Props = {
  time: number;
  totalFrames: number;
  // changeFrames: (e: Event) => void;
  changeTime: (e: Event) => void;
};

export const Timeline = ({
  time,
  totalFrames,
  // changeFrames,
  changeTime,
}: Props) => {
  return (
    <div className="timeline">
      <div>
        <input
          type="range"
          min={0}
          max={totalFrames}
          step={1}
          value={time}
          onChange={changeTime}
          class="timeline__slider"
          name="timeRange"
        />
        {/* <input
          class="currentTime"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          value={time}
          style={{ right: `${100 - (time / totalFrames) * 100}%` }}
        /> */}
      </div>
      {/* <div class="bottom">
        <input type="number" value={totalFrames} onChange={changeFrames} />
      </div> */}
    </div>
  );
};
