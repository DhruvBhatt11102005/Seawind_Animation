$root = $PSScriptRoot
$map = @{
  'Responsive Website Design' = 'services/responsive-website-design.html'
  'Custom Web Development' = 'services/custom-web-development.html'
  'Integrated Payment Gateway' = 'services/integrated-payment-gateway.html'
  'Smart Mobile Applications' = 'services/smart-mobile-applications.html'
  'AI-Powered Digital Marketing' = 'services/ai-powered-digital-marketing.html'
  'SEO Services Provider' = 'services/seo-services-provider.html'
  'Shared Web Hosting' = 'services/shared-web-hosting.html'
  'Reseller Web Hosting' = 'services/reseller-web-hosting.html'
  'Linux Managed VPS Hosting' = 'services/linux-managed-vps-hosting.html'
  'Windows Managed VPS Hosting' = 'services/windows-managed-vps-hosting.html'
  'Linux Dedicated Server Hosting' = 'services/linux-dedicated-server-hosting.html'
  'Windows Dedicated Server Hosting' = 'services/windows-dedicated-server-hosting.html'
  'Domain Registration Services' = 'services/domain-registration-services.html'
  'SSL Security Certificates' = 'services/ssl-security-certificates.html'
  'Printing & Branding' = 'services/printing-branding.html'
  'Multimedia Presentations' = 'services/multimedia-presentations.html'
  'Hire Designer' = 'services/hire-designer.html'
  'Hire Developer' = 'services/hire-developer.html'
  'Offshore Staffing Solutions' = 'services/offshore-staffing-solutions.html'
  'AI Driven Services' = 'services/ai-driven-services.html'
  'AI in Marketing' = 'services/ai-in-marketing.html'
}

function Update-File($file, $label) {
  $path = Join-Path $root $file
  if (-not (Test-Path $path)) { return }
  $c = [IO.File]::ReadAllText($path)
  foreach ($k in $map.Keys) {
    $slug = $map[$k]
    $esc = [regex]::Escape($k)
    $pat1 = "(?s)(<h3>$esc</h3>.*?href=`")contact\.html(`" class=`"card-link`">Get a Quote)"
    $c = [regex]::Replace($c, $pat1, "`${1}$slug`${2}")
    $pat2 = "(?s)(<h3>$esc</h3>.*?href=`")services\.html(`" class=`"card-link`">Learn more)"
    $c = [regex]::Replace($c, $pat2, "`${1}$slug`${2}")
    $pat3 = "(?s)(<h3>$esc</h3>.*?href=`")#(`" class=`"card-link`">Learn more)"
    $c = [regex]::Replace($c, $pat3, "`${1}$slug`${2}")
  }
  [IO.File]::WriteAllText($path, $c)
  Write-Host "Updated $file ($label)"
}

Update-File 'services.html' 'services'
Update-File 'index.html' 'index'
Write-Host 'Done'
