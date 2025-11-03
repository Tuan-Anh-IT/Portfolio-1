// Portfolio App JavaScript
// Fetch data from Flask API and handle UI interactions

// Global state
let portfolioData = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    // Set current year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
    
    // Load portfolio data
    await loadPortfolioData();
    
    // Initialize UI components
    initSlider();
    initSkillsTabs();
    initCertificationsTabs();
    initTypewriter();
    initContactForm();
    initStarfield();
    
    // Setup avatar image handler
    setupAvatar();
}

// Load portfolio data from Flask API
async function loadPortfolioData() {
    try {
        const response = await fetch('/api/portfolio/');
        if (!response.ok) {
            throw new Error('Failed to load portfolio data');
        }
        portfolioData = await response.json();
        
        // Render data to UI
        renderPortfolioData();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Show error message or use default data
    }
}

// Render portfolio data to UI
function renderPortfolioData() {
    if (!portfolioData) return;
    
    // Render profile
    if (portfolioData.profile) {
        const profile = portfolioData.profile;
        if (profile.user && profile.user.first_name) {
            const nameEl = document.getElementById('profileName');
            if (nameEl) {
                nameEl.textContent = `${profile.user.first_name} ${profile.user.last_name || ''}`.trim();
            }
        }
        
        if (profile.avatar) {
            const avatarImg = document.getElementById('avatarImg');
            if (avatarImg) {
                avatarImg.src = profile.avatar;
            }
        }
        
        // Update bio only if aboutText is empty or has minimal content
        // This preserves the default HTML content with career goals
        if (profile.bio) {
            const aboutText = document.getElementById('aboutText');
            if (aboutText) {
                const existingContent = aboutText.innerHTML.trim();
                // Only update if aboutText is empty or only has placeholder content
                // Otherwise preserve the default HTML content with career goals
                if (!existingContent || existingContent.length < 50) {
                    // Preserve career goals section if it exists
                    const careerGoalsMatch = existingContent.match(/<div class="career-goals"[^>]*>[\s\S]*?<\/div>/);
                    const careerGoalsSection = careerGoalsMatch ? careerGoalsMatch[0] : '';
                    
                    // Set bio and preserve career goals if they exist
                    aboutText.innerHTML = `<p>${profile.bio}</p>${careerGoalsSection}`;
                }
                // If existingContent is already populated with default HTML, keep it
            }
        }
    }
    
    // Render skills (always render, even if empty array to clear defaults)
    if (portfolioData.skills) {
        renderSkills(portfolioData.skills);
    }
    
    // Render projects
    if (portfolioData.projects && portfolioData.projects.length > 0) {
        renderProjects(portfolioData.projects);
    }
    
    // Render experiences
    if (portfolioData.experiences) {
        renderExperiences(portfolioData.experiences);
    }
    
    // Render education
    if (portfolioData.education) {
        renderEducation(portfolioData.education);
    }
    
    // Render certifications
    if (portfolioData.certifications) {
        renderCertifications(portfolioData.certifications);
    }
    
    // Render achievements
    if (portfolioData.achievements) {
        renderAchievements(portfolioData.achievements);
    }
    
    // Render blog posts
    if (portfolioData.blog_posts) {
        renderBlogPosts(portfolioData.blog_posts);
    }
}

// Render skills
function renderSkills(skills) {
    const techContainer = document.getElementById('skills-tech');
    const toolsContainer = document.getElementById('skills-tools');
    
    if (!techContainer || !toolsContainer) return;
    
    // Keep default skills, only add API skills that don't already exist
    if (skills && skills.length > 0) {
        // Get existing skill names to avoid duplicates
        const existingTechNames = Array.from(techContainer.querySelectorAll('.tech-card')).map(card => card.textContent.trim());
        const existingToolNames = Array.from(toolsContainer.querySelectorAll('.tech-card')).map(card => card.textContent.trim());
        
        // Add API skills that don't already exist
        skills.forEach(skill => {
            const skillName = skill.name.trim();
            const isTech = skill.skill_type === 'tech';
            const existingNames = isTech ? existingTechNames : existingToolNames;
            const container = isTech ? techContainer : toolsContainer;
            
            // Only add if not already exists
            if (!existingNames.includes(skillName)) {
                const skillCard = createSkillCard(skill);
                container.appendChild(skillCard);
                
                // Update existing names list
                if (isTech) {
                    existingTechNames.push(skillName);
                } else {
                    existingToolNames.push(skillName);
                }
            }
        });
        
        console.log(`Added ${skills.length} skills from API (duplicates skipped)`);
    } else {
        console.log('No skills found in API data, using default skills');
    }
    
    // Update header skills bars
    if (skills && skills.length > 0) {
        updateHeaderSkills(skills);
    }
}

