# Portfolio + Careers pages
$root = $PSScriptRoot
. (Join-Path $root 'generate-pages.ps1')

$portfolio = @(
  @{ slug='kart-zone'; title='Kart Zone'; cat='E-commerce'; service='Web Development'; img='images/services/1749034404_Custom-Web-Development.jpg'; desc='E-commerce platform with custom catalog, checkout, and mobile-first shopping experience.'; client='Kart Zone' },
  @{ slug='ferrum'; title='Ferrum'; cat='Manufacturing'; service='Web Development'; img='images/services/1749033370_Responsive-Website-Design.jpg'; desc='Corporate website and brand presence for a trusted manufacturing partner.'; client='Ferrum' },
  @{ slug='joyous-bakery'; title='Joyous Bakery'; cat='Food & Beverage'; service='Digital Marketing'; img='images/services/1749633184_Ai-powerd-Digital-Marketing.avif'; desc='Brand visibility and marketing strategy for a growing bakery business.'; client='Joyous Bakery' },
  @{ slug='international-institute-of-design'; title='International Institute of Design'; cat='Education'; service='Web Development'; img='images/services/1749033370_Responsive-Website-Design.jpg'; desc='Institutional website with program showcases and lead-generation flows.'; client='IID' },
  @{ slug='solitaire-car-studio'; title='Solitaire Car Studio'; cat='Automotive'; service='Web & CRM'; img='images/services/1749465505_Integrated-Payment-Gateway.avif'; desc='Salesforce-integrated web platform for automotive retail operations.'; client='Solitaire Car Studio' },
  @{ slug='news-of-gujarat'; title='News Of Gujarat'; cat='Media'; service='Digital Marketing'; img='images/services/1753869348_seo-company-ahmedabad.jpg'; desc='Media brand growth with SEO, content, and multi-channel digital campaigns.'; client='News Of Gujarat' },
  @{ slug='actilifehealth'; title='Actilife Health'; cat='Healthcare'; service='Web Development'; img='images/services/1749034404_Custom-Web-Development.jpg'; desc='Healthcare digital presence with patient-focused UX and scalable architecture.'; client='Actilife Health' },
  @{ slug='the-phone-garage'; title='The Phone Garage'; cat='Retail'; service='E-commerce'; img='images/services/1749026306_Smart_Mobile_Applications.jpg'; desc='Retail e-commerce and mobile-friendly storefront for device sales and repairs.'; client='The Phone Garage' }
)

$jobs = @(
  @{
    id='php-developer'
    title='PHP Developer'
    posts='2'
    exp='1 to 3 years'
    category='Development'
    summary='Build and maintain PHP web applications, CMS modules, and e-commerce integrations.'
    skills=@('PHP 5+','MySQL','WordPress','Drupal','Magento','Laravel / CodeIgniter','REST & SOAP APIs','Payment gateway integration')
    responsibilities=@('Develop dynamic websites per specifications','Module, plugin, and theme development','API and third-party integrations','QA support and client coordination')
  },
  @{
    id='business-development-executive'
    title='Business Development Executive'
    posts='5'
    exp='6 months to 2 years'
    category='Sales'
    summary='Generate leads, close IT service deals, and grow the client base in Ahmedabad and beyond.'
    skills=@('Field & tele-sales','Lead generation','Client meetings','Proposal writing','IT services industry knowledge')
    responsibilities=@('Cold calls, exhibitions, and prospect follow-ups','Negotiation and deal closure','Marketing communication planning','Reporting to Business Development Manager')
  },
  @{
    id='android-developer'
    title='Android Developer'
    posts='2'
    exp='1 to 2 years'
    category='Development'
    summary='Native Android apps with Kotlin/Java, MVVM, and modern mobile architecture.'
    skills=@('Kotlin / Java','MVVM','Retrofit','Firebase','Git','Play Store deployment','Unit & UI testing')
    responsibilities=@('Build and ship Android applications','Integrate REST APIs and maps','Optimize performance and scalability','Collaborate in Agile sprints')
  }
)

