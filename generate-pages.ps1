# Generates blog, service category, and service detail pages for Seawind Solution
$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false

function Write-Utf8($path, $content) {
  $dir = Split-Path $path -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}

function Get-ShellStart($base, $title, $active) {
  $nav = @{
    home = ""; services = ""; portfolio = ""; technologies = ""; blog = ""; careers = ""; about = ""; contact = ""
  }
  if ($active) { $nav[$active] = ' class="nav-active"' }

  @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$title</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${base}style.css" />
  <link rel="stylesheet" href="${base}animations.css" />
  <link rel="stylesheet" href="${base}inner.css" />
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="display:none;"><defs><filter id="gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></defs></svg>
  <div class="page-loader" id="pageLoader" aria-hidden="true"><img src="${base}images/loader/loaderimage (1).png" alt="Loading..." class="loader-custom-img" /><span class="loader-text">Seawind</span></div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
  <div class="noise-overlay" aria-hidden="true"></div>
  <div class="mesh-bg" aria-hidden="true"></div>
  <div class="site-waves" aria-hidden="true"><div class="site-wave site-wave-1"></div><div class="site-wave site-wave-2"></div><div class="site-wave site-wave-3"></div></div>
  <div class="cursor-glow" id="cursorGlow"></div>
  <div class="cursor-ring" id="cursorRing" aria-hidden="true"></div>
  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="${base}index.html" class="logo"><span class="logo-frame logo-frame--nav"><img src="${base}images/logo/trademark-logo-new.png" alt="Seawind Solution" class="logo-img logo-img--nav" /></span></a>
      <ul class="nav-links">
        <li><a href="${base}services.html"$($nav.services)>Services</a></li>
        <li><a href="${base}portfolio.html"$($nav.portfolio)>Portfolio</a></li>
        <li><a href="${base}technologies.html"$($nav.technologies)>Tech</a></li>
        <li><a href="${base}blog.html"$($nav.blog)>Blog</a></li>
        <li><a href="${base}careers.html"$($nav.careers)>Careers</a></li>
        <li><a href="${base}about.html"$($nav.about)>About</a></li>
        <li><a href="${base}contact.html"$($nav.contact)>Contact</a></li>
        <li><a href="${base}contact.html" class="btn-nav">Get Started</a></li>
      </ul>
      <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>
"@
}

function Get-ShellEnd($base) {
  @"
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="${base}index.html" class="logo footer-logo"><span class="logo-frame logo-frame--footer"><img src="${base}images/logo/trademark-logo-new.png" alt="Seawind Solution" class="logo-img logo-img--footer" /></span></a>
          <p>India's leading digital agency delivering world-class web, mobile, and AI solutions since 2012.</p>
          <div class="social-links">
            <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a2.7 2.7 0 0 0-2.7-2.7c-1.2 0-1.8.7-2.1 1.2v-1h-3.3v7.8h3.3v-4.2c0-.2 0-.4.1-.6.2-.4.5-.8 1.1-.8.8 0 1.1.6 1.1 1.5v4.1h3.3M7.3 8.7c1.1 0 1.8-.7 1.8-1.7s-.7-1.7-1.8-1.7-1.8.7-1.8 1.7.7 1.7 1.8 1.7m1.6 9.8V10.7H5.6v7.8h3.3z"/></svg></a>
            <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.2 4H19.8L15.2 9.4L20.6 16.5H17.4L14.9 13.2L12 17.2H10.4L15.3 11.5L10.1 4.7H13.4L15.7 7.7L18.2 4M17.6 15.6H18.5L13.1 8.5H12.2L17.6 15.6Z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.4 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4 1a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg></a>
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54v-2.21c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg></a>
          </div>
        </div>
        <div class="footer-links">
          <div class="footer-col"><h5>Services</h5><a href="${base}services/web-services.html">Web Development</a><a href="${base}services/mobile-app-development.html">Mobile Apps</a><a href="${base}services/ai-solutions.html">AI Solutions</a><a href="${base}services/digital-marketing.html">Digital Marketing</a><a href="${base}services/website-hosting.html">Hosting</a></div>
          <div class="footer-col"><h5>Company</h5><a href="${base}about.html">About Us</a><a href="${base}portfolio.html">Portfolio</a><a href="${base}careers.html">Careers</a><a href="${base}blog.html">Blog</a><a href="${base}contact.html">Contact</a></div>
          <div class="footer-col"><h5>Contact</h5><a href="mailto:info@seawindsolution.com">info@seawindsolution.com</a><a href="tel:+918141887285">+91 81418 87285</a><a href="tel:+918141887287">+91 81418 87287</a><a href="${base}contact.html">Ahmedabad, India</a></div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 Seawind Solution. All rights reserved.</p>
        <div class="footer-legal"><a href="${base}privacy-policy.html">Privacy Policy</a><a href="${base}terms-of-service.html">Terms of Service</a></div>
      </div>
    </div>
  </footer>
  <script src="${base}forms-config.js"></script>
  <script src="${base}forms.js"></script>
  <script src="${base}script.js"></script>
  <script src="${base}animations.js"></script>
  <script src="${base}inner.js"></script>
</body>
</html>
"@
}

