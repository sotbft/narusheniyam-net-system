// инициализация localStorage при первой загрузке
function initStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('appeals')) {
        localStorage.setItem('appeals', JSON.stringify([]));
    }
}

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initStorage();
    
    // настройка вкладок на index.html
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginTabBtn && registerTabBtn) {
        loginTabBtn.addEventListener('click', function() {
            loginTabBtn.classList.add('active');
            registerTabBtn.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });
        
        registerTabBtn.addEventListener('click', function() {
            registerTabBtn.classList.add('active');
            loginTabBtn.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }
    
    // проверка авторизации для защищенных страниц
    const currentUser = getCurrentUser();
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.includes('appeal-form.html')) {
        if (!currentUser) {
            window.location.href = 'index.html';
        }
    }
    
    // загрузка данных для dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboard();
    }
});

// регистрация нового пользователя
function register() {
    const users = JSON.parse(localStorage.getItem('users'));
    const newUser = {
        id: Date.now(),
        fio: document.getElementById('reg-fio').value,
        phone: document.getElementById('reg-phone').value,
        email: document.getElementById('reg-email').value,
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        regDate: new Date().toLocaleDateString()
    };
    
    // проверка заполнения полей
    if (!newUser.fio || !newUser.phone || !newUser.email || !newUser.username || !newUser.password) {
        document.getElementById('register-message').textContent = 'Заполните все поля!';
        document.getElementById('register-message').style.color = '#e74c3c';
        return;
    }
    
    // проверка на существующего пользователя
    const existingUser = users.find(user => user.username === newUser.username);
    if (existingUser) {
        document.getElementById('register-message').textContent = 'Логин уже занят!';
        document.getElementById('register-message').style.color = '#e74c3c';
        return;
    }
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    document.getElementById('register-message').textContent = 'Регистрация успешна!';
    document.getElementById('register-message').style.color = '#27ae60';
    
    // очистка формы
    document.getElementById('reg-fio').value = '';
    document.getElementById('reg-phone').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    
    // автоматический переход на вкладку входа через 1.5 секунды
    setTimeout(() => {
        document.getElementById('login-tab-btn').click();
    }, 1500);
}

// вход в систему
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('users'));
    
    // проверка заполнения полей
    if (!username || !password) {
        document.getElementById('login-error').textContent = 'Заполните все поля!';
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // сохраняем только основные данные пользователя
        const userData = {
            id: user.id,
            fio: user.fio,
            username: user.username,
            email: user.email
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('login-error').textContent = 'Неверный логин или пароль!';
    }
}

// получение текущего пользователя
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// выход из системы
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// загрузка dashboard
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Отображение информации пользователя
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.fio;
    }
    
    // загрузка заявлений пользователя
    loadUserAppeals();
}

// загрузка заявлений пользователя
function loadUserAppeals() {
    const appeals = JSON.parse(localStorage.getItem('appeals'));
    const user = getCurrentUser();
    
    if (!appeals || !user) return;
    
    // фильтрация заявлений текущего пользователя
    const userAppeals = appeals.filter(appeal => appeal.userId === user.id);
    const appealsContainer = document.getElementById('appeals-container');
    
    if (!appealsContainer) return;
    
    if (userAppeals.length === 0) {
        appealsContainer.innerHTML = `
            <div class="no-appeals">
                У вас пока нет заявлений. Создайте первое!
            </div>
        `;
        return;
    }
    
    // сортируем по дате (новые сначала)
    userAppeals.sort((a, b) => b.id - a.id);
    
    // отображение заявлений
    appealsContainer.innerHTML = userAppeals.map(appeal => `
        <div class="appeal-card">
            <div class="appeal-header">
                <div class="appeal-number">Заявление №${appeal.id}</div>
                <div class="appeal-status status-${appeal.status}">
                    ${getStatusText(appeal.status)}
                </div>
            </div>
            <div class="appeal-details">
                <p><strong>Автомобиль:</strong> ${appeal.carNumber}</p>
                <p><strong>Нарушение:</strong> ${appeal.description}</p>
                <p><strong>Дата:</strong> ${appeal.createdAt}</p>
            </div>
        </div>
    `).join('');
}

// получение текста статуса
function getStatusText(status) {
    const statuses = {
        'new': 'Новое',
        'confirmed': 'Подтверждено',
        'rejected': 'Отклонено'
    };
    return statuses[status] || status;
}

// создание нового заявления
function createAppeal() {
    const carNumber = document.getElementById('car-number').value;
    const description = document.getElementById('description').value;
    const user = getCurrentUser();
    
    if (!carNumber || !description) {
        alert('Заполните все поля!');
        return;
    }
    
    if (!user) {
        alert('Ошибка авторизации!');
        return;
    }
    
    const appeals = JSON.parse(localStorage.getItem('appeals'));
    
    const newAppeal = {
        id: Date.now(),
        userId: user.id,
        carNumber: carNumber.toUpperCase(),
        description: description,
        status: 'new',
        createdAt: new Date().toLocaleString(),
        userFio: user.fio
    };
    
    appeals.push(newAppeal);
    localStorage.setItem('appeals', JSON.stringify(appeals));
    
    alert('Заявление успешно создано!');
    window.location.href = 'dashboard.html';
}

function goBack() {
    window.location.href = 'dashboard.html';
}