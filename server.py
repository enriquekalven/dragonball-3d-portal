#!/usr/bin/env python3
"""
Localhost-only HTTP server & Google Cloud TTS Chirp 3 HD proxy for the
Dragon Ball 3D Multiverse Portal.
Strictly binds to 127.0.0.1 (never 0.0.0.0) and sets strict security headers.

Supports per-language Chirp 3 HD synthesis across all 12 languages
(all 11 Atlas of Wonder languages + Dutch):
  en, es, zh (cmn-CN), yue (yue-HK), ja, ko, pt, fr, it, de, nl, ar.
"""
import argparse
import base64
import hashlib
import http.server
import json
import os
import re
import socketserver
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

HOST = "127.0.0.1"
DEFAULT_PORT = 8421
WEB_DIR = Path(__file__).resolve().parent
CACHE_DIR = WEB_DIR / ".tts_cache"

CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self'; "
    "img-src 'self' data: blob:; "
    "media-src 'self' blob: data:; "
    "connect-src 'self' blob: data:; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self';"
)

# Chirp 3 HD voice map across all 12 supported languages
LANG_VOICE_MAP = {
    "en": ("en-US", "en-US-Chirp3-HD-{persona}"),
    "en-US": ("en-US", "en-US-Chirp3-HD-{persona}"),
    "es": ("es-ES", "es-ES-Chirp3-HD-{persona}"),
    "es-ES": ("es-ES", "es-ES-Chirp3-HD-{persona}"),
    "zh": ("cmn-CN", "cmn-CN-Chirp3-HD-{persona}"),
    "zh-CN": ("cmn-CN", "cmn-CN-Chirp3-HD-{persona}"),
    "yue": ("yue-HK", "yue-HK-Chirp3-HD-{persona}"),
    "zh-HK": ("yue-HK", "yue-HK-Chirp3-HD-{persona}"),
    "ja": ("ja-JP", "ja-JP-Chirp3-HD-{persona}"),
    "ja-JP": ("ja-JP", "ja-JP-Chirp3-HD-{persona}"),
    "ko": ("ko-KR", "ko-KR-Chirp3-HD-{persona}"),
    "ko-KR": ("ko-KR", "ko-KR-Chirp3-HD-{persona}"),
    "pt": ("pt-BR", "pt-BR-Chirp3-HD-{persona}"),
    "pt-BR": ("pt-BR", "pt-BR-Chirp3-HD-{persona}"),
    "fr": ("fr-FR", "fr-FR-Chirp3-HD-{persona}"),
    "fr-FR": ("fr-FR", "fr-FR-Chirp3-HD-{persona}"),
    "it": ("it-IT", "it-IT-Chirp3-HD-{persona}"),
    "it-IT": ("it-IT", "it-IT-Chirp3-HD-{persona}"),
    "de": ("de-DE", "de-DE-Chirp3-HD-{persona}"),
    "de-DE": ("de-DE", "de-DE-Chirp3-HD-{persona}"),
    "nl": ("nl-NL", "nl-NL-Chirp3-HD-{persona}"),
    "nl-NL": ("nl-NL", "nl-NL-Chirp3-HD-{persona}"),
    "ar": ("ar-XA", "ar-XA-Chirp3-HD-{persona}"),
    "ar-XA": ("ar-XA", "ar-XA-Chirp3-HD-{persona}"),
    "ar-SA": ("ar-XA", "ar-XA-Chirp3-HD-{persona}"),
}

VALID_PERSONAS = {
    "Aoede",
    "Puck",
    "Charon",
    "Kore",
    "Fenrir",
    "Leda",
    "Orus",
    "Zephyr",
}

EMOJI_AND_SYMBOL_RE = re.compile(
    r"[\U0001F300-\U0001FAFF\u2600-\u27BF•⇒→★☆]+", flags=re.UNICODE
)


class ChirpCredentialProvider:
    """Thread-safe Google Cloud credential helper with 45-minute token caching."""

    def __init__(self):
        self._lock = threading.Lock()
        self._token = None
        self._project = None
        self._expires_at = 0.0

    def get_credentials(self):
        now = time.time()
        with self._lock:
            if self._token and self._project and now < self._expires_at:
                return self._token, self._project

            token = os.environ.get("GOOGLE_OAUTH_ACCESS_TOKEN", "").strip()
            project = (
                os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip()
                or os.environ.get("GCLOUD_PROJECT", "").strip()
            )

            try:
                if not token:
                    token = subprocess.check_output(
                        ["gcloud", "auth", "print-access-token"],
                        stderr=subprocess.DEVNULL,
                        timeout=6,
                        text=True,
                    ).strip()
                if not project:
                    project = subprocess.check_output(
                        ["gcloud", "config", "get-value", "project"],
                        stderr=subprocess.DEVNULL,
                        timeout=6,
                        text=True,
                    ).strip()
            except Exception:
                return None, None

            if not token or not project or project == "(unset)":
                return None, None

            self._token = token
            self._project = project
            self._expires_at = now + 2700.0
            return self._token, self._project

    def invalidate(self):
        with self._lock:
            self._token = None
            self._expires_at = 0.0


