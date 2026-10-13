from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=BASE_DIR,
    static_folder=None
)

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

WASTE_INFO = {
    "plastic": {
        "bin": "Blue / Dry Waste",
        "tip": "Rinse the item and send it for plastic recycling where accepted."
    },
    "paper": {
        "bin": "Blue / Paper Recycling",
        "tip": "Keep paper dry and clean. Separate greasy or food-soiled paper."
    },
    "glass": {
        "bin": "Glass Recycling",
        "tip": "Handle carefully and follow your local glass collection rules."
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
        "tip": "Take batteries and electronics to an authorized collection point."
    },
    "other": {
        "bin": "General / Residual Waste",
        "tip": "Check local rules before disposing of mixed or contaminated items."
    }
}


@app.route("/")
def home():
    return render_template("index.html")


# Serve CSS from the repository root
@app.route("/style.css")
def serve_css():
    return send_from_directory(BASE_DIR, "style.css")


# Serve JavaScript from the repository root
@app.route("/script.js")
def serve_js():
    return send_from_directory(BASE_DIR, "script.js")


@app.route("/classify", methods=["POST"])
def classify():
    category = request.form.get("category", "other").lower()
    image = request.files.get("image")

    image_url = None

    if image and image.filename:
        safe_name = secure_filename(image.filename)

        if not safe_name:
            return jsonify({"error": "Invalid filename"}), 400

        extension = os.path.splitext(safe_name)[1].lower()

        if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
            return jsonify({"error": "Unsupported image format"}), 400

        image.save(os.path.join(app.config["UPLOAD_FOLDER"], safe_name))

    if category not in WASTE_INFO:
        category = "other"

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
