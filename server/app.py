import os
from flask import Flask, request
from matches import matches

app = Flask(__name__)


@app.route("/v2/check", methods=["POST"])
def hello_world():
    if "text" in request.form.keys():
        response = {"matches": matches(request.form["text"])}
        return response, 200
    else:
        return "No input text.", 500


if __name__ == "__main__":
    app.run(host="localhost", port=8081)
