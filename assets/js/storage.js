// ============================================
// SIDE HUSTLE: 27-DAY LAUNCH - Storage Module
// ============================================

const Storage = {
    prefix: 'sh27_',

    get(key) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch { return null; }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch { return false; }
    },

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    },

    // Theme
    getTheme() { return this.get('theme') || 'light'; },
    setTheme(theme) {
        this.set('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },
    toggleTheme() {
        const newTheme = this.getTheme() === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    // User profile
    getUser() { return this.get('user'); },
    setUser(user) { this.set('user', user); },
    isLoggedIn() { return !!this.getUser(); },

    // Start date
    getStartDate() { return this.get('startDate'); },
    setStartDate(date) { this.set('startDate', date); },

    // Workbook submissions
    getDraft(day) { return this.get(`draft_${day}`) || {}; },
    setDraft(day, data) { this.set(`draft_${day}`, data); },

    getSubmission(day) { return this.get(`submission_${day}`); },
    setSubmission(day, data) {
        this.set(`submission_${day}`, {
            ...data,
            submittedAt: new Date().toISOString(),
            version: 1
        });
    },

    isSubmitted(day) { return !!this.getSubmission(day); },

    getDayStatus(day) {
        if (this.isSubmitted(day)) return 'submitted';
        const draft = this.getDraft(day);
        if (Object.keys(draft).length > 0) return 'in-progress';
        return 'not-started';
    },

    // Get all submissions
    getAllSubmissions() {
        const submissions = {};
        for (let i = 1; i <= 27; i++) {
            const sub = this.getSubmission(i);
            if (sub) submissions[i] = sub;
        }
        return submissions;
    },

    // Progress stats
    getProgress() {
        let completed = 0;
        let inProgress = 0;
        for (let i = 1; i <= 27; i++) {
            const status = this.getDayStatus(i);
            if (status === 'submitted') completed++;
            else if (status === 'in-progress') inProgress++;
        }
        return { completed, inProgress, total: 27, percent: Math.round((completed / 27) * 100) };
    },

    // Checklist (mission) state per day
    getMissionState(day) { return this.get(`mission_${day}`) || []; },
    toggleMissionItem(day, index) {
        const state = this.getMissionState(day);
        const idx = state.indexOf(index);
        if (idx >= 0) state.splice(idx, 1);
        else state.push(index);
        this.set(`mission_${day}`, state);
        return state;
    },

    // Current active day (for resume)
    getLastActiveDay() { return this.get('lastActiveDay') || 1; },
    setLastActiveDay(day) { this.set('lastActiveDay', day); },

    // Webhook settings
    getWebhookSettings() { return this.get('webhook') || { url: '', apiKey: '', enabled: false }; },
    setWebhookSettings(settings) { this.set('webhook', settings); },

    // Export all data
    exportAllJSON() {
        const data = {
            user: this.getUser(),
            startDate: this.getStartDate(),
            submissions: this.getAllSubmissions(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    exportAllCSV() {
        const submissions = this.getAllSubmissions();
        const rows = [['Day', 'Title', 'Field', 'Value', 'Submitted At']];

        for (const [day, sub] of Object.entries(submissions)) {
            const dayNum = parseInt(day);
            for (const [field, value] of Object.entries(sub)) {
                if (field !== 'submittedAt' && field !== 'version') {
                    rows.push([dayNum, `Day ${dayNum}`, field, String(value).replace(/"/g, '""'), sub.submittedAt || '']);
                }
            }
        }

        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    Storage.setTheme(Storage.getTheme());
});

window.Storage = Storage;
