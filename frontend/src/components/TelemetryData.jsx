export default function TelemetryPanel({ flightData, currentIndex, totalDistance, flightDurationMinutes }) {
    const currentPoint = flightData[currentIndex] || {};

    return (
      <div>
        <div><strong>Flight Time:</strong> {Math.floor(flightDurationMinutes)} min {Math.round((flightDurationMinutes % 1) * 60)} seconds</div>
        <div><strong>Distance:</strong> {totalDistance.toFixed(2)} km</div>
        <hr style={{margin:'10px 0'}} />
        <div><strong>Altitude:</strong> {currentPoint.altitude?.toFixed(0) || 0} m</div>
        <div><strong>Heading:</strong> {currentPoint.heading?.toFixed(0) || 0}°</div>
        <div><strong>Airspeed:</strong> {currentPoint.airspeed?.toFixed(1) || 0} m/s</div>
        <div><strong>True Airspeed:</strong> {currentPoint.true_airspeed?.toFixed(1) || 0} m/s</div>
        <hr style={{margin:'10px 0'}} />
        <div><strong>Roll Attitude:</strong> {currentPoint.roll?.toFixed(2) || 0}°</div>
        <div><strong>Pitch Attitude:</strong> {currentPoint.pitch?.toFixed(2) || 0}°</div>
        <div><strong>Roll Rate:</strong> {currentPoint.rollspeed?.toFixed(2) || 0}°/s</div>
        <div><strong>Pitch Rate:</strong> {currentPoint.pitchspeed?.toFixed(2) || 0}°/s</div>
        <div><strong>Yaw Rate:</strong> {currentPoint.yawspeed?.toFixed(2) || 0}°/s</div>
        <hr style={{margin:'10px 0'}} />
        <div><strong>Sideslip Angle:</strong> {currentPoint.sideslip_angle ? currentPoint.sideslip_angle.toFixed(2) : 'N/A'}°</div>
        <div><strong>Drift Angle:</strong> {currentPoint.drift_angle?.toFixed(2) || 0}°</div>
        <hr style={{margin:'10px 0'}} />
        <div><strong>Battery Percentage:</strong> 94%</div>
      </div>
    );
}
