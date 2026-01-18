// ============================================
// SIDE HUSTLE: 27-DAY LAUNCH - Main Application
// ============================================

const App = {
  async init() {
    this.setupRoutes();
    Router.init('app');
    this.setupEventListeners();
    this.initHeader();
    this.initBackToTop();
    this.updateSignOutButton();
  },

  setupRoutes() {
    Router.register('/', () => this.renderHome());
    Router.register('/course/:slug', (p) => this.renderCourseLanding(p.slug));
    Router.register('/program', () => this.renderProgram());
    Router.register('/day/:day', (p) => this.renderDay(parseInt(p.day)));
    Router.register('/workbook', () => this.renderWorkbook());
    Router.register('/pricing', () => this.renderPricing());
    Router.register('/about', () => this.renderAbout());
    Router.register('/contact', () => this.renderContact());
    Router.register('/dashboard', () => this.renderDashboard());
    Router.register('/admin', () => this.renderAdmin());
  },

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#theme-toggle')) {
        Storage.toggleTheme();
        this.updateThemeIcon();
      }
      if (e.target.closest('.mobile-menu-toggle')) {
        document.querySelector('.header-nav')?.classList.toggle('open');
      }
      if (e.target.closest('.header-nav-link')) {
        document.querySelector('.header-nav')?.classList.remove('open');
      }
    });
  },

  initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    const updateHeader = () => {
      header.classList.toggle('solid', window.scrollY > 100);
      header.classList.toggle('transparent', window.scrollY <= 100);
    };
    window.addEventListener('scroll', updateHeader);
    updateHeader();
  },

  initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },

  updateThemeIcon() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = Storage.getTheme() === 'dark' ? Components.icons.sun : Components.icons.moon;
  },

  updateSignOutButton() {
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
      signOutBtn.style.display = Storage.isSubscribed() ? 'inline-flex' : 'none';
    }
  },

  signOut() {
    if (confirm('Are you sure you want to sign out?')) {
      Storage.clearSubscription();
      this.updateSignOutButton();
      Router.navigate('/');
    }
  },

  initComponents() {
    // Re-attach any needed event listeners after route change
    this.initFormAutosave();
  },

  initFormAutosave() {
    const form = document.getElementById('workbook-form');
    if (!form) return;

    const day = parseInt(form.dataset.day);
    let saveTimeout;

    // Initial progress update
    this.updateFormProgress(day);

    form.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => this.saveDraft(day), 500);
      this.updateSaveStatus('saving');
      this.updateFormProgress(day);
    });
  },

  updateFormProgress(day) {
    const form = document.getElementById('workbook-form');
    if (!form) return;

    const allFields = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea, select');
    const radioGroups = new Set();
    form.querySelectorAll('input[type="radio"]').forEach(r => radioGroups.add(r.name));
    const checkboxGroups = new Set();
    form.querySelectorAll('.form-checkbox-group').forEach(g => {
      const name = g.querySelector('input')?.name;
      if (name) checkboxGroups.add(name);
    });

    let filled = 0;
    let total = allFields.length + radioGroups.size + checkboxGroups.size;

    // Count filled text/textarea/select fields
    allFields.forEach(field => {
      if (field.value && field.value.trim() !== '') filled++;
    });

    // Count filled radio groups
    radioGroups.forEach(name => {
      if (form.querySelector(`input[name="${name}"]:checked`)) filled++;
    });

    // Count filled checkbox groups
    checkboxGroups.forEach(name => {
      if (form.querySelector(`.form-checkbox-group input[name="${name}"]:checked`)) filled++;
    });

    const percent = total > 0 ? Math.round((filled / total) * 100) : 0;

    // Update progress bar
    const fillEl = document.getElementById(`progress-fill-${day}`);
    const percentEl = document.getElementById(`progress-percent-${day}`);
    const hintEl = document.getElementById(`progress-hint-${day}`);
    const completeEl = document.getElementById(`progress-complete-${day}`);

    if (fillEl) fillEl.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;

    // Show/hide congratulations section based on completion
    if (percent === 100) {
      if (hintEl) hintEl.style.display = 'none';
      if (completeEl) completeEl.style.display = 'block';
    } else {
      if (hintEl) hintEl.style.display = 'block';
      if (completeEl) completeEl.style.display = 'none';
    }
  },

  saveDraft(day) {
    const form = document.getElementById('workbook-form');
    if (!form) return;

    const data = {};
    const formData = new FormData(form);

    // Handle checkbox groups
    form.querySelectorAll('.form-checkbox-group').forEach(group => {
      const name = group.querySelector('input')?.name;
      if (name) {
        const checked = Array.from(group.querySelectorAll('input:checked')).map(i => i.value);
        data[name] = checked;
      }
    });

    formData.forEach((value, key) => {
      if (!data[key]) data[key] = value;
    });

    Storage.setDraft(day, data);
    this.updateSaveStatus('saved');
  },

  updateSaveStatus(status) {
    const el = document.getElementById('save-status');
    if (!el) return;
    el.className = `workbook-status ${status}`;
    el.innerHTML = status === 'saving' ? '⏳ Saving...' : status === 'saved' ? '✓ Draft saved' : status === 'submitted' ? '✓ Submitted' : '';
  },

  async submitDay(day) {
    const form = document.getElementById('workbook-form');
    if (!form) return;

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(f => {
      if (!f.value || (f.type === 'checkbox' && !f.checked)) {
        f.classList.add('error');
        valid = false;
      } else {
        f.classList.remove('error');
      }
    });

    if (!valid) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    // Gather data
    this.saveDraft(day);
    const draft = Storage.getDraft(day);
    Storage.setSubmission(day, draft);
    Storage.setLastActiveDay(day + 1);

    // Webhook sync if configured
    const webhook = Storage.getWebhookSettings();
    if (webhook.enabled && webhook.url) {
      this.syncToWebhook(day, draft, webhook);
    }

    // Navigate to next day or show completion
    if (day < 27) {
      Router.navigate(`/day/${day + 1}`);
    } else {
      Router.navigate('/workbook');
    }
  },

  async syncToWebhook(day, data, webhook) {
    try {
      const dayInfo = await Data.getDay(day);
      const user = Storage.getUser();

      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhook.apiKey}`
        },
        body: JSON.stringify({
          user_id: user?.email || 'anonymous',
          course_id: 'side-hustle-27',
          day_index: day,
          day_title: dayInfo?.title || `Day ${day}`,
          submitted_at: new Date().toISOString(),
          answers: data,
          metadata: {
            user_agent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language
          }
        })
      });
    } catch (error) {
      console.error('Webhook sync failed:', error);
    }
  },

  toggleMission(day, index, el) {
    const state = Storage.toggleMissionItem(day, index);
    el.classList.toggle('checked', state.includes(index));
    el.innerHTML = state.includes(index) ? Components.icons.check : '';
    el.setAttribute('aria-checked', state.includes(index));
  },

  exportJSON() {
    const data = Storage.exportAllJSON();
    this.downloadFile(data, 'workbook-export.json', 'application/json');
  },

  exportCSV() {
    const data = Storage.exportAllCSV();
    this.downloadFile(data, 'workbook-export.csv', 'text/csv');
  },

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  printWorkbook() {
    window.print();
  },

  showEnrollmentVerification() {
    const email = prompt('Please enter the email you used to purchase the course:');
    if (email && email.includes('@')) {
      // Store the subscription (in production, this would verify with Gumroad's API)
      Storage.setSubscription({
        email: email,
        plan: 'full',
        verifiedAt: new Date().toISOString()
      });
      alert('Access granted! Welcome to the 27-Day Side Hustle Launch program.');
      Router.handleRoute();
    } else if (email) {
      alert('Please enter a valid email address.');
    }
  },

  setStartDate() {
    const input = document.getElementById('start-date-input');
    if (input && input.value) {
      Storage.setStartDate(input.value);
      Router.handleRoute();
    }
  },

  // ============================================
  // PAGE RENDERERS
  // ============================================

  async renderHome() {
    const [platform, courses] = await Promise.all([
      Data.getPlatformInfo(),
      Data.getAllCourses()
    ]);

    return `
      <section class="hero hero-platform">
        <div class="hero-bg-image hero-bg-left">
          <img src="assets/images/uncle-sam.jpg" alt="" loading="eager">
        </div>
        <div class="hero-bg-image hero-bg-right">
          <img src="assets/images/uncle-sam.jpg" alt="" loading="eager">
        </div>
        <div class="hero-bg-gradient"></div>
        <div class="hero-content container">
          <h1 class="hero-tagline">I Want YOU to Launch That Side Hustle!</h1>
          <p class="hero-subline">Need Money? Tired of Procrastinating? Don't Know How to Start?<br>You will learn by doing. Just click here.</p>
          <div class="hero-ctas">
            <a href="https://sinadehesh.gumroad.com/l/kghybn" class="btn btn-primary btn-lg">I'll Do It!</a>
            <a href="#/course/27-day-launch" class="btn btn-outline-light btn-lg">Explain the Course</a>
          </div>
        </div>
        <div class="hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div class="scroll-arrow"></div>
        </div>
      </section>
      
      <section class="section home-courses" id="courses">
        <div class="container">
          <div class="section-header text-center">
            <span class="section-eyebrow">The Moment of Truth</span>
            <h2 class="section-title">Pick Your Battle</h2>
            <p class="section-subtitle">Every successful entrepreneur started exactly where you are. The difference? They stopped researching and started doing. Which one will you be?</p>
          </div>
          ${Components.coursesGrid(courses)}
        </div>
      </section>
      
      <section class="section section-muted home-why">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">Why Most People Fail (And You Won't)</h2>
          </div>
          <div class="home-what-grid">
            <div class="home-what-item">
              <div class="home-what-icon">🧠</div>
              <h3 class="home-what-title">Overwhelm Kills Dreams</h3>
              <p class="home-what-text">Other courses dump 100 hours on you. We give you ONE task per day. Impossible to fail if you just show up.</p>
            </div>
            <div class="home-what-item">
              <div class="home-what-icon">✍️</div>
              <h3 class="home-what-title">Decisions, Not Daydreams</h3>
              <p class="home-what-text">Our workbook forces you to commit. Write it down, make it real. No more "thinking about it."</p>
            </div>
            <div class="home-what-item">
              <div class="home-what-icon">🏆</div>
              <h3 class="home-what-title">Built for Action Takers</h3>
              <p class="home-what-text">This isn't for everyone. Only for people ready to stop making excuses and start making money.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="section home-cta-section">
        <div class="container text-center">
          <h2 class="section-title">The Clock Is Ticking</h2>
          <p class="section-subtitle mb-8">A year from now, you'll wish you started today. What's it going to be?</p>
          <a href="#courses" class="btn btn-primary btn-lg">I Choose Action</a>
        </div>
      </section>
    `;
  },

  async renderCourseLanding(slug) {
    const courseInfo = await Data.getCourseBySlug(slug);

    if (!courseInfo) {
      return `<div class="section text-center"><div class="container"><h1>Course not found</h1><a href="#/" class="btn btn-primary mt-6">Back to Home</a></div></div>`;
    }

    // Load the full course data
    const course = await Data.getCourse();
    const progress = Storage.getProgress();

    return `
      <section class="hero">
        <div class="hero-bg"><img src="${courseInfo.image}" alt=""></div>
        <div class="hero-overlay"></div>
        <div class="hero-content container">
          <div class="hero-badge">${courseInfo.icon} ${courseInfo.duration}</div>
          <h1 class="hero-tagline">${courseInfo.title}</h1>
          <p class="hero-subline">${courseInfo.description}</p>
          <div class="hero-ctas">
            <a href="#/program" class="btn btn-primary btn-lg">Start the ${courseInfo.duration} Plan</a>
            <a href="#/pricing" class="btn btn-outline-light btn-lg">See Pricing</a>
          </div>
        </div>
      </section>
      
      <section class="section home-what">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">What You'll Get</h2>
          </div>
          <div class="home-what-grid">
            <div class="home-what-item">
              <div class="home-what-icon">📋</div>
              <h3 class="home-what-title">${courseInfo.duration} of Action</h3>
              <p class="home-what-text">One focused step per day. Each day builds on the last. No skipping, no shortcuts, just steady progress.</p>
            </div>
            <div class="home-what-item">
              <div class="home-what-icon">📝</div>
              <h3 class="home-what-title">Built-In Workbook</h3>
              <p class="home-what-text">Every day has a submission form. Capture decisions, numbers, and customer evidence. Export anytime.</p>
            </div>
            <div class="home-what-item">
              <div class="home-what-icon">🎯</div>
              <h3 class="home-what-title">Real Outcomes</h3>
              <p class="home-what-text">${courseInfo.outcomes ? courseInfo.outcomes.join('. ') + '.' : 'Tangible results you can measure and build on.'}</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="section section-muted home-how">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">How It Works</h2>
          </div>
          <div class="home-how-timeline">
            <div class="home-how-step"><div class="home-how-number">1</div><p class="home-how-label">Pick Ideas</p><p class="home-how-desc">Week 1: Generate and evaluate</p></div>
            <div class="home-how-step"><div class="home-how-number">2</div><p class="home-how-label">Validate</p><p class="home-how-desc">Week 2: Research and define</p></div>
            <div class="home-how-step"><div class="home-how-number">3</div><p class="home-how-label">Prepare</p><p class="home-how-desc">Week 3: Build and price</p></div>
            <div class="home-how-step"><div class="home-how-number">4</div><p class="home-how-label">Launch</p><p class="home-how-desc">Week 4: Sell and iterate</p></div>
          </div>
        </div>
      </section>
      
      <section class="section home-workbook">
        <div class="container">
          <div class="grid grid-2" style="align-items:center;gap:var(--space-12)">
            <div>
              <h2 class="section-title">The Workbook</h2>
              <p class="section-subtitle mb-6">Every day, you complete a structured form. Your decisions, calculations, and progress are captured automatically.</p>
              <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--space-3)">
                ${courseInfo.features.map(f => `<li>✓ ${f}</li>`).join('')}
              </ul>
            </div>
            <div class="home-workbook-preview">
              <div class="home-workbook-preview-header">
                <div class="home-workbook-preview-dot" style="background:var(--color-error)"></div>
                <div class="home-workbook-preview-dot" style="background:var(--color-warning)"></div>
                <div class="home-workbook-preview-dot" style="background:var(--color-success)"></div>
              </div>
              <div class="home-workbook-preview-fields">
                <div class="home-workbook-preview-field"><span style="font-weight:500">Trend 1:</span><div class="skeleton" style="flex:1"></div></div>
                <div class="home-workbook-preview-field"><span style="font-weight:500">Prediction:</span><div class="skeleton" style="flex:1"></div></div>
                <div class="home-workbook-preview-field"><span style="font-weight:500">Opportunity:</span><div class="skeleton" style="flex:1"></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section class="section section-muted home-outcomes">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">By the End, You'll Have</h2>
          </div>
          <div class="home-outcomes-grid">
            <div class="home-outcome-item"><div><span class="home-outcome-day">Day 9</span><p class="home-outcome-text">A defined offer: who pays, what they get, why now</p></div></div>
            <div class="home-outcome-item"><div><span class="home-outcome-day">Day 12</span><p class="home-outcome-text">A pricing strategy with clear reasoning</p></div></div>
            <div class="home-outcome-item"><div><span class="home-outcome-day">Day 17</span><p class="home-outcome-text">A published offer with a live payment link</p></div></div>
            <div class="home-outcome-item"><div><span class="home-outcome-day">Day 27</span><p class="home-outcome-text">A retrospective and 90-day growth plan</p></div></div>
          </div>
        </div>
      </section>
      
      <section class="section home-testimonials">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">What People Say</h2>
          </div>
          <div class="grid grid-3">
            ${course.testimonials.map(t => Components.testimonialCard(t)).join('')}
          </div>
        </div>
      </section>
      
      <section class="section section-muted home-pricing-preview">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">Simple Pricing</h2>
            <p class="section-subtitle">One-time payment. Lifetime access. 14-day guarantee.</p>
          </div>
          <div class="pricing-grid">
            ${course.pricing.tiers.map(t => Components.pricingCard(t)).join('')}
          </div>
        </div>
      </section>
      
      <section class="section home-faq">
        <div class="container">
          <div class="section-header text-center">
            <h2 class="section-title">Questions</h2>
          </div>
          <div style="max-width:700px;margin:0 auto">
            ${Components.faqAccordion(course.faqs)}
          </div>
        </div>
      </section>
    `;
  },

  async renderProgram() {
    // Check subscription
    if (!Storage.isSubscribed()) {
      return Components.subscriptionGate();
    }

    const [course, days] = await Promise.all([Data.getCourse(), Data.getDays()]);
    const progress = Storage.getProgress();
    const todayDay = Data.getTodayDay();
    const startDate = Storage.getStartDate();

    let weeksHtml = '';
    for (const week of course.weeks) {
      const weekDays = days.filter(d => week.days.includes(d.day));
      const isCurrentWeek = weekDays.some(d => d.day === todayDay);
      weeksHtml += Components.weekSection(week, weekDays, todayDay, isCurrentWeek);
    }

    return `
      <div class="program-page">
        <div class="program-header">
          <div class="container">
            <div class="program-header-inner">
              <div class="program-header-content">
                <h1 class="program-header-title">27-Day Program</h1>
                <p class="program-header-subtitle">Your daily action plan from idea to launch</p>
                <div class="program-stats">
                  <div class="program-stat"><div class="program-stat-value">${progress.completed}</div><div class="program-stat-label">Completed</div></div>
                  <div class="program-stat"><div class="program-stat-value">${progress.total - progress.completed}</div><div class="program-stat-label">Remaining</div></div>
                  <div class="program-stat"><div class="program-stat-value">${progress.percent}%</div><div class="program-stat-label">Progress</div></div>
                </div>
              </div>
              <div class="program-header-actions">
                <div class="form-group">
                  <label class="form-label">Your Start Date</label>
                  <input type="date" class="form-input" id="start-date-input" value="${startDate || ''}" onchange="App.setStartDate()">
                </div>
                ${progress.completed > 0 || progress.inProgress > 0 ? `<a href="#/day/${Storage.getLastActiveDay()}" class="btn btn-primary">Resume Day ${Storage.getLastActiveDay()}</a>` : `<a href="#/day/1" class="btn btn-primary">Start Day 1</a>`}
              </div>
            </div>
          </div>
        </div>
        
        <section class="section">
          <div class="container">
            ${weeksHtml}
          </div>
        </section>
      </div>
    `;
  },

  async renderDay(dayNumber) {
    // Check subscription
    if (!Storage.isSubscribed()) {
      return Components.subscriptionGate();
    }

    if (dayNumber < 1 || dayNumber > 27) {
      return `<div class="section text-center"><div class="container"><h1>Day not found</h1><a href="#/program" class="btn btn-primary mt-6">Back to Program</a></div></div>`;
    }

    const [day, form, adjacent, week] = await Promise.all([
      Data.getDay(dayNumber),
      Data.getForm(dayNumber),
      Data.getAdjacentDays(dayNumber),
      Data.getWeekForDay(dayNumber)
    ]);

    if (!day) {
      return `<div class="section text-center"><div class="container"><h1>Day not found</h1><a href="#/program" class="btn btn-primary mt-6">Back to Program</a></div></div>`;
    }

    Storage.setLastActiveDay(dayNumber);
    const status = Storage.getDayStatus(dayNumber);
    const savedData = status === 'submitted' ? Storage.getSubmission(dayNumber) : Storage.getDraft(dayNumber);
    const progress = Storage.getProgress();

    return `
      <div class="day-page">
        <div class="day-header">
          <div class="container container-narrow">
            <nav class="day-breadcrumb">
              <a href="#/program">Program</a>
              <span>/</span>
              <span>Week ${week?.number || Math.ceil(dayNumber / 7)}</span>
              <span>/</span>
              <span>Day ${dayNumber}</span>
            </nav>
            <div class="day-header-top">
              <div class="day-header-content">
                <div class="day-week-label">Week ${week?.number || Math.ceil(dayNumber / 7)}: ${week?.title || ''}</div>
                <h1 class="day-title"><span class="day-number">Day ${dayNumber}</span> – ${day.title.replace(/^Day \d+\s*[-–]\s*/i, '')}</h1>
              </div>
              <div class="day-header-status">
                ${Components.statusBadge(status)}
                <div class="day-progress-container">
                  <span class="day-progress-text">${progress.percent}%</span>
                  <div class="day-progress-bar"><div class="day-progress-bar-fill" style="width:${progress.percent}%"></div></div>
                </div>
              </div>
            </div>
            <div class="day-nav">
              ${Components.progressDots(dayNumber)}
            </div>
          </div>
        </div>
        
        <div class="day-content">
          <div class="container container-narrow">
            <div class="day-content-grid">
              
              <div class="day-section">
                <h2 class="day-section-title">
                  <span class="day-section-icon">📖</span>
                  Today's Promise
                </h2>
                <div class="lesson-content">
                  <p class="mb-4"><strong>${day.mainPromise}</strong></p>
                  ${day.teachings ? day.teachings.map(t => `
                    <div class="teaching-block mb-4">
                      <h3 class="font-semibold mb-2">${t.title}</h3>
                      ${t.content.split('\n\n').map(p => `<p class="mb-2">${p}</p>`).join('')}
                      ${t.soWhat ? `<p class="text-muted italic mt-2"><strong>So what?</strong> ${t.soWhat}</p>` : ''}
                    </div>
                  `).join('') : ''}
                </div>
              </div>
              
              <div class="day-section day-work-section">
                <h2 class="day-section-title">
                  <span class="day-section-icon">✓</span>
                  Today's Work
                </h2>
                <p class="text-muted mb-4">Estimated time: ${day.timeEstimate}</p>
                
                <!-- Sticky Progress Bar -->
                <div class="day-progress-sticky">
                  ${Components.dayProgressBar(dayNumber, form)}
                </div>
                
                <!-- Task Guidance Cards -->
                <div class="day-tasks-guidance">
                  ${Components.missionList(day.doBlocks, dayNumber)}
                </div>
                
                <!-- Workbook Form -->
                <div class="day-workbook-form">
                  <h3 class="workbook-form-title">📝 Your Responses</h3>
                  <div id="save-status" class="workbook-status ${status === 'submitted' ? 'submitted' : 'saved'}">${status === 'submitted' ? '✓ Submitted' : ''}</div>
                  ${Components.renderForm(form, savedData || {}, dayNumber)}
                </div>
                
                <div class="day-actions">
                  <div class="day-actions-left">
                    <button class="btn btn-ghost" onclick="App.saveDraft(${dayNumber})">Save Draft</button>
                  </div>
                  <div class="day-actions-right">
                    ${status !== 'submitted' ? `<button class="btn btn-primary" onclick="App.submitDay(${dayNumber})">Submit Day ${dayNumber}</button>` : `<button class="btn btn-success" disabled>Submitted ✓</button>`}
                  </div>
                </div>
              </div>
              
              ${day.wrap?.outputs ? `
                ${Components.callout('success', 'Today\'s Outputs', day.wrap.outputs.map(o => `• ${o}`).join('<br>'))}
              ` : ''}
              
              ${day.wrap?.tomorrowPreview ? `
                ${Components.callout('info', 'Tomorrow Preview', day.wrap.tomorrowPreview)}
              ` : ''}
              
            </div>
          </div>
        </div>
        
        <div class="day-footer">
          <div class="container">
            <div class="day-footer-inner">
              ${adjacent.prev ? `<a href="#/day/${adjacent.prev}" class="day-footer-nav">${Components.icons.chevronLeft} Day ${adjacent.prev}</a>` : '<div></div>'}
              ${adjacent.next ? `<a href="#/day/${adjacent.next}" class="day-footer-nav">Day ${adjacent.next} ${Components.icons.chevronRight}</a>` : `<a href="#/workbook" class="day-footer-nav">View Workbook ${Components.icons.chevronRight}</a>`}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async renderWorkbook() {
    // Check subscription
    if (!Storage.isSubscribed()) {
      return Components.subscriptionGate();
    }

    const submissions = Storage.getAllSubmissions();
    const days = await Data.getDays();
    const progress = Storage.getProgress();

    const rows = days.map(day => {
      const sub = submissions[day.day];
      const status = Storage.getDayStatus(day.day);
      const preview = sub ? Object.values(sub).find(v => typeof v === 'string' && v.length > 10)?.slice(0, 50) + '...' : '—';

      return `
        <tr>
          <td><a href="#/day/${day.day}" class="workbook-day-link">Day ${day.day}</a></td>
          <td>${day.title}</td>
          <td>${Components.statusBadge(status)}</td>
          <td class="workbook-preview">${status === 'submitted' ? preview : '—'}</td>
          <td>${sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="workbook-page">
        <div class="workbook-header">
          <div class="container">
            <h1 class="workbook-title">Your Workbook</h1>
            <p class="text-muted mb-6">${progress.completed} of 27 days submitted</p>
            <div class="workbook-actions">
              <button class="btn btn-secondary" onclick="App.exportJSON()">${Components.icons.download} Export JSON</button>
              <button class="btn btn-secondary" onclick="App.exportCSV()">${Components.icons.download} Export CSV</button>
              <button class="btn btn-secondary" onclick="App.printWorkbook()">Print Workbook</button>
            </div>
          </div>
        </div>
        
        <section class="section">
          <div class="container">
            <table class="workbook-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Preview</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  },

  async renderPricing() {
    const course = await Data.getCourse();

    return `
      <div class="pricing-page">
        <div class="pricing-header">
          <div class="container">
            <h1 class="pricing-title">Start Your Side Hustle Journey</h1>
            <p class="pricing-subtitle">One-time payment. Lifetime access. Start today.</p>
          </div>
        </div>
        
        <section class="section">
          <div class="container">
            <div class="pricing-grid">
              ${course.pricing.tiers.map(t => Components.pricingCard(t)).join('')}
            </div>
            
            <div class="pricing-guarantee">
              <h3 class="pricing-guarantee-title">${course.pricing.guarantee.title}</h3>
              <p class="pricing-guarantee-text">${course.pricing.guarantee.text}</p>
            </div>
          </div>
        </section>
        
        <section class="section section-muted">
          <div class="container">
            <div class="section-header text-center">
              <h2 class="section-title">Frequently Asked Questions</h2>
            </div>
            <div style="max-width:700px;margin:0 auto">
              ${Components.faqAccordion(course.faqs)}
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async renderAbout() {
    const course = await Data.getCourse();

    return `
      <div class="about-page">
        <div class="about-hero">
          <div class="container">
            <h1 class="section-title">${course.about.title}</h1>
          </div>
        </div>
        <section class="section">
          <div class="container">
            <div class="about-content">
              ${course.about.content.map(p => `<p>${p}</p>`).join('')}
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async renderContact() {
    return `
      <div class="about-page">
        <div class="about-hero">
          <div class="container">
            <h1 class="section-title">Contact</h1>
            <p class="section-subtitle">Questions? Get in touch.</p>
          </div>
        </div>
        <section class="section">
          <div class="container">
            <div class="contact-grid" style="max-width:900px">
              <form class="contact-form" onsubmit="event.preventDefault();alert('Message sent!')">
                <div class="form-group mb-4">
                  <label class="form-label">Name</label>
                  <input type="text" class="form-input" required>
                </div>
                <div class="form-group mb-4">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" required>
                </div>
                <div class="form-group mb-4">
                  <label class="form-label">Message</label>
                  <textarea class="form-input form-textarea" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
              </form>
              <div class="contact-info">
                <div class="contact-item"><div class="contact-icon">📧</div><div><h3 class="font-semibold">Email</h3><p class="text-muted">hello@sidehustle27.com</p></div></div>
                <div class="contact-item"><div class="contact-icon">⏰</div><div><h3 class="font-semibold">Response Time</h3><p class="text-muted">Within 24 hours</p></div></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async renderDashboard() {
    // Check subscription
    if (!Storage.isSubscribed()) {
      return Components.subscriptionGate();
    }

    const progress = Storage.getProgress();
    const user = Storage.getUser();
    const lastDay = Storage.getLastActiveDay();
    const day = await Data.getDay(lastDay);

    if (!user) {
      return `
        <div class="dashboard-page">
          <div class="dashboard-header">
            <div class="container">
              <h1 class="dashboard-welcome">Welcome to Your Dashboard</h1>
              <p class="dashboard-subtitle">Sign in to track your progress</p>
            </div>
          </div>
          <section class="section">
            <div class="container" style="max-width:400px">
              <div class="dashboard-card">
                <h2 class="dashboard-card-title">Get Started</h2>
                <form onsubmit="event.preventDefault();Storage.setUser({email:this.email.value,name:this.name.value});Router.handleRoute();">
                  <div class="form-group mb-4">
                    <label class="form-label">Name</label>
                    <input type="text" name="name" class="form-input" required>
                  </div>
                  <div class="form-group mb-4">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-input" required>
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Start Tracking</button>
                </form>
              </div>
            </div>
          </section>
        </div>
      `;
    }

    return `
      <div class="dashboard-page">
        <div class="dashboard-header">
          <div class="container">
            <h1 class="dashboard-welcome">Welcome back, ${user.name}</h1>
            <p class="dashboard-subtitle">Keep the momentum going.</p>
          </div>
        </div>
        <section class="section">
          <div class="container">
            <div class="dashboard-grid">
              <div class="dashboard-main">
                <div class="dashboard-card mb-6">
                  <h2 class="dashboard-card-title">Resume Your Progress</h2>
                  <div class="dashboard-resume">
                    <div class="dashboard-resume-day">${lastDay}</div>
                    <div class="dashboard-resume-info">
                      <div class="dashboard-resume-title">${day?.title || `Day ${lastDay}`}</div>
                      <div class="dashboard-resume-week">Week ${Math.ceil(lastDay / 7)}</div>
                    </div>
                    <a href="#/day/${lastDay}" class="btn btn-primary">Continue</a>
                  </div>
                </div>
                
                <div class="dashboard-card">
                  <h2 class="dashboard-card-title">Quick Links</h2>
                  <div class="flex gap-3" style="flex-wrap:wrap">
                    <a href="#/program" class="btn btn-secondary">View Program</a>
                    <a href="#/workbook" class="btn btn-secondary">View Workbook</a>
                    <button class="btn btn-ghost" onclick="App.exportJSON()">Export JSON</button>
                    <button class="btn btn-ghost" onclick="App.exportCSV()">Export CSV</button>
                  </div>
                </div>
              </div>
              
              <div class="dashboard-side">
                <div class="dashboard-stats">
                  <div class="dashboard-stat"><div class="dashboard-stat-value">${progress.completed}</div><div class="dashboard-stat-label">Completed</div></div>
                  <div class="dashboard-stat"><div class="dashboard-stat-value">${progress.inProgress}</div><div class="dashboard-stat-label">In Progress</div></div>
                  <div class="dashboard-stat"><div class="dashboard-stat-value">${progress.percent}%</div><div class="dashboard-stat-label">Overall</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async renderAdmin() {
    const [course, days, forms] = await Promise.all([
      Data.getCourse(),
      Data.getDays(),
      Data.getForms()
    ]);

    return `
      <div class="admin-page">
        <div class="admin-header">
          <h1>Admin Console</h1>
        </div>
        <div class="admin-container">
          <div class="admin-grid">
            <div class="admin-panel">
              <div class="admin-panel-header">
                Course Data
                <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(course)}, null, 2));alert('Copied!')">Copy JSON</button>
              </div>
              <div class="admin-panel-body">
                <pre class="admin-json">${JSON.stringify(course, null, 2).slice(0, 2000)}...</pre>
              </div>
            </div>
            <div class="admin-panel">
              <div class="admin-panel-header">
                Days Data (${days.length} days)
                <button class="btn btn-sm btn-secondary" onclick="App.downloadFile(JSON.stringify(${JSON.stringify(days)}, null, 2), 'days.json', 'application/json')">Download</button>
              </div>
              <div class="admin-panel-body">
                <pre class="admin-json">${JSON.stringify(days.slice(0, 3), null, 2)}...</pre>
              </div>
            </div>
          </div>
          
          <div class="admin-grid mt-6">
            <div class="admin-panel">
              <div class="admin-panel-header">
                Forms Data
                <button class="btn btn-sm btn-secondary" onclick="App.downloadFile(JSON.stringify(${JSON.stringify(forms)}, null, 2), 'forms.json', 'application/json')">Download</button>
              </div>
              <div class="admin-panel-body">
                <pre class="admin-json">${JSON.stringify(forms['1'], null, 2)}</pre>
              </div>
            </div>
            <div class="admin-panel">
              <div class="admin-panel-header">
                Webhook Settings
              </div>
              <div class="admin-panel-body">
                <form class="admin-form" onsubmit="event.preventDefault();Storage.setWebhookSettings({url:this.url.value,apiKey:this.apiKey.value,enabled:this.enabled.checked});alert('Saved!')">
                  <div class="form-group">
                    <label class="form-label">Webhook URL</label>
                    <input type="url" name="url" class="form-input" value="${Storage.getWebhookSettings().url}" placeholder="https://...">
                  </div>
                  <div class="form-group">
                    <label class="form-label">API Key</label>
                    <input type="text" name="apiKey" class="form-input" value="${Storage.getWebhookSettings().apiKey}">
                  </div>
                  <label class="form-checkbox">
                    <input type="checkbox" name="enabled" ${Storage.getWebhookSettings().enabled ? 'checked' : ''}>
                    <span>Enable webhook sync</span>
                  </label>
                  <button type="submit" class="btn btn-primary mt-4">Save Settings</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
