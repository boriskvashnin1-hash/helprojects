
console.log('📁 Projects manager loading...');

class ProjectsManager {
    constructor() {
        this.projects = [];
        this.loadProjects();
    }
    
    loadProjects() {
        const saved = localStorage.getItem('helprojects_projects');
        if (saved) {
            this.projects = JSON.parse(saved);
        } else {
            // Демо-проекты
            this.projects = [
                {
                    id: '1',
                    title: 'Школьный робот',
                    description: 'Создание робота-помощника',
                    goal: 50000,
                    current_amount: 25000,
                    author: 'Иван Петров',
                    category: 'technology',
                    status: 'active'
                },
                {
                    id: '2',
                    title: 'Школьная газета',
                    description: 'Ежемесячная газета',
                    goal: 20000,
                    current_amount: 15000,
                    author: 'Мария Сидорова',
                    category: 'art',
                    status: 'active'
                }
            ];
            this.saveProjects();
        }
        console.log('✅ Загружено проектов:', this.projects.length);
    }
    
    saveProjects() {
        localStorage.setItem('helprojects_projects', JSON.stringify(this.projects));
    }
    
    getAllProjects() {
        return this.projects;
    }
    
    getProjectById(id) {
        return this.projects.find(p => p.id === id);
    }
    
    createProject(projectData) {
        const project = {
            id: 'project_' + Date.now(),
            ...projectData,
            current_amount: 0,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        this.projects.push(project);
        this.saveProjects();
        
        return { success: true, project };
    }
    
    supportProject(projectId, amount) {
        const project = this.getProjectById(projectId);
        if (!project) {
            return { success: false, message: 'Проект не найден' };
        }
        
        project.current_amount += parseFloat(amount);
        this.saveProjects();
        
        return { success: true, project };
    }
}

// Создаем глобально
window.projectsManager = new ProjectsManager();
console.log('✅ Projects manager ready');
// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
}