// Create skill card element
function createSkillCard(skill) {
    const card = document.createElement('div');
    card.className = 'tech-card';
    card.dataset.skillId = skill.id; // Mark as API-loaded card
    
    // Get logo URL based on skill name
    const logoUrl = getSkillLogo(skill.name, skill.icon);
    
    card.innerHTML = `
        <span class="tech-logo">
            <img src="${logoUrl}" alt="${skill.name}" onerror="this.parentElement.innerHTML='${skill.icon || '⚡'}'">
        </span>
        <span>${skill.name}</span>
    `;
    
    return card;
}

// Get logo URL for skills
function getSkillLogo(skillName, customIcon) {
    if (customIcon && customIcon.startsWith('http')) {
        return customIcon;
    }
    
    const skillLogos = {
        // Tech Stack
        'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        'Flask': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
        'HTML5': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        'CSS3': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
        'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
        'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        'Vue': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
        'Django': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
        'SQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
        'SQLAlchemy': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
        'Web Security': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/owasp.svg',
        'Cloud Security': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
        'Penetration Testing': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hackthebox.svg',
        // Tools
        'Nmap': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nmap.svg',
        'Wireshark': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/wireshark.svg',
        'Metasploit': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/metasploit.svg',
        'Kali Linux': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kalilinux.svg',
        'Grafana': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grafana.svg',
        'Burp Suite': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/burpsuite.svg',
        'Burp': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/burpsuite.svg',
        'Git': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
        'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
        'AWS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
        'Jenkins': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/jenkins.svg',
    };
    
    // Try exact match first
    if (skillLogos[skillName]) {
        return skillLogos[skillName];
    }
    
    // Try case-insensitive match
    const lowerName = skillName.toLowerCase();
    for (const [key, url] of Object.entries(skillLogos)) {
        if (key.toLowerCase() === lowerName) {
            return url;
        }
    }
    
    // Try simple-icons for common tools
    const simpleIconName = skillName.toLowerCase().replace(/\s+/g, '');
    return `https://simpleicons.org/icons/${simpleIconName}.svg`;
}

// Update header skills bars
function updateHeaderSkills(skills) {
    const headerSkills = document.getElementById('headerSkills');
    if (!headerSkills || !skills.length) return;
    
    // Take top 3 skills by proficiency
    const topSkills = skills
        .sort((a, b) => b.proficiency - a.proficiency)
        .slice(0, 3);
    
    if (topSkills.length > 0) {
        headerSkills.innerHTML = topSkills.map(skill => `
            <div class="skill">
                <span>${skill.name}</span>
                <div class="bar" data-progress="${skill.proficiency}"></div>
            </div>
        `).join('');
        
        // Update CSS for progress bars
        topSkills.forEach(skill => {
            const style = document.createElement('style');
            style.textContent = `
                .skill .bar[data-progress="${skill.proficiency}"]::after {
                    width: ${skill.proficiency}%;
                }
            `;
            document.head.appendChild(style);
        });
    }
}

