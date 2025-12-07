// script.js - Основные функции сайта

// Управление мобильным меню
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Управление модальными окнами
function showModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'none';
    clearMessages();
}

function showRegister() {
    showModal();
    showRegisterForm();
}

function showLogin() {
    showModal();
    showLoginForm();
}

function showRegisterForm() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    clearMessages();
}

function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearMessages();
}

function clearMessages() {
    document.getElementById('register-message').innerHTML = '';
    document.getElementById('login-message').innerHTML = '';
}

// Регистрация пользователя
async function registerUser(event) {
    event.preventDefault();
    
    const userData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        fullName: document.getElementById('fullName').value,
        school: document.getElementById('school').value,
        className: document.getElementById('class').value
    };
    
    const messageEl = document.getElementById('register-message');
    messageEl.innerHTML = '<div class="loading">Регистрация...</div>';
    
    const result = await window.auth.register(userData);
    
    if (result.success) {
        messageEl.innerHTML = `<div class="message success">
            <i class="fas fa-check-circle"></i> ${result.message || 'Регистрация успешна!'}
        </div>`;
        
        // Очистка формы
        event.target.reset();
        
        // Закрытие модального окна через 2 секунды
        setTimeout(() => {
            closeModal();
            window.location.href = 'pages/profile.html';
        }, 2000);
        
    } else {
        messageEl.innerHTML = `<div class="message error">
            <i class="fas fa-exclamation-circle"></i> ${result.message}
        </div>`;
    }
}

// Вход пользователя
async function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const messageEl = document.getElementById('login-message');
    messageEl.innerHTML = '<div class="loading">Вход...</div>';
    
    const result = await window.auth.login(email, password);
    
    if (result.success) {
        messageEl.innerHTML = `<div class="message success">
            <i class="fas fa-check-circle"></i> Вход выполнен успешно!
        </div>`;
        
        // Очистка формы
        event.target.reset();
        
        // Закрытие модального окна через 1 секунду
        setTimeout(() => {
            closeModal();
            window.location.href = 'pages/profile.html';
        }, 1000);
        
    } else {
        messageEl.innerHTML = `<div class="message error">
            <i class="fas fa-exclamation-circle"></i> ${result.message}
        </div>`;
    }
}

// Выход
function logout() {
    window.auth.logout();
    window.location.href = 'index.html';
}

// Отображение проектов на главной
function displayFeaturedProjects() {
    const container = document.getElementById('featured-projects');
    if (!container) return;
    
    const projects = window.projectDB.getAllProjects();
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="loading">Проектов пока нет</div>';
        return;
    }
    
    // Берем первые 3 проекта
    const featuredProjects = projects.slice(0, 3);
    
    container.innerHTML = featuredProjects.map(project => `
        <div class="project-card">
            <div class="project-image">
                <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="${project.title}">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description.substring(0, 100)}...</p>
                <div class="project-goal">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(project.current_amount / project.goal * 100)}%"></div>
                    </div>
                    <div class="project-stats">
                        <span>Собрано: ${project.current_amount} ₽</span>
                        <span>Цель: ${project.goal} ₽</span>
                    </div>
                </div>
                <div class="project-author">
                    <small>Автор: ${project.author || 'Учащийся'}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Обновление UI авторизации
    if (window.auth) {
        window.auth.updateUI();
    }
    
    // Отображение проектов
    displayFeaturedProjects();
    
    // Закрытие модального окна при клике вне его
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Закрытие мобильного меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('.nav-links');
            nav.classList.remove('active');
        });
    });
});

// Глобальные функции
window.toggleMenu = toggleMenu;
window.showRegister = showRegister;
window.showLogin = showLogin;
window.closeModal = closeModal;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logout = logout;
