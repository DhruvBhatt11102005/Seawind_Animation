$root = $PSScriptRoot
$cats = @(
  @{ slug='web-services'; title='Web Services' },
  @{ slug='mobile-app-development'; title='Mobile App Development' },
  @{ slug='digital-marketing'; title='Digital Marketing' },
  @{ slug='website-hosting'; title='Website Hosting' },
  @{ slug='vps-hosting'; title='VPS Hosting' },
  @{ slug='dedicated-server-hosting'; title='Dedicated Server Hosting' },
  @{ slug='integrated-domain-management'; title='Domain Management' },
  @{ slug='ssl-certificates'; title='SSL Certificates' },
  @{ slug='multimedia-presentations'; title='Multimedia Presentations' },
  @{ slug='printing-services'; title='Printing Services' },
  @{ slug='offshore-staffing'; title='Offshore Staffing' },
  @{ slug='specialized-it-services'; title='Specialized IT Services' },
  @{ slug='ai-solutions'; title='AI Solutions' },
  @{ slug='whatsapp-business-api'; title='WhatsApp Business API' },
  @{ slug='bulk-sms-service'; title='Bulk SMS Service' },
  @{ slug='cgi-video'; title='CGI Video' },
  @{ slug='live-video-streaming'; title='Live Video Streaming' },
  @{ slug='rcs-messaging'; title='RCS Messaging' }
)
$cards = ''
foreach ($cat in $cats) {
  $cards += "        <a href=`"services/$($cat.slug).html`" class=`"category-card tilt-card`"><h3>$($cat.title)</h3><p>Explore our $($cat.title.ToLower()) offerings.</p><span class=`"card-link`">Explore <span class=`"btn-arrow`">&rarr;</span></span></a>`n"
}
$block = @"
  <section class="section" id="categories" style="padding-top:0;">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">Categories</span>
        <h2>Browse by <span class="gradient-text">Service Type</span></h2>
      </div>
      <div class="category-grid reveal">
$cards      </div>
    </div>
  </section>

"@
$path = Join-Path $root 'services.html'
$c = [IO.File]::ReadAllText($path)
$marker = '  <!-- PROCESS -->'
if ($c -notmatch 'id="categories"') {
  $c = $c.Replace($marker, $block + $marker)
  [IO.File]::WriteAllText($path, $c)
  Write-Host 'Inserted category grid'
} else {
  Write-Host 'Category grid already present'
}
