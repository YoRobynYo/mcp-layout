from flask import Flask, request, send_file
import tempfile
import os
from TTS.api import TTS

app = Flask(__name__)

# Load Coqui model once (pick a good one)
MODEL = "tts_models/en/ljspeech/tacotron2-DDC"
tts = TTS(MODEL)

@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json()
    text = data.get("text", "")

    if not text.strip():
        return {"error": "No text provided"}, 400

    # Save to a temporary WAV file
    tmp_wav = tempfile.mktemp(suffix=".wav")
    tts.tts_to_file(text=text, file_path=tmp_wav)

    return send_file(tmp_wav, mimetype="audio/wav", as_attachment=False)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
