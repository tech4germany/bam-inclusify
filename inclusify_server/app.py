import os
from flask import Flask, request, send_from_directory
from inclusify_server.matches import matches, rules

app = Flask(__name__, static_folder=None)

@app.route('/', defaults=dict(filename=None))
@app.route('/<path:filename>', methods=['GET'])
def index(filename):
    filename = filename or 'index.html'
    return send_from_directory("static", filename)

@app.route("/v2/check", methods=["POST"])
def serve_api():
    if "text" in request.form.keys():
        response = {"matches": matches(request.form["text"])}
        return response, 200
    else:
        return "No input text.", 500


if __name__ == "__main__":
    app.run(host="localhost", port=8081)
