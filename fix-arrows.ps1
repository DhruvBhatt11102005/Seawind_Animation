# Fix mojibake arrows (UTF-8 arrow mis-encoded) -> HTML entity
$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false

# U+2192 arrow, or common mojibake when arrow was corrupted
$replacements = @(
  @{ bad = [string][char]0x00E2 + [char]0x2020 + [char]0x2019; good = '&rarr;' }
  @{ bad = [char]0x2192; good = '&rarr;' }
  @{ bad = [string][char]0x00E2 + [char]0x20AC + [char]0x201D; good = '&mdash;' }
  @{ bad = [char]0x2014; good = '&mdash;' }
)

$count = 0
Get-ChildItem $root -Recurse -Include '*.html','*.ps1' | ForEach-Object {
  $text = $utf8.GetString([IO.File]::ReadAllBytes($_.FullName))
  $orig = $text
  foreach ($r in $replacements) {
    $text = $text.Replace($r.bad, $r.good)
  }
  if ($text -ne $orig) {
    [IO.File]::WriteAllText($_.FullName, $text, $utf8)
    $count++
    Write-Host "Fixed $($_.FullName)"
  }
}
Write-Host "Done. $count files updated."
