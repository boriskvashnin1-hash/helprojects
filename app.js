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
            const socialWidgets = document.getElementById('socialWidgets');
            if (socialWidgets) socialWidgets.style.display = 'grid';
        } else {
            const socialWidgets = document.getElementById('socialWidgets');
            if (socialWidgets) socialWidgets.style.display = 'none';
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
                            <small>(${project.rating?.count || 0})</small>
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

    // 📊 НЕДОСТАЮЩИЕ МЕТОДЫ ДЛЯ РАБОТЫ
    setupEventListeners() {
        // Обработчик формы проекта
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'projectForm') {
                e.preventDefault();
                this.handleProjectSubmit(e);
            }
        });

        // Обработчики фильтров
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.applyFilters();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'categoryFilter' || e.target.id === 'sortSelect') {
                this.applyFilters();
            }
        });
    }

    setupDynamicEventListeners() {
        // Динамические обработчики для элементов, созданных после рендера
        const commentTextareas = document.querySelectorAll('#commentText');
        commentTextareas.forEach(textarea => {
            textarea.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    const projectId = textarea.closest('.comments-section')?.querySelector('button')?.onclick?.toString().match(/'([^']+)'/)?.[1];
                    if (projectId) this.submitComment(projectId);
                }
            });
        });
    }

    loadInitialData() {
        // Загрузка тестовых данных
        const savedProjects = localStorage.getItem('crowdfunding-projects');
        const savedUsers = localStorage.getItem('crowdfunding-users');
        const savedUserStats = localStorage.getItem('crowdfunding-userStats');

        if (savedProjects) this.projects = JSON.parse(savedProjects);
        if (savedUsers) this.users = JSON.parse(savedUsers);
        if (savedUserStats) this.userStats = JSON.parse(savedUserStats);

        // Если нет проектов, создаем демо-данные
        if (this.projects.length === 0) {
            this.projects = [
                {
                    id: '1',
                    title: 'Школьный научный проект',
                    description: 'Создание робота для помощи в уборке класса',
                    goal: 15000,
                    collected: 8500,
                    donors: 23,
                    category: 'технологии',
                    author: 'Иван Петров',
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    deadline: 23,
                    image: '',
                    isFavorite: false,
                    rating: { count: 5, average: 4.5 }
                },
                {
                    id: '2',
                    title: 'Экологическая акция',
                    description: 'Посадка деревьев в школьном дворе',
                    goal: 8000,
                    collected: 6500,
                    donors: 15,
                    category: 'экология',
                    author: 'Мария Сидорова',
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    deadline: 27,
                    image: '',
                    isFavorite: true,
                    rating: { count: 3, average: 5.0 }
                }
            ];
            this.saveToStorage();
        }
    }

    saveToStorage() {
        localStorage.setItem('crowdfunding-projects', JSON.stringify(this.projects));
        localStorage.setItem('crowdfunding-users', JSON.stringify(this.users));
        localStorage.setItem('crowdfunding-userStats', JSON.stringify(this.userStats));
    }

    saveUserStats() {
        localStorage.setItem('crowdfunding-userStats', JSON.stringify(this.userStats));
    }

    handleProjectSubmit(event) {
        event.preventDefault();
        
        const formData = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            goal: parseInt(document.getElementById('projectGoal').value),
            category: document.getElementById('projectCategory').value,
            deadline: parseInt(document.getElementById('projectDeadline').value) || 30,
            author: document.getElementById('projectAuthor').value || 'Аноним',
            image: document.getElementById('projectImage').value || ''
        };

        const project = {
            id: Date.now().toString(),
            ...formData,
            collected: 0,
            donors: 0,
            createdAt: new Date().toISOString(),
            isFavorite: false,
            rating: { count: 0, average: 0 },
            comments: []
        };

        this.projects.push(project);
        this.saveToStorage();
        
        this.addCoins(50, 'За создание проекта');
        this.addXP(25);
        this.checkProjectAchievements();
        
        this.showNotification('🎉 Проект успешно создан! +50 коинов', 'success');
        this.navigate('projects');
    }

    supportProject(projectId) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const amount = parseInt(prompt('Введите сумму поддержки (руб):', '500'));
        if (isNaN(amount) || amount <= 0) return;

        project.collected += amount;
        project.donors += 1;
        
        this.addCoins(Math.floor(amount / 10), 'За поддержку проекта');
        this.addXP(10);
        
        this.saveToStorage();
        this.render();
        
        this.showNotification(`💝 Спасибо за поддержку! Вы внесли ${amount}₽`, 'success');
    }

    toggleFavorite(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.isFavorite = !project.isFavorite;
            this.saveToStorage();
            this.render();
            
            if (project.isFavorite) {
                this.addCoins(5, 'За добавление в избранное');
            }
        }
    }

    // 🔧 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    getCategories() {
        return ['технологии', 'искусство', 'образование', 'экология', 'спорт', 'социальный'];
    }

    getCategoryIcon(category) {
        const icons = {
            'технологии': '💻',
            'искусство': '🎨',
            'образование': '📚',
            'экология': '🌱',
            'спорт': '⚽',
            'социальный': '🤝'
        };
        return icons[category] || '📁';
    }

    getDaysLeft(deadline) {
        const now = new Date();
        const target = new Date(deadline);
        const diff = target - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    getRecommendedProjects() {
        return this.projects.slice(0, 3);
    }

    getTrendingProjects() {
        return [...this.projects]
            .sort((a, b) => b.donors - a.donors)
            .slice(0, 3);
    }

    getPlatformStats() {
        const totalProjects = this.projects.length;
        const totalCollected = this.projects.reduce((sum, p) => sum + p.collected, 0);
        const totalDonors = this.projects.reduce((sum, p) => sum + p.donors, 0);
        const successRate = totalProjects > 0 ? Math.round((this.projects.filter(p => p.collected >= p.goal).length / totalProjects) * 100) : 0;
        const avgDonation = totalDonors > 0 ? Math.round(totalCollected / totalDonors) : 0;

        return {
            totalProjects,
            totalCollected,
            totalDonors,
            successRate,
            avgDonation
        };
    }

    applyFilters() {
        this.render();
    }

    applyFiltersOnRender() {
        return this.projects;
    }

    getAchievements(project) {
        const achievements = [];
        if (project.collected >= project.goal) achievements.push('🎯 Цель достигнута');
        if (project.donors > 20) achievements.push('👥 Популярный');
        if (project.rating?.average >= 4.5) achievements.push('⭐ Высокий рейтинг');
        return achievements;
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-route') === this.currentRoute);
        });
    }

    // 💬 СИСТЕМА ЧАТА (ИСПРАВЛЕННАЯ)
    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        messageElement.innerHTML = `
            <div class="chat-message-content">${message}</div>
            <div class="chat-message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.chatMessages.push({ message, sender, timestamp: new Date() });
    }

    generateBotResponse(userMessage) {
        const responses = {
            'привет': 'Привет! Как я могу помочь с вашим проектом?',
            'помощь': 'Я могу помочь с созданием проекта, поиском поддержки или ответить на вопросы о платформе.',
            'проект': 'Чтобы создать проект, нажмите "Создать проект" и заполните форму. Нужна помощь?',
            'default': 'Интересный вопрос! Расскажите подробнее, чем я могу помочь?'
        };

        const lowerMessage = userMessage.toLowerCase();
        let response = responses.default;

        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key) && key !== 'default') {
                response = value;
                break;
            }
        }

        setTimeout(() => {
            this.addChatMessage(response, 'bot');
        }, 1000);
    }

    // 🔔 СИСТЕМА УВЕДОМЛЕНИЙ
    showNotification(message, type = 'info') {
        // Создаем уведомление, если нет готовой системы
        alert(`${type.toUpperCase()}: ${message}`);
    }

    showModal(content) {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.innerHTML = content;
            modal.style.display = 'flex';
        }
    }

    hideModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showAuthModal() {
        this.showModal(`
            <div class="modal-content">
                <h3>Вход в систему</h3>
                <p>Для выполнения действия требуется авторизация</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                    <button onclick="app.handleAuth('demo')" class="btn btn-gradient">
                        Демо-вход
                    </button>
                    <button onclick="app.hideModal()" class="btn btn-cancel">
                        Отмена
                    </button>
                </div>
            </div>
        `);
    }

    handleAuth(type) {
        if (type === 'demo') {
            this.currentUser = {
                id: 'demo',
                name: 'Демо-пользователь',
                email: 'demo@example.com',
                avatar: '👤'
            };
            this.hideModal();
            this.showNotification('🎉 Демо-вход выполнен!', 'success');
            this.render();
        }
    }

    logout() {
        this.currentUser = null;
        this.showNotification('👋 До свидания!', 'info');
        this.render();
    }

    // 🎮 ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ГЕЙМИФИКАЦИИ
    addCoins(amount, reason = '') {
        if (!this.currentUser) return;
        
        this.userStats.coins += amount;
        this.saveUserStats();
        this.updateCoinsDisplay();
        
        this.showNotification(`🎉 +${amount} коинов! ${reason}`, 'success');
        this.checkCoinAchievements();
    }

    addXP(amount) {
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

    checkCoinAchievements() {
        // Заглушка для проверки достижений
        if (this.userStats.coins >= 100 && !this.userStats.badges.includes('coin_collector_1')) {
            this.unlockBadge('💰 Начинающий инвестор', 'coin_collector_1');
        }
    }

    checkProjectAchievements() {
        // Заглушка для проверки достижений проектов
        const createdProjects = this.projects.filter(p => p.author === this.currentUser?.name).length;
        if (createdProjects >= 1 && !this.userStats.badges.includes('first_project')) {
            this.unlockBadge('🚀 Первый проект', 'first_project');
        }
    }

    unlockBadge(badgeName, badgeId) {
        this.userStats.badges.push(badgeId);
        this.saveUserStats();
        this.showNotification(`🏆 Получено достижение: ${badgeName}`, 'success');
    }

    updateCoinsDisplay() {
        const coinsElement = document.getElementById('userCoins');
        if (coinsElement) {
            coinsElement.textContent = this.userStats.coins;
        }
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

    showLevelUpModal(level) {
        this.showAchievementModal(
            '🎊 Новый уровень!',
            `Поздравляем! Вы достигли ${level} уровня!`,
            '🚀'
        );
    }

    // 🎯 ЗАГЛУШКИ ДЛЯ ОСТАЛЬНЫХ МЕТОДОВ
    setupPWA() {
        // Базовая PWA функциональность
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startLiveUpdates() {
        this.liveUpdatesInterval = setInterval(() => {
            this.simulateLiveActivity();
        }, 30000);
    }

    simulateLiveActivity() {
        // Имитация живой активности на платформе
        if (this.projects.length > 0 && Math.random() > 0.7) {
            const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
            if (randomProject.collected < randomProject.goal) {
                randomProject.collected += Math.floor(Math.random() * 500);
                randomProject.donors += 1;
                this.saveToStorage();
                
                if (this.currentRoute === 'projects' || this.currentRoute === 'home') {
                    this.render();
                }
            }
        }
    }

    // 🎵 МЕДИА ФУНКЦИИ (ЗАГЛУШКИ)
    setupMediaHandlers() {
        // Базовая настройка обработчиков медиа
    }

    showUploadModal() {
        this.showNotification('Функция загрузки медиа в разработке', 'info');
    }

    hideUploadModal() {
        // Скрытие модального окна загрузки
    }

    handleMediaUpload(event) {
        this.showNotification('Загрузка медиа временно недоступна', 'info');
    }

    // 🖼️ LIGHTBOX (ЗАГЛУШКИ)
    openLightbox(index) {
        this.showNotification('Просмотр медиа в разработке', 'info');
    }

    closeLightbox() {
        // Закрытие lightbox
    }

    nextMedia() {
        // Следующее медиа
    }

    prevMedia() {
        // Предыдущее медиа
    }

    // 📱 СОЦИАЛЬНЫЕ ФУНКЦИИ (ЗАГЛУШКИ)
    shareProject(projectId, platform) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.showNotification(`Проект "${project.title}" опубликован в ${platform}`, 'success');
            this.addCoins(10, 'За публикацию проекта');
        }
    }

    startLiveStream(projectId) {
        this.showNotification('Прямые трансляции скоро будут доступны', 'info');
    }

    addComment(projectId, text) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.comments = project.comments || [];
            project.comments.push({
                id: Date.now(),
                author: this.currentUser.name,
                text: text,
                timestamp: new Date().toISOString(),
                likes: 0
            });
            this.saveToStorage();
            this.addCoins(5, 'За комментарий');
            this.showNotification('💬 Комментарий добавлен!', 'success');
        }
    }

    submitComment(projectId) {
        const textarea = document.getElementById('commentText');
        if (textarea && textarea.value.trim()) {
            this.addComment(projectId, textarea.value.trim());
            textarea.value = '';
        }
    }

    likeComment(projectId, commentId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project && project.comments) {
            const comment = project.comments.find(c => c.id == commentId);
            if (comment) {
                comment.likes++;
                this.saveToStorage();
                this.addCoins(1, 'За лайк комментария');
            }
        }
    }

    playAudio(audioUrl, title) {
        this.showNotification(`Воспроизведение: ${title}`, 'info');
    }

    joinTelegram() {
        window.open('https://t.me/example', '_blank');
        this.addCoins(20, 'За присоединение к Telegram');
    }

    watchYouTube() {
        window.open('https://youtube.com', '_blank');
        this.addCoins(15, 'За просмотр YouTube');
    }

    renderUserBadges() {
        const allBadges = [
            { id: 'first_project', name: '🚀 Первый проект', earned: this.userStats.badges.includes('first_project') },
            { id: 'coin_collector_1', name: '💰 Начинающий инвестор', earned: this.userStats.badges.includes('coin_collector_1') }
        ];

        return allBadges.map(badge => `
            <div class="badge ${badge.earned ? 'earned' : 'locked'}">
                ${badge.name}
            </div>
        `).join('');
    }

    renderCategoryChart() {
        return '<div class="chart-placeholder">График категорий</div>';
    }

    renderStats() {
        const stats = this.getPlatformStats();
        return `
            <div class="stats-page">
                <h2>📊 Статистика платформы</h2>
                <div class="stats-grid">
                    <div class="stat-card">${stats.totalProjects} проектов</div>
                    <div class="stat-card">${stats.totalCollected}₽ собрано</div>
                    <div class="stat-card">${stats.totalDonors} участников</div>
                    <div class="stat-card">${stats.successRate}% успеха</div>
                </div>
            </div>
        `;
    }

    renderProjectDetail() {
        const project = this.projects.find(p => p.id === this.currentProjectId);
        if (!project) {
            return '<div class="error-state">Проект не найден</div>';
        }

        const progress = (project.collected / project.goal) * 100;
        return `
            <div class="project-detail">
                <button onclick="app.navigate('projects')" class="btn btn-back">← Назад</button>
                <h1>${project.title}</h1>
                <p>Автор: ${project.author}</p>
                <div class="progress-container">
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div>${project.collected}₽ / ${project.goal}₽ (${Math.round(progress)}%)</div>
                </div>
                <p>${project.description}</p>
                <button onclick="app.supportProject('${project.id}')" class="btn btn-donate">Поддержать проект</button>
                
                <div class="comments-section">
                    <h3>Комментарии</h3>
                    ${project.comments ? project.comments.map(comment => `
                        <div class="comment">
                            <strong>${comment.author}</strong>: ${comment.text}
                            <button onclick="app.likeComment('${project.id}', '${comment.id}')">👍 ${comment.likes}</button>
                        </div>
                    `).join('') : '<p>Пока нет комментариев</p>'}
                    
                    <textarea id="commentText" placeholder="Ваш комментарий..."></textarea>
                    <button onclick="app.submitComment('${project.id}')" class="btn">Отправить</button>
                </div>
            </div>
        `;
    }
}

// Инициализация приложения
const app = new CrowdfundingApp();
