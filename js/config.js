// Файл: js/config.js
// УДАЛИТЕ старый файл и создайте этот

// ========== ВАШИ КЛЮЧИ SUPABASE ==========
// ЗАМЕНИТЕ эти значения на реальные из вашего проекта Supabase

const SUPABASE_URL = https://yhqchvmoymbfvumwgwse.supabase.co;  // ← замените
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocWNodm1veW1iZnZ1bXdnd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTAyNzksImV4cCI6MjA4MDk2NjI3OX0.QRwyAqHGLPmEKYIp__3iqagewV_FEjoLFWyfy6cgeqo;  // ← замените

// ========== ИНИЦИАЛИЗАЦИЯ ==========

console.log('🔄 Загрузка config.js...');
console.log('Supabase URL установлен:', SUPABASE_URL ? 'Да' : 'Нет');
console.log('Supabase Key установлен:', SUPABASE_ANON_KEY ? 'Да' : 'Нет');

// Проверяем, загружен ли Supabase CDN
if (typeof supabase === 'undefined') {
    console.error('❌ ОШИБКА: Библиотека Supabase не загружена!');
    console.error('Добавьте в HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    alert('Ошибка: Supabase не подключен. Проверьте консоль (F12)');
} else {
    console.log('✅ Библиотека Supabase загружена');
}

// Пытаемся создать клиент
let supabaseClient = null;
try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase клиент создан');
    } else {
        console.error('❌ Ключи Supabase не настроены!');
        console.log('Получите ключи: Supabase Dashboard → Settings → API');
    }
} catch (error) {
    console.error('❌ Ошибка создания Supabase клиента:', error);
}

// Делаем глобально доступным
window.supabase = supabaseClient;
console.log('window.supabase установлен:', !!window.supabase);
