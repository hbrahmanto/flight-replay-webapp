# flight-replay-webapp

A web application that allows users to upload a .tlog file to visualize aircraft telemetry data and analyzation of flight performance. 

Prerequisites:
Node.js (v12 or later)
React.js (for frontend)

When the file is pulled make sure that the necessary dependencies are installed for the frontend directory through npm install in VSCode terminal.

Since the backend is using fastAPI, the web app can only be run locally. Hence, it is required that all of the dependencies of requirements.txt are installed and have this running uvicorn main:app --reload --host 0.0.0.0 --port 8000 before the frontend is started through npm start.

Some key features:
* Telemetry data are shown of the flight
* Playback controls
* Flight map
