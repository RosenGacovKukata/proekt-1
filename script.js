// DOM Elements
const currentDateEl = document.getElementById('currentDate');
const taskList = document.getElementById('taskList');
const foldersList = document.getElementById('projectsList');
const dailyChart = document.getElementById('dailyChart');
const folderChart = document.getElementById('projectChart');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const addTaskBtn = document.getElementById('addTaskBtn');
const addFolderBtn = document.getElementById('addProjectBtn');
const searchTasks = document.getElementById('searchTasks');
const searchFolders = document.getElementById('searchProjects');
const taskStatusFilter = document.getElementById('taskStatusFilter');
const statusCards = document.querySelectorAll('.status-card');
const completedTasksCount = document.getElementById('completedTasksCount');
const ongoingTasksCount = document.getElementById('ongoingTasksCount');
const chartDate = document.getElementById('chartDate');
const chartTimeRange = document.getElementById('chartTimeRange');
const generateReportBtn = document.getElementById('generateReport');

// Modals
const addTaskModal = document.getElementById('addTaskModal');
const addFolderModal = document.getElementById('addProjectModal');
const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-modal');
const addTaskForm = document.getElementById('addTaskForm');
const addFolderForm = document.getElementById('addProjectForm');
const deleteModal = document.getElementById('deleteModal');
const deleteMessage = document.getElementById('deleteMessage');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const addTaskToFolderModal = document.getElementById('addTaskToProjectModal');
const availableTasks = document.getElementById('availableTasks');

// Colors
const colors = {
    primary: '#FF0066',
    primaryLight: '#ff3385',
    primaryTransparent: 'rgba(255, 0, 102, 0.1)'
};

// Data Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let folders = JSON.parse(localStorage.getItem('projects')) || [];
let currentDeleteAction = null;
let currentFolderId = null;

// Initialize date
function initializeDate() {
    const date = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = date.toLocaleDateString('en-US', options);
    chartDate.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Modal Management
function openModal(modal) {
    modal.classList.add('active');
    
    // If it's the task modal, populate the folder dropdown
    if (modal === addTaskModal) {
        populateFolderDropdown();
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// Populate folder dropdown in task form
function populateFolderDropdown() {
    const folderSelect = document.getElementById('taskProject');
    folderSelect.innerHTML = '<option value="">Select Folder</option>';
    
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        folderSelect.appendChild(option);
    });
}

// Toggle dropdown menu
const folderDropdownToggle = document.getElementById('folderDropdownToggle');
const folderDropdownMenu = document.getElementById('folderDropdownMenu');
const selectedFoldersText = document.querySelector('.selected-folders');

folderDropdownToggle.addEventListener('click', () => {
    folderDropdownMenu.classList.toggle('active');
    folderDropdownToggle.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!folderDropdownToggle.contains(e.target) && !folderDropdownMenu.contains(e.target)) {
        folderDropdownMenu.classList.remove('active');
        folderDropdownToggle.classList.remove('active');
    }
});

// Update selected folders text
function updateSelectedFoldersText(selectedFolders) {
    if (selectedFolders.length === 0) {
        selectedFoldersText.textContent = 'Select folders';
        return;
    }

    const selectedFolderNames = selectedFolders.map(folderId => {
        const folder = folders.find(f => f.id === parseInt(folderId));
        return folder ? folder.name : '';
    }).filter(Boolean);

    if (selectedFolderNames.length === 0) {
        selectedFoldersText.textContent = 'Select folders';
    } else if (selectedFolderNames.length === 1) {
        selectedFoldersText.textContent = selectedFolderNames[0];
    } else {
        selectedFoldersText.textContent = `${selectedFolderNames[0]} +${selectedFolderNames.length - 1} more`;
    }
}

