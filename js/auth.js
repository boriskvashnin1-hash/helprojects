// Файл: js/auth.js
// УДАЛИТЕ старый и создайте этот

console.log('🔄 Загрузка auth.js...');

// Простая проверка инициализации
function checkInit() {
    if (!window.supabase) {
        console.error('❌ Supabase не инициализирован!');
        console.log('Проверьте:');
        console.log('1. Подключен ли Supabase CDN?');
        console.log('2. Заполнены ли ключи в config.js?');
        console.log('3. Правильный ли порядок подключения скриптов?');
        return false;
    }
    return true;
}

// Упрощенная проверка авторизации
async function checkAuth() {
    console.log('🔐 Проверка авторизации...');
    
    if (!checkInit()) {
        console.log('Пропускаем проверку авторизации - Supabase не готов');
        return false;
    }
    
    try {
        // Простая проверка сессии
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.log('Ошибка сессии:', error.message);
            return false;
        }
        
        if (data.session) {
            console.log('✅ Пользователь авторизован:', data.session.user.email);
            window.currentUser = data.session.user;
            updateUI();
            return true;
        } else {
            console.log('❌ Пользователь не авторизован');
            window.currentUser = null;
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        return false;
    }
}

// Обновление интерфейса
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const profileLink = document.getElementById('profileLink');
    
    if (window.currentUser) {
        // Пользователь вошел
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileLink) {
            profileLink.style.display = 'inline-block';
            profileLink.href = 'pages/profile.html';
        }
    } else {
        // Пользователь не вошел
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Простой вход
async function simpleLogin(email, password) {
    if (!checkInit()) {
        alert('Система не готова. Проверьте консоль.');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        alert('Вход успешен!');
        window.location.reload();
        
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    }
}

// Простая регистрация
async function simpleRegister(email, password, name) {
    if (!checkInit()) {
        alert('Система не готова. Проверьте консоль.');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                }
            }
        });
        
        if (error) throw error;
        
        alert('Регистрация успешна! Проверьте email.');
        
    } catch (error) {
        alert('Ошибка регистрации: ' + error.message);
    }
}

// Выход
async function logout() {
    if (!checkInit()) {
        alert('Система не готова.');
        return;
    }
    
    try {
        await supabase.auth.signOut();
        window.currentUser = null;
        alert('Вы вышли из системы');
        window.location.href = '../index.html';
    } catch (error) {
        alert('Ошибка выхода: ' + error.message);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница загружена, запускаем проверку авторизации...');
    checkAuth().then(isAuth => {
        console.log('Проверка авторизации завершена:', isAuth ? 'Авторизован' : 'Не авторизован');
    });
});

// Экспортируем функции
window.simpleLogin = simpleLogin;
window.simpleRegister = simpleRegister;
window.logout = logout;
window.checkAuth = checkAuth;
