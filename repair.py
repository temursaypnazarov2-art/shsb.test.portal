import re

def main():
    with open('script.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all pattern like: element.addEventListener('click'
    # where element is a word.
    
    # We will replace lines like:
    # btn.addEventListener('click', () => {
    # with:
    # if (btn) btn.addEventListener('click', () => {
    
    # However we must not replace things like `document.addEventListener` or `window.addEventListener`
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        match = re.search(r'^(\s*)([A-Za-z0-9_]+)\.addEventListener\(', line)
        if match:
            indent = match.group(1)
            var_name = match.group(2)
            
            # Skip document, window, and anything already guarded
            if var_name in ['document', 'window', 'e', 'toggleBtn', 'btn']:
                continue
            
            # Check if there's already an if check on the same line
            if 'if (' in line or 'if(' in line:
                continue
                
            # Now we add the if check
            new_line = line.replace(f"{var_name}.addEventListener", f"if ({var_name}) {var_name}.addEventListener")
            lines[i] = new_line

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
        
    print("Fixed addEventListeners.")

if __name__ == '__main__':
    main()
