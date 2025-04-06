from pymavlink import mavutil
import math

T0 = 288.15  # Sea level temperature in Kelvin (15°C)
L = 0.0065   # Temperature lapse rate in K/m
R = 287.05   # Specific gas constant for air in J/(kg·K)

def calculate_temperature_at_altitude(altitude_m):
    temperature = T0 - (L * altitude_m)
    return temperature

def calculate_true_airspeed(ias, altitude_m):
    
    temperature = calculate_temperature_at_altitude(altitude_m)
    
    tas = ias * math.sqrt(T0 / temperature)
    return tas

def calculate_sideslip_angle(groundspeed, heading):
    heading_rad = math.radians(heading)
    
    v_y = groundspeed * math.sin(heading_rad) 

    sideslip_angle = math.degrees(math.asin(v_y / groundspeed)) if groundspeed != 0 else 0
    return sideslip_angle

def calculate_driftangle(heading, ground_track):
    driftangle = heading - ground_track

    if driftangle > 180:
        driftangle -= 360
    elif driftangle < -180:
        driftangle += 360
    return driftangle

def parse_tlog(file_path):
    mlog = mavutil.mavlink_connection(file_path)
    data_points = []

    lat = lon = alt = heading = airspeed = roll = pitch = yaw = rollspeed = pitchspeed = yawspeed = battery_percentage = None

    while True:
        msg = mlog.recv_match(type=['GLOBAL_POSITION_INT', 'VFR_HUD', 'ATTITUDE'], blocking=False)
        if msg is None:
            break

        if msg.get_type() == 'GLOBAL_POSITION_INT':
            lat = msg.lat / 1e7
            lon = msg.lon / 1e7
            alt = msg.alt / 1000.0  #Conversion to meters
            heading = msg.hdg / 100.0 if msg.hdg != 65535 else None  #Cheacking whether heading is valid
            vx = msg.vx / 100.0  # Velocity in x-direction (m/s)
            vy = msg.vy / 100.0  # Velocity in y-direction (m/s)

            if lat is not None and lon is not None and alt is not None:
                data_point = {
                    "timestamp": mlog.timestamp,
                    "lat": lat,
                    "lon": lon,
                    "alt": alt,
                    "heading": heading,
                    "airspeed": airspeed,
                    "true_airspeed": None, 
                    "roll": None,
                    "pitch": None,
                    "yaw": None,
                    "rollspeed": None,
                    "pitchspeed": None,
                    "yawspeed": None,
                    "sideslip_angle": None
                }
                data_points.append(data_point)

        elif msg.get_type() == 'VFR_HUD':
            if data_points:
                # Extract IAS (Indicated Airspeed) from VFR_HUD
                ias = msg.airspeed  #In m/s
                airspeed = ias
                altitude_vfr = msg.alt  #Altitude in meters from VFR_HUD

                #Calculate True Airspeed (TAS)
                if alt is not None:
                    tas = calculate_true_airspeed(ias, altitude_vfr)
                    data_points[-1]["true_airspeed"] = tas  
                
                data_points[-1]["altitude"] = msg.alt  #Altitude from VFR_HUD
                data_points[-1]["airspeed"] = airspeed

                # Calculate Sideslip Angle based on groundspeed and heading
                sideslip_angle = calculate_sideslip_angle(msg.groundspeed, msg.heading)
                data_points[-1]["sideslip_angle"] = sideslip_angle

                if heading is not None and vx is not None and vy is not None:
                    ground_track = math.atan2(vy, vx)
                    driftangle = calculate_driftangle(heading, math.degrees(ground_track))
                    data_points[-1]["drift_angle"] = driftangle

        elif msg.get_type() == 'ATTITUDE':
            #All rates are in radians
            roll = msg.roll  
            pitch = msg.pitch  
            yaw = msg.yaw  

            #All in radians per second
            rollspeed = msg.rollspeed  
            pitchspeed = msg.pitchspeed  
            yawspeed = msg.yawspeed  

            # Convert radians to degrees for easier visualization (optional)
            roll_deg = math.degrees(roll)
            pitch_deg = math.degrees(pitch)
            yaw_deg = math.degrees(yaw)
            rollspeed_deg = math.degrees(rollspeed)
            pitchspeed_deg = math.degrees(pitchspeed)
            yawspeed_deg = math.degrees(yawspeed)

            if data_points:
                data_points[-1]["roll"] = roll_deg
                data_points[-1]["pitch"] = pitch_deg
                data_points[-1]["yaw"] = yaw_deg
                data_points[-1]["rollspeed"] = rollspeed_deg
                data_points[-1]["pitchspeed"] = pitchspeed_deg
                data_points[-1]["yawspeed"] = yawspeed_deg

    return data_points
