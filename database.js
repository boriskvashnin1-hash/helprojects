// js/database.js
class Database {
  constructor() {
    this.supabase = window.db
    this.init()
  }
  
  async init() {
    // Проверяем подключение
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) throw error
      console.log('✅ База данных подключена')
    } catch (error) {
      console.warn('⚠️ Нет подключения к БД. Используется локальный режим.')
      this.localMode = true
    }
  }
  
  // Регистрация пользователя
  async registerUser(email, password, userData) {
    if (this.localMode) {
      // Локальное сохранение
      const users = JSON.parse(localStorage.getItem('helprojects_users') || '[]')
      users.push({
        id: Date.now(),
        email,
        ...userData,
        created_at: new Date().toISOString()
      })
      localStorage.setItem('helprojects_users', JSON.stringify(users))
      return { data: { user: users[users.length - 1] }, error: null }
    }
    
    // Регистрация в Supabase
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    return { data, error }
  }
  
  // Получить всех пользователей (для админа)
  async getUsers() {
    if (this.localMode) {
      return JSON.parse(localStorage.getItem('helprojects_users') || '[]')
    }
    
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  }
  
  // Создать проект
  async createProject(projectData) {
    if (this.localMode) {
      const projects = JSON.parse(localStorage.getItem('helprojects_projects') || '[]')
      projects.push({
        id: Date.now(),
        ...projectData,
        created_at: new Date().toISOString(),
        current_amount: 0,
        status: 'active'
      })
      localStorage.setItem('helprojects_projects', JSON.stringify(projects))
      return { data: projects[projects.length - 1], error: null }
    }
    
    const { data, error } = await this.supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    return { data, error }
  }
  
  // Получить все проекты
  async getProjects() {
    if (this.localMode) {
      return JSON.parse(localStorage.getItem('helprojects_projects') || '[]')
    }
    
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  window.database = new Database()
})
