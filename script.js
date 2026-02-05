// инициализация localStorage при первой загрузке
function initStorage() {
    // Инициализируем пользователей (создаем администратора при первом запуске)
    if (!localStorage.getItem('users')) {
        const adminUser = {
            id: 1,
            fio: "Администратор системы",
            phone: "+79000000000",
            email: "admin@narusheniyam.net",
            username: "copp",
            password: "password",
            regDate: new Date().toLocaleDateString(),
            isAdmin: true
        };
        localStorage.setItem('users', JSON.stringify([adminUser]));
    }
    
    // Инициализируем заявления
    if (!localStorage.getItem('appeals')) {
        localStorage.setItem('appeals', JSON.stringify([]));
    }
    
    // Инициализируем текущего пользователя
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', '');
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
    
    if (window.location.pathname.includes('admin.html')) {
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = 'index.html';
        } else {
            loadAdminPanel();
        }
    }
    
    if (window.location.pathname.includes('dashboard.html')) {
        if (!currentUser) {
            window.location.href = 'index.html';
        } else {
            loadDashboard();
        }
    }
    
    if (window.location.pathname.includes('appeal-form.html')) {
        if (!currentUser) {
            window.location.href = 'index.html';
        } else {
            // Загружаем имя пользователя
            const userNameElement = document.getElementById('user-name');
            if (userNameElement && currentUser.fio) {
                userNameElement.textContent = currentUser.fio;
            }
        }
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
        regDate: new Date().toLocaleDateString(),
        isAdmin: false
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
    const username = document.getElementById('login-username').value.trim();
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
            email: user.email,
            isAdmin: user.isAdmin || false
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // перенаправляем в зависимости от роли
        if (userData.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
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
    const carNumber = document.getElementById('car-number').value.trim();
    const description = document.getElementById('description').value.trim();
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

// загрузка панели администратора
function loadAdminPanel() {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    // Отображение информации администратора
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) {
        adminNameElement.textContent = user.fio;
    }
    
    // загрузка всех заявлений
    const appeals = JSON.parse(localStorage.getItem('appeals'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    const appealsContainer = document.getElementById('admin-appeals');
    if (!appealsContainer) return;
    
    if (appeals.length === 0) {
        appealsContainer.innerHTML = '<div class="no-appeals">Заявлений пока нет</div>';
        updateAdminStats();
        return;
    }
    
    // сортируем по дате (новые сначала)
    appeals.sort((a, b) => b.id - a.id);
    
    appealsContainer.innerHTML = appeals.map(appeal => {
        // находим пользователя, создавшего заявление
        const appealUser = users.find(u => u.id === appeal.userId);
        const userFio = appealUser ? appealUser.fio : 'Неизвестный пользователь';
        
        return `
            <div class="appeal-card" id="appeal-${appeal.id}">
                <div class="appeal-header">
                    <div class="appeal-number">Заявление #${appeal.id}</div>
                    <div class="appeal-user">От: ${userFio}</div>
                </div>
                <div class="appeal-details">
                    <p><strong>Автомобиль:</strong> ${appeal.carNumber}</p>
                    <p><strong>Описание нарушения:</strong></p>
                    <div class="appeal-description">${appeal.description}</div>
                    <p><strong>Дата создания:</strong> ${appeal.createdAt}</p>
                </div>
                <div class="appeal-footer">
                    <div class="status-controls">
                        <strong>Статус:</strong>
                        <select class="status-select" onchange="updateAppealStatus(${appeal.id}, this.value)">
                            <option value="new" ${appeal.status === 'new' ? 'selected' : ''}>Новое</option>
                            <option value="confirmed" ${appeal.status === 'confirmed' ? 'selected' : ''}>Подтверждено</option>
                            <option value="rejected" ${appeal.status === 'rejected' ? 'selected' : ''}>Отклонено</option>
                        </select>
                        <span class="status-badge status-${appeal.status}">${getStatusText(appeal.status)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateAdminStats();
}

// обновление статуса заявления
function updateAppealStatus(appealId, newStatus) {
    const appeals = JSON.parse(localStorage.getItem('appeals'));
    const appealIndex = appeals.findIndex(a => a.id === appealId);
    
    if (appealIndex !== -1) {
        appeals[appealIndex].status = newStatus;
        appeals[appealIndex].updatedAt = new Date().toLocaleString();
        localStorage.setItem('appeals', JSON.stringify(appeals));
        
        // обновляем отображение статуса
        const statusBadge = document.querySelector(`#appeal-${appealId} .status-badge`);
        if (statusBadge) {
            statusBadge.className = `status-badge status-${newStatus}`;
            statusBadge.textContent = getStatusText(newStatus);
        }
        
        // обновляем статистику
        updateAdminStats();
        
        // показываем уведомление
        showNotification(`Статус заявления #${appealId} изменен на "${getStatusText(newStatus)}"`);
    }
}

// обновление статистики в панели администратора
function updateAdminStats() {
    const appeals = JSON.parse(localStorage.getItem('appeals'));
    
    const totalElement = document.getElementById('total-appeals');
    const newElement = document.getElementById('new-appeals');
    const confirmedElement = document.getElementById('confirmed-appeals');
    const rejectedElement = document.getElementById('rejected-appeals');
    
    if (totalElement) totalElement.textContent = appeals.length;
    if (newElement) newElement.textContent = appeals.filter(a => a.status === 'new').length;
    if (confirmedElement) confirmedElement.textContent = appeals.filter(a => a.status === 'confirmed').length;
    if (rejectedElement) rejectedElement.textContent = appeals.filter(a => a.status === 'rejected').length;
}

// показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// фильтрация заявлений в панели администратора
function filterAppeals() {
    const filterValue = document.getElementById('status-filter').value;
    const allCards = document.querySelectorAll('#admin-appeals .appeal-card');
    
    allCards.forEach(card => {
        if (filterValue === 'all') {
            card.style.display = 'block';
        } else {
            const statusBadge = card.querySelector('.status-badge');
            const status = statusBadge.textContent.toLowerCase();
            const statusMap = {
                'новое': 'new',
                'подтверждено': 'confirmed',
                'отклонено': 'rejected'
            };
            
            if (statusMap[status] === filterValue) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Функции для отладки
function resetData() {
    if (confirm("Очистить все данные и создать нового администратора?")) {
        localStorage.clear();
        initStorage();
        alert("Данные сброшены. Администратор создан заново.");
        location.reload();
    }
}

function showUsers() {
    const users = JSON.parse(localStorage.getItem('users'));
    console.log("Все пользователи:", users);
    alert(`Всего пользователей: ${users.length}\n\nАдминистратор: ${users.find(u => u.isAdmin) ? 'Есть' : 'Нет'}`);
}
