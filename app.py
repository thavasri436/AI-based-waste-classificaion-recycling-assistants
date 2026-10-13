from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = os.path.join("static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Demo classifier: uses the selected category from the form.
# Replace classify_demo() with a trained image model for real AI image recognition.
WASTE_INFO = {
    "plastic": {"bin": "Blue / Dry Waste", "tip": "Rinse the item and send it for plastic recycling where accepted."},
    "paper": {"bin": "Blue / Paper Recycling", "tip": "Keep paper dry and clean. Separate greasy or food-soiled paper."},
    "glass": {"bin": "Glass Recycling", "tip": "Handle carefully and follow your local glass collection rules."},
    "metal": {"bin": "Metal Recycling", "tip": "Empty and rinse cans before placing them with recyclable metals."},
    "organic": {"bin": "Green / Wet Waste", "tip": "Compost fruit and vegetable scraps where possible."},
    "ewaste": {"bin": "E-waste Collection Point", "tip": "Do not put batteries or electronics in regular household bins."},
    "other": {"bin": "General / Residual Waste", "tip": "Check local rules before disposing of mixed or contaminated items."}
}

def classify_demo(category):
    return category if category in WASTE_INFO else "other"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/classify", methods=["POST"])
def classify():
    category = request.form.get("category", "other").lower()
    image = request.files.get("image")
    image_name = None
    if image and image.filename:
        safe_name = secure_filename(image.filename)
        # Save uploaded image for demo display only; it is not analyzed by an AI model.
        image.save(os.path.join(app.config["UPLOAD_FOLDER"], safe_name))
        image_name = safe_name
    result = classify_demo(category)
    info = WASTE_INFO[result]
    return jsonify({
        "category": result.title(),
        "bin": info["bin"],
        "tip": info["tip"],
        "image_url": f"/static/uploads/{image_name}" if image_name else None,
        "demo": True
    })

if __name__ == "__main__":
    app.run(debug=True)
