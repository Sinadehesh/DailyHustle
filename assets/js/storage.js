// ============================================
// DAILY HUSTLE - LocalStorage Management
// ============================================

const Storage = {
    prefix: 'dh_',

    // Basic operations
    get(key) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    },

    // Theme management
    getTheme() {
        return this.get('theme') || 'light';
    },

    setTheme(theme) {
        this.set('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme() {
        const current = this.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    // Course enrollment
    getEnrolledCourses() {
        return this.get('enrolled') || [];
    },

    enrollCourse(courseSlug) {
        const enrolled = this.getEnrolledCourses();
        if (!enrolled.includes(courseSlug)) {
            enrolled.push(courseSlug);
            this.set('enrolled', enrolled);
        }
        // Initialize progress
        if (!this.getCourseProgress(courseSlug)) {
            this.set(`progress_${courseSlug}`, {
                completedLessons: [],
                lastLesson: null,
                startedAt: new Date().toISOString()
            });
        }
    },

    isEnrolled(courseSlug) {
        return this.getEnrolledCourses().includes(courseSlug);
    },

    // Lesson progress
    getCourseProgress(courseSlug) {
        return this.get(`progress_${courseSlug}`);
    },

    markLessonComplete(courseSlug, lessonId) {
        const progress = this.getCourseProgress(courseSlug) || {
            completedLessons: [],
            lastLesson: null,
            startedAt: new Date().toISOString()
        };

        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
        }
        progress.lastLesson = lessonId;
        progress.lastAccessedAt = new Date().toISOString();

        this.set(`progress_${courseSlug}`, progress);
    },

    isLessonComplete(courseSlug, lessonId) {
        const progress = this.getCourseProgress(courseSlug);
        return progress?.completedLessons?.includes(lessonId) || false;
    },

    getCompletedLessonsCount(courseSlug) {
        const progress = this.getCourseProgress(courseSlug);
        return progress?.completedLessons?.length || 0;
    },

    async getCourseProgressPercent(courseSlug) {
        const progress = this.getCourseProgress(courseSlug);
        if (!progress) return 0;

        const course = await Data.getCourse(courseSlug);
        if (!course) return 0;

        const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        if (totalLessons === 0) return 0;

        return Math.round((progress.completedLessons.length / totalLessons) * 100);
    },

    resetCourseProgress(courseSlug) {
        this.set(`progress_${courseSlug}`, {
            completedLessons: [],
            lastLesson: null,
            startedAt: new Date().toISOString()
        });
    },

    // Reflection notes
    getReflection(courseSlug, lessonId) {
        return this.get(`reflection_${courseSlug}_${lessonId}`) || '';
    },

    setReflection(courseSlug, lessonId, text) {
        this.set(`reflection_${courseSlug}_${lessonId}`, text);
    },

    // Checklist state
    getChecklistState(courseSlug, lessonId) {
        return this.get(`checklist_${courseSlug}_${lessonId}`) || [];
    },

    toggleChecklistItem(courseSlug, lessonId, itemIndex) {
        const state = this.getChecklistState(courseSlug, lessonId);
        const idx = state.indexOf(itemIndex);
        if (idx >= 0) {
            state.splice(idx, 1);
        } else {
            state.push(itemIndex);
        }
        this.set(`checklist_${courseSlug}_${lessonId}`, state);
        return state;
    },

    // Quiz answers
    getQuizAnswer(courseSlug, lessonId, quizIndex) {
        return this.get(`quiz_${courseSlug}_${lessonId}_${quizIndex}`);
    },

    setQuizAnswer(courseSlug, lessonId, quizIndex, answer) {
        this.set(`quiz_${courseSlug}_${lessonId}_${quizIndex}`, answer);
    },

    // User mock
    getUser() {
        return this.get('user');
    },

    setUser(user) {
        this.set('user', user);
    },

    logout() {
        this.remove('user');
    },

    isLoggedIn() {
        return !!this.getUser();
    }
};

// Export for use in other modules
window.Storage = Storage;

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
});
