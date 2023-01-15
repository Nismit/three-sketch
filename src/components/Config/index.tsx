type Props = {
  totalFrames: number;
  changeFrames: (e: Event) => void;
};

export const Config = ({ totalFrames, changeFrames }: Props) => (
  <div>
    <h2>Config</h2>
    <div>
      <label for="frames">Total Frames</label>
      <input
        type="number"
        id="frames"
        value={totalFrames}
        onChange={changeFrames}
      />
    </div>
  </div>
);
