from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from parse_tlog import parse_tlog

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_tlog/")
async def upload_tlog(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(await file.read())
            temp_file_path = tmp.name

        parsed_data = parse_tlog(temp_file_path)
        os.remove(temp_file_path)
        return JSONResponse(content=parsed_data)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)