let tasks = [];
let currentEditingId = null;


const taskForm = document.getElementById('taskForm');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const closeFormBtn = document.getElementById('closeFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const statusFilter = document.getElementById('statusFilter');
const sortFilter = document.getElementById('sortFilter');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const formTitle = document.getElementById('formTitle');


const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const subjectInput = document.getElementById('subject');
const priorityInput = document.getElementById('priority');


document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    renderTasks();
});


function setupEventListeners() {
    toggleFormBtn.addEventListener('click', () => {
        taskForm.classList.remove('hidden');
        currentEditingId = null;
        resetForm();
        formTitle.textContent = 'Nueva Tarea';
    });

    closeFormBtn.addEventListener('click', closeForm);
    cancelFormBtn.addEventListener('click', closeForm);
    taskForm.addEventListener('submit', handleFormSubmit);

    searchInput.addEventListener('input', renderTasks);
    priorityFilter.addEventListener('change', renderTasks);
    statusFilter.addEventListener('change', renderTasks);
    sortFilter.addEventListener('change', renderTasks);

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}


function handleFormSubmit(e) {
    e.preventDefault();

    const taskData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        date: dateInput.value,
        subject: subjectInput.value.trim(),
        priority: priorityInput.value,
    };

    if (currentEditingId) {
        
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id === currentEditingId) {
                tasks[i].title = taskData.title;
                tasks[i].description = taskData.description;
                tasks[i].date = taskData.date;
                tasks[i].subject = taskData.subject;
                tasks[i].priority = taskData.priority;
            }
        }
    } else {
      
        const newTask = {
            id: generateId(),
            title: taskData.title,
            description: taskData.description,
            date: taskData.date,
            subject: taskData.subject,
            priority: taskData.priority,
            status: 'Pendiente',
            createdAt: new Date().getTime()
        };
        tasks.push(newTask);
    }

    saveTasks();
    renderTasks();
    closeForm();
}


function loadTasks() {
    const saved = localStorage.getItem('tasks');
    tasks = saved ? JSON.parse(saved) : [];
}


function editTask(id) {
    const task = tasks.find(t => t.id === id);
    currentEditingId = id;
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    dateInput.value = task.date;
    subjectInput.value = task.subject;
    priorityInput.value = task.priority;
    formTitle.textContent = 'Editar Tarea';
    taskForm.classList.remove('hidden');
    taskForm.scrollIntoView({ behavior: 'smooth' });
}


function deleteTask(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}


function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}


function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function closeForm() {
    taskForm.classList.add('hidden');
    resetForm();
    currentEditingId = null;
}


function resetForm() {
    taskForm.reset();
    titleInput.value = '';
    descriptionInput.value = '';
    dateInput.value = '';
    subjectInput.value = '';
    priorityInput.value = '';
}


function closeModal() {
    modalOverlay.classList.add('hidden');
}


function toggleTaskStatus(id) {
   
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
        
            if (tasks[i].status === 'Completada') {
                tasks[i].status = 'Pendiente';
            } else {
                tasks[i].status = 'Completada';
            }
            break;
        }
    }
    saveTasks();
    renderTasks();
}


function getTaskStatus(task) {
    
    if (task.status === 'Completada') {
        return 'Completada';
    }
    
 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
  
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    

    if (taskDate < today) {
        return 'Retrasada';
    } else {
        return 'Pendiente';
    }
}



function getFilteredAndSortedTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPriority = priorityFilter.value;
    const selectedStatus = statusFilter.value;

   
    let filtered = [];
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        
       
        const matchesSearch = !searchTerm || 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.subject.toLowerCase().includes(searchTerm);
        
        
        const matchesPriority = !selectedPriority || task.priority === selectedPriority;
        
       
        const status = getTaskStatus(task);
        const matchesStatus = !selectedStatus || status === selectedStatus;
        
       
        if (matchesSearch && matchesPriority && matchesStatus) {
            filtered.push(task);
        }
    }

    const sortType = sortFilter.value;
    if (sortType === 'fecha-asc') {
        filtered.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    } else if (sortType === 'fecha-desc') {
        filtered.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    } else if (sortType === 'prioridad') {
        filtered.sort(function(a, b) {
            const prioridades = { 'Baja': 1, 'Media': 2, 'Alta': 3 };
            return prioridades[b.priority] - prioridades[a.priority];
        });
    }

    return filtered;
}



