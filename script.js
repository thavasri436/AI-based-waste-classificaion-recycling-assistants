document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("upload-form");
    const imageInput = document.getElementById("image-input");
    const dropZone = document.getElementById("drop-zone");
    const preview = document.getElementById("preview");
    const fileRow = document.getElementById("file-row");
    const fileName = document.getElementById("file-name");
    const removeButton = document.getElementById("remove-file");
    const classifyButton = document.getElementById("classify-button");
    const status = document.getElementById("status");
    const result = document.getElementById("result");

    let selectedFile = null;
    let previewURL = null;

    function showStatus(message, isError = false) {
        status.textContent = message;
        status.hidden = false;
        status.style.color = isError ? "#b42318" : "#176b4d";
    }

    function showPreview(file) {
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            showStatus("Please select a JPG, PNG or WEBP image.", true);
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            showStatus("Image size must be less than 8 MB.", true);
            return;
        }

        selectedFile = file;

        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }

        previewURL = URL.createObjectURL(file);

        preview.onload = () => {
            preview.hidden = false;
        };

        preview.onerror = () => {
            showStatus("Could not display this image. Try another file.", true);
        };

        preview.src = previewURL;
        preview.hidden = false;

        fileName.textContent = file.name;
        fileRow.hidden = false;
        result.hidden = true;
        status.hidden = true;
    }

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];

        if (file) {
            showPreview(file);
        }
    });

    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");

        const file = event.dataTransfer.files[0];

        if (!file) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;

        showPreview(file);
    });

    removeButton.addEventListener("click", () => {
        selectedFile = null;
        imageInput.value = "";
        preview.hidden = true;
        preview.removeAttribute("src");
        fileRow.hidden = true;
        fileName.textContent = "";
        result.hidden = true;
        status.hidden = true;

        if (previewURL) {
            URL.revokeObjectURL(previewURL);
            previewURL = null;
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            showStatus("Please select an image first.", true);
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("category", "other");

        classifyButton.disabled = true;
        classifyButton.textContent = "Getting advice...";

        showStatus("Processing your image...");
        result.hidden = true;

        try {
            const response = await fetch("/classify", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed.");
            }

            document.getElementById("result-category").textContent =
                data.category;

            document.getElementById("result-bin").textContent =
                data.bin;

            document.getElementById("result-advice").textContent =
                data.tip;

            document.getElementById("result-notice").textContent =
                "Demo result: the image has not been automatically analysed by an AI model.";

            result.hidden = false;
            status.hidden = true;

            result.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            showStatus(error.message || "Something went wrong.", true);
        } finally {
            classifyButton.disabled = false;
            classifyButton.innerHTML = 'Classify waste <span>→</span>';
        }
    });

    const tryAgainButton = document.getElementById("try-again");

    if (tryAgainButton) {
        tryAgainButton.addEventListener("click", () => {
            imageInput.click();
        });
    }
});
