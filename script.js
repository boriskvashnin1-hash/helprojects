// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация меню
    checkAuthState();
    loadFeaturedProjects();
    
    // Мобильное меню
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    // Проверка поддержки Service Worker для PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker зарегистрирован');
            })
            .catch(error => {
                console.log('Ошибка регистрации Service Worker:', error);
            });
    }
});

// Функция для переключения мобильного меню
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Функции для модальных окон
function showLogin() {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    modal.style.display = 'block';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

function showRegister() {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    modal.style.display = 'block';
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Загрузка featured проектов
async function loadFeaturedProjects() {
    const container = document.getElementById('featured-projects');
    if (!container) return;
    
    try {
        // Если есть функция из projects.js, используем её
        if (typeof getFeaturedProjects === 'function') {
            const projects = await getFeaturedProjects();
            displayProjects(projects);
        } else {
            // Fallback: показываем демо-проекты
            showDemoProjects();
        }
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        showDemoProjects();
    }
}

// Показать демо-проекты (если база данных не работает)
function showDemoProjects() {
    const container = document.getElementById('featured-projects');
    if (!container) return;
    
    container.innerHTML = `
        <div class="project-card">
            <div class="project-image">
                <img src="images/demo-project1.jpg" alt="Школьный робот" onerror="this.src='https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400'">
            </div>
            <div class="project-info">
                <h3>Робот для школьных соревнований</h3>
                <p>Создание программируемого робота для участия в городских соревнованиях по робототехнике</p>
                <div class="project-stats">
                    <div class="progress-bar">
                        <div class="progress" style="width: 65%"></div>
                    </div>
                    <div class="stats">
                        <span><i class="fas fa-ruble-sign"></i> 32,500 собрано</span>
                        <span><i class="fas fa-bullseye"></i> 50,000 цель</span>
                    </div>
                </div>
                <a href="pages/project-details.html?id=1" class="btn btn-small">Поддержать</a>
            </div>
        </div>
        
        <div class="project-card">
            <div class="project-image">
                <img src="images/demo-project2.jpg" alt="Школьная газета" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'">
            </div>
            <div class="project-info">
                <h3>Школьная газета "Голос поколения"</h3>
                <p>Запуск регулярной школьной газеты с современным дизайном и интересными рубриками</p>
                <div class="project-stats">
                    <div class="progress-bar">
                        <div class="progress" style="width: 80%"></div>
                    </div>
                    <div class="stats">
                        <span><i class="fas fa-ruble-sign"></i> 24,000 собрано</span>
                        <span><i class="fas fa-bullseye"></i> 30,000 цель</span>
                    </div>
                </div>
                <a href="pages/project-details.html?id=2" class="btn btn-small">Поддержать</a>
            </div>
        </div>
        
        <div class="project-card">
            <div class="project-image">
                <img src="images/demo-project3.jpg" alt="Экологический проект" onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w-400'">
            </div>
            <div class="project-info">
                <h3>Эко-сад на школьном дворе</h3>
                <p>Создание экологического сада с редкими растениями и учебной зоной для биологии</p>
                <div class="project-stats">
                    <div class="progress-bar">
                        <div class="progress" style="width: 45%"></div>
                    </div>
                    <div class="stats">
                        <span><i class="fas fa-ruble-sign"></i> 22,500 собрано</span>
                        <span><i class="fas fa-bullseye"></i> 50,000 цель</span>
                    </div>
                </div>
                <a href="pages/project-details.html?id=3" class="btn btn-small">Поддержать</a>
            </div>
        </div>
    `;
}

// Отображение проектов
function displayProjects(projects) {
    const container = document.getElementById('featured-projects');
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        showDemoProjects();
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-image">
                <img src="${project.image_url || 'images/default-project.jpg'}" 
                     alt="${project.title}" 
                     onerror="this.src='images/default-project.jpg'">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.short_description || (project.description ? project.description.substring(0, 100) + '...' : '')}</p>
                <div class="project-stats">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(100, (project.current_amount / project.goal_amount) * 100)}%"></div>
                    </div>
                    <div class="stats">
                        <span><i class="fas fa-ruble-sign"></i> ${project.current_amount} собрано</span>
                        <span><i class="fas fa-bullseye"></i> ${project.goal_amount} цель</span>
                    </div>
                </div>
                <a href="pages/project-details.html?id=${project.id}" class="btn btn-small">Поддержать</a>
            </div>
        </div>
    `).join('');
}

// Проверка состояния авторизации
async function checkAuthState() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        updateAuthUI(session);
        
        // Слушаем изменения авторизации
        supabase.auth.onAuthStateChange((_event, session) => {
            updateAuthUI(session);
        });
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
}

// Обновление UI в зависимости от авторизации
function updateAuthUI(session) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const profileLink = document.getElementById('profile-link');
    
    if (session?.user) {
        // Пользователь авторизован
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (profileLink) {
            profileLink.innerHTML = `<i class="fas fa-user"></i> ${session.user.email}`;
        }
    } else {
        // Пользователь не авторизован
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}
