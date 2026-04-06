# ============================================================
# Conversor de imágenes a WebP — Select Dance Studio
# ============================================================
# Requisito: tener cwebp instalado.
# Descarga: https://developers.google.com/speed/webp/download
#
# Pasos de instalación de cwebp en Windows:
# 1. Descargar el zip desde la URL de arriba
# 2. Extraer y copiar cwebp.exe a C:\Windows\System32\ (o agregar al PATH)
# 3. Abrir PowerShell como administrador y ejecutar este script
#
# Uso: ejecutar desde la carpeta donde están las imágenes
#   cd C:\xampp\htdocs\selectdancestudiogoogle\sds-frontend\public
#   .\convert-to-webp.ps1
# ============================================================

$sourceDir = $PSScriptRoot  # Directorio donde está el script
$outputDir = $sourceDir      # Guardar en el mismo lugar

# Calidad WebP (80 = excelente relación calidad/peso)
$quality = 80

Write-Host "`n🎯 Convirtiendo imágenes a WebP (calidad $quality%)..." -ForegroundColor Cyan
Write-Host "📁 Directorio: $sourceDir`n"

# Mapeo de nombres actuales → nombres SEO-friendly
$renameMap = @{
    "Baby.jpg"        = "baby-dance-palermo-select-dance-studio"
    "Mini.jpg"        = "mini-danza-palermo-select-dance-studio"
    "Junior.jpg"      = "clase-junior-danza-palermo"
    "Teen.jpg"        = "clase-teen-danza-palermo"
    "Senior.jpg"      = "clase-senior-danza-palermo"
    "Competition.jpg" = "competicion-danza-select-dance-studio-palermo"
    "Recreative.jpg"  = "danza-recreativa-palermo-buenos-aires"
    "logo.jpg"        = "logo-select-dance-studio"
}

$totalSaved = 0
$convertedCount = 0

Get-ChildItem -Path $sourceDir -Include "*.jpg","*.jpeg","*.png" -File | ForEach-Object {
    $inputFile = $_.FullName
    $originalName = $_.Name

    # Usar nombre SEO si existe en el mapa, sino usar el nombre original en minúsculas
    if ($renameMap.ContainsKey($originalName)) {
        $baseName = $renameMap[$originalName]
    } else {
        $baseName = $_.BaseName.ToLower().Replace(" ", "-")
    }

    $outputFile = Join-Path $outputDir "$baseName.webp"

    Write-Host "  🔄 $originalName → $baseName.webp" -ForegroundColor Yellow

    # Verificar si cwebp está disponible
    if (-not (Get-Command cwebp -ErrorAction SilentlyContinue)) {
        Write-Host "  ❌ ERROR: cwebp no encontrado. Instalalo desde:" -ForegroundColor Red
        Write-Host "     https://developers.google.com/speed/webp/download" -ForegroundColor Red
        exit 1
    }

    # Convertir
    & cwebp -q $quality $inputFile -o $outputFile 2>&1 | Out-Null

    if (Test-Path $outputFile) {
        $originalSize = (Get-Item $inputFile).Length
        $webpSize = (Get-Item $outputFile).Length
        $saved = $originalSize - $webpSize
        $savedPct = [math]::Round(($saved / $originalSize) * 100, 1)
        $totalSaved += $saved
        $convertedCount++

        $originalKB = [math]::Round($originalSize / 1KB, 1)
        $webpKB = [math]::Round($webpSize / 1KB, 1)
        Write-Host "  ✅ $originalKB KB → $webpKB KB (ahorro: $savedPct%)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error convirtiendo $originalName" -ForegroundColor Red
    }
}

$totalSavedKB = [math]::Round($totalSaved / 1KB, 1)
$totalSavedMB = [math]::Round($totalSaved / 1MB, 2)

Write-Host "`n✅ Conversión completa!" -ForegroundColor Cyan
Write-Host "   Archivos convertidos: $convertedCount"
Write-Host "   Peso total ahorrado: $totalSavedKB KB ($totalSavedMB MB)" -ForegroundColor Green
Write-Host "`n📋 Próximo paso: actualizar las referencias en el código de .jpg → .webp`n"
