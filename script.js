// Показ/скрытие формы
function showForm() {
    document.getElementById('projectForm').style.display = 'block';
}

function hideForm() {
    document.getElementById('projectForm').style.display = 'none';
}

// Добавление проекта
function addProject(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const goal = document.getElementById('goal').value;
    
    alert(`Проект "${title}" отправлен на модерацию! Мы добавим его в течение дня.`);
    
    // Очищаем форму
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('goal').value = '';
    hideForm();
}

// Загрузка проектов из JSON
fetch('data.json')
    .then(response => response.json())
    .then(projects => {
        const container = document.getElementById('projects');
        
        projects.forEach(project => {
            const progress = (project.collected / project.goal) * 100;
            const progressWidth = progress > 100 ? 100 : progress;
            
            container.innerHTML += `
                <div class="project">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressWidth}%"></div>
                    </div>
                    <div class="stats">
                        <span>Собрано: ${project.collected}₽</span>
                        <span>Цель: ${project.goal}₽</span>
                        <span>Прогресс: ${Math.round(progress)}%</span>
                    </div>
                    <button onclick="supportProject(${project.id})" class="btn">Поддержать проект</button>
                </div>
            `;
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки проектов:', error);
        document.getElementById('projects').innerHTML = '<p>Проекты временно недоступны</p>';
    });

// Функция поддержки проекта
function supportProject(projectId) {
    alert(`Для поддержки проекта №${projectId}:\n\nСбербанк: 2202 2002 2020 2020\nТинькофф: 2200 7000 8000 9000\nЮMoney: 4100 1234 5678 9012\n\nПосле перевода сообщите нам для обновления суммы!`);
}
