$uri = "http://localhost:5000/api/users/register"

# Create a multipart form data object
$form = @{}
$form['name'] = 'Test User 456'
$form['username'] = 'testuser456'
$form['email'] = 'testuser456@example.com'
$form['password'] = 'password123'
$form['bio'] = 'Testing FormData'
$form['currentPost'] = 'Engineer'
$form['education'] = '[{"school":"MIT","degree":"BS","fieldOfStudy":"CS","years":"2020"}]'
$form['pastWork'] = '[{"company":"Google","position":"SDE","years":"3","description":"Backend"}]'

# Use .NET HttpClient for proper multipart handling
Add-Type -AssemblyName System.Net.Http

$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)

$content = New-Object System.Net.Http.MultipartFormDataContent

foreach ($key in $form.Keys) {
    $value = $form[$key]
    $content.Add((New-Object System.Net.Http.StringContent($value)), $key)
}

Write-Host "Sending registration request..."
$response = $client.PostAsync($uri, $content).Result

Write-Host "Status Code: $($response.StatusCode)"
$responseContent = $response.Content.ReadAsStringAsync().Result
Write-Host "Response Body:"
Write-Host $responseContent

$client.Dispose()
$handler.Dispose()