// Render projects
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    // Only clear if we have API data, otherwise keep defaults
    if (projects && projects.length > 0) {
        // Remove default placeholder projects
        const existingProjects = projectsGrid.querySelectorAll('.project-card');
        existingProjects.forEach(card => {
            // Only remove if it doesn't have data attributes (default cards)
            if (!card.dataset.projectId) {
                card.remove();
            }
        });
        
        // Add API projects
        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.projectId = project.id; // Mark as API-loaded card
    
    const imageHtml = project.image 
        ? `<img src="${project.image}" alt="${project.title} preview" onerror="this.src='https://via.placeholder.com/400x200?text=${encodeURIComponent(project.title)}'">`
        : `<div class="project-placeholder"><span>📁</span></div>`;
    
    const technologies = project.technologies || [];
    const tagsHtml = technologies.map(tech => 
        `<span>${tech.name}</span>`
    ).join('');
    
    const actionsHtml = `
        ${project.url ? `<a class="btn small primary" href="${project.url}" target="_blank" rel="noopener noreferrer">Xem dự án</a>` : ''}
        ${project.github_url ? `<a class="btn small" href="${project.github_url}" target="_blank" rel="noopener noreferrer">Code</a>` : ''}
    `;
    
    card.innerHTML = `
        <div class="media" role="img" aria-label="${project.title}">
            ${imageHtml}
        </div>
        <div class="body">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            ${technologies.length > 0 ? `<div class="tags">${tagsHtml}</div>` : ''}
            <div class="project-actions">
                ${actionsHtml}
            </div>
        </div>
    `;
    
    return card;
}

// Render experiences (timeline)
function renderExperiences(experiences) {
    const timelineContainer = document.getElementById('experienceTimeline');
    if (!timelineContainer) return;
    
    if (!experiences || experiences.length === 0) {
        timelineContainer.innerHTML = '<div class="empty-message">Chưa có kinh nghiệm được thêm vào.</div>';
        return;
    }
    
    timelineContainer.innerHTML = '';
    
    experiences.forEach(exp => {
        const timelineItem = createExperienceItem(exp);
        timelineContainer.appendChild(timelineItem);
    });
}