function Get-CtaBlock($base) {
  @"
  <section class="cta-section section">
    <div class="container">
      <div class="cta-inner reveal">
        <div class="cta-orb cta-orb-1"></div><div class="cta-orb cta-orb-2"></div>
        <div class="cta-waves" aria-hidden="true"><div class="cta-wave cta-wave-1"></div><div class="cta-wave cta-wave-2"></div><div class="cta-wave cta-wave-3"></div></div>
        <span class="section-tag">Let's Build Together</span>
        <h2>Ready to Start Your <span class="gradient-text">Next Project?</span></h2>
        <p>Tell us about your idea and we'll get back to you within 24 hours.</p>
        <a href="${base}contact.html" class="btn-primary">Get In Touch <span class="btn-arrow">&rarr;</span></a>
      </div>
    </div>
  </section>
"@
}

$services = @(
  @{ slug='responsive-website-design'; title='Responsive Website Design'; cat='web-services'; catName='Web Services'; img='images/services/1749033370_Responsive-Website-Design.jpg'; desc='Mobile-friendly, visually appealing websites that work seamlessly across all devices.'; long='We design responsive websites that adapt beautifully to phones, tablets, and desktops - improving engagement, SEO, and conversions for your business in Ahmedabad and beyond.' },
  @{ slug='custom-web-development'; title='Custom Web Development'; cat='web-services'; catName='Web Services'; img='images/services/1749034404_Custom-Web-Development.jpg'; desc='Tailored web development solutions built to match your business goals and brand identity.'; long='From corporate portals to custom web apps, our developers build scalable, secure solutions using modern frameworks - aligned with your brand and growth goals.' },
  @{ slug='integrated-payment-gateway'; title='Integrated Payment Gateway'; cat='web-services'; catName='Web Services'; img='images/services/1749465505_Integrated-Payment-Gateway.avif'; desc='Secure, reliable payment gateway integrations for e-commerce and business platforms.'; long='We integrate trusted payment gateways with your website or app - ensuring secure transactions, smooth checkout, and compliance with industry standards.' },
  @{ slug='smart-mobile-applications'; title='Smart Mobile Applications'; cat='mobile-app-development'; catName='Mobile App Development'; img='images/services/1749026306_Smart_Mobile_Applications.jpg'; desc='Feature-rich mobile apps with outstanding user experience on iOS and Android.'; long='Our mobile team delivers native and cross-platform apps - from MVP to enterprise - with intuitive UX, robust backends, and App Store / Play Store deployment support.' },
  @{ slug='ai-powered-digital-marketing'; title='AI-Powered Digital Marketing'; cat='digital-marketing'; catName='Digital Marketing'; img='images/services/1749633184_Ai-powerd-Digital-Marketing.avif'; desc='Stand out and convert more customers with data-driven, AI-enhanced marketing.'; long='Leverage AI for smarter campaigns, audience targeting, and content - helping your brand reach the right customers at the right time across digital channels.' },
  @{ slug='seo-services-provider'; title='SEO Services Provider'; cat='digital-marketing'; catName='Digital Marketing'; img='images/services/1753869348_seo-company-ahmedabad.jpg'; desc='Online SEO strategies that improve visibility and drive qualified traffic.'; long='As an SEO company in Ahmedabad, we optimize your site structure, content, and technical performance to rank higher and attract leads that convert.' },
  @{ slug='shared-web-hosting'; title='Shared Web Hosting'; cat='website-hosting'; catName='Website Hosting'; img='images/services/1749033108_Shared-Web-Hosting.jpg'; desc='Reliable, cost-effective hosting for small websites with great performance.'; long='Fast, secure shared hosting with 99.9% uptime - ideal for business websites, blogs, and startups that need dependable performance without high cost.' },
  @{ slug='reseller-web-hosting'; title='Reseller Web Hosting'; cat='website-hosting'; catName='Website Hosting'; img='images/services/1749032626_Reseller-Web-Hosting.jpg'; desc='Start your hosting business with flexible, reliable reseller plans.'; long='Full administrative control, white-label options, and dedicated reseller support - build and manage your own hosting brand with Seawind infrastructure.' },
  @{ slug='linux-managed-vps-hosting'; title='Linux Managed VPS Hosting'; cat='vps-hosting'; catName='VPS Hosting'; img='images/services/1749032463_Linux-Managed-VPS-Hosting.jpg'; desc='High-performance Linux VPS with 24/7 management and security.'; long='Managed Linux VPS hosting with proactive monitoring, backups, and scaling - perfect for growing applications and business-critical workloads.' },
  @{ slug='windows-managed-vps-hosting'; title='Windows Managed VPS Hosting'; cat='vps-hosting'; catName='VPS Hosting'; img='images/services/1749033468_Windows-Managed-VPS-Hosting.jpg'; desc='Fully managed Windows VPS with superb control and scalable resources.'; long='Run .NET, ASP, and Windows-based apps on secure, managed VPS instances with expert support and flexible resource allocation.' },
  @{ slug='linux-dedicated-server-hosting'; title='Linux Dedicated Server Hosting'; cat='dedicated-server-hosting'; catName='Dedicated Server Hosting'; img='images/services/1749032232_Linux-Dedicated-Server-Hosting1.jpg'; desc='Robust dedicated Linux servers for heavy enterprise workloads.'; long='Dedicated hardware, full root access, and enterprise-grade security for high-traffic sites, SaaS platforms, and data-intensive applications.' },
  @{ slug='windows-dedicated-server-hosting'; title='Windows Dedicated Server Hosting'; cat='dedicated-server-hosting'; catName='Dedicated Server Hosting'; img='images/services/1749633603_Windows-Dedicated-Server-Hosting.avif'; desc='Enterprise-grade dedicated Windows servers with maximum control.'; long='Reliable Windows dedicated servers with full administrative access, high uptime, and 24/7 technical support for mission-critical systems.' },
  @{ slug='domain-registration-services'; title='Domain Registration Services'; cat='integrated-domain-management'; catName='Domain Management'; img='images/services/1749449989_Domain-Registration-Services.avif'; desc='Easy domain registration with 50+ extensions for global and local needs.'; long='Search, register, transfer, and manage domains with AI-integrated tools - plus DNS management and renewal reminders in one place.' },
  @{ slug='ssl-security-certificates'; title='SSL Security Certificates'; cat='ssl-certificates'; catName='SSL Certificates'; img='images/services/1749452747_SSL-Security-Certificates.avif'; desc='Secure your website and boost trust with industry-standard SSL.'; long='We provision and install SSL certificates - from basic to EV - protecting data in transit and improving search rankings and customer confidence.' },
  @{ slug='printing-branding'; title='Printing & Branding'; cat='printing-services'; catName='Printing Services'; img='images/services/1749452597_Printing-Branding.avif'; desc='High-quality printing and custom branding for stronger visibility.'; long='Business cards, brochures, packaging, and brand collateral - designed and printed to elevate your brand presence across print and digital touchpoints.' },
  @{ slug='multimedia-presentations'; title='Multimedia Presentations'; cat='multimedia-presentations'; catName='Multimedia Presentations'; img='images/services/1749452529_Multimedia-Presentations.avif'; desc='AI-powered multimedia presentations for impactful storytelling.'; long='Engaging slide decks, video presentations, and interactive media that communicate your message clearly to investors, clients, and teams.' },
  @{ slug='hire-designer'; title='Hire Designer'; cat='offshore-staffing'; catName='Offshore Staffing'; img='images/services/1749465320_Hire-Designer.avif'; desc='Skilled designers to bring your creative ideas to life.'; long='Extend your team with dedicated UI/UX and graphic designers - flexible engagement, proven processes, and cost-effective offshore talent from India.' },
  @{ slug='hire-developer'; title='Hire Developer'; cat='offshore-staffing'; catName='Offshore Staffing'; img='images/services/1749465398_Hire-Devloper.avif'; desc='Expert developers for scalable web and app solutions.'; long='Hire full-stack, frontend, backend, or mobile developers on dedicated or part-time models - vetted talent integrated with your workflow and tools.' },
  @{ slug='offshore-staffing-solutions'; title='Offshore Staffing Solutions'; cat='offshore-staffing'; catName='Offshore Staffing'; img='images/services/1749633485_Offshore-Staffing-Solutions.avif'; desc='Scale your workforce with experienced offshore talent.'; long='End-to-end offshore staffing - recruitment, onboarding, and management - so you can grow capacity without compromising quality or budget.' },
  @{ slug='ai-driven-services'; title='AI Driven Services'; cat='ai-solutions'; catName='AI Solutions'; img='images/services/1749633261_Ai-Driven-Services.avif'; desc='AI-driven services designed to enhance efficiency and growth.'; long='Custom AI integrations, automation, chatbots, and intelligent workflows that transform operations and unlock new business opportunities.' },
  @{ slug='ai-in-marketing'; title='AI in Marketing'; cat='ai-solutions'; catName='AI Solutions'; img='images/services/1736417386_ai-in-marketing.jpg'; desc='AI in marketing to boost engagement and drive conversions.'; long='Predictive analytics, personalized campaigns, and content optimization powered by AI - helping marketers achieve more with smarter insights.' }
)

