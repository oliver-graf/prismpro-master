param([string] $id = "SQL")

$filepath = "C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\Log\ERRORLOG.1"

$newstreamreader = New-Object System.IO.StreamReader($filepath)
$eachlinenumber = 1

$timestamp = Get-Date -Format o | ForEach-Object { $_ -replace ":", "." }
$loc = "C:\Program Files\"
$ext = ".txt"
$location = $loc+$id+$timestamp+$ext

Set-Content $location "Logs"

while (($readeachline = $newstreamreader.ReadLine()) -ne $null)
{
    $readeachline
    Add-Content $location $readeachline
}


$newstreamreader.Dispose()
  


# Set the Google Auth parameters. Fill in your RefreshToken, ClientID, and ClientSecret
$params = @{
    Uri = 'https://accounts.google.com/o/oauth2/token'
    Body = @(
        "refresh_token=1//04EReUQ8kgxRYCgYIARAAGAQSNwF-L9IrpMEDNy4B6OT2w2SkU3BhrV8YzdoLMWtacp2t4vPBQVM4z9XZ80bbXkpq9zfTnV9NFGY", # Replace $RefreshToken with your refresh token
        "client_id=366723132186-tut18j1a1mupbng7qmsp0bq4uanhbe0h.apps.googleusercontent.com",         # Replace $ClientID with your client ID
        "client_secret=4dLWCDSXB2Dgoa5I4yWJLxgb", # Replace $ClientSecret with your client secret
        "grant_type=refresh_token"
    ) -join '&'
    Method = 'Post'
    ContentType = 'application/x-www-form-urlencoded'
}
$accessToken = (Invoke-RestMethod @params).access_token

# Change this to the file you want to upload
$SourceFile = $location

# Get the source file contents and details, encode in base64
$sourceItem = Get-Item $sourceFile
$sourceBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($sourceItem.FullName))
$sourceMime = [System.Web.MimeMapping]::GetMimeMapping($sourceItem.FullName)

# If uploading to a Team Drive, set this to 'true'
$supportsTeamDrives = 'false'

# Set the file metadata
$uploadMetadata = @{
    originalFilename = $sourceItem.Name
    name = $sourceItem.Name
    description = $sourceItem.VersionInfo.FileDescription
    parents = @('1e4hhdCydQ5pjEKMXUoxe0f35-uYshnLZ') # Include to upload to a specific folder
    #teamDriveId = ‘teamDriveId’            # Include to upload to a specific teamdrive
}

# Set the upload body
$uploadBody = @"
--boundary
Content-Type: application/json; charset=UTF-8

$($uploadMetadata | ConvertTo-Json)

--boundary
Content-Transfer-Encoding: base64
Content-Type: $sourceMime

$sourceBase64
--boundary--
"@

# Set the upload headers
$uploadHeaders = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = 'multipart/related; boundary=boundary'
    "Content-Length" = $uploadBody.Length
}

# Perform the upload
$response = Invoke-RestMethod -Uri "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsTeamDrives=$supportsTeamDrives" -Method Post -Headers $uploadHeaders -Body $uploadBody