// Create experience timeline item
function createExperienceItem(exp) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    
    const startDate = exp.start_date ? new Date(exp.start_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '';
    const endDate = exp.current 
        ? 'Hiện tại' 
        : (exp.end_date ? new Date(exp.end_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '');
    const dateRange = `${startDate} - ${endDate}`;
    
    const skillsHtml = exp.skills_used && exp.skills_used.length > 0
        ? `<div class="timeline-skills">${exp.skills_used.map(skill => `<span>${skill.name}</span>`).join('')}</div>`
        : '';
    
    item.innerHTML = `
        <div class="timeline-date">${dateRange}</div>
        <div class="timeline-title">${exp.title}</div>
        <div class="timeline-company">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
        <div class="timeline-description">${exp.description}</div>
        ${skillsHtml}
    `;
    
    return item;
}

// Render education
function renderEducation(education) {
    // Render to certifications tab
    const educationCertTab = document.getElementById('education-cert-tab');
    // Also check for old location (if exists)
    const educationContainer = document.getElementById('educationContainer');
    
    const targetContainer = educationCertTab || educationContainer;
    if (!targetContainer) return;
    
    if (!education || education.length === 0) {
        targetContainer.innerHTML = '<div class="empty-message">Chưa có thông tin học vấn được thêm vào.</div>';
        return;
    }
    
    targetContainer.innerHTML = '';
    
    education.forEach(edu => {
        const eduCard = createEducationCard(edu);
        targetContainer.appendChild(eduCard);
    });
}

// Create education card
function createEducationCard(edu) {
    const card = document.createElement('div');
    card.className = 'education-card';
    
    const startDate = edu.start_date ? new Date(edu.start_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '';
    const endDate = edu.current 
        ? 'Hiện tại' 
        : (edu.end_date ? new Date(edu.end_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '');
    const dateRange = `${startDate} - ${endDate}`;
    
    const gpaHtml = edu.gpa ? `<div class="edu-gpa">GPA: ${edu.gpa.toFixed(2)}</div>` : '';
    const descriptionHtml = edu.description ? `<div class="edu-description">${edu.description}</div>` : '';
    
    card.innerHTML = `
        <div class="edu-degree">${edu.degree}</div>
        <div class="edu-institution">${edu.institution}</div>
        <div class="edu-field">${edu.field_of_study}</div>
        <div class="edu-date">${dateRange}</div>
        ${gpaHtml}
        ${descriptionHtml}
    `;
    
    return card;
}

// Render certifications
function renderCertifications(certifications) {
    const certsList = document.getElementById('certifications-list');
    if (!certsList) return;
    
    if (!certifications || certifications.length === 0) {
        certsList.innerHTML = '<div class="empty-message">Chưa có chứng chỉ được thêm vào.</div>';
        return;
    }
    
    certsList.innerHTML = '';
    
    certifications.forEach(cert => {
        const certCard = createCertificationCard(cert);
        certsList.appendChild(certCard);
    });
}

// Create certification card
function createCertificationCard(cert) {
    const card = document.createElement('div');
    card.className = 'cert-card';
    
    const issueDate = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '';
    const expiryDate = cert.expiry_date 
        ? new Date(cert.expiry_date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })
        : 'Không hết hạn';
    const dateInfo = cert.expiry_date ? `Cấp: ${issueDate} • Hết hạn: ${expiryDate}` : `Cấp: ${issueDate}`;
    
    const imageHtml = cert.image 
        ? `<img src="${cert.image}" alt="${cert.name}" class="cert-image" onerror="this.style.display='none'">`
        : '';
    
    const credentialIdHtml = cert.credential_id 
        ? `<div class="cert-id">ID: ${cert.credential_id}</div>`
        : '';
    
    const credentialUrlHtml = cert.credential_url
        ? `<a href="${cert.credential_url}" target="_blank" rel="noopener noreferrer" class="btn small" style="margin-top: 10px;">Xem chứng chỉ</a>`
        : '';
    
    const descriptionHtml = cert.description 
        ? `<div class="cert-description">${cert.description}</div>`
        : '';
    
    card.innerHTML = `
        ${imageHtml}
        <div class="cert-name">${cert.name}</div>
        <div class="cert-issuer">${cert.issuer}</div>
        <div class="cert-date">${dateInfo}</div>
        ${credentialIdHtml}
        ${descriptionHtml}
        ${credentialUrlHtml}
    `;
    
    return card;
}

// Render achievements
function renderAchievements(achievements) {
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) return;
    
    if (!achievements || achievements.length === 0) {
        achievementsList.innerHTML = '<div class="empty-message">Chưa có thành tích được thêm vào.</div>';
        return;
    }
    
    achievementsList.innerHTML = '';
    
    achievements.forEach(ach => {
        const achCard = createAchievementCard(ach);
        achievementsList.appendChild(achCard);
    });
}

// Create achievement card
function createAchievementCard(ach) {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    
    const date = ach.date ? new Date(ach.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    
    const imageHtml = ach.image 
        ? `<img src="${ach.image}" alt="${ach.title}" class="achievement-image" onerror="this.style.display='none'">`
        : '';
    
    const orgHtml = ach.organization 
        ? `<div class="achievement-org">${ach.organization}</div>`
        : '';
    
    const urlHtml = ach.url
        ? `<a href="${ach.url}" target="_blank" rel="noopener noreferrer" class="btn small" style="margin-top: 10px;">Xem chi tiết</a>`
        : '';
    
    card.innerHTML = `
        ${imageHtml}
        <div class="achievement-title">${ach.title}</div>
        ${orgHtml}
        <div class="achievement-date">${date}</div>
        <div class="achievement-description">${ach.description}</div>
        ${urlHtml}
    `;
    
    return card;
}

// Render blog posts
function renderBlogPosts(posts) {
    const blogContent = document.getElementById('blogContent');
    if (!blogContent) return;
    
    if (!posts || posts.length === 0) {
        blogContent.innerHTML = '<p class="center" style="color:var(--muted)">Bài viết đang được cập nhật.</p>';
        return;
    }
    
    blogContent.innerHTML = '';
    
    posts.forEach(post => {
        const postCard = createBlogPostCard(post);
        blogContent.appendChild(postCard);
    });
}

// Create blog post card
function createBlogPostCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.style.cssText = 'border: 1px solid rgba(0, 229, 255, 0.18); background: rgba(0, 229, 255, 0.04); border-radius: 16px; padding: 20px; margin-bottom: 20px; transition: all 0.3s ease;';
    
    const date = post.published_at 
        ? new Date(post.published_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
    
    const tagsHtml = post.tags
        ? `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;">${post.tags.split(',').map(tag => `<span style="padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(0, 229, 255, 0.22); background: rgba(0, 229, 255, 0.06); color: var(--muted); font-size: 12px;">${tag.trim()}</span>`).join('')}</div>`
        : '';
    
    card.innerHTML = `
        <h3 style="color: var(--text); font-size: 20px; font-weight: 700; margin-bottom: 8px;">${post.title}</h3>
        <div style="color: var(--muted); font-size: 13px; margin-bottom: 10px;">${date}</div>
        ${post.excerpt ? `<p style="color: var(--muted); font-size: 14px; line-height: 1.6; margin-bottom: 10px;">${post.excerpt}</p>` : ''}
        ${tagsHtml}
        <a href="#" class="btn small" style="margin-top: 10px;">Đọc thêm</a>
    `;
    
    card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'rgba(0, 229, 255, 0.35)';
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 8px 24px rgba(0, 229, 255, 0.12)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'rgba(0, 229, 255, 0.18)';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
    });
    
    return card;
}