$categories = @(
  @{ slug='web-services'; title='Web Services'; tag='Web'; desc='Professional web design and development in Ahmedabad for business growth.'; img='images/services/1749034404_Custom-Web-Development.jpg' },
  @{ slug='mobile-app-development'; title='Mobile App Development'; tag='Mobile'; desc='Leading mobile app development company in Ahmedabad for iOS and Android.'; img='images/services/1749026306_Smart_Mobile_Applications.jpg' },
  @{ slug='digital-marketing'; title='Digital Marketing'; tag='Marketing'; desc='Leading digital marketing agency in Ahmedabad - SEO, social, and AI-powered campaigns.'; img='images/services/1749633184_Ai-powerd-Digital-Marketing.avif' },
  @{ slug='website-hosting'; title='Website Hosting'; tag='Hosting'; desc='Fast and secure web hosting in Ahmedabad for businesses of all sizes.'; img='images/services/1749033108_Shared-Web-Hosting.jpg' },
  @{ slug='vps-hosting'; title='VPS Hosting'; tag='VPS'; desc='Powerful VPS hosting in Ahmedabad for growing businesses.'; img='images/services/1749032463_Linux-Managed-VPS-Hosting.jpg' },
  @{ slug='dedicated-server-hosting'; title='Dedicated Server Hosting'; tag='Servers'; desc='Reliable dedicated server hosting with full control and 24/7 support.'; img='images/services/1749032232_Linux-Dedicated-Server-Hosting1.jpg' },
  @{ slug='integrated-domain-management'; title='Integrated Domain Management'; tag='Domains'; desc='AI-integrated domain registration and management in India.'; img='images/services/1749449989_Domain-Registration-Services.avif' },
  @{ slug='ssl-certificates'; title='Secured SSL Certificates'; tag='Security'; desc='SSL and security certificates for enhanced website protection.'; img='images/services/1749452747_SSL-Security-Certificates.avif' },
  @{ slug='multimedia-presentations'; title='Multimedia Presentations'; tag='Media'; desc='Multimedia presentation services for impactful brand storytelling.'; img='images/services/1749452529_Multimedia-Presentations.avif' },
  @{ slug='printing-services'; title='Printing Services'; tag='Print'; desc='Printing services in India for branding and marketing collateral.'; img='images/services/1749452597_Printing-Branding.avif' },
  @{ slug='offshore-staffing'; title='Supported Offshore Staffing'; tag='Staffing'; desc='Supported offshore staffing in India - designers, developers, and teams.'; img='images/services/1749633485_Offshore-Staffing-Solutions.avif' },
  @{ slug='specialized-it-services'; title='Specialized IT Services'; tag='IT'; desc='Specialized IT services including integrations, payments, and enterprise solutions.'; img='images/services/1749465505_Integrated-Payment-Gateway.avif' },
  @{ slug='ai-solutions'; title='AI Solutions'; tag='AI'; desc='AI-powered web solutions for smarter digital growth.'; img='images/services/1749633261_Ai-Driven-Services.avif' },
  @{ slug='whatsapp-business-api'; title='WhatsApp Business API'; tag='Messaging'; desc='Trusted WhatsApp Business API provider in Ahmedabad.'; img='images/services/1749633184_Ai-powerd-Digital-Marketing.avif' },
  @{ slug='bulk-sms-service'; title='Bulk SMS Service'; tag='SMS'; desc='Best bulk SMS service provider in Ahmedabad for campaigns and alerts.'; img='images/services/1753869348_seo-company-ahmedabad.jpg' },
  @{ slug='cgi-video'; title='CGI Video'; tag='Video'; desc='Professional CGI video services in Ahmedabad.'; img='images/services/1749452529_Multimedia-Presentations.avif' },
  @{ slug='live-video-streaming'; title='Professional Live Video Streaming'; tag='Streaming'; desc='Professional live video streaming services for events and broadcasts.'; img='images/services/1749452529_Multimedia-Presentations.avif' },
  @{ slug='rcs-messaging'; title='RCS Messaging'; tag='RCS'; desc='RCS messaging service in Ahmedabad for rich business communication.'; img='images/services/1749633184_Ai-powerd-Digital-Marketing.avif' }
)

