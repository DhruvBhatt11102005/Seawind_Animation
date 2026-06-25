$root = $PSScriptRoot
$oldNav = @'
        <li><a href="services.html">Services</a></li>
        <li><a href="technologies.html">Technologies</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
'@
$newNav = @'
        <li><a href="services.html">Services</a></li>
        <li><a href="portfolio.html">Portfolio</a></li>
        <li><a href="technologies.html">Tech</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="careers.html">Careers</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
'@
$oldNavSub = $oldNav -replace 'href="', 'href="../'
$newNavSub = $newNav -replace 'href="', 'href="../'

$oldFooterCo = @'
            <a href="about.html">About Us</a>
            <a href="blog.html">Blog</a>
            <a href="technologies.html">Technologies</a>
            <a href="contact.html">Contact</a>
'@
$newFooterCo = @'
            <a href="about.html">About Us</a>
            <a href="portfolio.html">Portfolio</a>
            <a href="careers.html">Careers</a>
            <a href="blog.html">Blog</a>
            <a href="contact.html">Contact</a>
'@
$oldFooterCoSub = $oldFooterCo -replace 'href="', 'href="../'
$newFooterCoSub = $newFooterCo -replace 'href="', 'href="../'

$formScripts = @'
  <script src="forms-config.js"></script>
  <script src="forms.js"></script>
'@
$formScriptsSub = @'
  <script src="../forms-config.js"></script>
  <script src="../forms.js"></script>
'@

Get-ChildItem $root -Recurse -Filter '*.html' | ForEach-Object {
  $c = [IO.File]::ReadAllText($_.FullName)
  $orig = $c
  $isSub = $_.DirectoryName -replace '\\','/' -match '/(services|blog|portfolio)/'

  if ($_.Name -eq 'contact.html') {
    $c = $c -replace '(?s)(<li><a href="services\.html">Services</a></li>\s*)<li><a href="technologies\.html">Technologies</a></li>\s*<li><a href="blog\.html">Blog</a></li>', "`$1<li><a href=`"portfolio.html`">Portfolio</a></li>`n        <li><a href=`"technologies.html`">Tech</a></li>`n        <li><a href=`"blog.html`">Blog</a></li>`n        <li><a href=`"careers.html`">Careers</a></li>"
  }

  if ($isSub) {
    $c = $c.Replace($oldNavSub, $newNavSub)
    $c = $c.Replace($oldFooterCoSub, $newFooterCoSub)
    if ($c -notmatch 'forms-config\.js') {
      $c = $c.Replace('<script src="../script.js">', "$formScriptsSub`n  <script src=`"../script.js`">")
    }
  } else {
    $c = $c.Replace($oldNav, $newNav)
    $c = $c.Replace($oldFooterCo, $newFooterCo)
    if ($c -notmatch 'forms-config\.js') {
      $c = $c.Replace('<script src="script.js">', "$formScripts`n  <script src=`"script.js`">")
    }
  }

  if ($c -ne $orig) {
    [IO.File]::WriteAllText($_.FullName, $c)
    Write-Host "Updated $($_.Name)"
  }
}
Write-Host 'Nav/forms patch complete.'
