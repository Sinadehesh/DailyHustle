// ============================================
// DAILY HUSTLE - UI Components
// ============================================

const Components = {

    // Icons (SVG)
    icons: {
        chevronDown: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7.5L10 12.5L15 7.5"/></svg>`,
        chevronRight: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.5 5L12.5 10L7.5 15"/></svg>`,
        chevronLeft: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.5 15L7.5 10L12.5 5"/></svg>`,
        search: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/></svg>`,
        menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`,
        close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
        sun: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/></svg>`,
        moon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`,
        check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l3 3 7-7"/></svg>`,
        arrowUp: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 16V4M10 4l-5 5M10 4l5 5"/></svg>`,
        play: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l10 6-10 6V4z"/></svg>`,
        book: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a2 2 0 012 2v12a1 1 0 00-1-1H2V3zM18 3h-6a2 2 0 00-2 2v12a1 1 0 011-1h7V3z"/></svg>`,
        clock: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 5v5l3 3"/></svg>`,
        star: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z"/></svg>`,
        user: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="6" r="4"/><path d="M3 18c0-4 3-6 7-6s7 2 7 6"/></svg>`,
        globe: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M2 10h16M10 2a14 14 0 010 16M10 2a14 14 0 000 16"/></svg>`
    },

    // Course Card
    courseCard(course) {
        const levelClass = course.level.toLowerCase();
        const isFree = course.price === 0;

        return `
      <article class="card card-course" data-course="${course.slug}">
        <a href="#/course/${course.slug}" class="card-link" aria-label="${course.title}">
          <div class="card-thumbnail">
            <img src="${course.thumbnail}" alt="${course.title}" loading="lazy">
            ${course.featured ? '<span class="badge badge-featured" style="position:absolute;top:12px;left:12px;">Featured</span>' : ''}
          </div>
          <div class="card-body">
            <h3 class="card-title">${course.title}</h3>
            <p class="card-description">${course.subtitle}</p>
            <div class="card-meta">
              <span class="badge badge-level ${levelClass}">${t(`course.${course.level}`)}</span>
              <span class="badge badge-duration">${course.durationDays} ${t('course.days')}</span>
              ${isFree ? '<span class="badge badge-free">' + t('course.free') + '</span>' : ''}
            </div>
            <div class="card-footer">
              <span class="card-price">${isFree ? t('course.free') : '$' + course.price}</span>
              <span class="btn btn-sm btn-primary">${t('course.view')}</span>
            </div>
          </div>
        </a>
      </article>
    `;
    },

    // Blog Card
    blogCard(post) {
        return `
      <article class="card card-blog">
        <a href="#/blog/${post.slug}" class="card-link">
          <div class="card-thumbnail">
            <img src="${post.thumbnail}" alt="${post.title}" loading="lazy">
          </div>
          <div class="card-body">
            <span class="card-category">${post.category}</span>
            <h3 class="card-title">${post.title}</h3>
            <p class="card-excerpt">${post.excerpt}</p>
            <div class="card-meta">
              <span>${post.readTime} min read</span>
              <span>${post.date}</span>
            </div>
          </div>
        </a>
      </article>
    `;
    },

    // Testimonial Card
    testimonialCard(testimonial) {
        return `
      <div class="card card-testimonial">
        <blockquote class="quote">${testimonial.quote}</blockquote>
        <p class="author">${testimonial.name}</p>
        <p class="outcome">${testimonial.outcome}</p>
      </div>
    `;
    },

    // Rating Stars
    rating(value, count = null) {
        const fullStars = Math.floor(value);
        const hasHalf = value % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += `<span class="rating-star">${this.icons.star}</span>`;
            } else if (i === fullStars && hasHalf) {
                stars += `<span class="rating-star">${this.icons.star}</span>`;
            } else {
                stars += `<span class="rating-star empty">${this.icons.star}</span>`;
            }
        }

        return `
      <div class="rating">
        ${stars}
        <span class="rating-value">${value}</span>
        ${count !== null ? `<span class="rating-count">(${count} ${t('course.reviews')})</span>` : ''}
      </div>
    `;
    },

    // Accordion
    accordion(items, moduleStyle = false) {
        return `
      <div class="accordion ${moduleStyle ? 'accordion-module' : ''}">
        ${items.map((item, index) => `
          <div class="accordion-item" data-state="closed" data-index="${index}">
            <button class="accordion-trigger" aria-expanded="false">
              <span>${item.title}</span>
              <span class="icon">${this.icons.chevronDown}</span>
            </button>
            <div class="accordion-content">
              <div class="accordion-content-inner">
                <div class="accordion-body">
                  ${item.content}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    },

    // Module Accordion (for curriculum)
    curriculumAccordion(modules, courseSlug) {
        return `
      <div class="accordion accordion-module">
        ${modules.map((module, mIndex) => {
            const lessonsHtml = module.lessons.map(lesson => {
                const isComplete = Storage.isLessonComplete(courseSlug, lesson.id);
                return `
              <a href="#/lesson/${courseSlug}/${lesson.id}" class="lesson-item ${isComplete ? 'completed' : ''}">
                <div class="lesson-icon ${isComplete ? '' : ''}">
                  ${isComplete ? this.icons.check : this.icons.book}
                </div>
                <div class="lesson-info">
                  <div class="lesson-title">${lesson.title}</div>
                  <div class="lesson-meta">${lesson.type}</div>
                </div>
                <div class="lesson-duration">${lesson.estimateMinutes} ${t('course.minutes')}</div>
              </a>
            `;
            }).join('');

            return `
            <div class="accordion-item" data-state="${mIndex === 0 ? 'open' : 'closed'}">
              <button class="accordion-trigger" aria-expanded="${mIndex === 0}">
                <div>
                  <div class="module-title">${module.title}</div>
                  <div class="module-meta">${module.lessons.length} ${t('course.lessons')}</div>
                </div>
                <span class="icon">${this.icons.chevronDown}</span>
              </button>
              <div class="accordion-content">
                <div class="accordion-content-inner">
                  <div class="lesson-list">
                    ${lessonsHtml}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    },

    // Pricing Cards
    pricingCards(tiers) {
        return `
      <div class="pricing-grid">
        ${tiers.map(tier => `
          <div class="pricing-card ${tier.featured ? 'featured' : ''}">
            <h3 class="pricing-name">${tier.name}</h3>
            <div class="pricing-price">
              ${tier.price === 0 ? t('course.free') : '$' + tier.price}
              ${tier.price > 0 ? '<span>one-time</span>' : ''}
            </div>
            <ul class="pricing-features">
              ${tier.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="btn btn-primary btn-lg" style="width:100%">
              ${tier.price === 0 ? t('course.start') : t('course.enroll')}
            </button>
          </div>
        `).join('')}
      </div>
    `;
    },

    // Progress Bar
    progressBar(percent, showText = true) {
        return `
      <div class="progress">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
      ${showText ? `<span class="progress-text">${percent}%</span>` : ''}
    `;
    },

    // Filter Bar
    filterBar() {
        return `
      <div class="filter-bar">
        <div class="container">
          <div class="filter-bar-inner">
            <div class="filter-search search-input-wrapper">
              <span class="search-icon">${this.icons.search}</span>
              <input type="text" class="form-input search-input" 
                     placeholder="${t('filters.search')}" 
                     id="search-input"
                     aria-label="${t('filters.search')}">
            </div>
            <div class="filter-group">
              <select class="filter-select" id="filter-category" aria-label="${t('filters.category')}">
                <option value="all">${t('filters.category')}</option>
                <option value="self">${t('categories.self')}</option>
                <option value="creative">${t('categories.creative')}</option>
                <option value="business">${t('categories.business')}</option>
              </select>
              <select class="filter-select" id="filter-level" aria-label="${t('filters.level')}">
                <option value="all">${t('filters.level')}</option>
                <option value="beginner">${t('course.beginner')}</option>
                <option value="intermediate">${t('course.intermediate')}</option>
                <option value="advanced">${t('course.advanced')}</option>
              </select>
              <select class="filter-select" id="filter-price" aria-label="${t('filters.price')}">
                <option value="all">${t('filters.price')}</option>
                <option value="free">${t('filters.free')}</option>
                <option value="paid">${t('filters.paid')}</option>
              </select>
              <select class="filter-select" id="filter-sort" aria-label="${t('filters.sort')}">
                <option value="popular">${t('filters.popular')}</option>
                <option value="newest">${t('filters.newest')}</option>
                <option value="highest_rated">${t('filters.highest_rated')}</option>
                <option value="shortest">${t('filters.shortest')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    // Callout (for lesson content)
    callout(type, title, content) {
        const icons = {
            notice: '💡',
            tip: '✨',
            warning: '⚠️',
            mistake: '❌'
        };
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

    // Checklist (interactive)
    checklist(items, courseSlug, lessonId) {
        const saved = Storage.getChecklistState(courseSlug, lessonId);
        return `
      <ul class="checklist" data-course="${courseSlug}" data-lesson="${lessonId}">
        ${items.map((item, index) => {
            const isChecked = saved.includes(index);
            return `
            <li class="checklist-item ${isChecked ? 'checked' : ''}">
              <div class="checklist-checkbox ${isChecked ? 'checked' : ''}" 
                   data-index="${index}" 
                   tabindex="0" 
                   role="checkbox" 
                   aria-checked="${isChecked}"></div>
              <span class="checklist-text">${item}</span>
            </li>
          `;
        }).join('')}
      </ul>
    `;
    },

    // Quiz
    quiz(data, courseSlug, lessonId, quizIndex) {
        const savedAnswer = Storage.getQuizAnswer(courseSlug, lessonId, quizIndex);
        const hasAnswered = savedAnswer !== null && savedAnswer !== undefined;
        const isCorrect = hasAnswered && data.options[savedAnswer]?.correct;

        return `
      <div class="quiz" data-course="${courseSlug}" data-lesson="${lessonId}" data-quiz="${quizIndex}">
        <p class="quiz-question">${data.question}</p>
        <div class="quiz-options">
          ${data.options.map((opt, index) => {
            let classes = 'quiz-option';
            if (hasAnswered && index === savedAnswer) {
                classes += opt.correct ? ' correct' : ' incorrect';
            }
            return `
              <div class="${classes}" data-index="${index}" tabindex="0" role="radio">
                <span class="quiz-option-indicator"></span>
                <span>${opt.text}</span>
              </div>
            `;
        }).join('')}
        </div>
        ${!hasAnswered ? `<button class="btn btn-primary mt-4 quiz-check">${t('lesson.quiz_check')}</button>` : ''}
        ${hasAnswered ? `
          <div class="quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? data.feedback?.correct || t('lesson.quiz_correct') : data.feedback?.incorrect || t('lesson.quiz_incorrect')}
          </div>
        ` : ''}
      </div>
    `;
    },

    // Reflection textarea
    reflection(prompt, courseSlug, lessonId) {
        const saved = Storage.getReflection(courseSlug, lessonId);
        return `
      <div class="lesson-reflection">
        <h4 class="lesson-reflection-title">${t('lesson.reflection_title')}</h4>
        <p>${prompt}</p>
        <textarea class="lesson-reflection-textarea" 
                  data-course="${courseSlug}" 
                  data-lesson="${lessonId}"
                  placeholder="Write your thoughts...">${saved}</textarea>
        <p class="lesson-reflection-hint">${t('lesson.reflection_hint')}</p>
      </div>
    `;
    },

    // Empty state
    emptyState(icon, title, text) {
        return `
      <div class="courses-empty">
        <div class="courses-empty-icon">${icon}</div>
        <h3 class="courses-empty-title">${title}</h3>
        <p class="courses-empty-text">${text}</p>
      </div>
    `;
    }
};

window.Components = Components;
