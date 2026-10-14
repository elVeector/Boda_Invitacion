#!/bin/zsh
# Sirve la invitación localmente para permitir el reproductor de YouTube.
cd "$(dirname "$0")"
python3 - <<'PYTHON'
import http.server
import webbrowser

servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), http.server.SimpleHTTPRequestHandler)
url = f"http://127.0.0.1:{servidor.server_port}"
print(f"Invitación disponible en {url}")
print("Cierra esta ventana o pulsa Control+C para detener la vista previa.")
webbrowser.open(url)
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    servidor.server_close()
PYTHON
