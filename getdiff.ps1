$path = "C:\Users\Asus\.gemini\antigravity-ide\brain\ad927d0b-9f30-4a42-9cbf-69ef57f98f9e\.system_generated\logs\transcript.jsonl"
$lines = Get-Content -Path $path -Tail 200
foreach ($line in $lines) {
    if ($line -match "The following changes were made by the multi_replace_file_content tool") {
        $line | Out-File "diff.txt" -Encoding UTF8
    }
}
