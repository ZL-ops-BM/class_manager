#!/usr/bin/env python3
"""班级管理系统 · 开发服务器（UTF-8 / 无缓存 / CORS）"""
import http.server
import os
import sys

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return MIME.get(ext, "application/octet-stream")

    def end_headers(self):
        # 禁用缓存，确保开发时始终拿到最新文件
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format, *args):
        # 简洁日志
        print(f"  {args[0]}")

print(f"✓ 班级管理系统开发服务器已启动 → http://localhost:{PORT}")
print(f"  根目录: {ROOT}")
print(f"  按 Ctrl+C 停止\n")

http.server.HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