// Populate folder checkboxes
function populateFolderCheckboxes(selectedFolders = []) {
    const folderCheckboxes = document.querySelector('.folder-checkboxes');
    folderCheckboxes.innerHTML = '';
    
    folders.forEach(folder => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'folder-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `folder-${folder.id}`;
        checkbox.value = folder.id;
        checkbox.checked = selectedFolders.includes(folder.id.toString());
        
        checkbox.addEventListener('change', () => {
            const selectedFolders = Array.from(document.querySelectorAll('.folder-checkbox-item input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            updateSelectedFoldersText(selectedFolders);
        });
        
        const folderInfo = document.createElement('div');
        folderInfo.className = 'folder-info';
        
        const folderName = document.createElement('div');
        folderName.className = 'folder-name';
        folderName.textContent = folder.name;
        
        const folderDescription = document.createElement('div');
        folderDescription.className = 'folder-description';
        folderDescription.textContent = folder.description || 'No description';
        
        const taskCount = document.createElement('div');
        taskCount.className = 'task-count';
        taskCount.textContent = `${folder.tasks || 0} tasks`;
        
        folderInfo.appendChild(folderName);
        folderInfo.appendChild(folderDescription);
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(folderInfo);
        checkboxItem.appendChild(taskCount);
        
        folderCheckboxes.appendChild(checkboxItem);
    });
    
    updateSelectedFoldersText(selectedFolders);
}

// Event Listeners for Modals
addTaskBtn.addEventListener('click', () => openModal(addTaskModal));
addFolderBtn.addEventListener('click', () => openModal(addFolderModal));

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal === addTaskModal) {
            // Reset the form
            addTaskForm.reset();
            delete addTaskForm.dataset.editingTaskId;
            
            // Reset the modal title and button text
            document.querySelector('#addTaskModal h2').textContent = 'Add New Task';
            document.querySelector('#addTaskModal .btn-primary').textContent = 'Add Task';
        }
        closeModal(modal);
    });
});

// Navigation
function navigateToPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    document.getElementById(`${pageId}-page`).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageId = item.getAttribute('data-page');
        navigateToPage(pageId);
    });
});

// Task Management
function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-card';
    
    // Get all folder names for this task
    let folderTags = '';
    if (task.folders && task.folders.length > 0) {
        task.folders.forEach(folderId => {
            const folder = folders.find(f => f.id === parseInt(folderId));
            if (folder) {
                folderTags += `<span class="task-project">${folder.name}</span>`;
            }
        });
    }
    
    taskEl.innerHTML = `
        <div class="task-header">
            <div class="task-title-group">
                <span class="material-icons complete-task" data-action="complete" title="${task.status === 'complete' ? 'Mark as Ongoing' : 'Mark as Complete'}">
                    ${task.status === 'complete' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <div class="task-main-info">
                    <div class="task-title-row">
                        <h3 class="task-title ${task.status === 'complete' ? 'completed' : ''}">${task.title}</h3>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-projects">${folderTags}</div>
                </div>
            </div>
            <div class="task-actions">
                <span class="material-icons" data-action="edit">edit</span>
                <span class="material-icons" data-action="delete">delete</span>
            </div>
        </div>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
        <div class="task-meta">
            <span class="task-date">
                <span class="material-icons">event</span>
                Deadline: ${task.dueDate || task.date}
            </span>
        </div>
    `;

    // Add event listeners for task actions
    taskEl.querySelector('[data-action="complete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskComplete(task);
    });
    taskEl.querySelector('[data-action="edit"]').addEventListener('click', () => editTask(task));
    taskEl.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTask(task.id));

    return taskEl;
}

function addNewTask(taskData) {
    const task = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: 'ongoing', // Default status is ongoing
        ...taskData
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateTaskCounts();
}

// Edit Task
function editTask(task) {
    // Populate the task form with existing data
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskPriority').value = task.priority;
    
    // Populate folder checkboxes with existing folders
    populateFolderCheckboxes(task.folders || []);

    // Store the task ID for updating
    addTaskForm.dataset.editingTaskId = task.id;

    // Change the form title and submit button text
    document.querySelector('#addTaskModal h2').textContent = 'Edit Task';
    document.querySelector('#addTaskModal .btn-primary').textContent = 'Update Task';

    // Open the modal
    openModal(addTaskModal);
}

// Delete Confirmation Modal
function showDeleteModal(message, action) {
    deleteMessage.textContent = message;
    currentDeleteAction = action;
    openModal(deleteModal);
}

// Event Listeners for Delete Modal
confirmDeleteBtn.addEventListener('click', () => {
    if (currentDeleteAction) {
        currentDeleteAction();
    }
    closeModal(deleteModal);
});

// Delete Task
function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const message = `Do you want to delete the task "${task.title}"?`;
    showDeleteModal(message, () => {
        if (task.folders && task.folders.length > 0) {
            // Update folders' task count
            task.folders.forEach(folderId => {
                const folder = folders.find(f => f.id === parseInt(folderId));
                if (folder && folder.tasks > 0) {
                    folder.tasks--;
                }
            });
            saveFolders();
            renderFolders();
        }
        
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateTaskCounts();
    });
}

function updateTaskCounts() {
    const counts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {});

    // Update status card counts
    document.querySelector('.status-card.ongoing .count').textContent = counts['ongoing'] || 0;
    document.querySelector('.status-card.complete .count').textContent = counts['complete'] || 0;

    // Update overview counts
    completedTasksCount.textContent = counts['complete'] || 0;
    ongoingTasksCount.textContent = counts['ongoing'] || 0;
}

