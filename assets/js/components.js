// ============================================
// SIDE HUSTLE: 27-DAY LAUNCH - Components
// ============================================

const Components = {

  icons: {
    chevronDown: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7.5L10 12.5L15 7.5"/></svg>`,
    chevronRight: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.5 5L12.5 10L7.5 15"/></svg>`,
    chevronLeft: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.5 15L7.5 10L12.5 5"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l3 3 7-7"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>`,
    sun: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/></svg>`,
    moon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`,
    download: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8M8 10l-3-3M8 10l3-3M2 14h12"/></svg>`,
    menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`,
  },

  // Status badge
  statusBadge(status) {
    const labels = { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'submitted': 'Submitted' };
    return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
  },

  // Day card (for program timeline)
  dayCard(day, isToday = false) {
    const status = Storage.getDayStatus(day.day);
    return `
      <a href="#/day/${day.day}" class="day-card ${status} ${isToday ? 'today' : ''}">
        <div class="day-card-number">${day.day}</div>
        <div class="day-card-info">
          <div class="day-card-title">${day.title}</div>
          <div class="day-card-goal">${day.mainPromise}</div>
        </div>
        <div class="day-card-meta">
          <span class="day-card-time">${this.icons.clock} ${day.timeEstimate}</span>
          ${this.statusBadge(status)}
        </div>
      </a>
    `;
  },

  // Week section (accordion)
  weekSection(week, days, todayDay, isOpen = false) {
    const completedDays = days.filter(d => Storage.getDayStatus(d.day) === 'submitted').length;
    return `
      <div class="week-section" data-state="${isOpen ? 'open' : 'closed'}">
        <div class="week-header" onclick="this.parentElement.dataset.state = this.parentElement.dataset.state === 'open' ? 'closed' : 'open'">
          <div class="week-header-left">
            <span class="week-number">Week ${week.number}</span>
            <span class="week-title">${week.title}</span>
            <span class="week-progress">${completedDays}/${days.length} complete</span>
          </div>
          <span class="icon">${this.icons.chevronDown}</span>
        </div>
        <div class="week-content">
          <div class="week-content-inner">
            <div class="week-days">
              ${days.map(d => this.dayCard(d, d.day === todayDay)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Task guidance cards (replaces checkboxes - just shows what to do)
  taskGuidance(doBlocks, day) {
    if (!doBlocks || !Array.isArray(doBlocks)) return '<p class="text-muted">No tasks for today.</p>';

    return doBlocks.map((block, blockIndex) => `
      <div class="task-card">
        <div class="task-card-header">
          <div class="task-card-icon">📋</div>
          <div class="task-card-meta">
            <h3 class="task-card-title">${block.title}</h3>
            <span class="task-card-time">⏱ ${block.estimatedMinutes} min</span>
          </div>
        </div>
        
        ${block.steps ? `
          <div class="task-card-steps">
            <ol class="steps-list">
              ${block.steps.map((step, i) => `<li><span class="step-number">${i + 1}</span>${step}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        
        ${block.example ? `
          <div class="task-card-example">
            <span class="example-label">💡 Example:</span>
            <p>${block.example}</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  // Dynamic progress bar for day completion (tracks form fields)
  dayProgressBar(dayNumber, formSchema) {
    const fieldCount = formSchema?.fields?.length || 0;
    return `
      <div class="day-progress-wrapper" data-day="${dayNumber}" data-total-fields="${fieldCount}">
        <div class="day-progress-header">
          <span class="day-progress-label">Today's Progress</span>
          <span class="day-progress-percent" id="progress-percent-${dayNumber}">0%</span>
        </div>
        <div class="day-progress-track">
          <div class="day-progress-fill" id="progress-fill-${dayNumber}" style="width: 0%"></div>
          <div class="day-progress-glow"></div>
        </div>
        <p class="day-progress-hint" id="progress-hint-${dayNumber}">Fill in the form fields below to track your progress</p>
        <div class="day-progress-complete" id="progress-complete-${dayNumber}" style="display: none;">
          <div class="progress-congrats">
            <span class="progress-congrats-icon">🎉</span>
            <div class="progress-congrats-content">
              <h4 class="progress-congrats-title">Congratulations!</h4>
              <p class="progress-congrats-text">You've completed all fields for today. Ready to submit?</p>
            </div>
          </div>
          <button class="btn btn-primary btn-lg progress-submit-btn" onclick="App.submitDay(${dayNumber})">
            Submit Day ${dayNumber} ✓
          </button>
        </div>
      </div>
    `;
  },

  // Legacy missionList - kept for backwards compatibility but redirects to taskGuidance
  missionList(doBlocks, day) {
    return this.taskGuidance(doBlocks, day);
  },

  // Form field renderer
  renderField(field, value = '', dayNumber) {
    const id = `field_${field.id}`;
    const requiredClass = field.required ? 'required' : '';
    const val = value || '';

    let input = '';

    switch (field.type) {
      case 'TEXT':
        input = `<input type="text" class="form-input" id="${id}" name="${field.id}" value="${this.escapeHtml(val)}" ${field.required ? 'required' : ''}>`;
        break;

      case 'TEXTAREA':
        input = `<textarea class="form-input form-textarea" id="${id}" name="${field.id}" rows="4" ${field.required ? 'required' : ''}>${this.escapeHtml(val)}</textarea>`;
        break;

      case 'NUMBER':
        input = `<input type="number" class="form-input" id="${id}" name="${field.id}" value="${val}" ${field.min ? `min="${field.min}"` : ''} ${field.max ? `max="${field.max}"` : ''} ${field.required ? 'required' : ''}>`;
        break;

      case 'CURRENCY':
        input = `<div class="form-currency"><input type="number" class="form-input" id="${id}" name="${field.id}" value="${val}" step="0.01" ${field.required ? 'required' : ''}></div>`;
        break;

      case 'DATE':
        input = `<input type="date" class="form-input" id="${id}" name="${field.id}" value="${val}" ${field.required ? 'required' : ''}>`;
        break;

      case 'URL':
        input = `<input type="url" class="form-input" id="${id}" name="${field.id}" value="${this.escapeHtml(val)}" placeholder="https://..." ${field.required ? 'required' : ''}>`;
        break;

      case 'SELECT':
        input = `
          <select class="form-input form-select" id="${id}" name="${field.id}" ${field.required ? 'required' : ''}>
            <option value="">Select...</option>
            ${(field.options || []).map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        `;
        break;

      case 'RADIO':
        input = `
          <div class="form-radio-group">
            ${(field.options || []).map((opt, i) => `
              <label class="form-radio">
                <input type="radio" name="${field.id}" value="${opt}" ${val === opt ? 'checked' : ''} ${field.required && i === 0 ? 'required' : ''}>
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
        `;
        break;

      case 'CHECKBOX':
        input = `
          <label class="form-checkbox">
            <input type="checkbox" name="${field.id}" value="true" ${val === 'true' || val === true ? 'checked' : ''} ${field.required ? 'required' : ''}>
            <span>${field.checkboxLabel || 'Yes'}</span>
          </label>
        `;
        break;

      case 'CHECKBOX_GROUP':
        const checkedVals = Array.isArray(val) ? val : (val ? val.split(',') : []);
        input = `
          <div class="form-checkbox-group">
            ${(field.options || []).map(opt => `
              <label class="form-checkbox">
                <input type="checkbox" name="${field.id}" value="${opt}" ${checkedVals.includes(opt) ? 'checked' : ''}>
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
        `;
        break;

      default:
        input = `<input type="text" class="form-input" id="${id}" name="${field.id}" value="${this.escapeHtml(val)}">`;
    }

    return `
      <div class="form-group workbook-form-field" data-field="${field.id}">
        <label class="form-label ${requiredClass}" for="${id}">${field.label}</label>
        ${input}
        ${field.helperText ? `<span class="form-hint">${field.helperText}</span>` : ''}
      </div>
    `;
  },

  // Render entire form
  renderForm(formSchema, savedData, dayNumber) {
    if (!formSchema || !formSchema.fields) return '<p>No form available for this day.</p>';

    return `
      <form class="workbook-form" id="workbook-form" data-day="${dayNumber}">
        ${formSchema.fields.map(f => this.renderField(f, savedData[f.id], dayNumber)).join('')}
      </form>
    `;
  },

  // Callout
  callout(type, title, content) {
    const icons = { warning: '⚠️', success: '✓', info: '💡' };
    return `
      <div class="callout callout-${type}">
        <span class="callout-icon">${icons[type] || '💡'}</span>
        <div class="callout-content">
          ${title ? `<div class="callout-title">${title}</div>` : ''}
          <div>${content}</div>
        </div>
      </div>
    `;
  },

  // Progress dots for day header
  progressDots(currentDay) {
    let dots = '';
    for (let i = 1; i <= 27; i++) {
      const status = Storage.getDayStatus(i);
      let dotClass = '';
      if (status === 'submitted') dotClass = 'completed';
      else if (status === 'in-progress') dotClass = 'in-progress';
      if (i === currentDay) dotClass += ' current';
      dots += `<div class="day-nav-dot ${dotClass}" title="Day ${i}"></div>`;
    }
    return `<div class="day-nav-dots">${dots}</div>`;
  },

  // Pricing card
  pricingCard(tier) {
    return `
      <div class="pricing-card ${tier.featured ? 'featured' : ''}">
        <h3 class="pricing-card-name">${tier.name}</h3>
        <div class="pricing-card-price">$${tier.price}<span>/one-time</span></div>
        <p class="pricing-card-desc">${tier.description}</p>
        <ul class="pricing-features">
          ${tier.features.map(f => `<li><span class="check">✓</span> ${f}</li>`).join('')}
        </ul>
        <button class="btn ${tier.featured ? 'btn-primary' : 'btn-secondary'} btn-lg pricing-cta">Get Started</button>
      </div>
    `;
  },

  // Testimonial card
  testimonialCard(t) {
    return `
      <div class="testimonial-card">
        <blockquote class="testimonial-quote">"${t.quote}"</blockquote>
        <p class="testimonial-author">${t.author}</p>
        <p class="testimonial-role">${t.role}</p>
      </div>
    `;
  },

  // FAQ accordion
  faqAccordion(faqs) {
    return `
      <div class="accordion">
        ${faqs.map((faq, i) => `
          <div class="accordion-item" data-state="${i === 0 ? 'open' : 'closed'}">
            <button class="accordion-trigger" aria-expanded="${i === 0}" onclick="this.parentElement.dataset.state = this.parentElement.dataset.state === 'open' ? 'closed' : 'open'; this.setAttribute('aria-expanded', this.parentElement.dataset.state === 'open')">
              <span>${faq.question}</span>
              <span class="icon">${this.icons.chevronDown}</span>
            </button>
            <div class="accordion-content">
              <div class="accordion-content-inner">
                <div class="accordion-body">${faq.answer}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  // Subscription gate - shown when user needs to subscribe
  subscriptionGate() {
    return `
      <div class="subscription-gate">
        <div class="subscription-gate-content">
          <div class="subscription-gate-icon">🔒</div>
          <h2 class="subscription-gate-title">Enroll to Access Course Content</h2>
          <p class="subscription-gate-text">Get full access to all 27 days of the Side Hustle Launch program, including lessons, workbooks, and progress tracking.</p>
          <div class="subscription-gate-features">
            <div class="subscription-gate-feature">✓ 27 daily action steps</div>
            <div class="subscription-gate-feature">✓ Built-in workbook</div>
            <div class="subscription-gate-feature">✓ Progress tracking</div>
            <div class="subscription-gate-feature">✓ Export your work</div>
          </div>
          <a class="gumroad-button btn btn-primary btn-lg" href="https://sinadehesh.gumroad.com/l/kghybn">Enroll in the 27-Day Course</a>
          <p class="subscription-gate-login">Already enrolled? <a href="#" onclick="App.showEnrollmentVerification(); return false;">Verify your access here</a></p>
        </div>
      </div>
    `;
  },

  // Subscription badge for header
  subscriptionBadge() {
    const sub = Storage.getSubscription();
    if (!sub) return '';
    return `<span class="badge badge-success">Subscribed</span>`;
  },

  // Course card for catalog
  courseCard(course) {
    const badgeClass = course.badgeColor === 'gold' ? 'badge-gold' : 'badge-info';
    return `
      <div class="course-card">
        <div class="course-card-image">
          ${course.image
        ? `<img src="${course.image}" alt="${course.title}" loading="lazy">`
        : `<div class="course-card-icon-placeholder">${course.icon || '📚'}</div>`
      }
          ${course.badge ? `<span class="course-card-badge ${badgeClass}">${course.badge}</span>` : ''}
        </div>
        <div class="course-card-content">
          <div class="course-card-meta">
            <span class="course-card-duration">${this.icons.clock} ${course.duration}</span>
            <span class="course-card-time">${course.timePerDay}</span>
          </div>
          <h3 class="course-card-title">${course.title}</h3>
          <p class="course-card-subtitle">${course.subtitle}</p>
          <p class="course-card-description">${course.description}</p>
          <div class="course-card-features">
            ${course.features.slice(0, 3).map(f => `<span class="course-feature-tag">✓ ${f}</span>`).join('')}
          </div>
          <div class="course-card-footer">
            <div class="course-card-price">
              <span class="price-amount">$${course.price}</span>
              <span class="price-label">one-time</span>
            </div>
            <a href="#/course/${course.slug}" class="btn btn-primary">Learn More</a>
          </div>
        </div>
      </div>
    `;
  },

  // Coming soon card
  comingSoonCard(course) {
    return `
      <div class="course-card course-card-coming-soon">
        <div class="course-card-image coming-soon-image">
          <div class="course-card-icon-placeholder">${course.icon || '📚'}</div>
          <span class="course-card-badge badge-coming-soon">${course.badge}</span>
        </div>
        <div class="course-card-content">
          <div class="course-card-meta">
            <span class="course-card-duration">${this.icons.clock} ${course.duration}</span>
            <span class="course-card-time">${course.timePerDay}</span>
          </div>
          <h3 class="course-card-title">${course.title}</h3>
          <p class="course-card-subtitle">${course.subtitle}</p>
          <p class="course-card-description">${course.description}</p>
          <div class="course-card-footer">
            <button class="btn btn-secondary btn-disabled" disabled>Coming Soon</button>
          </div>
        </div>
      </div>
    `;
  },

  // Courses grid
  coursesGrid(courses) {
    return `
      <div class="courses-grid">
        ${courses.map(course =>
      course.status === 'available'
        ? this.courseCard(course)
        : this.comingSoonCard(course)
    ).join('')}
      </div>
    `;
  }
};

window.Components = Components;