// Initialize horizontal slider with mouse wheel support
function initSlider() {
    const slider = document.querySelector('.slider');
    const panels = document.querySelectorAll('.panel');
    const dots = document.querySelectorAll('.slide-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!slider || !panels.length) return;
    
    let currentSlide = 0;
    const totalSlides = panels.length;
    let isTransitioning = false;
    
    // Slide mapping to menu items
    const slideToMenuMap = {
        0: '#home',
        1: '#about',
        2: '#experience',
        3: '#projects',
        4: '#certifications',
        5: '#contact',
        6: '#blog'
    };
    
    // Update slider position
    function updateSlider() {
        const translateX = -currentSlide * 100;
        slider.style.transform = `translateX(${translateX}vw)`;
    }
    
    // Update navigation buttons
    function updateButtons() {
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    // Update navigation dots
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Update menu active state
    function updateMenuActive() {
        const currentHash = slideToMenuMap[currentSlide];
        navLinks.forEach(link => {
            const linkHash = link.getAttribute('href');
            link.classList.toggle('active', linkHash === currentHash);
        });
    }
    
    // Go to specific slide
    function goToSlide(slideIndex, direction) {
        if (slideIndex < 0 || slideIndex >= totalSlides || isTransitioning) return;
        
        isTransitioning = true;
        
        // Add slide animations
        if (direction === 'next') {
            panels[currentSlide].classList.add('slide-out-left');
            panels[slideIndex].classList.add('slide-in-right');
        } else if (direction === 'prev') {
            panels[currentSlide].classList.add('slide-out-right');
            panels[slideIndex].classList.add('slide-in-left');
        }
        
        currentSlide = slideIndex;
        
        // Update UI
        setTimeout(() => {
            updateSlider();
            updateButtons();
            updateDots();
            updateMenuActive();
            
            // Remove animation classes
            setTimeout(() => {
                panels.forEach(panel => {
                    panel.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
                });
                isTransitioning = false;
            }, 100);
        }, 100);
    }
    
    // Go to slide by menu hash
    function goToSlideByHash(hash) {
        const slideIndex = Object.values(slideToMenuMap).indexOf(hash);
        if (slideIndex !== -1) {
            const direction = slideIndex > currentSlide ? 'next' : 'prev';
            goToSlide(slideIndex, direction);
        }
    }
    
    // Setup project buttons to navigate to projects slide
    function setupProjectButtons() {
        const projectButtons = document.querySelectorAll('[data-target="projects"]');
        projectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlideByHash('#projects');
            });
        });
    }
    
    // Mouse wheel event handler for slide navigation
    let wheelTimeout;
    let isWheeling = false;
    
    document.addEventListener('wheel', (e) => {
        if (isTransitioning || isWheeling) return;
        
        // Prevent default scroll
        e.preventDefault();
        
        isWheeling = true;
        clearTimeout(wheelTimeout);
        
        // Determine direction
        const delta = e.deltaY;
        const threshold = 50; // Minimum scroll delta to trigger slide change
        
        if (Math.abs(delta) > threshold) {
            if (delta > 0 && currentSlide < totalSlides - 1) {
                // Scroll down - next slide
                goToSlide(currentSlide + 1, 'next');
            } else if (delta < 0 && currentSlide > 0) {
                // Scroll up - previous slide
                goToSlide(currentSlide - 1, 'prev');
            }
        }
        
        wheelTimeout = setTimeout(() => {
            isWheeling = false;
        }, 300);
    }, { passive: false });
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1, 'prev'));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1, 'next'));
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const direction = index > currentSlide ? 'next' : 'prev';
            goToSlide(index, direction);
        });
    });
    
    // Menu navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href');
            goToSlideByHash(hash);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1, 'prev');
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1, 'next');
    });
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    slider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                goToSlide(currentSlide + 1, 'next');
            } else {
                goToSlide(currentSlide - 1, 'prev');
            }
        }
    });
    
    // Initialize
    setupProjectButtons();
    updateSlider();
    updateButtons();
    updateDots();
    updateMenuActive();
}

