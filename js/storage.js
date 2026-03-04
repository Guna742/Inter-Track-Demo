/**
 * InternTrack — Storage Module
 * LocalStorage CRUD helpers + default seed data.
 */

'use strict';

const Storage = (() => {
    const PROFILES_KEY = 'interntrack_profiles';
    const PROJECTS_KEY = 'interntrack_projects';

    // ── Default seed data (loaded on first run) ──
    const DEFAULT_PROFILES = {
        'u_intern1': {
            userId: 'u_intern1',
            name: 'Jordan Lee',
            email: 'jordan01@interntrack.com',
            tagline: 'Full-Stack Intern | Building tomorrow\'s products today',
            bio: 'Passionate software engineering intern with a knack for clean UI and scalable systems. Currently exploring the intersection of design and engineering through hands-on internship experience.',
            avatar: '',
            location: 'San Francisco, CA',
            skills: ['JavaScript', 'HTML/CSS', 'Node.js', 'React', 'Git', 'Figma', 'REST APIs', 'SQL'],
            internship: {
                company: 'TechVentures Inc.',
                role: 'Frontend Engineering Intern',
                startDate: '2025-06-01',
                endDate: '2025-12-01',
                description: 'Developed and maintained client-facing web applications, collaborated with senior engineers on the design system.',
                technologies: ['React', 'TypeScript', 'Figma', 'REST APIs'],
            },
            socialLinks: {
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
            }
        },
        'u_intern2': {
            userId: 'u_intern2',
            name: 'Casey Rivera',
            email: 'intern02@interntrack.com',
            tagline: 'UI/UX Design Intern | Crafting human-centric digital experiences',
            bio: 'Aspiring product designer focusing on accessible and intuitive interfaces. Bridging the gap between user needs and technical feasibility.',
            avatar: '',
            location: 'Austin, TX',
            skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research', 'Prototyping', 'HTML', 'CSS'],
            internship: {
                company: 'CreativePulse Studios',
                role: 'UI/UX Design Intern',
                startDate: '2025-07-15',
                endDate: '2026-01-15',
                description: 'Assisted in redesigning the core mobile experience, conducted user testing sessions, and created a comprehensive UI kit.',
                technologies: ['Figma', 'Prototyping'],
            },
            socialLinks: {
                github: '',
                linkedin: 'https://linkedin.com',
            }
        }
    };

    const DEFAULT_PROJECTS = [
        {
            id: 'proj_1',
            title: 'InternTrack Platform',
            description: 'A role-based SaaS internship management portal built with pure HTML, CSS, and Vanilla JavaScript. Features glassmorphism UI, LocalStorage persistence, and full role-based access control.',
            techStack: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage'],
            githubLink: 'https://github.com',
            liveLink: 'https://interntrack.demo',
            screenshot: '',
            ownerId: 'u_intern1',
            ownerName: 'Jordan Lee',
            createdAt: Date.now() - 86400000 * 5,
        },
        {
            id: 'proj_2',
            title: 'Dev Portfolio Generator',
            description: 'A no-code portfolio builder that generates responsive HTML/CSS portfolios from a simple JSON config. Auto-deploys to GitHub Pages with one click.',
            techStack: ['Node.js', 'JSON', 'GitHub Actions', 'CSS'],
            githubLink: 'https://github.com',
            liveLink: '',
            screenshot: '',
            ownerId: 'u_intern1',
            ownerName: 'Jordan Lee',
            createdAt: Date.now() - 86400000 * 2,
        },
        {
            id: 'proj_3',
            title: 'Real-Time Chat App',
            description: 'WebSocket-based real-time messaging application with room support, username auth, typing indicators, and message history. Built from scratch with no frameworks.',
            techStack: ['WebSockets', 'Node.js', 'HTML', 'CSS'],
            githubLink: 'https://github.com',
            liveLink: '',
            screenshot: '',
            ownerId: 'u_intern2',
            ownerName: 'Casey Rivera',
            createdAt: Date.now() - 86400000 * 1,
        },
    ];

    const VERSION_KEY = 'interntrack_v';
    const CURRENT_VERSION = '2.1';

    /** Bootstrap default data on first run; clears stale data from old builds. */
    function seed() {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion !== CURRENT_VERSION) {
            localStorage.removeItem(PROFILES_KEY);
            localStorage.removeItem(PROJECTS_KEY);
            Object.keys(localStorage)
                .filter(k => k.startsWith('interntrack_') && k !== VERSION_KEY)
                .forEach(k => localStorage.removeItem(k));
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        }
        if (!localStorage.getItem(PROFILES_KEY)) {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
        }
        if (!localStorage.getItem(PROJECTS_KEY)) {
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
        }
    }

    // ── Profiles ──
    function getProfiles() {
        try {
            const raw = localStorage.getItem(PROFILES_KEY);
            return raw ? JSON.parse(raw) : DEFAULT_PROFILES;
        } catch { return DEFAULT_PROFILES; }
    }

    function getProfile(userId) {
        if (!userId) {
            const session = Auth.getSession();
            userId = session ? session.userId : null;
        }
        if (!userId) return null;
        const profiles = getProfiles();
        return profiles[userId] || null;
    }

    function saveProfile(userId, data) {
        const profiles = getProfiles();
        profiles[userId] = { ...data, userId };
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }

    // ── Projects ──
    function getProjects() {
        try {
            const raw = localStorage.getItem(PROJECTS_KEY);
            const projects = raw ? JSON.parse(raw) : DEFAULT_PROJECTS;
            return projects.sort((a, b) => b.createdAt - a.createdAt);
        } catch { return DEFAULT_PROJECTS; }
    }

    function saveProject(project) {
        const projects = getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx > -1) {
            projects[idx] = project; // update
        } else {
            project.id = 'proj_' + Date.now();
            project.createdAt = Date.now();
            projects.unshift(project); // add to front
        }
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return project;
    }

    function deleteProject(id) {
        const projects = getProjects().filter(p => p.id !== id);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }

    function getProjectById(id) {
        return getProjects().find(p => p.id === id) || null;
    }

    return { seed, getProfiles, getProfile, saveProfile, getProjects, saveProject, deleteProject, getProjectById };
})();

// Auto-seed on load
Storage.seed();
