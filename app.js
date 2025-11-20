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

    // 🎬 НОВЫЕ МУЛЬТИМЕДИЙНЫЕ ФУНКЦИИ

    // 📁 ЗАГРУЗКА И УПРАВЛЕНИЕ МЕДИА
    setupMediaHandlers() {
        // Drag and drop для медиа
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
                
                // Добавляем файл в медиа-галерею
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
        const gallery = document.getElementById('mediaGallery');
        if (!gallery) return;

        gallery.innerHTML = this.mediaFiles.map((media, index) => `
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
        // Останавливаем все медиа
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

    // 📱 СОЦИАЛЬНЫЕ ФУНКЦИИ И ШАРИНГ
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
        
        // Награда за шаринг
        this.userStats.socialShares++;
        this.addCoins(10, 'За分享 проекта');
        this.addXP(5);
        
        this.showNotification(`📤 Проект опубликован в ${this.getPlatformName(platform)}! +10 коинов`, 'success');
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
                // Здесь можно интегрировать с WebRTC сервером
                this.simulateLiveStream(projectId);
            })
            .catch(error => {
                this.showNotification('❌ Ошибка доступа к камере/микрофону', 'error');
            });
    }

    simulateLiveStream(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Имитация живой трансляции
        this.showLiveNotification(`🎥 Началась трансляция проекта "${project.title}"`, 'info');
        
        // Увеличиваем вовлеченность
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
            
            // Награда за комментарий
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
                                        <img src="${comment.media.url}" alt="Медиа" onclick="app.openLightboxFromComment('${comment.media.url}')">
                                    ` : comment.media.type === 'video' ? `
                                        <video controls style="max-width: 100%;">
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
            </div>
        `;
    }

    likeComment(projectId, commentId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project && project.comments) {
            const comment = project.comments.find(c => c.id == commentId);
            if (comment) {
                comment.likes++;
                this.saveToStorage();
                this.renderProjectDetail();
                
                // Награда за лайк
                this.addCoins(1, 'За лайк комментария');
            }
        }
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
    }

    watchYouTube() {
        window.open('https://youtube.com/your_channel', '_blank');
        this.addCoins(15, 'За просмотр YouTube');
    }

    loadSocialFeed() {
        // Имитация загрузки постов из соцсетей
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

    // 🎨 ОБНОВЛЕННЫЙ РЕНДЕРИНГ
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
                        <div class="media-upload" onclick="app.showUploadModal()">
                            <div style="font-size: 2rem;">+</div>
                            <div>Добавить медиа</div>
                        </div>
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
                                        <div class="social-avatar">${post.avatar}</div>
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

    // 🕒 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}д назад`;
        if (hours > 0) return `${hours}ч назад`;
        if (minutes > 0) return `${minutes}м назад`;
        return 'Только что';
    }

    // ... остальные методы из предыдущей версии ...
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new CrowdfundingApp();
});
