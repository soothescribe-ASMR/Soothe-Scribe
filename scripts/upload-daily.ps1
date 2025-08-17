param(
    [Parameter(Mandatory)][string]$videoFile,
    [string]$title,
    [string]$description,
    [string]$tags
)

if (-not (Test-Path $videoFile)) {
    Write-Host "❌  File not found: $videoFile"
    exit 1
}

# ------------- YouTube -------------
Write-Host "🛫 YouTube upload …"
$headers = @{ Authorization = "Bearer $($env:YT_ACCESS_TOKEN)" }

$body = @{
    snippet = @{
        title       = $title
        description = $description
        tags        = ($tags -split ',')
        categoryId  = "22"
    }
    status = @{ privacyStatus = "public" }
} | ConvertTo-Json -Depth 5

$session = Invoke-RestMethod `
    -Uri "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body

$uploadUrl = $session.headers.Location
$bytes = [System.IO.File]::ReadAllBytes($videoFile)
Invoke-RestMethod -Uri $uploadUrl -Method Put -ContentType "video/mp4" -Body $bytes
Write-Host "✅ YouTube done"

# ------------- Instagram -------------
Write-Host "🛫 Instagram Reel …"
$igId  = $env:INSTAGRAM_ACCOUNT_ID
$token = $env:FACEBOOK_ACCESS_TOKEN

# 1) container
$container = Invoke-RestMethod `
    -Uri "https://graph.facebook.com/v18.0/$igId/media" `
    -Method Post `
    -Body @{
        access_token = $token
        media_type   = "REELS"
        video_url    = "https://your-cdn.com/$(Split-Path $videoFile -Leaf)"  # <-- replace with real public URL
        caption      = "$title`n$description`n$tags"
    }

# 2) publish
Invoke-RestMethod `
    -Uri "https://graph.facebook.com/v18.0/$igId/media_publish" `
    -Method Post `
    -Body @{ access_token = $token; creation_id = $container.id }
Write-Host "✅ Instagram queued"

# ------------- Facebook -------------
Write-Host "🛫 Facebook Page …"
$pageId = $env:FACEBOOK_PAGE_ID
$token  = $env:FACEBOOK_ACCESS_TOKEN

curl.exe -sSf `
  -X POST "https://graph.facebook.com/v18.0/$pageId/videos" `
  -F "access_token=$token" `
  -F "title=$title" `
  -F "description=$description`n$tags" `
  -F "source=@$videoFile"
Write-Host "✅ Facebook done"