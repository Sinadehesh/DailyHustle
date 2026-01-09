// ============================================
// DAILY HUSTLE - Data Layer
// ============================================

const Data = {
    cache: {},

    async load(file) {
        if (this.cache[file]) {
            return this.cache[file];
        }

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

    async getCourses() {
        return await this.load('courses.json') || [];
    },

    async getCourse(slug) {
        const courses = await this.getCourses();
        return courses.find(c => c.slug === slug) || null;
    },

    async getFeaturedCourses() {
        const courses = await this.getCourses();
        return courses.filter(c => c.featured);
    },

    async getPopularCourses() {
        const courses = await this.getCourses();
        return courses.filter(c => c.popular);
    },

    async filterCourses({ category, level, price, format, search, sort } = {}) {
        let courses = await this.getCourses();

        if (category && category !== 'all') {
            courses = courses.filter(c => c.category === category);
        }

        if (level && level !== 'all') {
            courses = courses.filter(c => c.level === level);
        }

        if (price && price !== 'all') {
            if (price === 'free') {
                courses = courses.filter(c => c.price === 0);
            } else if (price === 'paid') {
                courses = courses.filter(c => c.price > 0);
            }
        }

        if (format && format !== 'all') {
            courses = courses.filter(c => c.format === format);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            courses = courses.filter(c =>
                c.title.toLowerCase().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.tags.some(t => t.toLowerCase().includes(searchLower))
            );
        }

        // Sort
        switch (sort) {
            case 'popular':
                courses.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'newest':
                // Assume id order is newest first for demo
                break;
            case 'highest_rated':
                courses.sort((a, b) => b.rating - a.rating);
                break;
            case 'shortest':
                courses.sort((a, b) => a.durationDays - b.durationDays);
                break;
            default:
                // Default: featured first, then popular
                courses.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return b.reviewCount - a.reviewCount;
                });
        }

        return courses;
    },

    async getLesson(courseSlug, lessonId) {
        const course = await this.getCourse(courseSlug);
        if (!course) return null;

        for (const module of course.modules) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) {
                return {
                    ...lesson,
                    module: {
                        id: module.id,
                        title: module.title
                    },
                    course: {
                        slug: course.slug,
                        title: course.title
                    }
                };
            }
        }
        return null;
    },

    async getAdjacentLessons(courseSlug, currentLessonId) {
        const course = await this.getCourse(courseSlug);
        if (!course) return { prev: null, next: null };

        const allLessons = [];
        course.modules.forEach(m => {
            m.lessons.forEach(l => {
                allLessons.push({ ...l, moduleId: m.id, moduleTitle: m.title });
            });
        });

        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);

        return {
            prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
        };
    },

    async getBlogPosts() {
        return await this.load('blog.json') || [];
    },

    async getTestimonials() {
        return await this.load('testimonials.json') || [];
    },

    async getRelatedCourses(courseSlug, limit = 3) {
        const course = await this.getCourse(courseSlug);
        if (!course) return [];

        const courses = await this.getCourses();

        // Find courses with shared tags
        return courses
            .filter(c => c.slug !== courseSlug)
            .map(c => ({
                ...c,
                sharedTags: c.tags.filter(t => course.tags.includes(t)).length
            }))
            .sort((a, b) => b.sharedTags - a.sharedTags)
            .slice(0, limit);
    },

    // Compute stats for trust bar
    async getStats() {
        const courses = await this.getCourses();

        const totalCourses = courses.length;
        const totalLearners = courses.reduce((sum, c) => sum + (c.reviewCount * 3), 0); // Estimate
        const totalHours = courses.reduce((sum, c) => {
            const lessonCount = c.modules.reduce((s, m) => s + m.lessons.length, 0);
            return sum + Math.ceil((lessonCount * c.minutesPerDay) / 60);
        }, 0);

        return {
            courses: totalCourses,
            learners: totalLearners,
            hours: totalHours
        };
    },

    // Get all unique categories
    async getCategories() {
        const courses = await this.getCourses();
        const categories = new Set(courses.map(c => c.category));
        return Array.from(categories);
    }
};

// Export for use in other modules
window.Data = Data;
