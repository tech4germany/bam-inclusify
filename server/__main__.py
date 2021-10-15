import os
from flask import Flask, request

app = Flask(__name__)


@app.route("/v2/check", methods=["POST"])
def hello_world():
    if "text" in request.form.keys():
        response = {
            "matches": [
                {
                    "message": "Evtl. passt der geschlechtsneutrale Begriff „Reinigungskraft“ besser.",
                    "shortMessage": "",
                    "replacements": [{"value": "Reinigungskraft"}],
                    "offset": 13,
                    "length": 8,
                    "context": {
                        "text": "Ich bin eine Putzfrau.",
                        "offset": 13,
                        "length": 8,
                    },
                    "sentence": "Ich bin eine Putzfrau.",
                    "type": {"typeName": "Hint"},
                    "rule": {
                        "id": "PUTZFRAU",
                        "subId": "1",
                        "sourceFile": "grammar.xml",
                        "description": "'Reinigungskraft' statt 'Putzfrau'",
                        "issueType": "style",
                        "category": {
                            "id": "GENDER_NEUTRALITY",
                            "name": "Geschlechtergerechte Sprache",
                        },
                        "isPremium": False,
                    },
                    "ignoreForIncompleteSentence": False,
                    "contextForSureMatch": 0,
                }
            ]
        }
        return response, 200
    else:
        return "No input text.", 500


if __name__ == "__main__":
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get("PORT", 8081))
    app.run(host="localhost", port=port, debug=True)
