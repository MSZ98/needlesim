#!/usr/bin/env python3
"""Simple HTTP server to host NeedleSim."""
# Only for development purposes

import http.server
import socketserver
import os

PORT = 8000
DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIR)

with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"Server: http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()
