// Основной скрипт

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    console.log('HelProjects загружен');
    
    // Проверяем авторизацию
    const isAuthenticated = await checkAuth();
    
    // Если пользователь авторизован и на главной странице
    if (isAuthenticated && window.location.pathname.endsWith('index.html')) {
        // Можно загрузить последние проекты пользователя
        const userProjects = await db.getUserProjects(currentUser.id);
        if (userProjects.length > 0) {
            console.log('У пользователя проектов:', userProjects.length);
        }
    }
    
    // Добавляем обработчик выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Валидация форм
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Утилиты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Экспорт утилит в глобальную область видимости
window.utils = {
    validateEmail,
    validatePassword,
    formatDate,
    showNotification
};