def _prepare_chirp_text(text: str, lang_key: str) -> str:
    """Clean decorative symbols and normalize clauses so Chirp 3 HD reads naturally."""
    cleaned = EMOJI_AND_SYMBOL_RE.sub(" ", text)
    cleaned = re.sub(r"\s*[;؛:]\s*", ". ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    is_cjk = lang_key in ("zh", "zh-CN", "yue", "zh-HK", "ja")
    if is_cjk:
        cleaned = re.sub(r"([。！？!?；;])\s*", r"\1\n", cleaned)
        parts = []
        for line in cleaned.split("\n"):
            line = line.strip()
            if not line:
                continue
            if len(line) > 45:
                sub = re.split(r"([，、,])", line)
                buf = ""
                for piece in sub:
                    buf += piece
                    if len(buf) >= 35 and piece in ("，", "、", ","):
                        parts.append(buf.rstrip("，、,") + "。")
                        buf = ""
                if buf.strip():
                    parts.append(buf.strip())
            else:
                parts.append(line)
        cleaned = "\n".join(parts)
    return cleaned[:2200]


class ChirpSynthesizer:
    """Synthesizes speech via Google Cloud Text-to-Speech v1 (Chirp 3 HD) with disk caching."""

    def __init__(self, cred_provider: ChirpCredentialProvider, cache_dir: Path):
        self._creds = cred_provider
        self._cache_dir = cache_dir
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    def resolve_voice(self, lang: str, persona: str = "Aoede"):
        safe_persona = persona if persona in VALID_PERSONAS else "Aoede"
        lang_key = (lang or "en").strip()
        if lang_key not in LANG_VOICE_MAP:
            prefix = lang_key.split("-")[0]
            lang_key = prefix if prefix in LANG_VOICE_MAP else "en"
        lang_code, template = LANG_VOICE_MAP[lang_key]
        voice_name = template.format(persona=safe_persona)
        return lang_key, lang_code, voice_name

    def synthesize(
        self,
        text: str,
        lang: str = "en",
        persona: str = "Aoede",
        speaking_rate: float = 1.0,
    ):
        cleaned = (text or "").strip()
        if not cleaned:
            raise ValueError("Text is required for TTS synthesis")
        lang_key, lang_code, voice_name = self.resolve_voice(lang, persona)
        prepared_text = _prepare_chirp_text(cleaned, lang_key)
        if not prepared_text:
            raise ValueError("No speakable text after cleanup")

        rate = max(0.75, min(1.35, float(speaking_rate or 1.0)))
        cache_key = hashlib.sha256(
            f"db_v1|{lang_code}|{voice_name}|{rate:.2f}|{prepared_text}".encode("utf-8")
        ).hexdigest()
        cache_path = self._cache_dir / f"{cache_key}.mp3"
        if cache_path.is_file() and cache_path.stat().st_size > 128:
            return cache_path.read_bytes(), voice_name, True

        token, project = self._creds.get_credentials()
        if not token or not project:
            raise RuntimeError("Google Cloud credentials unavailable for Chirp 3 HD")

        audio_bytes = self._synthesize_with_split_fallback(
            prepared_text, lang_key, lang_code, voice_name, rate, token, project
        )
        try:
            cache_path.write_bytes(audio_bytes)
        except OSError:
            pass
        return audio_bytes, voice_name, False

    def _synthesize_with_split_fallback(
        self,
        text: str,
        lang_key: str,
        lang_code: str,
        voice_name: str,
        speaking_rate: float,
        token: str,
        project: str,
    ) -> bytes:
        try:
            return self._call_google_tts(
                text, lang_code, voice_name, speaking_rate, token, project
            )
        except RuntimeError as err:
            msg = str(err)
            if "sentences that are too long" in msg and len(text) > 30:
                is_cjk = lang_key in ("zh", "zh-CN", "yue", "zh-HK", "ja")
                sentences = [
                    s.strip()
                    for s in re.split(r"(?<=[.!?。！？؟])\s+", text)
                    if s.strip()
                ]
                if len(sentences) > 1:
                    mid = len(sentences) // 2
                    left = " ".join(sentences[:mid])
                    right = " ".join(sentences[mid:])
                else:
                    mid = len(text) // 2
                    sep = "。" if is_cjk else "."
                    left = text[:mid].rstrip() + sep
                    right = text[mid:].lstrip()
                b1 = self._synthesize_with_split_fallback(
                    left, lang_key, lang_code, voice_name, speaking_rate, token, project
                )
                b2 = self._synthesize_with_split_fallback(
                    right, lang_key, lang_code, voice_name, speaking_rate, token, project
                )
                return b1 + b2
            raise

    def _call_google_tts(
        self,
        text: str,
        lang_code: str,
        voice_name: str,
        speaking_rate: float,
        token: str,
        project: str,
    ) -> bytes:
        url = "https://texttospeech.googleapis.com/v1/text:synthesize"
        payload = {
            "input": {"text": text},
            "voice": {
                "languageCode": lang_code,
                "name": voice_name,
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": speaking_rate,
            },
        }
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {token}",
                "x-goog-user-project": project,
                "Content-Type": "application/json; charset=utf-8",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=14) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as err:
            if err.code == 401:
                self._creds.invalidate()
            err_body = err.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Google TTS HTTP {err.code}: {err_body[:240]}") from err

        audio_b64 = resp_data.get("audioContent")
        if not audio_b64:
            raise RuntimeError("Google TTS response missing audioContent")
        return base64.b64decode(audio_b64)


