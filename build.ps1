Write-Host "✨ Starting the build process..." -ForegroundColor Yellow
Write-Host "✨ docker build -f Dockerfile.back -t 3proj-back ." -ForegroundColor Yellow
docker build -f Dockerfile.back -t 3proj-back .
Write-Host "✨ docker build -f Dockerfile.front -t 3proj-front ." -ForegroundColor Yellow
docker build -f Dockerfile.front -t 3proj-front .
Write-Host "🚀 Build completed successfully!" -ForegroundColor Green -BackgroundColor Black