// ============================================
// SIDE HUSTLE: 27-DAY LAUNCH - Data Module
// ============================================

const Data = {
    cache: {},

    async load(file) {
        if (this.cache[file]) return this.cache[file];
        try {
            const response = await fetch(`data/${file}`);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const data = await response.json();
            this.cache[file] = data;
            return data;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            return null;
        }
    },

    async getCatalog() {
        return await this.load('catalog.json');
    },

    async getPlatformInfo() {
        const catalog = await this.getCatalog();
        return catalog?.platform || null;
    },

    async getAllCourses() {
        const catalog = await this.getCatalog();
        return catalog?.courses || [];
    },

    async getCourseBySlug(slug) {
        const courses = await this.getAllCourses();
        return courses.find(c => c.slug === slug) || null;
    },

    async getAvailableCourses() {
        const courses = await this.getAllCourses();
        return courses.filter(c => c.status === 'available');
    },

    async getCourse() {
        return await this.load('courses.json');
    },

    async getDays() {
        return await this.load('days.json') || [];
    },

    async getDay(dayNumber) {
        const days = await this.getDays();
        return days.find(d => d.day === dayNumber) || null;
    },

    async getForms() {
        return await this.load('forms.json') || {};
    },

    async getForm(dayNumber) {
        const forms = await this.getForms();
        return forms[String(dayNumber)] || null;
    },

    async getWeek(weekNumber) {
        const course = await this.getCourse();
        return course?.weeks?.find(w => w.number === weekNumber) || null;
    },

    async getWeekForDay(dayNumber) {
        const course = await this.getCourse();
        if (!course) return null;
        return course.weeks.find(w => w.days.includes(dayNumber)) || null;
    },

    async getAdjacentDays(dayNumber) {
        return {
            prev: dayNumber > 1 ? dayNumber - 1 : null,
            next: dayNumber < 27 ? dayNumber + 1 : null
        };
    },

    // Get days for a specific week
    async getDaysForWeek(weekNumber) {
        const [course, days] = await Promise.all([this.getCourse(), this.getDays()]);
        const week = course?.weeks?.find(w => w.number === weekNumber);
        if (!week) return [];
        return days.filter(d => week.days.includes(d.day));
    },

    // Get "today" based on start date
    getTodayDay() {
        const startDate = Storage.getStartDate();
        if (!startDate) return 1;

        const start = new Date(startDate);
        const now = new Date();
        const diffTime = now - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Day 1 is start date, so add 1
        const todayDay = Math.min(Math.max(diffDays + 1, 1), 27);
        return todayDay;
    }
};

window.Data = Data;