// Initialize skills tabs
function initSkillsTabs() {
    const tabs = document.querySelectorAll('[data-skills-tab]');
    const tech = document.getElementById('skills-tech');
    const tools = document.getElementById('skills-tools');
    
    if (!tabs.length || !tech || !tools) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            
            const which = tab.getAttribute('data-skills-tab');
            if (which === 'tech') {
                tech.style.display = 'grid';
                tools.style.display = 'none';
            } else {
                tech.style.display = 'none';
                tools.style.display = 'grid';
            }
        });
    });
}

// Initialize certifications tabs
function initCertificationsTabs() {
    const tabs = document.querySelectorAll('[data-certs-tab]');
    const certs = document.getElementById('certifications-list');
    const achievements = document.getElementById('achievements-list');
    const education = document.getElementById('education-cert-tab');
    
    if (!tabs.length || !certs || !achievements || !education) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            
            const which = tab.getAttribute('data-certs-tab');
            if (which === 'certifications') {
                certs.style.display = 'grid';
                achievements.style.display = 'none';
                education.style.display = 'none';
            } else if (which === 'achievements') {
                certs.style.display = 'none';
                achievements.style.display = 'grid';
                education.style.display = 'none';
            } else if (which === 'education') {
                certs.style.display = 'none';
                achievements.style.display = 'none';
                education.style.display = 'block';
            }
        });
    });
}

// Initialize typewriter effect for roles
function initTypewriter() {
    const el = document.getElementById('roleText');
    if (!el) return;
    
    const roles = [
        'Web Developer',
        'Pentester',
        'Blue Team',
        'Threat Hunter',
        'AppSec Engineer',
        'Security Researcher',
        'Frontend Developer'
    ];
    
    let idx = 0;
    let char = 0;
    let typing = true;
    const speedType = 80;
    const speedErase = 40;
    const delayHold = 1100;
    const delaySwitch = 400;
    
    function tick() {
        const word = roles[idx];
        if (typing) {
            char++;
            el.textContent = word.slice(0, char);
            if (char === word.length) {
                typing = false;
                setTimeout(tick, delayHold);
                return;
            }
            setTimeout(tick, speedType);
        } else {
            char--;
            el.textContent = word.slice(0, Math.max(char, 0));
            if (char <= 0) {
                typing = true;
                idx = (idx + 1) % roles.length;
                setTimeout(tick, delaySwitch);
                return;
            }
            setTimeout(tick, speedErase);
        }
    }
    
    tick();
}

