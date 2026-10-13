# AI-Based Waste Classification & Recycling Assistant

A beginner-friendly web app with HTML, CSS, JavaScript frontend and Python (Flask) backend.

## Important demo note
This starter project demonstrates the full frontend/backend flow. The current classifier uses the category selected by the user; it does **not** automatically recognize waste from the uploaded photo yet. For real image recognition, integrate a trained image-classification model.

## Run in VS Code (Windows)
1. Extract the ZIP file.
2. Open VS Code → **File → Open Folder** → select `AI-Based-Waste-Classification-Recycling-Assistant`.
3. Open **Terminal → New Terminal**.
4. Create a virtual environment:
   ```powershell
   py -m venv .venv
   ```
5. Activate it:
   ```powershell
   .venv\Scripts\Activate.ps1
   ```
   If PowerShell blocks activation, use Command Prompt terminal and run:
   ```bat
   .venv\Scripts\activate.bat
   ```
6. Install dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
7. Start the app:
   ```powershell
   python app.py
   ```
8. Open the URL printed in the terminal, usually `http://127.0.0.1:5000`.

Stop the server with `Ctrl + C`.

## Open on your phone
Make sure the phone and laptop are on the same Wi-Fi. Run `ipconfig` in the laptop terminal and find the IPv4 address. In `app.py`, change the final line to:
`app.run(host="0.0.0.0", port=5000, debug=True)`
Then start it again and open `http://LAPTOP-IP:5000` on your phone. Windows Firewall may ask permission.
