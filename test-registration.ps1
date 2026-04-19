# Test registration endpoint
$uri = "http://localhost:5000/api/users/register"

# Create multipart form data
$boundaryGuid = [guid]::NewGuid().ToString()
$boundary = "----WebKitFormBoundary$([guid]::NewGuid().ToString().Replace('-', ''))"

$education = '[{"school":"MIT","degree":"BS","fieldOfStudy":"CS","years":"2020"}]'
$pastWork = '[{"company":"Google","position":"SDE","years":"3","description":"Backend work"}]'

$body = @"
--$boundary`r
Content-Disposition: form-data; name="name"`r
`r
John Test`r
--$boundary`r
Content-Disposition: form-data; name="username"`r
`r
johntest999`r
--$boundary`r
Content-Disposition: form-data; name="email"`r
`r
johntest999@example.com`r
--$boundary`r
Content-Disposition: form-data; name="password"`r
`r
pass123`r
--$boundary`r
Content-Disposition: form-data; name="bio"`r
`r
My bio`r
--$boundary`r
Content-Disposition: form-data; name="currentPost"`r
`r
Engineer`r
--$boundary`r
Content-Disposition: form-data; name="education"`r
`r
$education`r
--$boundary`r
Content-Disposition: form-data; name="pastWork"`r
`r
$pastWork`r
--$boundary--`r
"@

$headers = @{
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Body $body -Headers $headers -UseBasicParsing
    Write-Host "Response Status: $($response.StatusCode)"
    Write-Host "Response Body:" 
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body:"
        $reader.ReadToEnd()
    }
}