function renderTasks() {
    const filteredTasks = getFilteredAndSortedTasks();

   
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    
    emptyState.style.display = 'none';

  
    let html = '';
    for (let i = 0; i < filteredTasks.length; i++) {
        html = html + createTaskCard(filteredTasks[i]);
    }
    tasksContainer.innerHTML = html;

  
    attachCardListeners();
}


function createTaskCard(task) {
    const status = getTaskStatus(task);
    const formattedDate = formatDate(task.date);
    
    const html = `
        <div class="task-card">
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(task.title)}</h3>
            </div>

            <div class="card-date">📅 ${formattedDate}</div>
            <div class="card-subject">${escapeHtml(task.subject)}</div>

            <div>
                <span class="priority-badge priority-${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>
                <span class="status-badge status-${status.toLowerCase()}">
                    ${status}
                </span>
            </div>

            <p class="card-description" id="desc-${task.id}">
                ${escapeHtml(task.description)}
            </p>

            <div class="card-footer">
                <button class="btn-card-action btn-card-view" data-id="${task.id}" data-action="view">
                    📋 Ver
                </button>
                <button class="btn-card-action btn-card-view" data-id="${task.id}" data-action="edit">
                    ✏️ Editar
                </button>
                <button class="btn-card-action btn-card-delete" data-id="${task.id}" data-action="delete">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;

    return html;
}


function attachCardListeners() {
   
    
    const botones = document.querySelectorAll('[data-action]');
    for (let i = 0; i < botones.length; i++) {
        botones[i].addEventListener('click', function(e) {
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            const id = this.getAttribute('data-id');

            if (action === 'view') {
                showTaskModal(id);
            } else if (action === 'edit') {
                editTask(id);
            } else if (action === 'delete') {
                deleteTask(id);
            }
        });
    }

   
    const tarjetas = document.querySelectorAll('.task-card');
    for (let i = 0; i < tarjetas.length; i++) {
        tarjetas[i].addEventListener('click', function(e) {
           
            
            if (!e.target.closest('[data-action]')) {
                const idElement = this.querySelector('[data-id]');
                showTaskModal(idElement.getAttribute('data-id'));
            }
        });
    }
}


function showTaskModal(id) {

    
    let task = null;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            task = tasks[i];
            break;
        }
    }

    const status = getTaskStatus(task);
    const formattedDate = formatDate(task.date);

    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = task.title;

    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Descripción</div>
            <div class="detail-value">${escapeHtml(task.description)}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">Fecha de Entrega</div>
            <div class="detail-value">${formattedDate}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">Materia</div>
            <div class="detail-value">${escapeHtml(task.subject)}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">Prioridad</div>
            <div class="detail-value">
                <span class="priority-badge priority-${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>
            </div>
        </div>

        <div class="detail-row">
            <div class="detail-label">Estado</div>
            <div class="detail-value">
                <span class="status-badge status-${status.toLowerCase()}">
                    ${status}
                </span>
            </div>
        </div>

        <div class="modal-actions">
            <button class="btn btn-edit" onclick="editTask('${id}')">✏️ Editar</button>
            <button class="btn btn-danger" onclick="deleteTask('${id}')">🗑️ Eliminar</button>
        </div>
    `;

   
    modalOverlay.classList.remove('hidden');
}


function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addSampleTasks() {
    tasks = [
        {
            id: generateId(),
            title: 'Trabajo de Historia',
            description: 'Investigar sobre la Revolución Francesa y presentar un informe de 5 páginas sobre sus causas, eventos principales y consecuencias.',
            date: '2024-12-20',
            subject: 'Historia',
            priority: 'Alta',
            status: 'Pendiente',
            createdAt: new Date().getTime()
        },
        {
            id: generateId(),
            title: 'Proyecto de Matemáticas',
            description: 'Resolver 50 ejercicios de geometría analítica y crear una presentación visual explicando los conceptos.',
            date: '2024-12-25',
            subject: 'Matemáticas',
            priority: 'Media',
            status: 'Pendiente',
            createdAt: new Date().getTime()
        },
        {
            id: generateId(),
            title: 'Lectura de Literatura',
            description: 'Leer los primeros 3 capítulos de Don Quijote y escribir un análisis sobre los personajes principales.',
            date: '2024-12-18',
            subject: 'Literatura',
            priority: 'Media',
            status: 'Pendiente',
            createdAt: new Date().getTime()
        }
    ];
    saveTasks();
    renderTasks();
}
