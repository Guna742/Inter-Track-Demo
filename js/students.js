/**
 * InternTrack — Students Page Logic
 * Shows all intern student cards with expandable details.
 */

'use strict';

(() => {
  // Guard: admin only
  const session = Auth.requireAuth();
  if (!session) return;

  if (session.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  // ── DOM refs ──
  const sidebarNav = document.getElementById('sidebar-nav');
  const userAvatarSb = document.getElementById('user-avatar-sidebar');
  const userNameSb = document.getElementById('user-name-sidebar');
  const userRoleSb = document.getElementById('user-role-sidebar');
  const welcome = document.getElementById('welcome-title');
  const welcomeSub = document.getElementById('welcome-sub');
  const roleBanner = document.getElementById('role-banner');
  const roleBadgeMain = document.getElementById('role-badge-main');
  const topbarRoleBadge = document.getElementById('topbar-role-badge');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const appSidebar = document.getElementById('app-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const logoutBtn = document.getElementById('logout-btn');
  const studentsContainer = document.getElementById('students-container');
  const studentsCountEl = document.getElementById('students-count');

  // ── User info ──
  userAvatarSb.textContent = session.displayName[0].toUpperCase();
  userNameSb.textContent = session.displayName;
  userRoleSb.textContent = 'Administrator';

  welcome.textContent = `Students Overview`;
  welcomeSub.textContent = 'Review intern profiles, progress, and project contributions.';
  roleBanner.classList.add('admin');

  ['badge-admin', 'badge-user'].forEach(c => {
    roleBadgeMain.classList.remove(c);
    topbarRoleBadge.classList.remove(c);
  });
  roleBadgeMain.textContent = 'Admin';
  roleBadgeMain.className = 'badge badge-admin';
  topbarRoleBadge.textContent = 'Admin';
  topbarRoleBadge.className = 'badge badge-admin';

  // ── Sidebar nav ──
  const NAV = [
    { label: 'Dashboard', href: 'dashboard.html', icon: '⊞' },
    { label: 'Projects', href: 'projects.html', icon: '🗂️' },
    { label: 'Profile Builder', href: 'profile-builder.html', icon: '✏️' },
    { label: 'Students', href: 'students.html', icon: '🎓', active: true },
  ];

  let navHTML = `<div class="nav-section-label">Menu</div>`;
  NAV.forEach(item => {
    navHTML += `
      <a class="nav-item${item.active ? ' active' : ''}" href="${item.href}" aria-current="${item.active ? 'page' : 'false'}">
        <span class="nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${item.label}</span>
      </a>`;
  });
  sidebarNav.innerHTML = navHTML;

  // ── Load data ──
  const profiles = Storage.getProfiles();
  const allProjects = Storage.getProjects();
  const profileList = Object.values(profiles);

  studentsCountEl.textContent = `${profileList.length} intern${profileList.length !== 1 ? 's' : ''}`;

  // ── Helpers ──
  function computeScore(profile) {
    let score = 50;
    if (profile.skills && profile.skills.length) score += Math.min(profile.skills.length * 3, 20);
    if (profile.bio && profile.bio.length > 40) score += 10;
    if (profile.internship && profile.internship.company) score += 10;
    if (profile.avatar) score += 5;
    if (profile.socialLinks) {
      if (profile.socialLinks.github) score += 2;
      if (profile.socialLinks.linkedin) score += 3;
    }
    return Math.min(score, 100);
  }

  function computeRating(score) {
    return (score / 20).toFixed(1);
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3 && rating - full < 0.8;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    return [
      ...Array(full).fill('<span class="star filled">★</span>'),
      ...(hasHalf ? ['<span class="star half">★</span>'] : []),
      ...Array(empty).fill('<span class="star empty">☆</span>'),
    ].join('');
  }

  function getProjectsForStudent(profile) {
    // Projects don't have userId tied, so show all (demo data).
    // In a real app you'd filter by userId.
    return allProjects.slice(0, 3);
  }

  function getProgress(profile) {
    let filled = 0;
    const fields = ['name', 'email', 'tagline', 'bio', 'location', 'avatar'];
    fields.forEach(f => { if (profile[f]) filled++; });
    if (profile.skills && profile.skills.length > 0) filled++;
    if (profile.internship && profile.internship.company) filled++;
    if (profile.socialLinks && (profile.socialLinks.github || profile.socialLinks.linkedin)) filled++;
    return Math.round((filled / (fields.length + 3)) * 100);
  }

  // ── Render cards ──
  if (profileList.length === 0) {
    studentsContainer.innerHTML = `
      <div class="students-empty">
        <div class="students-empty-icon">🎓</div>
        <p>No student profiles found. Use Profile Builder to create one.</p>
      </div>`;
  } else {
    studentsContainer.innerHTML = profileList.map((profile, i) => {
      const score = computeScore(profile);
      const rating = computeRating(score);
      const progress = getProgress(profile);
      const projects = getProjectsForStudent(profile);
      const scoreDeg = Math.round((score / 100) * 360);
      const initial = (profile.name || profile.userId || '?')[0].toUpperCase();

      const hasPic = !!profile.avatar;

      return `
        <div class="student-card anim-fadeInUp" style="animation-delay: ${i * 80}ms" id="card-${profile.userId}" data-uid="${profile.userId}">
          <!-- Summary row -->
          <div class="student-summary" role="button" tabindex="0" aria-expanded="false" aria-controls="details-${profile.userId}"
               onclick="toggleCard('${profile.userId}')">

            <!-- Avatar -->
            <div class="student-avatar" aria-hidden="true">
              ${hasPic
          ? `<img src="${profile.avatar}" alt="${profile.name || 'Student'} avatar">`
          : `<span class="student-avatar-initials">${initial}</span>`}
            </div>

            <!-- Name + role -->
            <div class="student-identity">
              <div class="student-name">${profile.name || 'Unnamed Intern'}</div>
              <div class="student-role-tag">${profile.internship?.role || 'Intern'} ${profile.internship?.company ? '@ ' + profile.internship.company : ''}</div>
            </div>

            <!-- Star Rating -->
            <div class="student-rating" aria-label="Rating ${rating} out of 5">
              <div class="stars">${renderStars(parseFloat(rating))}</div>
              <span class="rating-value">${rating}</span>
            </div>

            <!-- Score ring -->
            <div class="student-score" aria-label="Overall score ${score}">
              <div class="score-ring" style="--score-deg: ${scoreDeg}deg">
                <span class="score-num">${score}%</span>
              </div>
            </div>

            <!-- Expand arrow -->
            <button class="expand-btn" aria-label="Expand student details" tabindex="-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <!-- Expanded details panel -->
          <div class="student-details" id="details-${profile.userId}" aria-hidden="true">
            <div class="student-details-inner">
              <div class="student-details-body">

                <!-- Left: Profile info + Progress -->
                <div class="detail-section">
                  <div class="detail-section-title">Profile Info</div>
                  <div class="meta-badges-vertical">
                    ${profile.location ? `
                    <div class="hero-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      ${profile.location}
                    </div>` : ''}
                    ${profile.email ? `
                    <div class="hero-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      ${profile.email}
                    </div>` : ''}
                    ${profile.socialLinks?.github ? `
                    <a class="hero-meta-item" href="${profile.socialLinks.github}" target="_blank" rel="noopener">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub Profile
                    </a>` : ''}
                    ${profile.socialLinks?.linkedin ? `
                    <a class="hero-meta-item" href="${profile.socialLinks.linkedin}" target="_blank" rel="noopener">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn Profile
                    </a>` : ''}
                  </div>

                  <!-- Profile progress -->
                  <div class="progress-wrap">
                    <div class="progress-label">
                      <span>Profile Completion</span>
                      <span>${progress}%</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-fill" style="width:${progress}%"></div>
                    </div>
                  </div>

                  <!-- Skills -->
                  ${profile.skills && profile.skills.length ? `
                  <div class="detail-section-title" style="margin-top:var(--sp-3)">Skills</div>
                  <div class="skills-chips">
                    ${profile.skills.map(s => `<span class="skill-chip">${s}</span>`).join('')}
                  </div>` : ''}
                </div>

                <!-- Right: Projects -->
                <div class="detail-section">
                  <div class="detail-section-title">Projects</div>
                  ${projects.length > 0 ? `
                  <div class="student-projects-list">
                    ${projects.map(p => `
                      <a class="student-proj-item student-proj-link" href="projects.html#${p.id}" aria-label="View project: ${p.title}">
                        <span class="student-proj-dot"></span>
                        <span class="student-proj-name">${p.title}</span>
                        <svg class="proj-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a>`).join('')}
                  </div>` : `<p class="text-muted text-xs" style="margin-top:var(--sp-2)">No projects yet.</p>`}

                  <!-- Overall score display -->
                  <div class="progress-wrap" style="margin-top:var(--sp-4)">
                    <div class="progress-label">
                      <span>Overall Score</span>
                      <span>${score}%</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-fill" style="width:${score}%"></div>
                    </div>
                  </div>

                  <!-- Task rating -->
                  <div class="detail-section-title" style="margin-top:var(--sp-4)">Task Rating</div>
                  <div class="detail-row">
                    <span class="detail-row-label">Rating</span>
                    <div class="student-rating">
                      <div class="stars">${renderStars(parseFloat(rating))}</div>
                      <span class="rating-value">${rating} / 5</span>
                    </div>
                  </div>
                </div>

                <!-- Edit Profile button -->
                <div class="detail-edit-row">
                  <a href="profile-builder.html?student=${profile.userId}"
                     class="btn btn-primary btn-sm edit-profile-btn"
                     aria-label="Edit profile for ${profile.name || 'this student'}">
                    ✏️ Edit Profile
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ── Toggle expand/collapse ──
  window.toggleCard = function (uid) {
    const card = document.getElementById(`card-${uid}`);
    const details = document.getElementById(`details-${uid}`);
    const summary = card.querySelector('.student-summary');

    const isExpanded = card.classList.contains('expanded');
    card.classList.toggle('expanded', !isExpanded);
    summary.setAttribute('aria-expanded', String(!isExpanded));
    details.setAttribute('aria-hidden', String(isExpanded));
  };

  // Keyboard support
  document.querySelectorAll('.student-summary').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // ── Sidebar toggle ──
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
