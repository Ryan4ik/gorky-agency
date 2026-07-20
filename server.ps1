# Simple PowerShell HTTP Server for Gorky SMM Agency Website
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "PowerShell Web Server started."
    Write-Host "Open your browser and navigate to: http://localhost:$port/"
    Write-Host "Press Ctrl+C in terminal to stop the server."
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        # Route root to index.html
        if ($url -eq "/") { $url = "/index.html" }
        
        # Build local path
        if ($url.StartsWith("/assets/sequence/")) {
            $fileName = $url.Substring(17).Replace('/', '\')
            $seqDir = (Get-Item "D:\*\*\SMM\Gorky Games\3d\JPG").FullName
            $localPath = Join-Path $seqDir $fileName
        } else {
            $localPath = Join-Path "C:\Users\Taron_HOME\.gemini\antigravity\scratch\gorky-agency" $url.Replace('/', '\').TrimStart('\')
        }
        
        if ([System.IO.File]::Exists($localPath)) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            # Set content types
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "application/octet-stream"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".svg"  { $contentType = "image/svg+xml" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 File Not Found</h1><p>Requested: $url</p>")
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