// Initialize contact form
function initContactForm() {
    const form = document.getElementById('contactForm');
    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!statusEl) return;
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            subject: formData.get('subject').trim(),
            message: formData.get('message').trim()
        };
        
        // Validate
        if (!data.name || !data.email || !data.subject || !data.message) {
            statusEl.textContent = 'Vui lòng điền đầy đủ thông tin.';
            statusEl.className = 'error';
            return;
        }
        
        // Disable submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang gửi...';
        }
        
        try {
            const response = await fetch('/api/contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                statusEl.textContent = 'Cảm ơn bạn! Tin nhắn đã được gửi thành công.';
                statusEl.className = 'success';
                form.reset();
            } else {
                const errorData = await response.json();
                statusEl.textContent = errorData.error || 'Có lỗi xảy ra khi gửi tin nhắn.';
                statusEl.className = 'error';
            }
        } catch (error) {
            console.error('Error sending contact form:', error);
            statusEl.textContent = 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.';
            statusEl.className = 'error';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Gửi tin nhắn';
            }
        }
    });
}

// Setup avatar image handler
function setupAvatar() {
    const img = document.getElementById('avatarImg');
    if (!img) return;
    
    const avatar = img.closest('.avatar');
    if (!avatar) return;
    
    function setHasImg() {
        if (img.complete && img.naturalWidth > 0) {
            avatar.classList.add('has-img');
        }
    }
    
    img.addEventListener('load', setHasImg);
    img.addEventListener('error', () => {
        avatar.classList.remove('has-img');
    });
    
    setHasImg();
}

// Initialize starfield background
function initStarfield() {
    const c = document.getElementById('bg-stars');
    if (!(c instanceof HTMLCanvasElement)) return;
    
    const ctx = c.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, stars = [];
    let time = 0;
    
    function size() {
        const doc = document.documentElement;
        const w = doc.clientWidth;
        const h = Math.max(doc.scrollHeight, window.innerHeight);
        return { w, h };
    }
    
    function resize() {
        const s = size();
        W = c.clientWidth = s.w;
        H = c.clientHeight = s.h;
        c.width = Math.floor(W * DPR);
        c.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        spawn();
    }
    
    function spawn() {
        const n = Math.floor((W * H) / 8000); // More stars
        stars = Array.from({ length: n }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            z: Math.random() * 0.8 + 0.2,
            r: Math.random() * 1.6 + 0.3,
            vx: (Math.random() - 0.5) * 0.08,
            vy: (Math.random() - 0.5) * 0.08,
            baseOpacity: Math.random() * 0.5 + 0.3,
            hue: Math.random() * 60 + 180 // Cyan to blue range
        }));
    }
    
    function animate() {
        time += 0.005;
        ctx.fillStyle = 'rgba(10, 15, 20, 0.1)'; // Fade effect
        ctx.fillRect(0, 0, W, H);
        
        // Draw connections between nearby stars (subtle network effect)
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15 * (stars[i].z + stars[j].z) / 2;
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        // Draw stars with enhanced effects
        for (const star of stars) {
            star.x += star.vx + Math.sin(time + star.x * 0.01) * 0.2;
            star.y += star.vy + Math.cos(time + star.y * 0.01) * 0.2;
            
            if (star.x < 0) star.x = W;
            if (star.x > W) star.x = 0;
            if (star.y < 0) star.y = H;
            if (star.y > H) star.y = 0;
            
            // Pulsing glow effect
            const pulse = Math.sin(time * 2 + star.x * 0.05 + star.y * 0.05) * 0.3 + 0.7;
            const glow = pulse * star.baseOpacity;
            
            // Outer glow
            const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 4);
            gradient.addColorStop(0, `rgba(0, 229, 255, ${glow * 0.6})`);
            gradient.addColorStop(0.5, `rgba(122, 248, 255, ${glow * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Main star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 229, 255, ${glow * star.z})`;
            ctx.shadowColor = `rgba(122, 248, 255, ${glow * 0.8})`;
            ctx.shadowBlur = 8 * star.z * star.r;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Bright core
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(122, 248, 255, ${glow * 0.9})`;
            ctx.fill();
        }
        
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resize);
    window.addEventListener('hashchange', () => setTimeout(resize, 50));
    
    resize();
    animate();
}

