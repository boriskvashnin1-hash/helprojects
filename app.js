class CrowdfundingApp {
    constructor() {
        this.projects = [];
        this.users = [];
        this.currentUser = null;
        this.currentRoute = 'home';
        this.currentProjectId = null;
        this.deferredPrompt = null;
        this.liveUpdatesInterval = null;
        this.chatMessages = [];
        this.mediaFiles = [];
        this.currentMediaIndex = 0;
        this.userStats = {
            coins: 100,
            level: 1,
            xp: 0,
            badges: [],
            notifications: [],
            socialShares: 0
        };
        
        // Привязываем методы
        this.applyFilters = this.applyFilters.bind(this);
        this.handleProjectSubmit = this.handleProjectSubmit.bind(this);
        this.supportProject = this.supportProject.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.rateProject = this.rateProject.bind(this);
        this.showProjectDetail = this.showProjectDetail.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleChat = this.toggleChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.showAuthModal = this.showAuthModal.bind(this);
        this.handleAuth = this.handleAuth.bind(this);
        this.logout = this.logout.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.handleMediaUpload = this.handleMediaUpload.bind(this);
        this.showUploadModal = this.showUploadModal.bind(this);
        this.hideUploadModal = this.hideUploadModal.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.nextMedia = this.nextMedia.bind(this);
        this.prevMedia = this.prevMedia.bind(this);
        this.shareProject = this.shareProject.bind(this);
        this.startLiveStream = this.startLiveStream.bind(this);
        this.addComment = this.addComment.bind(this);
        this.likeComment = this.likeComment.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.joinTelegram = this.joinTelegram.bind(this);
        this.watchYouTube = this.watchYouTube.bind(this);
        this.showAchievementModal = this.showAchievementModal.bind(this);
        this.hideAchievementModal = this.hideAchievementModal.bind(this);
        
        this.init();
    }

    init() {
        this.setupRouter();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupPWA();
        this.startLiveUpdates();
        this.setupMediaHandlers();
        
        setTimeout(() => {
            this.requestNotificationPermission();
        }, 2000);
        
        this.render();
    }

    // 🛣️ СИСТЕМА РОУТИНГА
    setupRouter() {
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });

        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        let route = 'home';

        if (hash === '/') route = 'home';
        else if (hash === '/projects') route = 'projects';
        else if (hash === '/create') route = 'create';
        else if (hash === '/stats') route = 'stats';
        else if (hash.startsWith('/project/')) {
            route = 'project-detail';
            this.currentProjectId = hash.split('/')[2];
        }

        this.currentRoute = route;
        this.render();
    }

    navigate(route) {
        window.location.hash = route === 'home' ? '/' : `/${route}`;
    }

    // 🎨 СИСТЕМА РЕНДЕРИНГА
    render() {
        const content = document.getElementById('app-content');
        if (!content) return;

        let html = '';
        switch(this.currentRoute) {
            case 'home':
                html = this.renderHome();
                break;
            case 'projects':
                html = this.renderProjects();
                break;
            case 'create':
                html = this.renderCreateForm();
                break;
            case 'stats':
                html = this.renderStats();
                break;
            case 'project-detail':
                html = this.renderProjectDetail();
                break;
            default:
                html = this.renderHome();
        }

        content.innerHTML = html;
        this.updateNavigation();
        this.setupDynamicEventListeners();
        
        // Показываем виджеты соцсетей на главной
        if (this.currentRoute === 'home') {
            document.getElementById('socialWidgets').style.display = 'grid';
        } else {
            document.getElementById('socialWidgets').style.display = 'none';
        }
    }

    renderHome() {
        const featuredProjects = this.getRecommendedProjects();
        const trendingProjects = this.getTrendingProjects();
        const stats = this.getPlatformStats();

        return `
            <div class="hero-section fade-in">
                <div class="hero-content">
                    <h2>Помощь молодым проектам</h2>
                    <p>Поддержи начинания школьников и студентов - вместе мы можем больше!</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
                        <button onclick="app.navigate('create')" class="btn btn-large btn-gradient hover-lift">
                            🚀 Создать проект
                        </button>
                        ${this.currentUser ? `
                            <div class="coins-system hover-glow">
                                🪙 <span id="userCoins">${this.userStats.coins}</span>
                            </div>
                            <div class="level-badge hover-glow tooltip">
                                ⭐ Ур. <span id="userLevel">${this.userStats.level}</span>
                                <span class="tooltip-text">Опыт: ${this.userStats.xp}/100 до след. уровня</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="stats-overview fade-in">
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.totalProjects}</div>
                    <div class="stat-label">Активных проектов</div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.totalCollected}₽</div>
                    <div class="stat-label">Собрано всего</div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.totalDonors}</div>
                    <div class="stat-label">Участников</div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.successRate}%</div>
                    <div class="stat-label">Успешных сборов</div>
                </div>
            </div>

            ${this.currentUser ? `
                <section class="achievements-panel fade-in">
                    <h3>🏆 Ваши достижения</h3>
                    <div class="badges-container">
                        ${this.renderUserBadges()}
                    </div>
                    <div class="level-progress">
                        <div class="level-progress-fill" id="userXP" style="width: ${this.userStats.xp % 100}%"></div>
                    </div>
                </section>
            ` : ''}

            <section class="featured-projects fade-in">
                <h3>🎯 Рекомендуемые проекты</h3>
                <div class="projects-grid">
                    ${featuredProjects.length > 0 ? 
                      featuredProjects.map(project => this.renderProjectCard(project)).join('') :
                      '<div class="empty-state"><h3>Пока нет проектов</h3><p>Будьте первым, кто создаст проект!</p></div>'
                    }
                </div>
                ${featuredProjects.length > 0 ? `
                    <div class="text-center">
                        <button onclick="app.navigate('projects')" class="btn btn-outline hover-lift">
                            👀 Смотреть все проекты
                        </button>
                    </div>
                ` : ''}
            </section>

            ${trendingProjects.length > 0 ? `
                <section class="featured-projects fade-in">
                    <h3>📈 Популярные проекты</h3>
                    <div class="projects-grid">
                        ${trendingProjects.map(project => this.renderProjectCard(project)).join('')}
                    </div>
                </section>
            ` : ''}
        `;
    }

    renderProjects() {
        const categories = this.getCategories();
        const filteredProjects = this.applyFiltersOnRender();

        return `
            <div class="page-header fade-in">
                <h2>Все проекты</h2>
                <div class="filters">
                    <select id="categoryFilter">
                        <option value="all">Все категории</option>
                        ${categories.map(cat => `<option value="${cat}">${this.getCategoryIcon(cat)} ${cat}</option>`).join('')}
                    </select>
                    <select id="sortSelect">
                        <option value="newest">Сначала новые</option>
                        <option value="popular">По популярности</option>
                        <option value="almost-done">Почти собраны</option>
                        <option value="most-funded">Больше всего собрано</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="🔍 Поиск проектов...">
                </div>
            </div>

            <div class="projects-grid" id="projectsGrid">
                ${filteredProjects.length > 0 ? 
                  filteredProjects.map(project => this.renderProjectCard(project)).join('') :
                  '<div class="empty-state"><h3>Проекты не найдены</h3><p>Попробуйте изменить параметры поиска</p></div>'
                }
            </div>
        `;
    }

    renderProjectCard(project) {
        const progress = (project.collected / project.goal) * 100;
        const daysLeft = project.deadline ? this.getDaysLeft(project.deadline) : null;
        const isUrgent = daysLeft && daysLeft < 7 && progress < 100;
        const achievements = this.getAchievements(project);
        const isFeatured = project.donors > 30 || progress > 80;
        const analytics = this.getProjectAnalytics(project.id);

        return `
            <div class="project-card ${isFeatured ? 'featured' : ''} fade-in hover-lift">
                ${isFeatured ? '<div class="featured-badge">🔥 Популярный</div>' : ''}
                <div class="project-image">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy">` : '📁'}
                    ${isUrgent ? '<div class="urgent-badge">⏰ Срочно!</div>' : ''}
                </div>
                
                <div class="project-content">
                    <div class="project-header">
                        <h4>${project.title}</h4>
                        <span class="project-category">${this.getCategoryIcon(project.category)} ${project.category}</span>
                    </div>
                    
                    <p class="project-description">${project.description.substring(0, 100)}...</p>
                    
                    ${achievements.length > 0 ? `
                        <div class="achievements">
                            ${achievements.map(ach => `<span class="achievement">${ach}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${analytics ? `
                        <div class="project-meta">
                            <span class="countdown-timer ${isUrgent ? 'countdown-expiring' : ''}">
                                ⏰ ${daysLeft}д
                            </span>
                            <span>${analytics.trend}</span>
                            <span>🎯 ${analytics.successProbability}% успеха</span>
                        </div>
                    ` : ''}
                    
                    <div class="project-author">
                        <span>👤 ${project.author}</span>
                        <span>📅 ${this.formatDate(project.createdAt)}</span>
                    </div>

                    <div class="progress-container">
                        <div class="progress">
                            <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                        <div class="progress-stats">
                            <span><strong>${project.collected}₽</strong> собрано</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                    </div>

                    <div class="project-meta">
                        <span>🎯 ${project.goal}₽</span>
                        <span>👥 ${project.donors} поддержали</span>
                        ${daysLeft ? `<span>⏰ ${daysLeft} дней осталось</span>` : ''}
                    </div>

                    ${project.averageRating ? `
                        <div class="rating">
                            ${[1,2,3,4,5].map(star => `
                                <span class="star ${star <= Math.round(project.averageRating) ? 'active' : ''}">
                                    ${star <= Math.round(project.averageRating) ? '⭐' : '☆'}
                                </span>
                            `).join('')}
                            <small>(${project.rating.count})</small>
                        </div>
                    ` : ''}

                    <div class="project-actions">
                        <button onclick="app.supportProject('${project.id}')" 
                                class="btn btn-donate hover-lift">💝 Поддержать</button>
                        <button onclick="app.toggleFavorite('${project.id}')" 
                                class="btn-icon ${project.isFavorite ? 'favorite' : ''} hover-lift">⭐</button>
                        ${!project.averageRating ? `
                            <button onclick="app.showRatingModal('${project.id}')" 
                                    class="btn-icon hover-lift">👍</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderCreateForm() {
        return `
            <div class="form-container fade-in">
                <h2>Создать новый проект</h2>
                <form id="projectForm" class="project-form">
                    <div class="form-group">
                        <label for="projectTitle">Название проекта *</label>
                        <input type="text" id="projectTitle" required maxlength="100" placeholder="Введите название проекта">
                    </div>

                    <div class="form-group">
                        <label for="projectDescription">Описание проекта *</label>
                        <textarea id="projectDescription" required rows="5" maxlength="2000" placeholder="Опишите ваш проект подробно..."></textarea>
                        <div class="char-counter"><span id="descCounter">0</span>/2000</div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="projectGoal">Целевая сумма (руб) *</label>
                            <input type="number" id="projectGoal" required min="1000" max="1000000" placeholder="10000">
                        </div>
                        
                        <div class="form-group">
                            <label for="projectCategory">Категория *</label>
                            <select id="projectCategory" required>
                                <option value="">Выберите категорию</option>
                                <option value="технологии">💻 Технологии</option>
                                <option value="искусство">🎨 Искусство</option>
                                <option value="образование">📚 Образование</option>
                                <option value="экология">🌱 Экология</option>
                                <option value="спорт">⚽ Спорт</option>
                                <option value="социальный">🤝 Социальный</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="projectDeadline">Срок сбора (дней)</label>
                            <input type="number" id="projectDeadline" min="1" max="365" value="30">
                        </div>
                        
                        <div class="form-group">
                            <label for="projectAuthor">Имя автора</label>
                            <input type="text" id="projectAuthor" value="${this.currentUser?.name || ''}" placeholder="Ваше имя">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="projectImage">Изображение проекта (URL)</label>
                        <input type="url" id="projectImage" placeholder="https://example.com/image.jpg">
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-gradient hover-lift">🚀 Создать проект</button>
                        <button type="button" onclick="app.navigate('home')" class="btn btn-cancel hover-lift">Отмена</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderStats() {
        const stats = this.getPlatformStats();
        const advancedStats = this.getAdvancedStats();
        const recentProjects = this.projects.slice(0, 5);

        return `
            <div class="stats-page fade-in">
                <h2>📊 Статистика платформы</h2>
                
                <div class="stats-grid">
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.totalProjects}</div>
                        <div class="stat-label">Всего проектов</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.totalCollected}₽</div>
                        <div class="stat-label">Общая сумма сборов</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.avgDonation}₽</div>
                        <div class="stat-label">Средний донат</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.successRate}%</div>
                        <div class="stat-label">Успешных проектов</div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-container hover-lift">
                        <h3>📈 Распределение по категориям</h3>
                        <div class="chart" id="categoryChart">
                            ${this.renderCategoryChart()}
                        </div>
                    </div>
                    
                    <div class="chart-container hover-lift">
                        <h3>🆕 Последние проекты</h3>
                        <div class="recent-projects">
                            ${recentProjects.map(project => `
                                <div class="recent-project hover-lift" onclick="app.showProjectDetail('${project.id}')">
                                    <span>${project.title}</span>
                                    <span class="project-amount">${project.collected}₽</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                ${advancedStats.trendingProjects.length > 0 ? `
                    <div class="chart-container hover-lift">
                        <h3>🔥 Топ проектов</h3>
                        <div class="recent-projects">
                            ${advancedStats.trendingProjects.map(project => `
                                <div class="recent-project hover-lift" onclick="app.showProjectDetail('${project.id}')">
                                    <span>${project.title}</span>
                                    <span class="project-amount">${project.collected}₽</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProjectDetail() {
        const project = this.projects.find(p => p.id === this.currentProjectId);
        if (!project) {
            return '<div class="error-state fade-in"><h3>Проект не найден</h3><button onclick="app.navigate(\'projects\')" class="btn">Вернуться к проектам</button></div>';
        }

        const progress = (project.collected / project.goal) * 100;
        const achievements = this.getAchievements(project);
        const analytics = this.getProjectAnalytics(project.id);

        return `
            <div class="project-detail">
                <button onclick="app.navigate('projects')" class="btn btn-back hover-lift">← Назад к проектам</button>
                
                <div class="project-hero fade-in">
                    <div class="project-hero-content">
                        <h1>${project.title}</h1>
                        <p class="project-meta">Автор: ${project.author} • 📅 ${this.formatDate(project.createdAt)}</p>
                        
                        <!-- Социальные кнопки -->
                        <div class="social-share">
                            <button class="share-btn vk" onclick="app.shareProject('${project.id}', 'vk')">
                                <span>VK</span>
                            </button>
                            <button class="share-btn telegram" onclick="app.shareProject('${project.id}', 'telegram')">
                                <span>Telegram</span>
                            </button>
                            <button class="share-btn whatsapp" onclick="app.shareProject('${project.id}', 'whatsapp')">
                                <span>WhatsApp</span>
                            </button>
                            <button class="share-btn twitter" onclick="app.shareProject('${project.id}', 'twitter')">
                                <span>Twitter</span>
                            </button>
                            <button class="share-btn copy" onclick="app.shareProject('${project.id}', 'copy')">
                                <span>Копировать</span>
                            </button>
                        </div>

                        ${achievements.length > 0 ? `
                            <div class="achievements">
                                ${achievements.map(ach => `<span class="achievement">${ach}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="project-stats-large">
                            <div class="stat hover-lift">
                                <span class="stat-number">${project.collected}₽</span>
                                <span class="stat-label">Собрано</span>
                            </div>
                            <div class="stat hover-lift">
                                <span class="stat-number">${project.goal}₽</span>
                                <span class="stat-label">Цель</span>
                            </div>
                            <div class="stat hover-lift">
                                <span class="stat-number">${project.donors}</span>
                                <span class="stat-label">Поддержали</span>
                            </div>
                            <div class="stat hover-lift">
                                <span class="stat-number">${Math.round(progress)}%</span>
                                <span class="stat-label">Прогресс</span>
                            </div>
                        </div>

                        <div class="progress large">
                            <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>

                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button onclick="app.supportProject('${project.id}')" class="btn btn-donate-large btn-gradient hover-lift">
                                💝 Поддержать проект
                            </button>
                            <button onclick="app.startLiveStream('${project.id}')" class="btn btn-outline hover-lift">
                                🎥 Прямой эфир
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Медиа галерея -->
                <section class="fade-in">
                    <h3>📁 Медиа проекта</h3>
                    <div class="media-gallery" id="mediaGallery">
                        ${this.renderMediaGallery()}
                    </div>
                </section>

                <div class="project-content-detailed fade-in">
                    <div class="project-description-full">
                        <h3>📖 О проекте</h3>
                        <p>${project.description}</p>
                        
                        ${analytics ? `
                            <div class="analytics-chart">
                                <h4>📊 Аналитика проекта</h4>
                                <div class="chart-placeholder">
                                    График прогресса сбора средств
                                </div>
                                <div style="margin-top: 1rem;">
                                    <div>📈 Тренд: ${analytics.trend}</div>
                                    <div>🎯 Вероятность успеха: ${analytics.successProbability}%</div>
                                    <div>⏱️ Среднедневной сбор: ${analytics.avgDailyCollection}₽</div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${project.averageRating ? `
                            <div class="rating" style="margin-top: 2rem;">
                                <h4>⭐ Рейтинг проекта</h4>
                                <div>
                                    ${[1,2,3,4,5].map(star => `
                                        <span class="star ${star <= Math.round(project.averageRating) ? 'active' : ''}">
                                            ${star <= Math.round(project.averageRating) ? '⭐' : '☆'}
                                        </span>
                                    `).join('')}
                                    <span style="margin-left: 1rem; color: var(--text-light);">
                                        ${project.averageRating.toFixed(1)} из 5 (${project.rating.count} оценок)
                                    </span>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Лента из соцсетей -->
                        <div class="social-feed">
                            <h4>📱 Обсуждение в соцсетях</h4>
                            ${this.loadSocialFeed().map(post => `
                                <div class="social-post">
                                    <div class="social-header">
                                        <div class="comment-avatar">${post.avatar}</div>
                                        <div>
                                            <div class="comment-author">${post.author}</div>
                                            <div class="comment-time">${post.time}</div>
                                        </div>
                                    </div>
                                    <div>${post.text}</div>
                                    <div class="social-stats">
                                        <span>👍 ${post.likes}</span>
                                        <span>📤 ${post.shares}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Комментарии -->
                        ${this.renderComments(project.id)}
                    </div>

                    <div class="project-sidebar">
                        <div class="info-card hover-lift">
                            <h4>📋 Информация</h4>
                            <div class="info-item">
                                <strong>Категория:</strong>
                                <span>${this.getCategoryIcon(project.category)} ${project.category}</span>
                            </div>
                            <div class="info-item">
                                <strong>Статус:</strong>
                                <span>${project.status}</span>
                            </div>
                            <div class="info-item">
                                <strong>Автор:</strong>
                                <span>${project.author}</span>
                            </div>
                            ${project.deadline ? `
                                <div class="info-item">
                                    <strong>Дней осталось:</strong>
                                    <span>${project.deadline}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Виджеты соцсетей -->
                        <div class="social-widgets">
                            <div class="social-widget">
                                <h4>📱 Наше сообщество</h4>
                                <p>Присоединяйтесь к обсуждению</p>
                                <button onclick="app.joinTelegram()" class="btn btn-gradient" style="margin-top: 1rem;">
                                    Подписаться
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🎬 МУЛЬТИМЕДИЙНЫЕ ФУНКЦИИ
    setupMediaHandlers() {
        const uploadArea = document.querySelector('.media-upload');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary)';
                uploadArea.style.background = 'var(--background)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border)';
                uploadArea.style.background = 'transparent';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border)';
                uploadArea.style.background = 'transparent';
                this.handleMediaUpload({ target: { files: e.dataTransfer.files } });
            });
        }
    }

    showUploadModal() {
        document.getElementById('uploadModal').style.display = 'flex';
    }

    hideUploadModal() {
        document.getElementById('uploadModal').style.display = 'none';
    }

    handleMediaUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        const progressBar = document.getElementById('uploadProgressBar');
        const uploadStatus = document.getElementById('uploadStatus');
        const uploadProgress = document.getElementById('uploadProgress');

        uploadProgress.style.display = 'block';

        Array.from(files).forEach((file, index) => {
            this.simulateUpload(file, progressBar, uploadStatus, files.length, index);
        });
    }

    simulateUpload(file, progressBar, uploadStatus, totalFiles, currentIndex) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                this.addMediaFile(file);
                uploadStatus.textContent = `Загружено: ${file.name}`;
                
                if (currentIndex === totalFiles - 1) {
                    setTimeout(() => {
                        this.hideUploadModal();
                        this.showNotification('🎉 Медиафайлы загружены!', 'success');
                    }, 1000);
                }
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
    }

    addMediaFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const mediaItem = {
                id: Date.now() + Math.random(),
                type: file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 'audio',
                url: e.target.result,
                name: file.name,
                size: file.size
            };
            
            this.mediaFiles.push(mediaItem);
            this.renderMediaGallery();
        };
        reader.readAsDataURL(file);
    }

    renderMediaGallery() {
        if (this.mediaFiles.length === 0) {
            return `
                <div class="media-upload" onclick="app.showUploadModal()">
                    <div style="font-size: 2rem;">+</div>
                    <div>Добавить медиа</div>
                </div>
            `;
        }

        return this.mediaFiles.map((media, index) => `
            <div class="media-item media-enter" onclick="app.openLightbox(${index})">
                ${media.type === 'image' ? `
                    <img src="${media.url}" alt="${media.name}" loading="lazy">
                ` : media.type === 'video' ? `
                    <video>
                        <source src="${media.url}" type="video/mp4">
                    </video>
                    <div class="play-button">▶</div>
                ` : `
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); height: 100%; display: flex; align-items: center; justify-content: center; color: white;">
                        🎵 Аудио
                    </div>
                `}
            </div>
        `).join('') + `
            <div class="media-upload" onclick="app.showUploadModal()">
                <div style="font-size: 2rem;">+</div>
                <div>Добавить медиа</div>
            </div>
        `;
    }

    // 🖼️ LIGHTBOX ДЛЯ МЕДИА
    openLightbox(index) {
        this.currentMediaIndex = index;
        const media = this.mediaFiles[index];
        const lightbox = document.getElementById('lightbox');
        const content = document.getElementById('lightboxContent');

        if (media.type === 'image') {
            content.innerHTML = `<img src="${media.url}" alt="${media.name}">`;
        } else if (media.type === 'video') {
            content.innerHTML = `
                <video controls autoplay>
                    <source src="${media.url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            `;
        } else {
            content.innerHTML = `
                <div style="text-align: center; color: white; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎵</div>
                    <h3>${media.name}</h3>
                    <audio controls autoplay style="margin-top: 1rem; width: 100%;">
                        <source src="${media.url}" type="audio/mp3">
                    </audio>
                </div>
            `;
        }

        lightbox.classList.add('active');
    }

    closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        const video = document.querySelector('#lightboxContent video');
        const audio = document.querySelector('#lightboxContent audio');
        if (video) video.pause();
        if (audio) audio.pause();
    }

    nextMedia() {
        if (this.mediaFiles.length > 0) {
            this.currentMediaIndex = (this.currentMediaIndex + 1) % this.mediaFiles.length;
            this.openLightbox(this.currentMediaIndex);
        }
    }

    prevMedia() {
        if (this.mediaFiles.length > 0) {
            this.currentMediaIndex = (this.currentMediaIndex - 1 + this.mediaFiles.length) % this.mediaFiles.length;
            this.openLightbox(this.currentMediaIndex);
        }
    }

    // 📱 СОЦИАЛЬНЫЕ ФУНКЦИИ
    shareProject(projectId, platform) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const url = window.location.href.split('#')[0] + `#/project/${projectId}`;
        const text = `Поддержи проект: "${project.title}" - уже собрано ${project.collected}₽ из ${project.goal}₽`;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'vk':
                shareUrl = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description.substring(0, 100))}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(text + '\n' + url).then(() => {
                    this.showNotification('📋 Ссылка скопирована в буфер!', 'success');
                });
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        
        this.userStats.socialShares++;
        this.addCoins(10, 'За分享 проекта');
        this.addXP(5);
        
        this.showNotification(`📤 Проект опубликован в ${this.getPlatformName(platform)}! +10 коинов`, 'success');
    }

    sharePlatform(platform) {
        const url = window.location.href.split('#')[0];
        const text = 'Платформа для поддержки молодых проектов - ПомощьПроектам';
        
        let shareUrl = '';
        switch(platform) {
            case 'vk':
                shareUrl = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent('ПомощьПроектам')}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }

    getPlatformName(platform) {
        const names = {
            'vk': 'ВКонтакте',
            'telegram': 'Telegram',
            'whatsapp': 'WhatsApp',
            'twitter': 'Twitter'
        };
        return names[platform] || platform;
    }

    // 🎥 ПРЯМЫЕ ТРАНСЛЯЦИИ
    startLiveStream(projectId) {
        if (!navigator.mediaDevices) {
            this.showNotification('❌ Ваш браузер не поддерживает трансляции', 'error');
            return;
        }

        this.showModal(`
            <h3>🎥 Начать трансляцию</h3>
            <p>Подключите камеру и микрофон для прямой трансляции</p>
            <div style="display: flex; gap: 0.5rem; margin: 1.5rem 0;">
                <button onclick="app.initiateStream('${projectId}')" class="btn btn-gradient">
                    🎬 Начать трансляцию
                </button>
                <button onclick="app.hideModal()" class="btn btn-cancel">
                    Отмена
                </button>
            </div>
        `);
    }

    initiateStream(projectId) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.showNotification('🎥 Трансляция началась!', 'success');
                this.hideModal();
                this.simulateLiveStream(projectId);
            })
            .catch(error => {
                this.showNotification('❌ Ошибка доступа к камере/микрофону', 'error');
            });
    }

    simulateLiveStream(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        this.showLiveNotification(`🎥 Началась трансляция проекта "${project.title}"`, 'info');
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                project.collected += Math.floor(Math.random() * 500) + 100;
                project.donors += 1;
                this.saveToStorage();
                this.showLiveNotification(`💫 Кто-то поддержал трансляцию проекта!`, 'success');
            }
        }, 10000);
    }

    // 💬 КОММЕНТАРИИ С МЕДИА
    addComment(projectId, text, media = null) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const comment = {
            id: Date.now(),
            author: this.currentUser.name,
            avatar: this.currentUser.avatar,
            text: text,
            media: media,
            timestamp: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.comments = project.comments || [];
            project.comments.push(comment);
            this.saveToStorage();
            
            this.addCoins(5, 'За комментарий');
            this.addXP(2);
            
            this.showNotification('💬 Комментарий добавлен! +5 коинов', 'success');
            this.renderProjectDetail();
        }
    }

    renderComments(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project || !project.comments) return '';

        return `
            <div class="comments-section">
                <h4>💬 Обсуждение (${project.comments.length})</h4>
                ${project.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <div class="comment-avatar">${comment.avatar}</div>
                            <div>
                                <div class="comment-author">${comment.author}</div>
                                <div class="comment-time">${this.formatTimeAgo(comment.timestamp)}</div>
                            </div>
                        </div>
                        <div class="comment-content">
                            <div>${comment.text}</div>
                            ${comment.media ? `
                                <div class="comment-media">
                                    ${comment.media.type === 'image' ? `
                                        <img src="${comment.media.url}" alt="Медиа" style="cursor: pointer; max-width: 200px;" onclick="app.openLightboxFromUrl('${comment.media.url}')">
                                    ` : comment.media.type === 'video' ? `
                                        <video controls style="max-width: 200px;">
                                            <source src="${comment.media.url}" type="video/mp4">
                                        </video>
                                    ` : ''}
                                </div>
                            ` : ''}
                            <div class="comment-actions">
                                <button class="comment-action" onclick="app.likeComment('${projectId}', '${comment.id}')">
                                    👍 ${comment.likes}
                                </button>
                                <button class="comment-action">
                                    💬 Ответить
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div style="margin-top: 1rem;">
                    <div class="form-group">
                        <textarea id="commentText" placeholder="Добавить комментарий..." rows="3" style="width: 100%;"></textarea>
                    </div>
                    <button onclick="app.submitComment('${projectId}')" class="btn btn-gradient">
                        💬 Отправить
                    </button>
                </div>
            </div>
        `;
    }

    submitComment(projectId) {
        const text = document.getElementById('commentText').value;
        if (!text.trim()) return;
        
        this.addComment(projectId, text);
        document.getElementById('commentText').value = '';
    }

    likeComment(projectId, commentId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project && project.comments) {
            const comment = project.comments.find(c => c.id == commentId);
            if (comment) {
                comment.likes++;
                this.saveToStorage();
                this.renderProjectDetail();
                this.addCoins(1, 'За лайк комментария');
            }
        }
    }

    openLightboxFromUrl(url) {
        const lightbox = document.getElementById('lightbox');
        const content = document.getElementById('lightboxContent');
        
        content.innerHTML = `<img src="${url}" alt="Изображение">`;
        lightbox.classList.add('active');
    }

    // 🎵 АУДИО ПЛЕЕР
    playAudio(audioUrl, title = 'Аудио') {
        const audioPlayer = document.getElementById('audioPlayer');
        const source = audioPlayer.querySelector('source');
        
        source.src = audioUrl;
        audioPlayer.load();
        audioPlayer.play().catch(e => {
            this.showNotification('❌ Ошибка воспроизведения аудио', 'error');
        });

        this.showNotification(`🎵 Воспроизведение: ${title}`, 'info');
    }

    // 📊 ИНТЕГРАЦИЯ С СОЦСЕТЯМИ
    joinTelegram() {
        window.open('https://t.me/your_channel', '_blank');
        this.addCoins(20, 'За присоединение к Telegram');
        this.showNotification('📱 Спасибо за подписку! +20 коинов', 'success');
    }

    watchYouTube() {
        window.open('https://youtube.com/your_channel', '_blank');
        this.addCoins(15, 'За просмотр YouTube');
        this.showNotification('🎥 Приятного просмотра! +15 коинов', 'success');
    }

    loadSocialFeed() {
        return [
            {
                id: 1,
                platform: 'vk',
                author: 'Сообщество проектов',
                avatar: '👥',
                text: 'Новый проект достиг 50% финансирования за первые сутки! 🎉',
                likes: 23,
                shares: 5,
                time: '2 часа назад'
            },
            {
                id: 2,
                platform: 'telegram',
                author: 'Tech News',
                avatar: '📱',
                text: 'Как краудфандинг меняет образование? Читайте в нашем новом посте!',
                likes: 45,
                shares: 12,
                time: '5 часов назад'
            }
        ];
    }

    // 💰 СИСТЕМА ВИРТУАЛЬНОЙ ВАЛЮТЫ
    addCoins(amount, reason = '') {
        if (!this.currentUser) return;
        
        this.userStats.coins += amount;
        this.saveUserStats();
        
        this.showLiveNotification(`🎉 +${amount} коинов! ${reason}`, 'success');
        this.updateCoinsDisplay();
        
        const coinsElement = document.querySelector('.coins-system');
        if (coinsElement) {
            coinsElement.classList.add('coin-animation');
            setTimeout(() => coinsElement.classList.remove('coin-animation'), 1000);
        }
        
        this.checkCoinAchievements();
    }

    spendCoins(amount, reason = '') {
        if (!this.currentUser || this.userStats.coins < amount) {
            this.showNotification('❌ Недостаточно коинов', 'error');
            return false;
        }
        
        this.userStats.coins -= amount;
        this.saveUserStats();
        this.updateCoinsDisplay();
        this.showNotification(`💸 Потрачено ${amount} коинов: ${reason}`, 'info');
        return true;
    }

    updateCoinsDisplay() {
        const coinsElement = document.getElementById('userCoins');
        if (coinsElement) {
            coinsElement.textContent = this.userStats.coins;
        }
    }

    // 🏆 СИСТЕМА УРОВНЕЙ И ДОСТИЖЕНИЙ
    addXP(amount, source = '') {
        if (!this.currentUser) return;
        
        this.userStats.xp += amount;
        const oldLevel = this.userStats.level;
        const newLevel = Math.floor(this.userStats.xp / 100) + 1;
        
        if (newLevel > oldLevel) {
            this.userStats.level = newLevel;
            this.showLevelUpModal(newLevel);
            this.addCoins(50, 'За новый уровень!');
        }
        
        this.saveUserStats();
        this.updateLevelDisplay();
    }

    showLevelUpModal(level) {
        this.showAchievementModal(
            '🎊 Новый уровень!',
            `Поздравляем! Вы достигли ${level} уровня!`,
            '🚀'
        );
    }

    updateLevelDisplay() {
        const levelElement = document.getElementById('userLevel');
        const xpElement = document.getElementById('userXP');
        
        if (levelElement) levelElement.textContent = this.userStats.level;
        if (xpElement) {
            const currentLevelXP = this.userStats.xp % 100;
            xpElement.style.width = `${currentLevelXP}%`;
        }
    }

    // 🎯 СИСТЕМА ДОСТИЖЕНИЙ
    checkCoinAchievements() {
        const achievements = [
            { threshold: 100, badge: '💰 Начинающий инвестор', id: 'coin_collector_1' },
            { threshold: 500, badge: '💰 Опытный инвестор', id: 'coin_collector_2' },
            { threshold: 1000, badge: '💰 Крипто-кит', id: 'coin_collector_3' }
        ];

        achievements.forEach(achievement => {
            if (this.userStats.coins >= achievement.threshold && 
                !this.userStats.badges.includes(achievement.id)) {
                this.unlockBadge(achievement.badge, achievement.id);
            }
        });
    }

    checkProjectAchievements() {
        const createdProjects = this.projects.filter(p => p.author === this.currentUser?.name).length;
        const supportedProjects = this.projects.filter(p => p.donors > 0 && this.currentUser).length;
        
        if (createdProjects >= 1 && !this.userStats.badges.includes('first_project')) {
            this.unlockBadge('🚀 Первый проект', 'first_project');
        }
        
        if (createdProjects >= 5 && !this.userStats.badges.includes('pro_creator')) {
            this.unlockBadge('🎯 Про-создатель', 'pro_creator');
        }
        
        if (supportedProjects >= 3 && !this.userStats.badges.includes('supporter')) {
            this.unlockBadge('❤️ Активный сторонник', 'supporter');
        }
    }

    unlockBadge(badgeName, badgeId) {
        this.userStats.badges.push(badgeId);
        this.saveUserStats();
        
        this.showAchievementModal(
            '🏆 Новое достижение!',
            badgeName,
            '🎊'
        );
        
        this.addCoins(25, `За достижение: ${badgeName}`);
        this.addXP(25);
    }

    renderUserBadges() {
        const allBadges = [
            { id: 'first_project', name: '🚀 Первый проект', description: 'Создал первый проект' },
            { id: 'pro_creator', name: '🎯 Про-создатель', description: 'Создал 5 проектов' },
            { id: 'supporter', name: '❤️ Активный сторонник', description: 'Поддержал 3 проекта' },
            { id: 'coin_collector_1', name: '💰 Начинающий инвестор', description: 'Накопил 100 коинов' },
            { id: 'coin_collector_2', name: '💰 Опытный инвестор', description: 'Накопил 500 коинов' },
            { id: 'coin_collector_3', name: '💰 Крипто-кит', description: 'Накопил 1000 коинов' }
        ];

        return allBadges.map(badge => `
            <div class="badge ${this.userStats.badges.includes(badge.id) ? 'earned' : 'locked'} tooltip">
                ${badge.name}
                <span class="tooltip-text">${badge.description}</span>
            </div>
        `).join('');
    }

    showAchievementModal(title, message, emoji) {
        const modal = document.getElementById('achievementModal');
        const body = document.getElementById('achievementModalBody');
        
        if (modal && body) {
            body.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
                    <h3>${title}</h3>
                    <p style="color: var(--text-light); margin: 1rem 0;">${message}</p>
                </div>
            `;
            modal.style.display = 'flex';
        }
    }

    hideAchievementModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 🔄 LIVE-ОБНОВЛЕНИЯ В РЕАЛЬНОМ ВРЕМЕНИ
    startLiveUpdates() {
        this.liveUpdatesInterval = setInterval(() => {
            this.simulateLiveActivity();
        }, 30000);
    }

    simulateLiveActivity() {
        if (this.projects.length === 0) return;
        
        const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
        if (randomProject && randomProject.collected < randomProject.goal) {
            const donation = Math.floor(Math.random() * 500) + 100;
            randomProject.collected += donation;
            randomProject.donors += 1;
            
            this.saveToStorage();
            
            if (Math.random() > 0.7) {
                this.showLiveNotification(
                    `💫 Кто-то поддержал проект "${randomProject.title}" на ${donation}₽`,
                    'info'
                );
            }
            
            if (this.currentRoute === 'projects' || this.currentRoute === 'home') {
                this.render();
            }
        }
    }

    showLiveNotification(message, type = 'info') {
        const container = document.getElementById('liveNotifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `live-notification notification-${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <small>Только что</small>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // 💬 ЧАТ-БОТ ПОДДЕРЖКИ
    toggleChat() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.classList.toggle('open');
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const messagesContainer = document.getElementById('chatMessages');
        
        if (!input || !messagesContainer || !input.value.trim()) return;
        
        const message = input.value.trim();
        this.addChatMessage(message, 'user');
        input.value = '';
        
        setTimeout(() => {
            this.generateBotResponse(message);
        }, 1000);
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`
