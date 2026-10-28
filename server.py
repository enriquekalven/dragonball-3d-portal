#!/usr/bin/env python3
"""
Localhost-only HTTP server with hardened security headers for the
Dragon Ball 3D Multiverse Portal.
Strictly binds to 127.0.0.1 (never 0.0.0.0).
"""
import http.server
import os
import socketserver

HOST = "127.0.0.1"
PORT = 8421
WEB_DIR = os.path.dirname(os.path.abspath(__file__))


class SecurePortalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def end_headers(self):
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self';",
        )
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header(
            "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
        )
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_TRACE(self):
        self.send_error(405, "Method Not Allowed")

    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), SecurePortalHandler) as httpd:
        print(f"Dragon Ball 3D Portal running at http://{HOST}:{PORT}/")
        httpd.serve_forever()