CRED_PROVIDER = ChirpCredentialProvider()
SYNTHESIZER = ChirpSynthesizer(CRED_PROVIDER, CACHE_DIR)


class SecurePortalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Content-Security-Policy", CSP_POLICY)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header(
            "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
        )
        super().end_headers()

    def _send_json(self, status_code: int, payload: dict):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        clean_path = self.path.split("?", 1)[0].split("#", 1)[0]
        if clean_path == "/api/tts/status":
            token, project = CRED_PROVIDER.get_credentials()
            self._send_json(
                200,
                {
                    "available": bool(token and project),
                    "engine": "Google Cloud TTS Chirp 3 HD",
                    "personas": sorted(VALID_PERSONAS),
                    "languages": sorted(
                        ["en", "es", "zh", "yue", "ja", "ko", "pt", "fr", "it", "de", "nl", "ar"]
                    ),
                },
            )
            return

        # Block hidden dotfiles/directories (.git, .tts_cache, .env)
        parts = [p for p in clean_path.split("/") if p]
        if any(p.startswith(".") for p in parts):
            self.send_error(403, "Forbidden")
            return

        self.send_header_cache_override = True
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/api/tts":
            self.send_error(404, "Not Found")
            return

        try:
            content_len = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_len = 0

        if content_len <= 0 or content_len > 16384:
            self._send_json(400, {"error": "Invalid request payload size"})
            return

        try:
            raw_body = self.rfile.read(content_len)
            data = json.loads(raw_body.decode("utf-8"))
        except Exception:
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        text = str(data.get("text") or "").strip()
        lang = str(data.get("lang") or "en").strip()
        persona = str(data.get("persona") or "Aoede").strip()
        speaking_rate = data.get("speakingRate", 1.0)

        if not text:
            self._send_json(400, {"error": "Missing 'text' field"})
            return

        try:
            audio_bytes, voice_name, cached = SYNTHESIZER.synthesize(
                text=text,
                lang=lang,
                persona=persona,
                speaking_rate=speaking_rate,
            )
        except Exception as exc:
            self._send_json(503, {"error": str(exc)})
            return

        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio_bytes)))
        self.send_header("X-TTS-Voice", voice_name)
        self.send_header("X-TTS-Cache", "HIT" if cached else "MISS")
        self.send_header("Cache-Control", "public, max-age=86400")
        self.end_headers()
        self.wfile.write(audio_bytes)

    def do_TRACE(self):
        self.send_error(405, "Method Not Allowed")

    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")


class ThreadedPortalServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Dragon Ball 3D Portal server with Chirp 3 HD TTS.")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = parser.parse_args()

    with ThreadedPortalServer((HOST, args.port), SecurePortalHandler) as httpd:
        print(f"Dragon Ball 3D Portal + Chirp 3 HD running at http://{HOST}:{args.port}/")
        httpd.serve_forever()