$blogs = @(
  @{ slug='ai-ml-trends-2025'; title='Top AI and ML Trends Reshaping the World in 2025'; date='Jan 15, 2025'; cat='AI & Technology'; img='images/services/1736417386_ai-in-marketing.jpg'; excerpt='Explore the AI and machine learning trends transforming industries in 2025 - from generative AI to enterprise automation.' },
  @{ slug='ai-ml-development-consulting'; title='AI & ML Development, Consulting, and Enterprise Services'; date='Dec 8, 2024'; cat='AI Solutions'; img='images/services/1749633261_Ai-Driven-Services.avif'; excerpt='How businesses leverage AI/ML development and consulting to scale operations and deliver smarter customer experiences.' },
  @{ slug='web-design-brand-story'; title='Web Design Company That Tells Your Brand Story'; date='Nov 22, 2024'; cat='Web Design'; img='images/services/1749033370_Responsive-Website-Design.jpg'; excerpt='Why storytelling-driven web design helps brands connect, convert, and stand out in competitive digital markets.' }
)

# Service detail pages
foreach ($s in $services) {
  $base = '../'
  $features = @('Expert team with 15+ years experience','Transparent communication & agile delivery','Scalable solutions for startups to enterprise','Dedicated post-launch support') -join '</li><li>'
  $html = (Get-ShellStart $base "$($s.title) - Seawind Solution" 'services') + @"

  <section class="page-hero">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">$($s.catName)</span>
        <h1>$($s.title)</h1>
        <p>$($s.desc)</p>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="${base}index.html">Home</a><span>/</span>
          <a href="${base}services.html">Services</a><span>/</span>
          <a href="${base}services/$($s.cat).html">$($s.catName)</a><span>/</span>
          <span>$($s.title)</span>
        </nav>
      </div>
    </div>
  </section>

  <section class="section service-detail-section">
    <div class="container">
      <div class="two-col-grid">
        <div class="reveal-left">
          <h2>Professional <span class="gradient-text">$($s.title)</span></h2>
          <p style="color:var(--muted);line-height:1.8;margin:20px 0;">$($s.long)</p>
          <ul class="detail-features"><li>$features</li></ul>
          <div style="margin-top:32px;display:flex;gap:16px;flex-wrap:wrap;">
            <a href="${base}contact.html" class="btn-primary">Get a Quote <span class="btn-arrow">&rarr;</span></a>
            <a href="${base}services/$($s.cat).html" class="btn-outline">View Category</a>
          </div>
        </div>
        <div class="reveal-right about-img-wrap tilt-card">
          <img src="${base}$($s.img)" alt="$($s.title)" />
        </div>
      </div>
    </div>
  </section>
$(Get-CtaBlock $base)
$(Get-ShellEnd $base)
"@
  Write-Utf8 (Join-Path $root "services\$($s.slug).html") $html
}

