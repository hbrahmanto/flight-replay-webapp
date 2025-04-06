from pymavlink import mavutil

def inspect_tlog(file_path):
    mlog = mavutil.mavlink_connection(file_path)

    while True:
        msg = mlog.recv_match(blocking=False)

        if msg is None:
            break

        print(f"Type: {msg.get_type()} | Data: {msg.to_dict()}")

if __name__ == "__main__":
    tlog_file = "001_assessment_flight.tlog" 
    inspect_tlog(tlog_file)