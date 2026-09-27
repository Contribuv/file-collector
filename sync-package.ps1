# sync-package.ps1 - 将构建所需文件复制到 package/ 目录，从 package/ 用 fnpack 构建，输出带版本号的 fpk
param(
    [string]$SourceDir = "$PSScriptRoot",
    [string]$PackageDir = "$PSScriptRoot\package",
    [string]$FnPack = ""
)

$ErrorActionPreference = "Stop"

Write-Host "=== 同步源码到 package/ ===" -ForegroundColor Cyan

# ---------- 1. 清理并重建 package/ ----------
if (Test-Path $PackageDir) {
    Remove-Item -Recurse -Force $PackageDir
    Write-Host "  已清理旧 package 目录"
}
New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null

# ---------- 2. 复制构建所需文件 ----------
$dirsToSync = @("app", "cmd", "config", "wizard")
$filesToSync = @("manifest", "ICON.PNG", "ICON_256.PNG")

foreach ($dir in $dirsToSync) {
    $src = Join-Path $SourceDir $dir
    if (Test-Path $src) {
        Copy-Item -Recurse -Force $src (Join-Path $PackageDir $dir)
        Write-Host "  已复制目录: $dir"
    }
}
foreach ($file in $filesToSync) {
    $src = Join-Path $SourceDir $file
    if (Test-Path $src) {
        Copy-Item -Force $src (Join-Path $PackageDir $file)
        Write-Host "  已复制文件: $file"
    }
}

# ---------- 3. 清理不需要打包的内容 ----------
# rproxy 只保留编译好的二进制，删除 Go 源码与构建脚本
$rproxyDir = Join-Path $PackageDir "app\rproxy"
if (Test-Path $rproxyDir) {
    Remove-Item -Recurse -Force (Join-Path $rproxyDir "src") -ErrorAction SilentlyContinue
    Remove-Item -Force (Join-Path $rproxyDir "build.sh") -ErrorAction SilentlyContinue
    Remove-Item -Force (Join-Path $rproxyDir "go.mod") -ErrorAction SilentlyContinue
    Remove-Item -Force (Join-Path $rproxyDir "go.sum") -ErrorAction SilentlyContinue
    Write-Host "  已清理 rproxy 源码（仅保留二进制）"
}

# Python 字节码缓存与调试用的 source map
$cleanupTargets = @("__pycache__", "*.pyc", "*.pyo", "*.map")
foreach ($t in $cleanupTargets) {
    Get-ChildItem -Path $PackageDir -Recurse -Force -Filter $t -ErrorAction SilentlyContinue |
        Where-Object { $null -ne $_.PSPath } |
        ForEach-Object { Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue }
}
Write-Host "  已清理 __pycache__ / *.pyc / *.map"

# 应用图标：new-logo.png -> package/logo.png
$newLogo = Join-Path $SourceDir "new-logo.png"
if (Test-Path $newLogo) {
    Copy-Item -Force $newLogo (Join-Path $PackageDir "logo.png")
    Write-Host "  图标: new-logo.png -> logo.png"
}

# ---------- 4. 定位 fnpack.exe ----------
if (-not $FnPack) {
    $candidates = @(
        "$SourceDir\..\fnpack.exe",
        "$SourceDir\fnpack.exe",
        "C:\Users\65198\CodeBuddy\文件收集\fnpack.exe"
    )
    if (-not $FnPack) {
        foreach ($c in $candidates) {
            if (Test-Path $c) { $FnPack = $c; break }
        }
    }
}
if (-not $FnPack -and (Get-Command fnpack.exe -ErrorAction SilentlyContinue)) {
    $FnPack = (Get-Command fnpack.exe -ErrorAction SilentlyContinue).Source
}
if (-not (Test-Path $FnPack)) {
    Write-Host "  [错误] 未找到 fnpack.exe，可用 -FnPack 参数指定路径" -ForegroundColor Red
    exit 1
}
Write-Host "  打包工具: $FnPack"

# ---------- 5. 从 manifest 读取版本号 ----------
$manifestFile = Join-Path $SourceDir "manifest"
$pkgVersion = $null
if (Test-Path $manifestFile) {
    $manifestContent = Get-Content $manifestFile -Raw
    if ($manifestContent -match '(?m)^\s*version\s*=\s*([0-9]+(?:\.[0-9]+)+)') {
        $pkgVersion = $Matches[1]
    }
}
if (-not $pkgVersion) {
    Write-Host "  [错误] 无法从 manifest 读取版本号" -ForegroundColor Red
    exit 1
}
Write-Host "  版本号: $pkgVersion"

# ---------- 6. 从 package/ 构建 fpk ----------
Write-Host "=== fnpack build -d $PackageDir ===" -ForegroundColor Cyan
Push-Location $PackageDir
try {
    & $FnPack build -d $PackageDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [错误] fnpack 构建失败，退出码 $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
}
finally {
    Pop-Location
}

# fnpack 输出文件名固定为 file-collector.fpk，可能落在 package/ 或当前目录，双位置查找
$builtFpk = $null
foreach ($probe in @((Join-Path $PackageDir "file-collector.fpk"), (Join-Path $SourceDir "file-collector.fpk"))) {
    if (Test-Path $probe) { $builtFpk = $probe; break }
}
if (-not $builtFpk) {
    Write-Host "  [错误] 构建后未找到 file-collector.fpk" -ForegroundColor Red
    exit 1
}

# ---------- 7. 重命名为带版本号的 fpk（输出到 SourceDir） ----------
$outputPath = Join-Path $SourceDir "file-collector-$pkgVersion.fpk"
if ($builtFpk -ne $outputPath -and (Test-Path $outputPath)) { Remove-Item -Force $outputPath }
Move-Item -Force $builtFpk $outputPath
Write-Host "  打包完成: $outputPath" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Green