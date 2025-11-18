// script.js - Полностью обновленная версия
class CrowdfundingPlatform {
    constructor() {
        this.projects = this.loadProjects();
        this.init();
    }

    init() {
        this.displayProjects();
        this.setupEventListeners();
        
        // Если проектов нет - загружаем демо данные
        if (this.projects.length === 0) {
            this.loadDemoProjects();
        }
    }

    // Загрузка проектов из LocalStorage
    loadProjects() {
        const saved = localStorage.getItem('crowdfund_projects');
        return saved ? JSON.parse(saved) : [];
    }

    // Сохранение проектов в LocalStorage
    saveProjects() {
        localStorage.setItem('crowdfund_projects', JSON.stringify(this.projects));
    }

    // Загрузка демо-проектов
    loadDemoProjects() {
        this.projects = [
            {
                id: 1,
                title: "Эко-саженцы для школы",
                description: "Посадка 100 деревьев на школьной территории. Помогите сделать нашу школу зеленее и экологичнее!",
                goal: 25000,
                collected: 12500,
                createdAt: new Date('2024-01-15').toISOString(),
                author: "Школьный эко-клуб",
                status: "active",
                category: "экология",
                donors: 23
            },
            {
                id: 2,
                title: "Школьный техно-клуб",
                description: "Оборудование для кружка робототехники и программирования. Arduino, 3D-принтер, компоненты.",
                goal: 50000,
                collected: 18000,
                createdAt: new Date('2024-01-20').toISOString(),
                author: "IT-отдел школы",
                status: "active",
                category: "образование",
                donors: 15
            },
            {
                id: 3,
                title: "Школьная газета",
                description: "Запуск ежемесячной газеты с новостями школы, интервью и интересными статьями от учеников.",
                goal: 15000,
                collected: 7500,
                createdAt: new Date('2024-01-25').toISOString(),
                author: "Редакция школы",
                status: "active",
                category: "творчество",
                donors: 31
            }
        ];
        this.saveProjects();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчик формы добавления проекта
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProject();
        });

        // Обработчик отмены формы
        document.getElementById('cancelForm').addEventListener('click', () => {
            this.hideForm();
        });

        // Обработчик сортировки
        document.getElementById('sortSelect').addEventListener('change', () => {
            this.sortProjects();
        });

        // Обработчик фильтра по категориям
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.displayProjects();
        });

        // Обработчик поиска
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchProjects(e.target.value);
        });
    }

    // Показать форму добавления проекта
    showForm() {
        document.getElementById('projectForm').style.display = 'block';
        document.getElementById('title').focus();
    }

    // Скрыть форму добавления проекта
    hideForm() {
        document.getElementById('projectForm').style.display = 'none';
        document.getElementById('projectForm').reset();
    }

    // Добавление нового проекта
    addProject() {
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const goal = parseInt(document.getElementById('goal').value);
        const category = document.getElementById('category').value;
        const author = document.getElementById('author').value.trim() || "Аноним";

        if (!title || !description || !goal) {
            alert('Пожалуйста, заполните все обязательные поля!');
            return;
        }

        const newProject = {
            id: Date.now(),
            title: title,
            description: description,
            goal: goal,
            collected: 0,
            createdAt: new Date().toISOString(),
            author: author,
            status: "active",
            category: category,
            donors: 0
        };

        this.projects.push(newProject);
        this.saveProjects();
        
        this.hideForm();
        this.displayProjects();
        
        this.showNotification(`Проект "${title}" успешно добавлен!`, 'success');
    }

    // Поддержка проекта
    supportProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const amount = prompt(`Введите сумму поддержки для проекта "${project.title}":`);
        if (!amount || isNaN(amount) || amount <= 0) {
            this.showNotification('Неверная сумма!', 'error');
            return;
        }

        const donationAmount = parseInt(amount);
        
        // Обновляем данные проекта
        project.collected += donationAmount;
        project.donors += 1;
        
        this.saveProjects();
        this.displayProjects();
        
        this.showNotification(`Спасибо! Вы поддержали проект на ${donationAmount}₽`, 'success');
        
        // Показываем модальное окно с реквизитами
        this.showDonationModal(project, donationAmount);
    }

    // Показать модальное окно доната
    showDonationModal(project, amount) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Поддержка проекта: ${project.title}</h3>
                <p>Вы выбрали сумму: <strong>${amount}₽</strong></p>
                <div class="payment-methods">
                    <div class="payment-method">
                        <h4>💳 Сбербанк</h4>
                        <p>2202 2002 2020 2020</p>
                    </div>
                    <div class="payment-method">
                        <h4>💳 Тинькофф</h4>
                        <p>2200 7000 8000 9000</p>
                    </div>
                    <div class="payment-method">
                        <h4>💳 ЮMoney</h4>
                        <p>4100 1234 5678 9012</p>
                    </div>
                </div>
                <p><small>После перевода сообщите нам для обновления суммы сбора!</small></p>
                <button onclick="this.closest('.modal').remove()" class="btn">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Поделиться проектом
    shareProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const shareText = `Поддержи проект: "${project.title}" - уже собрано ${project.collected}₽ из ${project.goal}₽`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: shareText,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareText + '\n' + shareUrl);
            this.showNotification('Ссылка скопирована в буфер обмена!', 'success');
        }
    }

    // Поиск проектов
    searchProjects(query) {
        const filteredProjects = this.projects.filter(project => 
            project.title.toLowerCase().includes(query.toLowerCase()) ||
            project.description.toLowerCase().includes(query.toLowerCase()) ||
            project.author.toLowerCase().includes(query.toLowerCase())
        );
        this.renderProjects(filteredProjects);
    }

    // Сортировка проектов
    sortProjects() {
        const sortBy = document.getElementById('sortSelect').value;
        
        switch(sortBy) {
            case 'newest':
                this.projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'popular':
                this.projects.sort((a, b) => b.collected - a.collected);
                break;
            case 'almost-done':
                this.projects.sort((a, b) => {
                    const progressA = (a.collected / a.goal);
                    const progressB = (b.collected / b.goal);
                    return progressB - progressA;
                });
                break;
            case 'most-donors':
                this.projects.sort((a, b) => b.donors - a.donors);
                break;
        }
        
        this.saveProjects();
        this.displayProjects();
    }

    // Отображение проектов
    displayProjects() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        let filteredProjects = this.projects;

        if (categoryFilter !== 'all') {
            filteredProjects = this.projects.filter(project => project.category === categoryFilter);
        }

        this.renderProjects(filteredProjects);
    }

    // Рендер проектов
    renderProjects(projects) {
        const container = document.getElementById('projects');
        
        if (projects.length === 0) {
            container.innerHTML = '<div class="no-projects"><p>Проекты не найдены</p></div>';
            return;
        }

        container.innerHTML = projects.map(project => {
            const progress = (project.collected / project.goal) * 100;
            const progressWidth = Math.min(progress, 100);
            const daysAgo = Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24));

            return `
                <div class="project" data-category="${project.category}">
                    <div class="project-header">
                        <h3>${project.title}</h3>
                        <span class="project-category">${this.getCategoryIcon(project.category)} ${project.category}</span>
                    </div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-author">Автор: ${project.author}</div>
                    
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressWidth}%"></div>
                    </div>
                    
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-value">${project.collected}₽</span>
                            <span class="stat-label">Собрано</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${project.goal}₽</span>
                            <span class="stat-label">Цель</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${Math.round(progress)}%</span>
                            <span class="stat-label">Прогресс</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${project.donors}</span>
                            <span class="stat-label">Поддержали</span>
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        <button onclick="platform.supportProject(${project.id})" class="btn btn-donate">💝 Поддержать</button>
                        <button onclick="platform.shareProject(${project.id})" class="btn btn-share">📤 Поделиться</button>
                    </div>
                    
                    <div class="project-meta">
                        <span>Добавлен ${daysAgo} дней назад</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Получить иконку для категории
    getCategoryIcon(category) {
        const icons = {
            'экология': '🌱',
            'образование': '📚',
            'творчество': '🎨',
            'технологии': '💻',
            'спорт': '⚽',
            'социальный': '🤝'
        };
        return icons[category] || '📋';
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Статистика платформы
    getPlatformStats() {
        const totalProjects = this.projects.length;
        const totalCollected = this.projects.reduce((sum, project) => sum + project.collected, 0);
        const totalDonors = this.projects.reduce((sum, project) => sum + project.donors, 0);
        
        return { totalProjects, totalCollected, totalDonors };
    }

    // Обновить статистику в футере
    updateStats() {
        const stats = this.getPlatformStats();
        const statsElement = document.getElementById('platformStats');
        
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">Проектов: ${stats.totalProjects}</div>
                <div class="stat-item">Собрано: ${stats.totalCollected}₽</div>
                <div class="stat-item">Поддержали: ${stats.totalDonors} раз</div>
            `;
        }
    }
}

// Инициализация платформы при загрузке страницы
let platform;

document.addEventListener('DOMContentLoaded', function() {
    platform = new CrowdfundingPlatform();
    
    // Обновляем статистику каждые 5 секунд
    setInterval(() => {
        platform.updateStats();
    }, 5000);
    
    // Инициализируем статистику
    platform.updateStats();
});

// Глобальные функции для вызова из HTML
function showForm() {
    platform.showForm();
}

function hideForm() {
    platform.hideForm();
}
