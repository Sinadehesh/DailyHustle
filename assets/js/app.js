// ============================================
// DAILY HUSTLE - Main Application
// ============================================

const App = {
    async init() {
        // Initialize i18n first
        await I18n.init();

        // Initialize theme
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);

        // Setup router
        this.setupRoutes();
        Router.init('app');

        // Setup global event listeners
        this.setupEventListeners();

        // Initialize header behavior
        this.initHeader();

        // Initialize back to top button
        this.initBackToTop();
    },

    setupRoutes() {
        Router.register('/', () => this.renderHome());
        Router.register('/courses', () => this.renderCourses());
        Router.register('/course/:slug', (params) => this.renderCourse(params.slug));
        Router.register('/lesson/:courseSlug/:lessonId', (params) => this.renderLesson(params.courseSlug, params.lessonId));
        Router.register('/dashboard', () => this.renderDashboard());
        Router.register('/about', () => this.renderAbout());
        Router.register('/blog', () => this.renderBlog());
        Router.register('/contact', () => this.renderContact());
        Router.register('/admin', () => this.renderAdmin());
    },

    setupEventListeners() {
        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#theme-toggle')) {
                Storage.toggleTheme();
                this.updateThemeIcon();
            }
        });

        // Language toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#lang-toggle')) {
                I18n.toggle();
                Router.handleRoute(); // Re-render current page
            }
        });

        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-menu-toggle')) {
                const nav = document.querySelector('.header-nav');
                nav?.classList.toggle('open');
            }
        });

        // Language change event
        window.addEventListener('languagechange', () => {
            Router.handleRoute();
        });

        // Close mobile menu on nav click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.header-nav-link')) {
                document.querySelector('.header-nav')?.classList.remove('open');
            }
        });
    },

    initHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        const updateHeader = () => {
            if (window.scrollY > 100) {
                header.classList.remove('transparent');
                header.classList.add('solid');
            } else {
                header.classList.add('transparent');
                header.classList.remove('solid');
            }
        };

        window.addEventListener('scroll', updateHeader);
        updateHeader();
    },

    initBackToTop() {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    updateThemeIcon() {
        const theme = Storage.getTheme();
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.innerHTML = theme === 'dark' ? Components.icons.sun : Components.icons.moon;
        }
    },

    initAccordions() {
        document.querySelectorAll('.accordion-trigger').forEach(trigger => {
            trigger.addEventListener('click', function () {
                const item = this.closest('.accordion-item');
                const isOpen = item.getAttribute('data-state') === 'open';

                item.setAttribute('data-state', isOpen ? 'closed' : 'open');
                this.setAttribute('aria-expanded', !isOpen);
            });
        });
    },

    initDropdowns() {
        document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
            trigger.addEventListener('click', function (e) {
                e.stopPropagation();
                const dropdown = this.closest('.dropdown');
                dropdown.classList.toggle('open');
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        });
    },

    initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-animate-stagger]').forEach(el => observer.observe(el));
    },

    initInteractiveElements() {
        // Checklists
        document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function () {
                const list = this.closest('.checklist');
                const courseSlug = list.dataset.course;
                const lessonId = list.dataset.lesson;
                const index = parseInt(this.dataset.index);

                Storage.toggleChecklistItem(courseSlug, lessonId, index);

                this.classList.toggle('checked');
                this.closest('.checklist-item').classList.toggle('checked');
                this.setAttribute('aria-checked', this.classList.contains('checked'));
            });

            checkbox.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Quizzes
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function () {
                const quiz = this.closest('.quiz');
                if (quiz.querySelector('.quiz-feedback')) return; // Already answered

                quiz.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });

            option.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        document.querySelectorAll('.quiz-check').forEach(btn => {
            btn.addEventListener('click', async function () {
                const quiz = this.closest('.quiz');
                const courseSlug = quiz.dataset.course;
                const lessonId = quiz.dataset.lesson;
                const quizIndex = parseInt(quiz.dataset.quiz);

                const selected = quiz.querySelector('.quiz-option.selected');
                if (!selected) return;

                const answerIndex = parseInt(selected.dataset.index);
                Storage.setQuizAnswer(courseSlug, lessonId, quizIndex, answerIndex);

                // Re-render quiz
                const course = await Data.getCourse(courseSlug);
                const lesson = await Data.getLesson(courseSlug, lessonId);
                let quizCount = 0;
                for (const block of lesson.contentBlocks) {
                    if (block.type === 'quiz') {
                        if (quizCount === quizIndex) {
                            quiz.outerHTML = Components.quiz(block, courseSlug, lessonId, quizIndex);
                            break;
                        }
                        quizCount++;
                    }
                }
            });
        });

        // Reflection textareas
        document.querySelectorAll('.lesson-reflection-textarea').forEach(textarea => {
            textarea.addEventListener('input', function () {
                const courseSlug = this.dataset.course;
                const lessonId = this.dataset.lesson;
                Storage.setReflection(courseSlug, lessonId, this.value);
            });
        });
    },

    // ============================================
    // PAGE RENDERERS
    // ============================================

    async renderHome() {
        const [courses, testimonials, blogPosts, stats] = await Promise.all([
            Data.getFeaturedCourses(),
            Data.getTestimonials(),
            Data.getBlogPosts(),
            Data.getStats()
        ]);

        return `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1920&h=1080&fit=crop" alt="">
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-tagline">${t('hero.tagline')}</h1>
          <p class="hero-subline">${t('hero.subline')}</p>
          <div class="hero-ctas">
            <a href="#/courses" class="btn btn-primary btn-lg">${t('hero.cta_primary')}</a>
            <a href="#/course/daily-hustle" class="btn btn-outline-light btn-lg">${t('hero.cta_secondary')}</a>
          </div>
          <div class="hero-trust">
            <div class="hero-trust-item">
              <div class="hero-trust-value">${stats.courses}</div>
              <div class="hero-trust-label">${t('trust.courses')}</div>
            </div>
            <div class="hero-trust-item">
              <div class="hero-trust-value">${stats.learners.toLocaleString()}+</div>
              <div class="hero-trust-label">${t('trust.learners')}</div>
            </div>
            <div class="hero-trust-item">
              <div class="hero-trust-value">${stats.hours}+</div>
              <div class="hero-trust-label">${t('trust.hours')}</div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Featured Courses -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">${t('sections.featured')}</h2>
            <p class="section-subtitle">${t('sections.featured_subtitle')}</p>
          </div>
          <div class="featured-slider">
            <div class="featured-track" data-animate-stagger>
              ${courses.map(c => Components.courseCard(c)).join('')}
            </div>
          </div>
          <div class="text-center mt-8">
            <a href="#/courses" class="btn btn-secondary">${t('buttons.view_all')}</a>
          </div>
        </div>
      </section>
      
      <!-- How It Works -->
      <section class="section section-muted how-it-works">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">${t('sections.how_it_works')}</h2>
            <p class="section-subtitle">${t('sections.how_it_works_subtitle')}</p>
          </div>
          <div class="steps-grid" data-animate-stagger>
            <div class="step-item">
              <div class="step-number">1</div>
              <h3 class="step-title">${t('steps.step1_title')}</h3>
              <p class="step-text">${t('steps.step1_text')}</p>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <h3 class="step-title">${t('steps.step2_title')}</h3>
              <p class="step-text">${t('steps.step2_text')}</p>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <h3 class="step-title">${t('steps.step3_title')}</h3>
              <p class="step-text">${t('steps.step3_text')}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Testimonials -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">${t('sections.testimonials')}</h2>
            <p class="section-subtitle">${t('sections.testimonials_subtitle')}</p>
          </div>
          <div class="grid grid-3" data-animate-stagger>
            ${testimonials.slice(0, 3).map(t => Components.testimonialCard(t)).join('')}
          </div>
        </div>
      </section>
      
      <!-- Blog Teasers -->
      <section class="section section-muted">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">${t('sections.blog')}</h2>
            <p class="section-subtitle">${t('sections.blog_subtitle')}</p>
          </div>
          <div class="grid grid-blog" data-animate-stagger>
            ${blogPosts.slice(0, 3).map(p => Components.blogCard(p)).join('')}
          </div>
          <div class="text-center mt-8">
            <a href="#/blog" class="btn btn-secondary">${t('buttons.view_all')}</a>
          </div>
        </div>
      </section>
      
      <!-- Newsletter -->
      <section class="section newsletter-section">
        <div class="container">
          <div class="newsletter-content">
            <h2 class="newsletter-title">${t('sections.newsletter')}</h2>
            <p class="newsletter-text">${t('sections.newsletter_subtitle')}</p>
            <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Newsletter signup would be processed here!');">
              <input type="email" class="form-input newsletter-input" placeholder="${t('footer.newsletter_placeholder')}" required>
              <button type="submit" class="btn btn-primary">${t('footer.newsletter_button')}</button>
            </form>
            <p class="newsletter-privacy">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    `;
    },

    async renderCourses() {
        const courses = await Data.filterCourses({});

        setTimeout(() => {
            this.initCourseFilters();
        }, 0);

        return `
      ${Components.filterBar()}
      <section class="section courses-page">
        <div class="container">
          <div class="layout-sidebar">
            <div class="courses-main">
              <p class="courses-results"><span id="course-count">${courses.length}</span> courses available</p>
              <div class="grid grid-courses" id="courses-grid">
                ${courses.map(c => Components.courseCard(c)).join('')}
              </div>
            </div>
            <aside class="sidebar courses-sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">Popular Courses</h3>
                <ul class="sidebar-list">
                  ${courses.filter(c => c.popular).slice(0, 3).map(c => `
                    <li><a href="#/course/${c.slug}">${c.title}</a></li>
                  `).join('')}
                </ul>
              </div>
              <div class="sidebar-section">
                <h3 class="sidebar-title">Categories</h3>
                <div class="category-cloud">
                  <a href="#" class="category-tag" data-category="self">${t('categories.self')}</a>
                  <a href="#" class="category-tag" data-category="creative">${t('categories.creative')}</a>
                  <a href="#" class="category-tag" data-category="business">${t('categories.business')}</a>
                </div>
              </div>
              <div class="sidebar-section">
                <h3 class="sidebar-title">Start Here</h3>
                <p class="text-sm text-muted">New to Daily Hustle? Start with Focus Foundations—it's free.</p>
                <a href="#/course/focus-foundations" class="btn btn-secondary mt-4" style="width:100%">Start Free</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    `;
    },

    initCourseFilters() {
        const searchInput = document.getElementById('search-input');
        const categorySelect = document.getElementById('filter-category');
        const levelSelect = document.getElementById('filter-level');
        const priceSelect = document.getElementById('filter-price');
        const sortSelect = document.getElementById('filter-sort');
        const grid = document.getElementById('courses-grid');
        const countEl = document.getElementById('course-count');

        const updateCourses = async () => {
            const filters = {
                search: searchInput?.value || '',
                category: categorySelect?.value || 'all',
                level: levelSelect?.value || 'all',
                price: priceSelect?.value || 'all',
                sort: sortSelect?.value || 'popular'
            };

            const courses = await Data.filterCourses(filters);

            if (grid) {
                if (courses.length === 0) {
                    grid.innerHTML = Components.emptyState('📚', 'No courses found', 'Try adjusting your filters.');
                } else {
                    grid.innerHTML = courses.map(c => Components.courseCard(c)).join('');
                }
            }

            if (countEl) {
                countEl.textContent = courses.length;
            }
        };

        // Debounce search
        let searchTimeout;
        searchInput?.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(updateCourses, 300);
        });

        categorySelect?.addEventListener('change', updateCourses);
        levelSelect?.addEventListener('change', updateCourses);
        priceSelect?.addEventListener('change', updateCourses);
        sortSelect?.addEventListener('change', updateCourses);

        // Category tags in sidebar
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = tag.dataset.category;
                if (categorySelect) {
                    categorySelect.value = cat;
                    updateCourses();
                }
            });
        });
    },

    async renderCourse(slug) {
        const course = await Data.getCourse(slug);
        if (!course) {
            return `<div class="section text-center"><h1>Course not found</h1><a href="#/courses" class="btn btn-primary mt-6">View Courses</a></div>`;
        }

        const related = await Data.getRelatedCourses(slug);
        const isEnrolled = Storage.isEnrolled(slug);
        const progress = isEnrolled ? await Storage.getCourseProgressPercent(slug) : 0;

        // Get first lesson for preview
        const firstLesson = course.modules[0]?.lessons[0];

        return `
      <!-- Course Hero -->
      <section class="course-hero">
        <div class="container">
          <div class="course-hero-inner">
            <div class="course-hero-content">
              <nav class="course-hero-breadcrumb">
                <a href="#/courses">${t('nav.courses')}</a>
                <span>/</span>
                <span>${course.title}</span>
              </nav>
              <h1 class="course-hero-title">${course.title}</h1>
              <p class="course-hero-subtitle">${course.subtitle}</p>
              ${Components.rating(course.rating, course.reviewCount)}
              <div class="course-facts">
                <div class="course-fact">
                  <span class="course-fact-label">${t('course.duration')}</span>
                  <span class="course-fact-value">${course.durationDays} ${t('course.days')}</span>
                </div>
                <div class="course-fact">
                  <span class="course-fact-label">${t('course.daily_time')}</span>
                  <span class="course-fact-value">${course.minutesPerDay} min</span>
                </div>
                <div class="course-fact">
                  <span class="course-fact-label">${t('course.level')}</span>
                  <span class="course-fact-value">${t('course.' + course.level)}</span>
                </div>
                <div class="course-fact">
                  <span class="course-fact-label">${t('course.format')}</span>
                  <span class="course-fact-value">${t('formats.' + course.format)}</span>
                </div>
              </div>
            </div>
            <div class="course-hero-media">
              <div class="course-hero-image">
                <img src="${course.heroMedia.url}" alt="${course.title}">
              </div>
              <div class="course-cta-card">
                <div class="course-cta-price">${course.price === 0 ? t('course.free') : '$' + course.price}</div>
                ${isEnrolled ? `
                  <div class="mb-4">
                    <p class="text-sm text-muted mb-2">Your progress: ${progress}%</p>
                    ${Components.progressBar(progress, false)}
                  </div>
                ` : ''}
                <div class="course-cta-btns">
                  ${isEnrolled ? `
                    <a href="#/lesson/${course.slug}/${firstLesson?.id}" class="btn btn-primary btn-lg">${t('course.continue')}</a>
                  ` : `
                    <button class="btn btn-primary btn-lg" onclick="Storage.enrollCourse('${course.slug}'); Router.handleRoute();">${t('course.enroll')}</button>
                  `}
                  ${firstLesson ? `<a href="#/lesson/${course.slug}/${firstLesson.id}" class="btn btn-secondary">${t('course.preview')}</a>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Introduction -->
      <section class="course-section">
        <div class="container">
          <div class="course-intro">
            <h2 class="course-intro-title">Dear Learner,</h2>
            <div class="course-intro-text">
              <p>${course.description}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Outcomes -->
      <section class="course-section course-outcomes">
        <div class="container">
          <h2 class="section-title mb-8">${t('course.outcomes')}</h2>
          <div class="outcomes-grid">
            ${course.outcomes.map(o => `
              <div class="outcome-item">
                <div class="outcome-icon">${o.icon}</div>
                <p class="outcome-text">${o.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      
      <!-- Curriculum -->
      <section class="course-section">
        <div class="container">
          <div class="course-curriculum">
            <h2 class="section-title mb-8">${t('course.curriculum')}</h2>
            ${Components.curriculumAccordion(course.modules, course.slug)}
          </div>
        </div>
      </section>
      
      <!-- Instructor -->
      <section class="course-section course-instructor">
        <div class="container">
          <h2 class="section-title mb-8">${t('course.instructor')}</h2>
          <div class="instructor-card">
            <div class="instructor-avatar">
              <img src="${course.instructor.avatar}" alt="${course.instructor.name}">
            </div>
            <div class="instructor-info">
              <h3 class="instructor-name">${course.instructor.name}</h3>
              <p class="instructor-role">${course.instructor.role}</p>
              <p class="instructor-bio">${course.instructor.bio}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Pricing -->
      <section class="course-section course-pricing">
        <div class="container">
          <h2 class="section-title mb-8 text-center">${t('course.pricing')}</h2>
          ${Components.pricingCards(course.pricingTiers)}
        </div>
      </section>
      
      <!-- FAQs -->
      <section class="course-section">
        <div class="container">
          <div class="course-faqs">
            <h2 class="section-title mb-8">${t('course.faqs')}</h2>
            ${Components.accordion(course.faqs.map(f => ({
            title: f.question,
            content: f.answer
        })))}
          </div>
        </div>
      </section>
      
      <!-- Related Courses -->
      ${related.length > 0 ? `
        <section class="course-section section-muted">
          <div class="container">
            <h2 class="section-title mb-8">${t('course.related')}</h2>
            <div class="grid grid-3">
              ${related.map(c => Components.courseCard(c)).join('')}
            </div>
          </div>
        </section>
      ` : ''}
    `;
    },

    async renderLesson(courseSlug, lessonId) {
        const lesson = await Data.getLesson(courseSlug, lessonId);
        if (!lesson) {
            return `<div class="section text-center"><h1>Lesson not found</h1><a href="#/courses" class="btn btn-primary mt-6">View Courses</a></div>`;
        }

        const course = await Data.getCourse(courseSlug);
        const { prev, next } = await Data.getAdjacentLessons(courseSlug, lessonId);
        const isComplete = Storage.isLessonComplete(courseSlug, lessonId);
        const progress = await Storage.getCourseProgressPercent(courseSlug);

        // Auto-enroll if not enrolled
        if (!Storage.isEnrolled(courseSlug)) {
            Storage.enrollCourse(courseSlug);
        }

        // Render content blocks
        let quizIndex = 0;
        const contentHtml = lesson.contentBlocks.map(block => {
            switch (block.type) {
                case 'text':
                    return block.content;
                case 'callout':
                    return Components.callout(block.style, block.title, block.content);
                case 'checklist':
                    return Components.checklist(block.items, courseSlug, lessonId);
                case 'quiz':
                    const html = Components.quiz(block, courseSlug, lessonId, quizIndex);
                    quizIndex++;
                    return html;
                case 'reflection':
                    return Components.reflection(block.prompt, courseSlug, lessonId);
                default:
                    return '';
            }
        }).join('');

        setTimeout(() => {
            this.initInteractiveElements();
            this.initLessonEvents(courseSlug, lessonId);
        }, 0);

        return `
      <div class="lesson-page">
        <!-- Sidebar -->
        <aside class="lesson-sidebar" id="lesson-sidebar">
          <div class="lesson-sidebar-header">
            <a href="#/course/${courseSlug}" class="btn btn-ghost btn-sm mb-4">${Components.icons.chevronLeft} ${t('buttons.back')}</a>
            <h2 class="lesson-sidebar-title">${course.title}</h2>
            <p class="lesson-sidebar-progress">${progress}% complete</p>
            <div class="progress mt-2"><div class="progress-bar" style="width:${progress}%"></div></div>
          </div>
          <nav class="lesson-nav">
            ${course.modules.map(module => `
              <div class="lesson-nav-module">
                <div class="lesson-nav-module-title">${module.title}</div>
                <div class="lesson-nav-lessons">
                  ${module.lessons.map(l => {
            const complete = Storage.isLessonComplete(courseSlug, l.id);
            const active = l.id === lessonId;
            return `
                      <a href="#/lesson/${courseSlug}/${l.id}" class="lesson-nav-item ${complete ? 'completed' : ''} ${active ? 'active' : ''}">
                        <span class="check">${complete ? '✓' : ''}</span>
                        <span>${l.title}</span>
                      </a>
                    `;
        }).join('')}
                </div>
              </div>
            `).join('')}
          </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="lesson-main">
          <div class="lesson-topbar">
            <div class="lesson-topbar-left">
              <button class="btn btn-ghost btn-icon mobile-menu-toggle" style="display:none" onclick="document.getElementById('lesson-sidebar').classList.toggle('open')">
                ${Components.icons.menu}
              </button>
              <span class="lesson-topbar-title">${lesson.module.title}</span>
            </div>
            <div class="lesson-topbar-right">
              <span class="lesson-progress-text">${progress}%</span>
              <button class="btn ${isComplete ? 'btn-ghost' : 'btn-primary'}" id="mark-complete-btn" ${isComplete ? 'disabled' : ''}>
                ${isComplete ? t('lesson.completed') + ' ✓' : t('lesson.mark_complete')}
              </button>
            </div>
          </div>
          
          <div class="lesson-content-wrapper">
            <article class="lesson-content">
              <h1>${lesson.title}</h1>
              ${contentHtml}
            </article>
          </div>
          
          <div class="lesson-bottombar">
            ${prev ? `
              <a href="#/lesson/${courseSlug}/${prev.id}" class="btn btn-secondary lesson-nav-btn">
                ${Components.icons.chevronLeft} ${t('lesson.previous')}
              </a>
            ` : '<div></div>'}
            ${next ? `
              <a href="#/lesson/${courseSlug}/${next.id}" class="btn btn-primary lesson-nav-btn">
                ${t('lesson.next')} ${Components.icons.chevronRight}
              </a>
            ` : `
              <a href="#/course/${courseSlug}" class="btn btn-primary lesson-nav-btn">
                Finish Course ${Components.icons.check}
              </a>
            `}
          </div>
        </main>
      </div>
    `;
    },

    initLessonEvents(courseSlug, lessonId) {
        const btn = document.getElementById('mark-complete-btn');
        if (btn && !Storage.isLessonComplete(courseSlug, lessonId)) {
            btn.addEventListener('click', async () => {
                Storage.markLessonComplete(courseSlug, lessonId);
                btn.textContent = t('lesson.completed') + ' ✓';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-ghost');
                btn.disabled = true;

                // Update sidebar
                const navItem = document.querySelector(`a[href="#/lesson/${courseSlug}/${lessonId}"]`);
                if (navItem) {
                    navItem.classList.add('completed');
                    navItem.querySelector('.check').textContent = '✓';
                }

                // Update progress
                const progress = await Storage.getCourseProgressPercent(courseSlug);
                document.querySelectorAll('.lesson-progress-text').forEach(el => el.textContent = progress + '%');
                document.querySelectorAll('.lesson-sidebar-progress').forEach(el => el.textContent = progress + '% complete');
                document.querySelectorAll('.progress-bar').forEach(el => el.style.width = progress + '%');
            });
        }
    },

    async renderDashboard() {
        const enrolled = Storage.getEnrolledCourses();
        const user = Storage.getUser() || { name: 'Guest' };

        // Get course details for enrolled courses
        const enrolledCourses = await Promise.all(
            enrolled.map(async (slug) => {
                const course = await Data.getCourse(slug);
                const progress = await Storage.getCourseProgressPercent(slug);
                return { ...course, progress };
            })
        );

        // Get recommendations
        const allCourses = await Data.getCourses();
        const recommendations = allCourses
            .filter(c => !enrolled.includes(c.slug))
            .slice(0, 3);

        return `
      <section class="dashboard-page">
        <div class="dashboard-header">
          <div class="container">
            <h1 class="dashboard-welcome">${t('dashboard.welcome')}, ${user.name}</h1>
            <p class="dashboard-subtitle">Continue building your daily practice.</p>
          </div>
        </div>
        
        <div class="container">
          <div class="dashboard-grid">
            <div class="dashboard-main">
              ${enrolledCourses.length > 0 && enrolledCourses[0].progress < 100 ? `
                <div class="dashboard-section">
                  <h2 class="dashboard-section-title">${t('dashboard.continue')}</h2>
                  <div class="enrolled-course-card">
                    <div class="enrolled-course-thumb">
                      <img src="${enrolledCourses[0].thumbnail}" alt="">
                    </div>
                    <div class="enrolled-course-info">
                      <h3 class="enrolled-course-title">${enrolledCourses[0].title}</h3>
                      <div class="enrolled-course-progress">
                        <div class="enrolled-course-progress-bar progress" style="flex:1">
                          <div class="progress-bar" style="width:${enrolledCourses[0].progress}%"></div>
                        </div>
                        <span class="enrolled-course-progress-text">${enrolledCourses[0].progress}%</span>
                      </div>
                      <a href="#/course/${enrolledCourses[0].slug}" class="btn btn-primary mt-4">${t('course.continue')}</a>
                    </div>
                  </div>
                </div>
              ` : ''}
              
              <div class="dashboard-section">
                <h2 class="dashboard-section-title">${t('dashboard.enrolled')}</h2>
                ${enrolledCourses.length === 0 ? `
                  <p class="text-muted">You haven't enrolled in any courses yet.</p>
                  <a href="#/courses" class="btn btn-primary mt-4">Browse Courses</a>
                ` : enrolledCourses.map(c => `
                  <div class="enrolled-course-card">
                    <div class="enrolled-course-thumb">
                      <img src="${c.thumbnail}" alt="">
                    </div>
                    <div class="enrolled-course-info">
                      <h3 class="enrolled-course-title">${c.title}</h3>
                      <div class="enrolled-course-progress">
                        <div class="enrolled-course-progress-bar progress" style="flex:1">
                          <div class="progress-bar" style="width:${c.progress}%"></div>
                        </div>
                        <span class="enrolled-course-progress-text">${c.progress}%</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              ${recommendations.length > 0 ? `
                <div class="dashboard-section">
                  <h2 class="dashboard-section-title">${t('dashboard.recommendations')}</h2>
                  <div class="grid grid-3">
                    ${recommendations.map(c => Components.courseCard(c)).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <div class="dashboard-side">
              <div class="stats-card mb-6">
                <div class="stats-card-value">${enrolled.length}</div>
                <div class="stats-card-label">Courses Enrolled</div>
              </div>
              <div class="stats-card mb-6">
                <div class="stats-card-value">${enrolledCourses.reduce((sum, c) => sum + Storage.getCompletedLessonsCount(c.slug), 0)}</div>
                <div class="stats-card-label">Lessons Completed</div>
              </div>
              <div class="stats-card">
                <div class="stats-card-value">${enrolledCourses.filter(c => c.progress === 100).length}</div>
                <div class="stats-card-label">Courses Finished</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    },

    async renderAbout() {
        return `
      <section class="about-hero">
        <div class="container">
          <div class="about-content">
            <h1 class="section-title">About Daily Hustle</h1>
            <p class="section-subtitle mb-8">A different approach to learning and productivity.</p>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="about-content" style="max-width:760px">
            <h2>The Problem</h2>
            <p>Most online courses are designed to be consumed, not completed. They're optimized for enrollment, not transformation. The result: a graveyard of half-watched videos and abandoned learning paths.</p>
            
            <h2>Our Approach</h2>
            <p>Daily Hustle is built on a simple insight: small daily actions compound into significant change. Every course we create follows the same principle—one focused lesson per day, designed to be completed in under 15 minutes.</p>
            <p>No binge-watching. No overwhelming modules. Just consistent, sustainable practice.</p>
            
            <h2>Who We Are</h2>
            <p>Daily Hustle was created by Marco Bellini, a former creative director based in Milan. After years of struggling with focus and productivity in the attention economy, he developed the practices that became Daily Hustle.</p>
            <p>Today, thousands of learners use our courses to build better attention habits, one day at a time.</p>
          </div>
        </div>
      </section>
    `;
    },

    async renderBlog() {
        const posts = await Data.getBlogPosts();

        return `
      <section class="blog-hero">
        <div class="container">
          <h1 class="section-title">${t('nav.blog')}</h1>
          <p class="section-subtitle">${t('sections.blog_subtitle')}</p>
        </div>
      </section>
      <section class="section blog-page">
        <div class="container">
          <div class="grid grid-blog">
            ${posts.map(p => Components.blogCard(p)).join('')}
          </div>
        </div>
      </section>
    `;
    },

    async renderContact() {
        return `
      <section class="about-hero">
        <div class="container">
          <h1 class="section-title">${t('nav.contact')}</h1>
          <p class="section-subtitle">Get in touch with us.</p>
        </div>
      </section>
      <section class="section contact-page">
        <div class="container">
          <div class="two-col">
            <div class="contact-form">
              <form onsubmit="event.preventDefault(); alert('Message sent!');">
                <div class="form-group mb-4">
                  <label class="form-label">${t('forms.name')}</label>
                  <input type="text" class="form-input" required>
                </div>
                <div class="form-group mb-4">
                  <label class="form-label">${t('forms.email')}</label>
                  <input type="email" class="form-input" required>
                </div>
                <div class="form-group mb-4">
                  <label class="form-label">${t('forms.message')}</label>
                  <textarea class="form-input form-textarea" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">${t('buttons.submit')}</button>
              </form>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <div class="contact-icon">📧</div>
                <div>
                  <h3 class="font-semibold">Email</h3>
                  <p class="text-muted">hello@dailyhustle.com</p>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div>
                  <h3 class="font-semibold">Location</h3>
                  <p class="text-muted">Milan, Italy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    },

    async renderAdmin() {
        return `
      <section class="admin-page">
        <div class="admin-header">
          <h1>Admin Console</h1>
        </div>
        <div class="admin-container">
          <div class="admin-grid">
            <div class="admin-panel">
              <div class="admin-panel-header">Course Editor</div>
              <div class="admin-panel-body">
                <form class="admin-form" id="admin-form">
                  <div class="admin-form-row">
                    <div class="form-group">
                      <label class="form-label">Title *</label>
                      <input type="text" class="form-input" id="admin-title" required>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Slug *</label>
                      <input type="text" class="form-input" id="admin-slug" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Subtitle</label>
                    <input type="text" class="form-input" id="admin-subtitle">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-input form-textarea" id="admin-description" rows="3"></textarea>
                  </div>
                  <div class="admin-form-row">
                    <div class="form-group">
                      <label class="form-label">Category</label>
                      <select class="form-select" id="admin-category">
                        <option value="self">Self Development</option>
                        <option value="creative">Creative</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Level</label>
                      <select class="form-select" id="admin-level">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div class="admin-form-row">
                    <div class="form-group">
                      <label class="form-label">Duration (days)</label>
                      <input type="number" class="form-input" id="admin-duration" value="7">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Minutes per day</label>
                      <input type="number" class="form-input" id="admin-minutes" value="10">
                    </div>
                  </div>
                  <div class="admin-form-row">
                    <div class="form-group">
                      <label class="form-label">Price ($)</label>
                      <input type="number" class="form-input" id="admin-price" value="0">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Thumbnail URL</label>
                      <input type="text" class="form-input" id="admin-thumbnail">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tags (comma-separated)</label>
                    <input type="text" class="form-input" id="admin-tags">
                  </div>
                  <div class="admin-actions">
                    <button type="button" class="btn btn-primary" onclick="App.generateAdminJSON()">Generate JSON</button>
                    <button type="button" class="btn btn-secondary" onclick="App.copyAdminJSON()">Copy to Clipboard</button>
                  </div>
                </form>
              </div>
            </div>
            <div class="admin-panel">
              <div class="admin-panel-header">JSON Preview</div>
              <div class="admin-panel-body">
                <pre class="admin-json-preview" id="admin-json-preview">// Click "Generate JSON" to see output</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    },

    generateAdminJSON() {
        const course = {
            id: document.getElementById('admin-slug')?.value || '',
            slug: document.getElementById('admin-slug')?.value || '',
            title: document.getElementById('admin-title')?.value || '',
            subtitle: document.getElementById('admin-subtitle')?.value || '',
            description: document.getElementById('admin-description')?.value || '',
            category: document.getElementById('admin-category')?.value || 'self',
            level: document.getElementById('admin-level')?.value || 'beginner',
            format: 'mixed',
            durationDays: parseInt(document.getElementById('admin-duration')?.value) || 7,
            minutesPerDay: parseInt(document.getElementById('admin-minutes')?.value) || 10,
            rating: 0,
            reviewCount: 0,
            price: parseInt(document.getElementById('admin-price')?.value) || 0,
            featured: false,
            popular: false,
            thumbnail: document.getElementById('admin-thumbnail')?.value || '',
            tags: (document.getElementById('admin-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
            modules: []
        };

        const preview = document.getElementById('admin-json-preview');
        if (preview) {
            preview.textContent = JSON.stringify(course, null, 2);
        }

        this._adminJSON = course;
    },

    copyAdminJSON() {
        if (this._adminJSON) {
            navigator.clipboard.writeText(JSON.stringify(this._adminJSON, null, 2));
            alert('JSON copied to clipboard!');
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Export for global access
window.App = App;