// Calculate folder progress
function calculateFolderProgress(folderId) {
    const folderTasks = tasks.filter(task => 
        task.folders && task.folders.includes(folderId.toString())
    );
    
    if (folderTasks.length === 0) return 0;
    
    const completedTasks = folderTasks.filter(task => task.status === 'complete').length;
    return Math.round((completedTasks / folderTasks.length) * 100);
}

// Calculate folder task counts
function calculateFolderTaskCounts(folderId) {
    const folderTasks = tasks.filter(task => 
        task.folders && task.folders.includes(folderId.toString())
    );
    
    const totalTasks = folderTasks.length;
    const completedTasks = folderTasks.filter(task => task.status === 'complete').length;
    
    return { totalTasks, completedTasks };
}

// Create folder element
function createFolderElement(folder) {
    const folderEl = document.createElement('div');
    folderEl.className = 'project-card';
    
    const progress = calculateFolderProgress(folder.id);
    const { totalTasks, completedTasks } = calculateFolderTaskCounts(folder.id);
    
    folderEl.innerHTML = `
        <div class="project-header">
            <div class="project-title">
                <h3>${folder.name}</h3>
            </div>
            <div class="project-actions">
                <span class="material-icons" data-action="delete" title="Delete Folder">delete</span>
            </div>
        </div>
        <p class="project-description">${folder.description || ''}</p>
        <div class="project-team">
            <div class="team-member add" data-action="add-task" title="Add Task to Folder">+</div>
        </div>
        <div class="project-progress">
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <span>${progress}%</span>
        </div>
        <div class="project-meta">
            <div class="meta-tasks">${completedTasks}/${totalTasks} Tasks</div>
        </div>
    `;

    // Add event listener for delete button
    folderEl.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteFolder(folder.id);
    });

    // Add event listener for add task button
    folderEl.querySelector('[data-action="add-task"]').addEventListener('click', (e) => {
        e.stopPropagation();
        currentFolderId = folder.id;
        showAvailableTasks(folder.id);
        openModal(addTaskToFolderModal);
    });

    return folderEl;
}

// Delete Folder
function deleteFolder(folderId) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const message = `Do you want to delete the folder "${folder.name}"?`;
    showDeleteModal(message, () => {
        // Remove the folder
        folders = folders.filter(f => f.id !== folderId);
        saveFolders();
        
        // Remove associated tasks
        tasks = tasks.filter(t => !t.folders || !t.folders.includes(folderId.toString()));
        saveTasks();
        
        // Update UI
        renderFolders();
        renderTasks();
        updateTaskCounts();
    });
}

// Search Functionality
function searchItems(searchTerm, items, renderFunction) {
    const filtered = items.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderFunction(filtered);
}

searchTasks.addEventListener('input', (e) => {
    searchItems(e.target.value, tasks, renderFilteredTasks);
});

searchFolders.addEventListener('input', (e) => {
    searchItems(e.target.value, folders, renderFilteredFolders);
});

// Filter Functionality
taskStatusFilter.addEventListener('change', (e) => {
    const status = e.target.value;
    const filtered = status === 'all' ? tasks : tasks.filter(task => task.status === status);
    renderFilteredTasks(filtered);
});

// Update folder task counts
function updateFolderTaskCounts() {
    // Reset all folder task counts
    folders.forEach(folder => {
        folder.tasks = 0;
    });

    // Count tasks for each folder
    tasks.forEach(task => {
        if (task.folders && task.folders.length > 0) {
            task.folders.forEach(folderId => {
                const folder = folders.find(f => f.id === parseInt(folderId));
                if (folder) {
                    folder.tasks = (folder.tasks || 0) + 1;
                }
            });
        }
    });

    // Save and render updated folders
    saveFolders();
    renderFolders();
}

// Update folder progress
function updateFolderProgress() {
    folders.forEach(folder => {
        folder.progress = calculateFolderProgress(folder.id);
    });
    saveFolders();
    renderFolders();
}

// Form Submissions
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get selected folders
    const selectedFolders = Array.from(document.querySelectorAll('.folder-checkbox-item input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        folders: selectedFolders,
        dueDate: document.getElementById('taskDueDate').value,
        priority: document.getElementById('taskPriority').value,
        status: 'ongoing'
    };
    
    if (!taskData.title.trim()) {
        alert('Please enter a task title');
        return;
    }

    // Check if we're editing an existing task
    const editingTaskId = addTaskForm.dataset.editingTaskId;
    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === parseInt(editingTaskId));
        if (taskIndex !== -1) {
            // Preserve the existing status
            taskData.status = tasks[taskIndex].status;
            
            // Update the task
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...taskData
            };
            
            saveTasks();
            renderTasks();
            updateTaskCounts();
            updateFolderTaskCounts();
            updateFolderProgress(); // Update folder progress
        }
    } else {
        // Add new task
        addNewTask(taskData);
        updateFolderTaskCounts();
        updateFolderProgress(); // Update folder progress
    }

    // Reset the form and close the modal
    closeModal(addTaskModal);
    e.target.reset();
    delete addTaskForm.dataset.editingTaskId;
    
    // Reset the modal title and button text
    document.querySelector('#addTaskModal h2').textContent = 'Add New Task';
    document.querySelector('#addTaskModal .btn-primary').textContent = 'Add Task';
});

addFolderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const folderData = {
        id: Date.now(),
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        progress: 0,
        tasks: 0
    };
    
    if (!folderData.name.trim()) {
        alert('Please enter a folder name');
        return;
    }
    
    folders.push(folderData);
    saveFolders();
    renderFolders();
    closeModal(addFolderModal);
    e.target.reset();
});

// Show available tasks for adding to folder
function showAvailableTasks(folderId) {
    availableTasks.innerHTML = '';
    
    // Get tasks that are not already in this folder
    const availableTasksList = tasks.filter(task => 
        !task.folders || !task.folders.includes(folderId.toString())
    );

    if (availableTasksList.length === 0) {
        availableTasks.innerHTML = '<p class="no-tasks">No available tasks to add</p>';
        return;
    }

    availableTasksList.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'available-task-item';
        taskEl.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-status">${task.status}</div>
            </div>
            <button class="add-task-btn" data-task-id="${task.id}">
                <span class="material-icons">add</span>
                Add
            </button>
        `;

        // Add event listener for add button
        taskEl.querySelector('.add-task-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addTaskToFolder(task.id, folderId);
        });

        availableTasks.appendChild(taskEl);
    });
}

// Add task to folder
function addTaskToFolder(taskId, folderId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        // Initialize folders array if it doesn't exist
        if (!tasks[taskIndex].folders) {
            tasks[taskIndex].folders = [];
        }
        
        // Add folder if it's not already there
        if (!tasks[taskIndex].folders.includes(folderId.toString())) {
            tasks[taskIndex].folders.push(folderId.toString());
            
            // Update folder's task count
            const folderIndex = folders.findIndex(f => f.id === folderId);
            if (folderIndex !== -1) {
                folders[folderIndex].tasks = (folders[folderIndex].tasks || 0) + 1;
                saveFolders();
            }
            
            saveTasks();
            renderTasks();
            renderFolders();
        }
        closeModal(addTaskToFolderModal);
    }
}

// Storage Management
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveFolders() {
    localStorage.setItem('projects', JSON.stringify(folders));
}

// Render Functions
function renderFilteredTasks(filteredTasks) {
    taskList.innerHTML = '';
    filteredTasks.forEach(task => taskList.appendChild(createTaskElement(task)));
}

function renderFilteredFolders(filteredFolders) {
    foldersList.innerHTML = '';
    filteredFolders.forEach(folder => foldersList.appendChild(createFolderElement(folder)));
}

function renderTasks() {
    renderFilteredTasks(tasks);
}

function renderFolders() {
    renderFilteredFolders(folders);
}

// Charts
function initializeCharts() {
    // Daily tasks chart
    new Chart(dailyChart, {
        type: 'bar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [
                {
                    label: 'Completed',
                    data: [3, 4, 5, 3, 2, 3, 4],
                    backgroundColor: colors.primary
                },
                {
                    label: 'Ongoing',
                    data: [2, 3, 4, 2, 1, 2, 3],
                    backgroundColor: colors.primaryLight
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 6
                }
            }
        }
    });

    // Folder overview chart
    new Chart(folderChart, {
        type: 'line',
        data: {
            labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [{
                label: 'Tasks Completed',
                data: [2, 3, 4, 3, 5, 4, 6],
                borderColor: colors.primary,
                backgroundColor: colors.primaryTransparent,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 8
                }
            }
        }
    });
}

// Report Generation
generateReportBtn.addEventListener('click', () => {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    // Implement report generation logic
    console.log('Generate report for:', { startDate, endDate });
});

// Toggle task complete status
function toggleTaskComplete(task) {
    task.status = task.status === 'complete' ? 'ongoing' : 'complete';
    
    // Find the task in the array and update it
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
        tasks[taskIndex] = task;
        saveTasks();
        renderTasks();
        updateTaskCounts();
        updateFolderProgress(); // Update folder progress when task status changes
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeDate();
    renderTasks();
    renderFolders();
    updateTaskCounts();
    initializeCharts();
}); 