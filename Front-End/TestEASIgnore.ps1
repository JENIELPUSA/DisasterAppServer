# TestEASIgnore.ps1
# -----------------
# List all files recursively
$allFiles = Get-ChildItem -Recurse -File

# Read .easignore patterns
$ignorePatterns = Get-Content .\.easignore | Where-Object { $_ -and $_ -notmatch '^#' }

# Function to check if a file matches any ignore pattern
function Is-Ignored($file, $patterns) {
    $filePath = $file.FullName -replace '\\','/'  # convert backslash to forward slash
    foreach ($pattern in $patterns) {
        if ($pattern.EndsWith("/")) {
            if ($filePath -like "*$pattern*") { return $true }
        } elseif ($pattern.Contains("*")) {
            if ($filePath -like "*$pattern*") { return $true }
        } else {
            if ($filePath -like "*$pattern") { return $true }
        }
    }
    return $false
}


# Separate files into ignored and included
$ignoredFiles = @()
$includedFiles = @()

foreach ($f in $allFiles) {
    if (Is-Ignored $f $ignorePatterns) {
        $ignoredFiles += $f
    } else {
        $includedFiles += $f
    }
}

# Output summary
Write-Host "`n===== EAS Ignore Test Summary =====`n"
Write-Host "Total files: $($allFiles.Count)"
Write-Host "Ignored files: $($ignoredFiles.Count)"
Write-Host "Included files: $($includedFiles.Count)`n"

Write-Host "----- Top 20 Largest Included Files -----"
$includedFiles | Sort-Object Length -Descending | Select-Object FullName, Length | Select-Object -First 20 | Format-Table -AutoSize

Write-Host "`n----- Top 20 Largest Ignored Files -----"
$ignoredFiles | Sort-Object Length -Descending | Select-Object FullName, Length | Select-Object -First 20 | Format-Table -AutoSize


# Compute total size of included files
$totalSize = ($includedFiles | Measure-Object Length -Sum).Sum

# Convert to MB
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "`n===== Total Size of Included Files ====="
Write-Host "Total size: $totalSize bytes (~$totalSizeMB MB)"

