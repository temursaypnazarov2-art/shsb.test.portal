import os

filepath = "script.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Cross-browser requestFullscreen
request_fullscreen_orig = "document.documentElement.requestFullscreen().catch(e => e);"
request_fullscreen_new = """const docElm = document.documentElement;
        if (docElm.requestFullscreen) docElm.requestFullscreen().catch(e => e);
        else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
        else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
        else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();"""
content = content.replace(request_fullscreen_orig, request_fullscreen_new)

# 2. Add cross-browser listeners in startBtn
add_listeners_orig = """        document.addEventListener('visibilitychange', handleCheating);
        window.addEventListener('blur', handleCheating);
        document.addEventListener('fullscreenchange', handleCheating);"""
add_listeners_new = """        document.addEventListener('visibilitychange', handleCheating);
        window.addEventListener('blur', handleCheating);
        document.addEventListener('fullscreenchange', handleCheating);
        document.addEventListener('webkitfullscreenchange', handleCheating);
        document.addEventListener('mozfullscreenchange', handleCheating);
        document.addEventListener('MSFullscreenChange', handleCheating);"""
content = content.replace(add_listeners_orig, add_listeners_new)

# 3. Remove cross-browser listeners in finishQuiz
remove_listeners_orig = """    document.removeEventListener('visibilitychange', handleCheating);
    window.removeEventListener('blur', handleCheating);
    document.removeEventListener('fullscreenchange', handleCheating);"""
remove_listeners_new = """    document.removeEventListener('visibilitychange', handleCheating);
    window.removeEventListener('blur', handleCheating);
    document.removeEventListener('fullscreenchange', handleCheating);
    document.removeEventListener('webkitfullscreenchange', handleCheating);
    document.removeEventListener('mozfullscreenchange', handleCheating);
    document.removeEventListener('MSFullscreenChange', handleCheating);"""
content = content.replace(remove_listeners_orig, remove_listeners_new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("script.js updated")
