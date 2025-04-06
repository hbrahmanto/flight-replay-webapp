import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-rotatedmarker';

//Plane Icon
const planeIcon = new L.Icon({
  iconUrl: 'plane_icon.png',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

//Calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const toDegrees = (rad) => rad * (180 / Math.PI);

  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360; 
}

//Original Camera Position
function SmartFollowPlane({ position }) {
  const map = useMap();
  const userInteractingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleDragStart = () => {
      userInteractingRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleDragEnd = () => {
      timerRef.current = setTimeout(() => {
        userInteractingRef.current = false;
      }, 3000);
    };

    map.on('dragstart', handleDragStart);
    map.on('dragend', handleDragEnd);

    return () => {
      map.off('dragstart', handleDragStart);
      map.off('dragend', handleDragEnd);
      clearTimeout(timerRef.current);
    };
  }, [map]);

  useEffect(() => {
    if (!userInteractingRef.current) {
      map.panTo(position);
    }
  }, [position, map]);

  return null;
}

export default function MapDisplay({ flightData, currentIndex }) {
  if (!flightData.length) return <div>Loading map...</div>;

  const currentPoint = flightData[currentIndex];
  const nextPoint = flightData[Math.min(currentIndex + 1, flightData.length - 1)];
  const bearing = calculateBearing(currentPoint.lat, currentPoint.lon, nextPoint.lat, nextPoint.lon);
  const adjustedBearing = bearing

  const initialCenter = [flightData[0].lat, flightData[0].lon];

  const pastPath = flightData.slice(0, currentIndex + 1).map(p => [p.lat, p.lon]);
  const futurePath = flightData.slice(currentIndex).map(p => [p.lat, p.lon]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={15}
      style={{height: '100vh', width: '100vw'}}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/*Past Path (Blue)*/}
      {pastPath.length > 1 && (
        <Polyline
          key={`past-${currentIndex}`}
          positions={pastPath}
          pathOptions={{ color: 'blue', weight: 4 }}
        />
      )}

      {/*Future Path (Gray)*/}
      {futurePath.length > 1 && (
        <Polyline
          key={`future-${currentIndex}`}
          positions={futurePath}
          pathOptions={{ color: 'gray', dashArray: '5,10', weight: 4 }}
        />
      )}

      {/*Red Line (Aircraft Heading)*/}
      {futurePath.length > 1 && (
        <Polyline
          key={`redline-${currentIndex}`}
          positions={[
            [currentPoint.lat, currentPoint.lon],
            [nextPoint.lat, nextPoint.lon]
          ]}
          pathOptions={{ color: 'red', weight: 4, opacity: 1 }}
        />
      )}

      {/*Point Marker*/}
      <Marker
        key={`plane-${currentIndex}`}
        position={[currentPoint.lat, currentPoint.lon]}
        icon={planeIcon}
        rotationAngle={adjustedBearing}
        rotationOrigin="center center"
      />

      <SmartFollowPlane position={[currentPoint.lat, currentPoint.lon]} />
    </MapContainer>
  );
}
