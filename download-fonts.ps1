# PowerShell script to download Satoshi font files

$fontsDir = "$PSScriptRoot\public\fonts"

# Create fonts directory if it doesn't exist
if (!(Test-Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir -Force
}

# Font files to download
$fontFiles = @(
    @{
        Name = "Satoshi-Light.woff2"
        Url = "https://api.fontshare.com/v2/fonts/download/satoshi/woff2/Satoshi-Light.woff2"
    },
    @{
        Name = "Satoshi-Regular.woff2"
        Url = "https://api.fontshare.com/v2/fonts/download/satoshi/woff2/Satoshi-Regular.woff2"
    },
    @{
        Name = "Satoshi-Medium.woff2"
        Url = "https://api.fontshare.com/v2/fonts/download/satoshi/woff2/Satoshi-Medium.woff2"
    },
    @{
        Name = "Satoshi-Bold.woff2"
        Url = "https://api.fontshare.com/v2/fonts/download/satoshi/woff2/Satoshi-Bold.woff2"
    },
    @{
        Name = "Satoshi-Black.woff2"
        Url = "https://api.fontshare.com/v2/fonts/download/satoshi/woff2/Satoshi-Black.woff2"
    }
)

# Download each font file
foreach ($font in $fontFiles) {
    $outputPath = Join-Path $fontsDir $font.Name
    Write-Host "Downloading $($font.Name) to $outputPath"
    
    try {
        Invoke-WebRequest -Uri $font.Url -OutFile $outputPath
        Write-Host "Downloaded $($font.Name) successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download $($font.Name): $_" -ForegroundColor Red
    }
}

Write-Host "Font download complete!" -ForegroundColor Green