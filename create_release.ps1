# 创建 GitHub Release v2.3.45 并上传 fpk
$ErrorActionPreference = 'Stop'

# 1. 从 Git Credential Manager 提取 GitHub 凭据
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'git'
$psi.Arguments = 'credential fill'
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$proc = [System.Diagnostics.Process]::Start($psi)
$proc.StandardInput.WriteLine('protocol=https')
$proc.StandardInput.WriteLine('host=github.com')
$proc.StandardInput.WriteLine('')
$proc.StandardInput.Close()
$credOut = $proc.StandardOutput.ReadToEnd()
$proc.WaitForExit()
$pass = ($credOut | Select-String '^password=(.+)$').Matches.Groups[1].Value
if (-not $pass) {
    Write-Error '无法获取 GitHub 凭据，请先配置 git 凭据或设置 GH_TOKEN'
}
$headers = @{
    Authorization = "Bearer $pass"
    Accept        = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
}

# 2. 验证 token
$me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers
Write-Output "认证用户: $($me.login)"

# 3. 创建 Release
$repo = 'Contribuv/file-collector'
$notes = @'
## v2.3.45

界面显示优化：

- 首页顶栏昵称优先显示：设置昵称后不再显示管理员用户名（`nickname` 为空时回退账号；SSO 登录仍显示飞牛 NAS 账号名）
- 收集页/分享页标题文案优化：去掉用户名后的逗号，改为「{昵称}邀请您上传文件！」「{昵称}分享了文件给您！」
- 后台链接列表「复制链接」文案同步去掉逗号，与页面展示保持一致
'@
$body = @{
    tag_name         = 'v2.3.45'
    target_commitish = 'main'
    name             = 'v2.3.45'
    body             = $notes
    draft            = $false
    prerelease       = $false
} | ConvertTo-Json

$release = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$repo/releases" -Headers $headers -Body $body -ContentType 'application/json'
Write-Output "Release 已创建: $($release.html_url) (id=$($release.id))"

# 4. 上传 fpk 资产
$fpk = 'D:\fnosApp\wjsjq\file-collector\file-collector-2.3.45.fpk'
if (-not (Test-Path $fpk)) { Write-Error "找不到 fpk: $fpk" }
$uploadUri = "https://uploads.github.com/repos/$repo/releases/$($release.id)/assets?name=file-collector-2.3.45.fpk"
$asset = Invoke-RestMethod -Method Post -Uri $uploadUri -Headers $headers -Form @{ file = Get-Item $fpk }
Write-Output "资产已上传: $($asset.name) ($($asset.size) bytes) url=$($asset.browser_download_url)"
