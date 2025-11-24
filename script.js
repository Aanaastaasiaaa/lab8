const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const feedbackModal = document.getElementById('feedbackModal');
const feedbackForm = document.getElementById('feedbackForm');
const responseMessage = document.getElementById('responseMessage');

const STORAGE_KEY = 'feedbackFormData';

function validateFullName(name) {
    return /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(name);
}

function validatePhone(phone) {
    return /^[\d\s\+]+$/.test(phone);
}

openModalBtn.addEventListener('click', function() {
    feedbackModal.style.display = 'flex';
    history.pushState({ modalOpen: true }, '', '#feedback');
    restoreFormData();
});

closeModalBtn.addEventListener('click', closeModal);

feedbackModal.addEventListener('click', function(e) {
    if (e.target === feedbackModal) {
        closeModal();
    }
});

window.addEventListener('popstate', function(e) {
    if (location.hash !== '#feedback') {
        closeModal();
    }
});

function closeModal() {
    feedbackModal.style.display = 'none';
    if (location.hash === '#feedback') {
        history.back();
    }
}

function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('message').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function restoreFormData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('fullName').value = formData.fullName || '';
        document.getElementById('email').value = formData.email || '';
        document.getElementById('phone').value = formData.phone || '';
        document.getElementById('organization').value = formData.organization || '';
        document.getElementById('message').value = formData.message || '';
    }
}

function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
}

function validateForm() {
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;

    let isValid = true;

    if (fullName && !validateFullName(fullName)) {
        showFieldError('fullName', 'ФИО может содержать только буквы, пробелы и дефисы');
        isValid = false;
    } else {
        clearFieldError('fullName');
    }

    if (phone && !validatePhone(phone)) {
        showFieldError('phone', 'Телефон может содержать только цифры, пробелы, +');
        isValid = false;
    } else {
        clearFieldError('phone');
    }

    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');

    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;

    formGroup.appendChild(errorElement);
    field.style.borderColor = '#dc3545';
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.field-error');

    if (existingError) {
        existingError.remove();
    }

    field.style.borderColor = '#C2C5CE';
}

feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) {
        showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }

    const formData = new FormData(feedbackForm);

    fetch('https://formcarry.com/s/ZR_aiSuf9jL', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            showMessage('Сообщение успешно отправлено!', 'success');
            feedbackForm.reset();
            clearFormData();
        } else {
            return response.json().then(err => {
                throw new Error(err.error || 'Ошибка отправки формы');
            });
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', 'error');
    });
});

function showMessage(text, type) {
    responseMessage.textContent = text;
    responseMessage.className = 'message ' + type;
    responseMessage.style.display = 'block';

    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
}

document.getElementById('fullName').addEventListener('input', function(e) {
    if (this.value && !validateFullName(this.value)) {
        showFieldError('fullName', 'ФИО может содержать только буквы, пробелы ');
    } else {
        clearFieldError('fullName');
    }
    saveFormData();
});

document.getElementById('phone').addEventListener('input', function(e) {
    if (this.value && !validatePhone(this.value)) {
        showFieldError('phone', 'Телефон может содержать только цифры, пробелы, +');
    } else {
        clearFieldError('phone');
    }
    saveFormData();
});

const otherInputs = feedbackForm.querySelectorAll('#email, #organization, #message');
otherInputs.forEach(input => {
    input.addEventListener('input', saveFormData);
});