# Category pages
foreach ($c in $categories) {
  $base = '../'
  $children = $services | Where-Object { $_.cat -eq $c.slug }
  $cards = ''
  foreach ($ch in $children) {
    $cards += @"
        <div class="service-card bounce-hover gallery-item tilt-card">
          <div class="card-image-wrap"><img src="${base}$($ch.img)" alt="$($ch.title)" loading="lazy" /></div>
          <div class="service-card-body">
            <h3>$($ch.title)</h3>
            <p>$($ch.desc)</p>
            <a href="${base}services/$($ch.slug).html" class="card-link">Explore <span>&rarr;</span></a>
          </div>
          <div class="card-glow"></div>
        </div>
"@
  }
  if (-not $cards) {
    $cards = @"
        <div class="mv-card" style="grid-column:1/-1;text-align:center;padding:48px;">
          <p style="color:var(--muted);margin-bottom:24px;">$($c.desc)</p>
          <a href="${base}contact.html" class="btn-primary">Request Consultation <span class="btn-arrow">&rarr;</span></a>
        </div>
"@
  }
  $gridClass = if ($children) { 'services-gallery category-gallery' } else { 'category-empty' }

  $html = (Get-ShellStart $base "$($c.title) - Seawind Solution" 'services') + @"

  <section class="page-hero">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">$($c.tag)</span>
        <h1>$($c.title)</h1>
        <p>$($c.desc)</p>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="${base}index.html">Home</a><span>/</span>
          <a href="${base}services.html">Services</a><span>/</span>
          <span>$($c.title)</span>
        </nav>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">Explore</span>
        <h2>Our <span class="gradient-text">$($c.title)</span> Offerings</h2>
      </div>
      <div class="$gridClass reveal">$cards</div>
    </div>
  </section>
$(Get-CtaBlock $base)
$(Get-ShellEnd $base)
"@
  Write-Utf8 (Join-Path $root "services\$($c.slug).html") $html
}

