import os

filepath = "index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace scripts
scripts_block = """    <script src="lang.js"></script>
    <script src="script.js"></script>"""

if scripts_block in content:
    # Remove from original location
    content = content.replace(scripts_block, "")
    
    # Place right before </body>
    if "</body>" in content:
        content = content.replace("</body>", scripts_block + "\n</body>")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print("Moved script tags to bottom!")
    else:
        print("</body> not found!")
else:
    print("Exact script block not found. Trying flexible replacement.")
    # fallback
    import re
    scripts_pattern = re.compile(r'<script src="lang\.js"></script>\s*<script src="script\.js"></script>')
    match = scripts_pattern.search(content)
    if match:
        matched_str = match.group(0)
        content = content.replace(matched_str, "")
        content = content.replace("</body>", matched_str + "\n</body>")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print("Moved script tags to bottom (fallback)!")
    else:
        print("Scripts not found.")
