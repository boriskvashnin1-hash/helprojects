// Функции работы с базой данных

// Получение профиля пользователя
async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Ошибка получения профиля:', error);
        return null;
    }
    
    return data;
}

// Создание таблиц (выполнить один раз в консоли Supabase)
async function createTables() {
    console.log('Создание таблиц...');
    
    // SQL для создания таблиц (копировать в SQL редактор Supabase)
    const sql = `
    -- Таблица профилей
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        class TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Таблица проектов
    CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        status TEXT DEFAULT 'planning',
        progress INTEGER DEFAULT 0,
        user_id UUID REFERENCES profiles(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deadline DATE
    );
    
    -- Таблица задач проекта
    CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    );
    `;
    
    console.log('Выполните этот SQL в Supabase SQL редакторе:');
    console.log(sql);
}

// Получение всех проектов
async function getProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*, profiles(full_name, class)')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Ошибка получения проектов:', error);
        return [];
    }
    
    return data;
}

// Получение проектов пользователя
async function getUserProjects(userId) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Ошибка получения проектов:', error);
        return [];
    }
    
    return data;
}

// Создание проекта
async function createProject(projectData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert('Требуется авторизация');
        return null;
    }
    
    const { data, error } = await supabase
        .from('projects')
        .insert([
            {
                ...projectData,
                user_id: user.id,
                created_at: new Date().toISOString()
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Ошибка создания проекта:', error);
        alert('Ошибка: ' + error.message);
        return null;
    }
    
    alert('Проект успешно создан!');
    return data;
}

// Обновление проекта
async function updateProject(projectId, updates) {
    const { data, error } = await supabase
        .from('projects')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();
    
    if (error) {
        console.error('Ошибка обновления проекта:', error);
        return null;
    }
    
    return data;
}

// Удаление проекта
async function deleteProject(projectId) {
    if (!confirm('Вы уверены, что хотите удалить проект?')) return false;
    
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
    
    if (error) {
        console.error('Ошибка удаления проекта:', error);
        alert('Ошибка: ' + error.message);
        return false;
    }
    
    alert('Проект удален');
    return true;
}

// Получение задач проекта
async function getProjectTasks(projectId) {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');
    
    if (error) {
        console.error('Ошибка получения задач:', error);
        return [];
    }
    
    return data;
}

// Добавление задачи
async function addTask(projectId, taskData) {
    const { data, error } = await supabase
        .from('tasks')
        .insert([
            {
                ...taskData,
                project_id: projectId,
                created_at: new Date().toISOString()
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Ошибка добавления задачи:', error);
        return null;
    }
    
    return data;
}

// Экспорт функций
window.db = {
    getUserProfile,
    getProjects,
    getUserProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectTasks,
    addTask,
    createTables
};
