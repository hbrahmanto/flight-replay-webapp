import { useState, useEffect, useRef } from 'react';
import MapDisplay from './components/MapDisplay';
import TelemetryPanel from './components/TelemetryData';
import { uploadTlog } from './api';
import { haversineDistance } from './utils';  //Used to calculate total distance
import './index.css';

function App() {
  const [flightData, setFlightData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing && flightData.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < flightData.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timerRef.current);
            setPlaying(false);
            return prev;
          }
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed, flightData]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const data = await uploadTlog(file);
      setFlightData(data);
      setCurrentIndex(0);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setPlaying(false);
  };

  //Calculate total distance and total flight duration
  const totalDistance = flightData.reduce((sum, point, index) => {
    if (index === 0) return sum;
    const prev = flightData[index - 1];
    return sum + haversineDistance(prev.lat, prev.lon, point.lat, point.lon);
  }, 0);

  const flightDurationMinutes = (flightData.length / speed) / 60;  //Approximate flight duration

  return (
    <div className="App" style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      {flightData.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }}>
          <input type="file" accept=".tlog" onChange={handleUpload} />
        </div>
      )}

      {flightData.length > 0 && (
        <>
          {/*Map Display*/}
          <MapDisplay flightData={flightData} currentIndex={currentIndex} />

          {/*Telemetry Data Box - Positioned at Top Right*/}
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            width: '235px',
          }}>
            {/*Telemetry Panel Component*/}
            <TelemetryPanel
              flightData={flightData}
              currentIndex={currentIndex}
              totalDistance={totalDistance}
              flightDurationMinutes={flightDurationMinutes}
            />
          </div>

          {/*Replay Controls Box - Positioned at Bottom Right*/}
          <div style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            width: '170px',
          }}>
            {/*Play/Pause Button*/}
            <button onClick={() => setPlaying(!playing)} style={{ width: '100%', padding: '10px', fontSize: '24px' }}>
              {playing ? '⏸️' : '▶️'}
            </button>

            {/*Speed Dropdown*/}
            <div style={{ width: '100%', textAlign: 'center' }}>
              <label style={{ marginBottom: '5px', display: 'block' }}>Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value={1}>1x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>

            {/*Start Over Button*/}
            <button
              onClick={handleRestart}
              style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}
            >
              Start Over
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
