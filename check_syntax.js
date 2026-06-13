const fs = require('fs');

try {
    const code = fs.readFileSync('script.js', 'utf8');
    // Using new Function to parse the code and catch syntax errors
    new Function(code);
    console.log("Syntax check passed!");
} catch (e) {
    console.error("Syntax Error: ", e.message);
}
