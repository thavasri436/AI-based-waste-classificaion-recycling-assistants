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
    let previewUrl = null;

    // Display status messages
    function showStatus(message, isError = false) {
        status.textContent = message;
        status.hidden = false;
        status.style.color = isError ? "#b42318" : "#176b4d";
    }

    // Display the selected image
    function showPreview(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showStatus("Please select a valid image file.", true);
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            showStatus("Image size must be less than 8 MB.", true);
            return;
        }

        if (
            !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ) {
            showStatus("Please select PNG, JPG or WEBP format.", true);
            return;
        }

        selectedFile = file;

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        previewUrl = URL.createObjectURL(file);

        preview.src = previewUrl;
        preview.hidden = false;

        fileName.textContent = file.name;
        fileRow.hidden = false;

        status.hidden = true;
        result.hidden = true;

        showStatus("Image selected successfully!");
    }

    // Select image using file picker
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];

        if (file) {
            showPreview(file);
        }
    });

    // Allow drag and drop
    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");

        const file = event.dataTransfer.files[0];

        if (!file) return;

        showPreview(file);

        // Put the dropped file into the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;
    });

    // Remove selected image
    removeButton.addEventListener("click", () => {
        selectedFile = null;
        imageInput.value = "";

        preview.hidden = true;
        preview.removeAttribute("src");

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }

        fileRow.hidden = true;
        fileName.textContent = "";

        status.hidden = true;
        result.hidden = true;
    });

    // Submit image to Flask backend
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            showStatus("Please select an image first.", true);
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        // Current demo backend uses the selected category.
        // No category selector exists in this HTML, so use "other".
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

            if (!response.ok) {
                throw new Error("Server error: " + response.status);
            }

            const data = await response.json();

            document.getElementById("result-category").textContent =
                data.category;

            document.getElementById("result-bin").textContent =
                data.bin;

            document.getElementById("result-advice").textContent =
                data.tip;

            document.getElementById("result-notice").textContent =
                data.demo
                    ? "Demo result: the image is uploaded, but it is not automatically analysed by an AI model yet."
                    : "";

            result.hidden = false;
            status.hidden = true;

            result.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            console.error("Upload error:", error);

            showStatus(
                "Upload failed. Please refresh the page and try again.",
                true
            );
        } finally {
            classifyButton.disabled = false;
            classifyButton.innerHTML = 'Classify waste <span>→</span>';
        }
    });

    // Try another image
    const tryAgainButton = document.getElementById("try-again");

    if (tryAgainButton) {
        tryAgainButton.addEventListener("click", () => {
            result.hidden = true;
            imageInput.click();
        });
    }
});