# Portfolio listing
$cards = ''
foreach ($p in $portfolio) {
  $cards += @"
        <article class="portfolio-card tilt-card" data-category="$($p.cat.ToLower() -replace '[^a-z0-9]','-')">
          <a href="portfolio/$($p.slug).html" class="portfolio-card-image">
            <img src="$($p.img)" alt="$($p.title)" loading="lazy" />
            <span class="portfolio-card-cat">$($p.cat)</span>
          </a>
          <div class="portfolio-card-body">
            <h3><a href="portfolio/$($p.slug).html">$($p.title)</a></h3>
            <p>$($p.desc)</p>
            <span class="portfolio-tag">$($p.service)</span>
          </div>
        </article>
"@
}

$filterCats = ($portfolio | ForEach-Object { $_.cat } | Select-Object -Unique)
$filterBtns = '<button class="filter-btn active" data-portfolio-filter="all">All</button>'
foreach ($c in $filterCats) {
  $f = $c.ToLower() -replace '[^a-z0-9]','-'
  $filterBtns += "<button class=`"filter-btn`" data-portfolio-filter=`"$f`">$c</button>"
}

$portHtml = (Get-ShellStart '' 'Portfolio - Seawind Solution | Our Work' 'portfolio') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">Our Work</span>
        <h1>Portfolio of <span class="gradient-text gradient-text--animated">Projects</span></h1>
        <p>Selected client work across web, mobile, marketing, and enterprise solutions.</p>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Portfolio</span></nav>
      </div>
    </div>
  </section>

  <section class="section portfolio-section">
    <div class="container">
      <div class="services-filter-wrap reveal">
        <div class="services-filter" id="portfolioFilters">$filterBtns</div>
      </div>
      <div class="portfolio-grid reveal" id="portfolioGrid">$cards</div>
    </div>
  </section>
$(Get-CtaBlock '')
$(Get-ShellEnd '')
"@
Write-Utf8 (Join-Path $root 'portfolio.html') $portHtml

# Portfolio detail pages
foreach ($p in $portfolio) {
  $base = '../'
  $skills = ($p.service, 'UI/UX Design', 'Agile Delivery', 'Post-launch Support') -join '</li><li>'
  $html = (Get-ShellStart $base "$($p.title) - Portfolio | Seawind Solution" 'portfolio') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">$($p.cat)</span>
        <h1>$($p.title)</h1>
        <p>$($p.desc)</p>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="${base}index.html">Home</a><span>/</span>
          <a href="${base}portfolio.html">Portfolio</a><span>/</span>
          <span>$($p.title)</span>
        </nav>
      </div>
    </div>
  </section>

  <section class="section service-detail-section">
    <div class="container">
      <div class="two-col-grid">
        <div class="reveal-left">
          <h2>Project <span class="gradient-text">Overview</span></h2>
          <p style="color:var(--muted);line-height:1.8;margin:20px 0;">Seawind Solution partnered with <strong>$($p.client)</strong> to deliver a $($p.service.ToLower()) solution that strengthens their digital presence and supports business growth.</p>
          <ul class="detail-features"><li>$skills</li></ul>
          <a href="${base}contact.html" class="btn-primary" style="margin-top:28px;display:inline-flex;">Start a Similar Project <span class="btn-arrow">&rarr;</span></a>
        </div>
        <div class="reveal-right about-img-wrap tilt-card">
          <img src="${base}$($p.img)" alt="$($p.title) project" />
        </div>
      </div>
    </div>
  </section>
$(Get-CtaBlock $base)
$(Get-ShellEnd $base)
"@
  Write-Utf8 (Join-Path $root "portfolio\$($p.slug).html") $html
}

