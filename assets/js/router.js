// ============================================
// DAILY HUSTLE - Lightweight Client-Side Router
// ============================================

const Router = {
    routes: {},
    currentRoute: null,
    container: null,

    init(containerId = 'app') {
        this.container = document.getElementById(containerId);
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    navigate(path) {
        window.location.hash = path;
    },

    getParams() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        const params = {};

        if (queryString) {
            queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = decodeURIComponent(value || '');
            });
        }

        // Extract path params (e.g., /course/:slug)
        const pathParts = path.split('/').filter(Boolean);
        params._path = pathParts;

        return { path, params, pathParts };
    },

    async handleRoute() {
        const { path, params, pathParts } = this.getParams();

        // Find matching route
        let handler = null;
        let routeParams = { ...params };

        for (const [routePath, routeHandler] of Object.entries(this.routes)) {
            const routeParts = routePath.split('/').filter(Boolean);

            if (routeParts.length !== pathParts.length && !routePath.includes('*')) continue;

            let match = true;
            const extractedParams = {};

            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    extractedParams[routeParts[i].slice(1)] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i] && routeParts[i] !== '*') {
                    match = false;
                    break;
                }
            }

            if (match) {
                handler = routeHandler;
                routeParams = { ...routeParams, ...extractedParams };
                break;
            }
        }

        // Default to home if no match
        if (!handler && this.routes['/']) {
            handler = this.routes['/'];
        }

        if (handler) {
            this.currentRoute = path;

            // Scroll to top
            window.scrollTo(0, 0);

            // Update active nav links
            this.updateActiveNav(path);

            // Execute handler
            try {
                const content = await handler(routeParams);
                if (content && this.container) {
                    this.container.innerHTML = content;

                    // Initialize any components in the new content
                    this.initializeComponents();

                    // Dispatch route change event
                    window.dispatchEvent(new CustomEvent('routechange', {
                        detail: { path, params: routeParams }
                    }));
                }
            } catch (error) {
                console.error('Route error:', error);
                if (this.container) {
                    this.container.innerHTML = `
            <div class="section text-center">
              <div class="container">
                <h1>Something went wrong</h1>
                <p class="text-muted">Please try again later.</p>
                <a href="#/" class="btn btn-primary mt-6">Go Home</a>
              </div>
            </div>
          `;
                }
            }
        }
    },

    updateActiveNav(path) {
        document.querySelectorAll('.header-nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            const linkPath = href.replace('#', '');

            if (path === '/' && linkPath === '/') {
                link.classList.add('active');
            } else if (linkPath !== '/' && path.startsWith(linkPath)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    initializeComponents() {
        // Initialize accordions
        App.initAccordions();

        // Initialize dropdowns
        App.initDropdowns();

        // Re-apply animations
        App.initAnimations();

        // Re-attach event listeners for interactive elements
        App.initInteractiveElements();
    }
};

// Export for use in other modules
window.Router = Router;