# Blog posts
foreach ($b in $blogs) {
  $base = '../'
  $html = (Get-ShellStart $base "$($b.title) - Seawind Blog" 'blog') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">$($b.cat)</span>
        <h1>$($b.title)</h1>
        <p class="blog-meta-line">$($b.date) · Seawind Solution</p>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="${base}index.html">Home</a><span>/</span>
          <a href="${base}blog.html">Blog</a><span>/</span>
          <span>Article</span>
        </nav>
      </div>
    </div>
  </section>

  <section class="section blog-article-section">
    <div class="container container--narrow">
      <div class="blog-article reveal">
        <div class="blog-article-image"><img src="${base}$($b.img)" alt="$($b.title)" /></div>
        <p class="blog-lead">$($b.excerpt)</p>
        <p>At Seawind Solution, we help businesses in Ahmedabad and worldwide adopt modern digital strategies. Whether you are scaling a startup or optimizing enterprise systems, our team combines design, development, and AI expertise to deliver measurable results.</p>
        <p>From discovery through deployment, we follow a proven six-step process - ensuring transparency, quality, and long-term support. <a href="${base}contact.html">Contact our team</a> to discuss how we can help with your next project.</p>
        <div class="blog-tags"><span>#SeawindSolution</span><span>#DigitalAgency</span><span>#Technology</span></div>
      </div>
    </div>
  </section>
$(Get-CtaBlock $base)
$(Get-ShellEnd $base)
"@
  Write-Utf8 (Join-Path $root "blog\$($b.slug).html") $html
}

