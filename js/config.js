// =============================================
// КОНФИГУРАЦИЯ SUPABASE ДЛЯ HELPROJECTS
// =============================================

// 🔑 ВАШИ КЛЮЧИ SUPABASE (ЗАМЕНИТЕ НА СВОИ!)
const SUPABASE_URL = https://yhqchvmoymbfvumwgwse.supabase.co;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocWNodm1veW1iZnZ1bXdnd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTAyNzksImV4cCI6MjA4MDk2NjI3OX0.QRwyAqHGLPmEKYIp__3iqagewV_FEjoLFWyfy6cgeqo;

// =============================================
// ИНИЦИАЛИЗАЦИЯ SUPABASE
// =============================================

// Проверяем, подключен ли Supabase CDN
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase CDN не подключен!');
        console.log('📌 Добавьте в HTML перед другими скриптами:');
        console.log('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return null;
    }
    
    try {
        // Создаем клиент Supabase
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase успешно инициализирован');
        console.log('🔗 URL:', SUPABASE_URL);
        return supabaseClient;
    } catch (error) {
        console.error('❌ Ошибка инициализации Supabase:', error);
        return null;
    }
}

// Глобальная переменная для доступа к Supabase
let supabase = initSupabase();

// =============================================
// ПРОВЕРКА КЛЮЧЕЙ
// =============================================

function checkConfig() {
    console.group('🔧 Проверка конфигурации HelProjects');
    
    if (!SUPABASE_URL || SUPABASE_URL.includes('ваш-проект')) {
        console.error('❌ SUPABASE_URL не настроен!');
        console.log('📌 Получите URL в Supabase Dashboard → Settings → API');
    } else {
        console.log('✓ SUPABASE_URL:', SUPABASE_URL);
    }
    
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('ваш-anon')) {
        console.error('❌ SUPABASE_ANON_KEY не настроен!');
        console.log('📌 Получите anon public key в Supabase Dashboard → Settings → API');
    } else {
        console.log('✓ SUPABASE_ANON_KEY: •••' + SUPABASE_ANON_KEY.slice(-10));
    }
    
    console.log('✓ Supabase Client:', supabase ? 'Инициализирован' : 'Не инициализирован');
    console.groupEnd();
}

// Автопроверка при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkConfig);
} else {
    checkConfig();
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}
