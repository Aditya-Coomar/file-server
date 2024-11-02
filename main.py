import os
import sys
import time
import subprocess
import threading

def run_fastapi_server(port, app_path):
    os.system(f'start cmd /k "uvicorn {app_path}"')

