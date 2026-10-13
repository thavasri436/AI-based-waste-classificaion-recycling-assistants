const form = document.getElementById("classifyForm");
const imageInput = document.getElementById("image");
const fileName = document.getElementById("fileName");
const submitBtn = document.getElementById("submitBtn");
const result = document.getElementById("result");
const preview = document.getElementById("preview");

imageInput.addEventListener("change", () => {
  fileName.textContent = imageInput.files.length ? imageInput.files[0].name : "PNG, JPG or JPEG · optional · max 8 MB";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (imageInput.files[0] && imageInput.files[0].size > 8 * 1024 * 1024) {
    alert("Please choose an image smaller than 8 MB.");
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = "Getting advice...";
  try {
    const response = await fetch("/classify", { method: "POST", body: new FormData(form) });
    if (!response.ok) throw new Error("The server returned an error.");
    const data = await response.json();
    document.getElementById("resultCategory").textContent = data.category;
    document.getElementById("resultBin").textContent = data.bin;
    document.getElementById("resultTip").textContent = data.tip;
    if (imageInput.files[0]) {
      preview.src = URL.createObjectURL(imageInput.files[0]);
      preview.hidden = false;
    } else {
      preview.hidden = true;
      preview.removeAttribute("src");
    }
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    alert("Could not connect to the backend. Check that python app.py is running.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Get recycling advice <span>→</span>';
  }
});
