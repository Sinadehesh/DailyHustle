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
          <div class="day-card-goal">${day.goal}</div>
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

  // Mission list with checkboxes
  missionList(missions, day) {
    const checked = Storage.getMissionState(day);
    return `
      <ul class="checklist mission-list" data-day="${day}">
        ${missions.map((m, i) => `
          <li class="checklist-item">
            <div class="checklist-checkbox ${checked.includes(i) ? 'checked' : ''}" 
                 data-index="${i}" 
                 tabindex="0" 
                 role="checkbox" 
                 aria-checked="${checked.includes(i)}"
                 onclick="App.toggleMission(${day}, ${i}, this)">
              ${checked.includes(i) ? this.icons.check : ''}
            </div>
            <span class="checklist-text">${m.task}</span>
            <span class="checklist-time">${m.time}</span>
          </li>
        `).join('')}
      </ul>
    `;
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
  }
};

window.Components = Components;
