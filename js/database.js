// js/database.js - Упрощенная версия для работы с projects.js
class Database {
    constructor() {
        console.log('Database initialized');
    }
    
    async init() {
        // Инициализация через projectsManager
        if (window.projectsManager) {
            await window.projectsManager.init();
        }
    }
    
    // Просто используем projectsManager
    getAllProjects() {
        return window.projectsManager ? window.projectsManager.getAllProjects() : [];
    }
    
    getProjectById(id) {
        return window.projectsManager ? window.projectsManager.getProjectById(id) : null;
    }
    
    async createProject(projectData) {
        if (window.projectsManager) {
            return window.projectsManager.createProject(projectData);
        }
        return { success: false, message: 'Projects manager not available' };
    }
    
    async supportProject(projectId, amount) {
        if (window.projectsManager) {
            return window.projectsManager.supportProject(projectId, amount);
        }
        return { success: false, message: 'Projects manager not available' };
    }
    
    async deleteProject(projectId) {
        if (window.projectsManager) {
            return window.projectsManager.deleteProject(projectId);
        }
        return { success: false, message: 'Projects manager not available' };
    }
    
    // Дополнительные методы для совместимости
    getProjects() {
        return this.getAllProjects();
    }
    
    async getUsers() {
        // Для совместимости с admin.html
        const users = JSON.parse(localStorage.getItem('helprojects_users') || '[]');
        return users;
    }
}

// Создаем глобальный экземпляр
window.projectDB = new Database();

// Инициализируем при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (window.projectDB) {
        window.projectDB.init();
    }
});
}

// Создаем глобальный экземпляр
window.projectDB = new ProjectDatabase();
