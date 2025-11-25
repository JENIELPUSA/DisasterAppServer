# List all files recursively
$allFiles = Get-ChildItem -Recurse -File

# Read .easignore patterns
$ignorePatterns = Get-Content .\.easignore | Where-Object { $_ -and $_ -notmatch '^#' }

# Function to check if a file matches any ignore pattern
function Is-Ignored($file, $patterns) {
    foreach ($pattern in $patterns) {
        if ($pattern.EndsWith("/")) {
            if ($file.FullName -like "*\$pattern*") { return $true }
        } elseif ($pattern.Contains("*")) {
            if ($file.FullName -like "*\$pattern*") { return $true }
        } else {
            if ($file.FullName -like "*\$pattern") { return $true }
        }
    }
    return $false
}

# Separate files
$ignoredFiles = @()
$includedFiles = @()
foreach ($f in $allFiles) {
    if (Is-Ignored $f $ignorePatterns) {
        $ignoredFiles += $f
    } else {
        $includedFiles += $f
    }
}

# Output top largest files
Write-Host "===== Top 20 Largest Included Files ====="
$includedFiles | Sort-Object Length -Descending | Select-Object FullName, Length | Select-Object -First 20 | Format-Table -AutoSize