# Careers page
$jobAccordions = ''
foreach ($j in $jobs) {
  $skillLi = ($j.skills | ForEach-Object { "<li>$_</li>" }) -join ''
  $respLi = ($j.responsibilities | ForEach-Object { "<li>$_</li>" }) -join ''
  $jobAccordions += @"
        <details class="job-card reveal">
          <summary>
            <div class="job-card-head">
              <h3>$($j.title) <span class="job-posts">($($j.posts) openings)</span></h3>
              <span class="job-meta">$($j.exp) · $($j.category)</span>
            </div>
            <span class="job-toggle" aria-hidden="true">+</span>
          </summary>
          <div class="job-card-body">
            <p>$($j.summary)</p>
            <h4>Skills</h4>
            <ul>$skillLi</ul>
            <h4>Responsibilities</h4>
            <ul>$respLi</ul>
          </div>
        </details>
"@
}

$jobOptions = ($jobs | ForEach-Object { "<option value=`"$($_.title)`">$($_.title)</option>" }) -join ''

$careerHtml = (Get-ShellStart '' 'Careers - Seawind Solution | Join Our Team' 'careers') + @"

  <section class="page-hero page-hero--compact">
    <div class="page-hero-bg"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
    <div class="container">
      <div class="page-hero-content">
        <span class="section-tag">Join Us</span>
        <h1>Career <span class="gradient-text gradient-text--animated">Opportunities</span></h1>
        <p>Build your career with Ahmedabad's leading digital agency. Current openings below.</p>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Careers</span></nav>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">Open Positions</span>
        <h2>Current <span class="gradient-text">Vacancies</span></h2>
      </div>
      <div class="jobs-list">$jobAccordions</div>
    </div>
  </section>

  <section class="section careers-apply-section" id="apply">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-info reveal-left">
          <span class="section-tag">Apply Now</span>
          <h2>Want to Make Career <span class="gradient-text">With Us?</span></h2>
          <p style="color:var(--muted);line-height:1.8;">Young, fast-paced environment where ideas are welcome. Opportunity to learn quickly and make a real impact.</p>
          <ul class="detail-features">
            <li>Competitive compensation</li>
            <li>Flexible growth paths</li>
            <li>Work on global client projects</li>
            <li>Ahmedabad · SG Highway office</li>
          </ul>
        </div>
        <div class="contact-form-wrap reveal-right">
          <form class="contact-form" id="careerForm" data-form-type="career">
            <h3>Apply for a Position</h3>
            <p style="color:var(--muted);margin-bottom:24px;font-size:0.95rem;">Fill in your details and we will get back to you.</p>
            <div class="form-group-row">
              <div class="form-group">
                <label for="careerFirstName">First Name *</label>
                <input type="text" id="careerFirstName" name="firstName" required />
              </div>
              <div class="form-group">
                <label for="careerLastName">Last Name *</label>
                <input type="text" id="careerLastName" name="lastName" required />
              </div>
            </div>
            <div class="form-group">
              <label for="careerEmail">Email *</label>
              <input type="email" id="careerEmail" name="email" required />
            </div>
            <div class="form-group">
              <label for="careerPhone">Phone *</label>
              <input type="tel" id="careerPhone" name="phone" required />
            </div>
            <div class="form-group">
              <label for="jobProfile">Job Profile *</label>
              <select id="jobProfile" name="jobProfile" required>
                <option value="">Select position...</option>
                $jobOptions
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="experience">Experience</label>
              <input type="text" id="experience" name="experience" placeholder="e.g. 2 years PHP development" />
            </div>
            <div class="form-group">
              <label for="resumeNote">Resume / Portfolio link</label>
              <input type="url" id="resumeNote" name="resumeNote" placeholder="LinkedIn or drive link" />
            </div>
            <div class="form-group">
              <label for="coverLetter">Cover letter *</label>
              <textarea id="coverLetter" name="coverLetter" rows="5" required placeholder="Tell us why you are a great fit..."></textarea>
            </div>
            <button type="submit" class="btn-primary btn-full contact-submit-btn" id="careerSubmitBtn">
              <span class="btn-text default-text">Submit Application <span class="btn-arrow">&rarr;</span></span>
              <span class="btn-text success-text" style="display:none;">Application Sent!</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
$(Get-CtaBlock '')
$(Get-ShellEnd '')
"@
Write-Utf8 (Join-Path $root 'careers.html') $careerHtml

Write-Host "Portfolio and careers pages generated."
