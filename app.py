import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    template_folder=BASE_DIR,
    static_folder=None
)

app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

WASTE_INFO = {
    "plastic": {
        "bin": "Blue / Dry Waste",
        "tip": "Rinse the item and recycle it where local rules allow."
    },
    "paper": {
        "bin": "Blue / Paper Recycling",
        "tip": "Keep paper clean and dry before recycling."
    },
    "glass": {
        "bin": "Glass Recycling",
        "tip": "Handle glass carefully and follow local collection rules."
    },
    "metal": {
        "bin": "Metal Recycling",
        "tip": "Empty and rinse cans before recycling."
    },
    "organic": {
        "bin": "Green / Wet Waste",
        "tip": "Compost fruit and vegetable scraps where possible."
    },
    "ewaste": {
        "bin": "E-waste Collection Point",
        "tip": "Take electronics and batteries to an authorized collection point."
    },
    "other": {
        "bin": "General / Residual Waste",
        "tip": "Check local waste disposal guidelines."
    }
}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/style.css")
def serve_css():
    return app.response_class(
        response=open(os.path.join(BASE_DIR, "style.css"), encoding="utf-8").read(),
        mimetype="text/css"
    )


@app.route("/script.js")
def serve_js():
    return app.response_class(
        response=open(os.path.join(BASE_DIR, "script.js"), encoding="utf-8").read(),
        mimetype="application/javascript"
    )


@app.route("/classify", methods=["POST"])
def classify():
    image = request.files.get("image")
    category = request.form.get("category", "other").lower()

    if category not in WASTE_INFO:
        category = "other"

    image_url = None

    if image and image.filename:
        filename = secure_filename(image.filename)

        if not filename:
            return jsonify({"error": "Invalid filename."}), 400

        extension = filename.rsplit(".", 1)[-1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            return jsonify({
                "error": "Please upload a PNG, JPG, JPEG or WEBP image."
            }), 400

        image.save(os.path.join(UPLOAD_FOLDER, filename))

    info = WASTE_INFO[category]

    return jsonify({
        "category": category.title(),
        "bin": info["bin"],
        "tip": info["tip"],
        "demo": True
    })


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "Image size must be less than 8 MB."
    }), 413


if __name__ == "__main__":
    app.run(debug=False)
