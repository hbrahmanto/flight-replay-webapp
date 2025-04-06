export default function PlaybackControls({playing, onPlayPause, speed, setSpeed, onRestart}) {
  return (
    <div className="playback-controls" style={{ margin: '10px 0' }}>
      <button onClick={onPlayPause}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <label style={{marginLeft: '10px'}}>
        Speed:
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          <option value={1}>1x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
        </select>
      </label>
      <button onClick={onRestart} style={{marginLeft: '10px'}}>
        Start Over
      </button>
    </div>
  );
}
