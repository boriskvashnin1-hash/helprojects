
// Функции аутентификации
let currentUser = null;

// Проверка авторизации
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        updateUIForLoggedInUser();
        return true;
    }
    return false;
}

// Обновление UI для авторизованного пользователя
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const profileLink = document.getElementById('profileLink');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileLink) {
        profileLink.style.display = 'block';
        profileLink.href = 'pages/profile.html';
    }
    
    // Показываем приветствие
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && currentUser) {
        const welcomeElement = document.createElement('span');
        welcomeElement.className = 'welcome-text';
        welcomeElement.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email}`;
        navLinks.insertBefore(welcomeElement, navLinks.firstChild);
    }
}

// Регистрация
async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const fullName = document.getElementById('registerFullName').value;
    const className = document.getElementById('registerClass').value;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                class: className
            }
        }
    });
    
    if (error) {
        alert('Ошибка регистрации: ' + error.message);
        return;
    }
    
    // Создание профиля пользователя
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    email: data.user.email,
                    full_name: fullName,
                    class: className,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (profileError) {
            console.error('Ошибка создания профиля:', profileError);
        }
    }
    
    alert('Регистрация успешна! Проверьте email для подтверждения.');
    closeAuthModal();
}

// Вход
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        alert('Ошибка входа: ' + error.message);
        return;
    }
    
    currentUser = data.user;
    updateUIForLoggedInUser();
    closeAuthModal();
    alert('Вход выполнен успешно!');
}

// Выход
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    window.location.href = '/';
}

// Открытие/закрытие модального окна
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Переключение между формами входа и регистрации
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('authModal');
    
    if (loginBtn) loginBtn.addEventListener('click', openAuthModal);
    if (showRegister) showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });
    if (showLogin) showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAuthModal();
    });
    
    // Проверяем авторизацию при загрузке
    checkAuth();
});
