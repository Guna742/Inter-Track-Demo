/**
 * InternTrack — Dashboard Logic
 * Role-aware render, animated counters, sidebar, toasts.
 */

'use strict';

(() => {
  // Guard: require any authenticated user
  const session = Auth.requireAuth();
  if (!session) return;

  const isAdmin = session.role === 'admin';

  // ── DOM refs ──
  const sidebarNav = document.getElementById('sidebar-nav');
  const userAvatarSb = document.getElementById('user-avatar-sidebar');
  const userNameSb = document.getElementById('user-name-sidebar');
  const userRoleSb = document.getElementById('user-role-sidebar');
  const statsGrid = document.getElementById('stats-grid');
  const quickActions = document.getElementById('quick-actions');
  const recentProjList = document.getElementById('recent-projects-list');
  const welcomeTitle = document.getElementById('welcome-title');
  const welcomeSub = document.getElementById('welcome-sub');
  const roleBanner = document.getElementById('role-banner');
  const roleBadgeMain = document.getElementById('role-badge-main');
  const topbarRoleBadge = document.getElementById('topbar-role-badge');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const appSidebar = document.getElementById('app-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const logoutBtn = document.getElementById('logout-btn');

  // ── Populate user info ──
  userAvatarSb.textContent = session.displayName[0].toUpperCase();
  userNameSb.textContent = session.displayName;
  userRoleSb.textContent = isAdmin ? 'Administrator' : 'Intern';

  // Role banner
  welcomeTitle.textContent = `Welcome back, ${session.displayName}!`;
  welcomeSub.textContent = isAdmin
    ? 'You have full admin access. Build profiles and manage projects.'
    : 'Browse your profile and explore projects in your workspace.';
  roleBanner.classList.add(session.role);

  const roleBadgeClass = isAdmin ? 'badge-admin' : 'badge-user';
  [roleBadgeMain, topbarRoleBadge].forEach(el => {
    el.textContent = isAdmin ? 'Admin' : 'Intern';
    el.className = `badge ${roleBadgeClass}`;
  });

  // ── Build Sidebar Nav ──
  const NAV_COMMON = [
    { label: 'Dashboard', href: 'dashboard.html', icon: '⊞', active: true },
    { label: 'My Profile', href: 'profile-view.html', icon: '👤' },
    { label: 'Projects', href: 'projects.html', icon: '🗂️' },
  ];
  const NAV_ADMIN = [
    { label: 'Profile Builder', href: 'profile-builder.html', icon: '✏️' },
    { label: 'Students', href: 'students.html', icon: '🎓' },
  ];

  const navItems = isAdmin
    ? [...NAV_COMMON.filter(item => item.label !== 'My Profile'), ...NAV_ADMIN]
    : NAV_COMMON;

  let navHTML = `<div class="nav-section-label">Menu</div>`;
  navItems.forEach(item => {
    navHTML += `
      <a class="nav-item${item.active ? ' active' : ''}" href="${item.href}" aria-current="${item.active ? 'page' : 'false'}">
        <span class="nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${item.label}</span>
      </a>`;
  });
  sidebarNav.innerHTML = navHTML;

  // ── Stats ──
  const projects = Storage.getProjects();
  const profile = Storage.getProfile(session.userId) || { skills: [] };

  const STATS_ADMIN = [
    { label: 'Total Projects', value: projects.length, icon: '🗂️', color: 'accent', trend: '+2 this week' },
    { label: 'Interns', value: Object.keys(Storage.getProfiles()).length, icon: '👥', color: 'cyan', trend: 'Active' },
    { label: 'Avg Skills', value: 8, icon: '⚡', color: 'violet', trend: 'Growing' },
    { label: 'Completion', value: 87, suffix: '%', icon: '✅', color: 'success', trend: '+5% week' },
  ];
  const STATS_USER = [
    { label: 'My Projects', value: projects.length, icon: '🗂️', color: 'accent', trend: 'Active' },
    { label: 'Skills', value: profile.skills.length, icon: '⚡', color: 'cyan', trend: 'Listed' },
    { label: 'Internship', value: 1, icon: '🏢', color: 'violet', trend: 'In progress' },
    { label: 'Days Left', value: 42, icon: '📅', color: 'success', trend: 'On track' },
  ];

  const stats = isAdmin ? STATS_ADMIN : STATS_USER;

  statsGrid.innerHTML = stats.map((s, i) => `
    <div class="stat-card c-${s.color} anim-fadeInUp anim-d${i + 1}" role="figure" aria-label="${s.label}: ${s.value}${s.suffix || ''}">
      <div class="stat-icon c-${s.color}" aria-hidden="true">${s.icon}</div>
      <div class="stat-value">
        <span class="counter-num" data-target="${s.value}">0</span>
        ${s.suffix ? `<span class="stat-suffix">${s.suffix}</span>` : ''}
      </div>
      <div class="stat-label">${s.label}</div>
      <span class="stat-trend">${s.trend}</span>
    </div>
  `).join('');

  // Animated counters
  document.querySelectorAll('.counter-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const start = performance.now();
    const step = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 300 + Math.random() * 200);
  });

  // ── Quick Actions ──
  const ACTIONS_ADMIN = [
    { label: 'Profile Builder', desc: 'Edit intern profile', href: 'profile-builder.html', icon: '✏️', color: 'rgba(79,124,255,.12)' },
    { label: 'All Projects', desc: 'Browse showcase', href: 'projects.html', icon: '🗂️', color: 'rgba(168,85,247,.08)' },
    { label: 'Students', desc: 'View intern details', href: 'students.html', icon: '🎓', color: 'rgba(34,211,238,.1)' },
  ];
  const ACTIONS_USER = [
    { label: 'My Profile', desc: 'View your portfolio', href: 'profile-view.html', icon: '👤', color: 'rgba(34,211,238,.08)' },
    { label: 'Projects', desc: 'Browse all projects', href: 'projects.html', icon: '🗂️', color: 'rgba(79,124,255,.12)' },
  ];

  const actions = isAdmin ? ACTIONS_ADMIN : ACTIONS_USER;
  quickActions.innerHTML = actions.map(a => `
    <a class="action-tile" href="${a.href}" aria-label="${a.label} — ${a.desc}">
      <div class="action-icon" style="background:${a.color}" aria-hidden="true">${a.icon}</div>
      <div class="action-label">${a.label}</div>
      <div class="action-desc">${a.desc}</div>
      <svg class="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  `).join('');

  // ── Recent Projects ──
  const recent = projects.slice(0, 4);
  if (recent.length === 0) {
    recentProjList.innerHTML = `<p class="text-muted text-sm" style="padding:var(--sp-4) 0">No projects yet.</p>`;
  } else {
    recentProjList.innerHTML = recent.map(p => `
      <div class="proj-item">
        <div class="proj-thumb" aria-hidden="true">
          ${p.screenshot
        ? `<img src="${p.screenshot}" alt="${p.title} thumbnail">`
        : p.title[0]}
        </div>
        <div class="proj-info">
          <div class="proj-name">${p.title}</div>
          <div class="proj-tech">${(p.techStack || []).slice(0, 3).join(' · ')}</div>
        </div>
        ${p.liveLink ? `<a class="proj-link" href="${p.liveLink}" target="_blank" rel="noopener" aria-label="Live demo for ${p.title}">Live ↗</a>` : ''}
      </div>
    `).join('');
  }

  // ── Sidebar toggle (mobile) ──
  function openSidebar() {
    appSidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    appSidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  hamburgerBtn.addEventListener('click', () => {
    appSidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  // ── Logout ──
  logoutBtn.addEventListener('click', () => Auth.logout());

})();
