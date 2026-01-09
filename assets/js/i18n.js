// ============================================
// DAILY HUSTLE - Internationalization
// ============================================

const I18n = {
    currentLang: 'en',
    strings: {},
    supportedLangs: ['en', 'it'],

    async init() {
        // Get saved language or detect from browser
        const saved = Storage.get('language');
        const browserLang = navigator.language.slice(0, 2);

        this.currentLang = saved ||
            (this.supportedLangs.includes(browserLang) ? browserLang : 'en');

        await this.loadStrings();
        this.updateHtmlLang();
    },

    async loadStrings() {
        try {
            const response = await fetch(`data/i18n/${this.currentLang}.json`);
            if (!response.ok) throw new Error('Failed to load language file');
            this.strings = await response.json();
        } catch (error) {
            console.error('I18n error:', error);
            // Fallback to English
            if (this.currentLang !== 'en') {
                this.currentLang = 'en';
                await this.loadStrings();
            }
        }
    },

    async setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) return;

        this.currentLang = lang;
        Storage.set('language', lang);
        await this.loadStrings();
        this.updateHtmlLang();

        // Re-render current route
        window.dispatchEvent(new CustomEvent('languagechange'));
    },

    toggle() {
        const newLang = this.currentLang === 'en' ? 'it' : 'en';
        this.setLanguage(newLang);
    },

    updateHtmlLang() {
        document.documentElement.lang = this.currentLang;
    },

    // Get translated string by path (e.g., 'nav.home')
    t(path, fallback = '') {
        const keys = path.split('.');
        let value = this.strings;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return fallback || path;
            }
        }

        return value || fallback || path;
    },

    // Get current language
    getLang() {
        return this.currentLang;
    },

    // Check if current language
    isLang(lang) {
        return this.currentLang === lang;
    }
};

// Export for use in other modules
window.I18n = I18n;

// Shorthand function
window.t = (path, fallback) => I18n.t(path, fallback);
