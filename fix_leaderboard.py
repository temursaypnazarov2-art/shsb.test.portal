import os

filepath = 'lang.js'

with open(filepath, 'rb') as f:
    content = f.read()

# Replace "Top-10 Reyting" with "🏆 Top-10 Reyting ⭐"
# Ensure the emoji is utf-8 encoded
content = content.replace(b'leaderboardTitle: "Top-10 Reyting",', 'leaderboardTitle: "🏆 Top-10 Reyting ⭐",'.encode('utf-8'))
content = content.replace(b'leaderboardTitle: "Top-10 Leaderboard",', 'leaderboardTitle: "🏆 Top-10 Leaderboard ⭐",'.encode('utf-8'))

with open(filepath, 'wb') as f:
    f.write(content)

print("Updated leaderboardTitle in lang.js")
