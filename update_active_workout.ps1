$code = Get-Content .\js\app.js -Encoding UTF8 -Raw

# 1. We need to add the timer HTML to activeView initialization if not there.
# Actually, the easiest is to prepend it to activeView when we render if it's missing, or just put it in index.html!
