$email = "admin" + "@" + "shopflow.com"
$body = "{`"email`":`"$email`",`"motDePasse`":`"admin123`"}"
$admin = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $body
Write-Host "Token: " $admin.accessToken