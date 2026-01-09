// ============================================
// SIDE HUSTLE: 27-DAY LAUNCH - Router Module
// ============================================

const Router = {
    routes: {},
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

        const pathParts = path.split('/').filter(Boolean);
        params._path = pathParts;

        return { path, params, pathParts };
    },

    async handleRoute() {
        const { path, params, pathParts } = this.getParams();

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

        if (!handler && this.routes['/']) {
            handler = this.routes['/'];
        }

        if (handler) {
            window.scrollTo(0, 0);
            this.updateActiveNav(path);

            try {
                const content = await handler(routeParams);
                if (content && this.container) {
                    this.container.innerHTML = content;
                    App.initComponents();
                    window.dispatchEvent(new CustomEvent('routechange', { detail: { path, params: routeParams } }));
                }
            } catch (error) {
                console.error('Route error:', error);
                if (this.container) {
                    this.container.innerHTML = `<div class="section text-center"><div class="container"><h1>Something went wrong</h1><p class="text-muted">Please try again.</p><a href="#/" class="btn btn-primary mt-6">Go Home</a></div></div>`;
                }
            }
        }
    },

    updateActiveNav(path) {
        document.querySelectorAll('.header-nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            const linkPath = href.replace('#', '');

            if (path === '/' && linkPath === '/') link.classList.add('active');
            else if (linkPath !== '/' && path.startsWith(linkPath)) link.classList.add('active');
            else link.classList.remove('active');
        });
    }
};

window.Router = Router;