# Root: technologies.html
$base = ''
$indexLines = Get-Content (Join-Path $root 'index.html')
$techBlock = ($indexLines[615..752] -join "`n")
$techHtml = (Get-ShellStart $base 'Technologies - Seawind Solution | Tech Stack' 'technologies') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">Technology Expertise</span>
        <h1>Technology Expertise for <span class="gradient-text gradient-text--animated">Digital Innovation</span></h1>
        <p>Tailor-made solutions with extensive technology expertise to help businesses unlock their true potential.</p>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a><span>/</span><span>Technologies</span>
        </nav>
      </div>
    </div>
  </section>

  $techBlock

  <section class="section tech-extras">
    <div class="container">
      <div class="mv-grid reveal">
        <div class="mv-card"><div class="mv-icon">📱</div><h3>Mobile</h3><p>iOS, Android, Flutter, React Native, Hybrid apps, and iBeacon solutions.</p></div>
        <div class="mv-card featured-mv"><div class="mv-icon">🛒</div><h3>E-commerce</h3><p>Shopify, Magento, WooCommerce, and Weebly store development and optimization.</p></div>
        <div class="mv-card"><div class="mv-icon">☁️</div><h3>Cloud & SaaS</h3><p>Google Cloud, AWS, Webflow, GitLab, and enterprise SaaS architecture.</p></div>
      </div>
    </div>
  </section>
$(Get-CtaBlock $base)
$(Get-ShellEnd $base)
"@
Write-Utf8 (Join-Path $root 'technologies.html') $techHtml

# Root: blog.html
$blogCards = ''
foreach ($b in $blogs) {
  $blogCards += @"
        <article class="blog-card tilt-card reveal">
          <a href="blog/$($b.slug).html" class="blog-card-image"><img src="$($b.img)" alt="$($b.title)" loading="lazy" /></a>
          <div class="blog-card-body">
            <span class="blog-card-cat">$($b.cat)</span>
            <h3><a href="blog/$($b.slug).html">$($b.title)</a></h3>
            <p>$($b.excerpt)</p>
            <div class="blog-card-meta"><span>$($b.date)</span><a href="blog/$($b.slug).html" class="card-link">Read more <span>&rarr;</span></a></div>
          </div>
        </article>
"@
}
$blogHtml = (Get-ShellStart $base 'Blog - Seawind Solution | What is Trending' 'blog') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">Insights</span>
        <h1>What is <span class="gradient-text gradient-text--animated">Trending?</span></h1>
        <p>Latest news, guides, and insights on web, mobile, AI, and digital marketing.</p>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a><span>/</span><span>Blog</span>
        </nav>
      </div>
    </div>
  </section>

  <section class="section blog-list-section">
    <div class="container">
      <div class="blog-grid">$blogCards</div>
    </div>
  </section>
$(Get-CtaBlock $base)
$(Get-ShellEnd $base)
"@
Write-Utf8 (Join-Path $root 'blog.html') $blogHtml

# Privacy & Terms
$legal = @(
  @{ file='privacy-policy.html'; title='Privacy Policy'; active=''; body='We respect your privacy. Seawind Solution collects information you provide via forms to respond to inquiries and deliver services. We do not sell personal data to third parties. Contact info@seawindsolution.com for data requests.' },
  @{ file='terms-of-service.html'; title='Terms of Service'; active=''; body='By using seawindsolution.com you agree to our terms. Services are provided per agreed proposals. Content on this site is owned by Seawind Solution unless stated otherwise. For questions contact info@seawindsolution.com.' }
)
foreach ($l in $legal) {
  $html = (Get-ShellStart $base "$($l.title) - Seawind Solution" '') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <h1>$($l.title)</h1>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>$($l.title)</span></nav>
      </div>
    </div>
  </section>
  <section class="section"><div class="container container--narrow"><div class="blog-article reveal"><p style="color:var(--muted);line-height:1.8;">$($l.body)</p></div></div></section>
$(Get-ShellEnd $base)
"@
  Write-Utf8 (Join-Path $root $l.file) $html
}

Write-Host "Generated $($services.Count) service pages, $($categories.Count) category pages, $($blogs.Count) blog posts, plus technologies, blog index, legal pages."
