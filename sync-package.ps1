# sync-package.ps1 - Sync source files to package directory
param(
    [string]$SourceDir = "$PSScriptRoot",
    [string]$PackageDir = "$PSScriptRoot\package"
)

Write-Host "=== Sync to package/ ===" -ForegroundColor Cyan

if (Test-Path $PackageDir) {
    Remove-Item -Recurse -Force $PackageDir
    Write-Host "  Cleaned old package dir"
}

$dirsToSync = @("app", "cmd", "config", "wizard")
$filesToSync = @("manifest", "logo.png", "ICON.PNG", "ICON_256.PNG")

New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null

foreach ($dir in $dirsToSync) {
    $src = Join-Path $SourceDir $dir
    $dst = Join-Path $PackageDir $dir
    if (Test-Path $src) {
        Copy-Item -Recurse -Force $src $dst
        Write-Host "  Synced dir: $dir"
    }
}

# 清理不需要打包的文件：rproxy Go 源码（只保留编译好的二进制）
$rproxyDir = Join-Path $PackageDir "app\rproxy"
if (Test-Path $rproxyDir) {
    Remove-Item -Recurse -Force "$rproxyDir\src" -ErrorAction SilentlyContinue
    Remove-Item -Force "$rproxyDir\build.sh" -ErrorAction SilentlyContinue
    Remove-Item -Force "$rproxyDir\go.mod" -ErrorAction SilentlyContinue
    Write-Host "  Cleaned rproxy source files"
}

# 清理 Python 字节码缓存
Get-ChildItem -Path $PackageDir -Recurse -Force -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue |
    ForEach-Object { Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue }
Get-ChildItem -Path $PackageDir -Recurse -Force -Include "*.pyc","*.pyo" -ErrorAction SilentlyContinue |
    ForEach-Object { Remove-Item -Force $_.FullName -ErrorAction SilentlyContinue }
Write-Host "  Cleaned __pycache__ / *.pyc"

foreach ($file in $filesToSync) {
    $src = Join-Path $SourceDir $file
    $dst = Join-Path $PackageDir $file
    if (Test-Path $src) {
        Copy-Item -Force $src $dst
        Write-Host "  Synced file: $file"
    }
}

Write-Host "Done!" -ForegroundColor Green
