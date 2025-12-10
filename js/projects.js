// Управление проектами - UI функции

// Загрузка и отображение проектов
async function loadProjects() {
    const projects = await db.getProjects();
    displayProjects(projects);
}

// Отображение проектов на странице
function displayProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = '<p class="no-projects">Проектов пока нет</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        container.appendChild(projectCard);
    });
}

// Создание карточки проекта
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const statusClass = `status-${project.status || 'planning'}`;
    const author = project.profiles ? project.profiles.full_name : 'Неизвестный автор';
    
    card.innerHTML = `
        <div class="project-header">
            <h3>${project.title}</h3>
            <span class="project-status ${statusClass}">
                ${getStatusText(project.status)}
            </span>
        </div>
        <p class="project-description">${project.description || 'Описание отсутствует'}</p>
        <div class="project-meta">
            <span><i class="fas fa-user"></i> ${author}</span>
            <span><i class="fas fa-book"></i> ${project.subject || 'Не указан'}</span>
            <span><i class="fas fa-chart-line"></i> ${project.progress || 0}%</span>
        </div>
        <div class="project-actions">
            <button onclick="viewProject('${project.id}')" class="btn btn-primary">
                <i class="fas fa-eye"></i> Подробнее
            </button>
            ${isCurrentUserProject(project.user_id) ? `
                <button onclick="editProject('${project.id}')" class="btn btn-secondary">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button onclick="deleteProject('${project.id}')" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Получение текста статуса
function getStatusText(status) {
    const statusMap = {
        'planning': 'Планирование',
        'active': 'В работе',
        'completed': 'Завершен'
    };
    return statusMap[status] || status;
}

// Проверка, принадлежит ли проект текущему пользователю
function isCurrentUserProject(userId) {
    return window.currentUser && window.currentUser.id === userId;
}

// Просмотр проекта
function viewProject(projectId) {
    window.location.href = `project-detail.html?id=${projectId}`;
}

// Редактирование проекта
function editProject(projectId) {
    window.location.href = `edit-project.html?id=${projectId}`;
}

// Удаление проекта
async function deleteProject(projectId) {
    const success = await db.deleteProject(projectId);
    if (success) {
        loadProjects();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Проверяем авторизацию
    await checkAuth();
    
    // Загружаем проекты если есть контейнер
    if (document.getElementById('projectsContainer')) {
        await loadProjects();
    }
    
    // Обработка формы создания проекта
    const createForm = document.getElementById('createProjectForm');
    if (createForm) {
        createForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const projectData = {
                title: document.getElementById('projectTitle').value,
                description: document.getElementById('projectDescription').value,
                subject: document.getElementById('projectSubject').value,
                status: document.getElementById('projectStatus').value,
                progress: parseInt(document.getElementById('projectProgress').value),
                deadline: document.getElementById('projectDeadline').value || null
            };
            
            const project = await db.createProject(projectData);
            if (project) {
                window.location.href = 'projects.html';
            }
        });
    }
});
