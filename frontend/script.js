let tasks = [];

// ---------------------------
// Load tasks from localStorage
// ---------------------------
function loadTasks() {
    const saved = localStorage.getItem("taskData");
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch {
            tasks = [];
        }
    }
    refreshTaskPreview();
}

// ---------------------------
// Save tasks to localStorage
// ---------------------------
function saveTasks() {
    localStorage.setItem("taskData", JSON.stringify(tasks));
}

// ---------------------------
// Refresh preview
// ---------------------------
function refreshTaskPreview() {
    const preview = document.getElementById('taskListPreview');
    if (preview) {
        if (tasks.length === 0) {
            preview.textContent = 'No tasks added yet';
        } else {
            preview.textContent = `Total tasks: ${tasks.length}\n` + 
                tasks.map((task, index) => 
                    `${index + 1}. ${task.title} (ID: ${task.id})`
                ).join('\n');
        }
    }
}

// ---------------------------
// Validate due date >= today
// ---------------------------
function validateDueDate(dateStr) {
    if (!dateStr) return true; // optional field
    const today = new Date();
    today.setHours(0,0,0,0);
    const selected = new Date(dateStr);
    selected.setHours(0,0,0,0);
    return selected >= today;
}

// ---------------------------
// Show toast notifications
// ---------------------------
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3500);
}

// ---------------------------
// Spinner handling
// ---------------------------
function showSpinner() {
    let spinner = document.getElementById('spinner');
    if (!spinner) {
        const status = document.getElementById('status');
        spinner = document.createElement('div');
        spinner.id = 'spinner';
        spinner.className = 'spinner';
        status.appendChild(spinner);
    }
    spinner.classList.remove('hidden');
    document.getElementById('status').textContent = 'Analyzing... ';
    document.getElementById('status').appendChild(spinner);
}

function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
    document.getElementById('status').textContent = 'Ready';
}

// ---------------------------
// Add task
// ---------------------------
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const due_date = document.getElementById('due_date').value || null;

    if (!validateDueDate(due_date)) {
        showToast("Due date cannot be earlier than today.", "error");
        return;
    }

    const estimated_hours = parseInt(document.getElementById('estimated_hours').value, 10) || 1;
    const importance = parseInt(document.getElementById('importance').value, 10) || 5;

    const depsRaw = document.getElementById('dependencies').value.trim();
    let dependencies = [];
    if (depsRaw) {
        dependencies = depsRaw
            .split(',')
            .map(s => s.trim())
            .filter(s => s)
            .map(Number)
            .filter(n => !isNaN(n));
    }

    // Unique ID per task for reliable operations
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const task = { id, title, due_date, estimated_hours, importance, dependencies };
    tasks.push(task);

    saveTasks();
    refreshTaskPreview();
    showToast("Task added successfully!");

    // Reset form
    document.getElementById('title').value = '';
    document.getElementById('due_date').value = '';
    document.getElementById('estimated_hours').value = '1';
    document.getElementById('importance').value = '5';
    document.getElementById('dependencies').value = '';
});

// ---------------------------
// Dark mode toggle
// ---------------------------
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const icon = document.querySelector('#darkModeToggle i');
    
    if (isDark) {
        icon.className = 'fas fa-sun';
        document.querySelector('#darkModeToggle').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        showToast("Dark mode enabled");
    } else {
        icon.className = 'fas fa-moon';
        document.querySelector('#darkModeToggle').innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        showToast("Light mode enabled");
    }
});

// ---------------------------
// Helper: priority styles
// ---------------------------
function priorityClass(label) {
    if (label === 'High') return 'high';
    if (label === 'Medium') return 'medium';
    return 'low';
}

function priorityBadgeClass(label) {
    if (label === 'High') return 'badge-high';
    if (label === 'Medium') return 'badge-medium';
    return 'badge-low';
}

// ---------------------------
// Mark task as done (remove from list & storage)
// ---------------------------
function markTaskDone(taskFromApi, cardElement) {
    let index = -1;

    // Prefer ID-based matching for reliability
    if (taskFromApi.id) {
        index = tasks.findIndex(t => t.id === taskFromApi.id);
    }

    // Fallback to property-based matching (for older data / if backend strips id)
    if (index === -1) {
        index = tasks.findIndex(t =>
            t.title === taskFromApi.title &&
            t.due_date === taskFromApi.due_date &&
            t.estimated_hours === taskFromApi.estimated_hours &&
            t.importance === taskFromApi.importance &&
            JSON.stringify(t.dependencies || []) === JSON.stringify(taskFromApi.dependencies || [])
        );
    }

    if (index !== -1) {
        tasks.splice(index, 1);
        saveTasks();
        refreshTaskPreview();
    }

    // Remove from UI with animation
    if (cardElement && cardElement.parentNode) {
        cardElement.style.transform = 'translateX(100%)';
        cardElement.style.opacity = '0';
        setTimeout(() => {
            if (cardElement.parentNode) {
                cardElement.parentNode.removeChild(cardElement);
            }
            
            // Show empty state if no tasks left
            const container = document.getElementById('results');
            if (container.children.length === 0) {
                showEmptyState();
            }
        }, 300);
    }

    showToast("Task marked as done!");
}

// ---------------------------
// Show empty state
// ---------------------------
function showEmptyState() {
    const container = document.getElementById('results');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-check-circle"></i>
            <h3>All tasks completed!</h3>
            <p>Add more tasks to analyze and prioritize.</p>
        </div>
    `;
}

// ---------------------------
// Drag and Drop functionality
// ---------------------------
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    e.target.classList.add('drop-zone');
}

function drop(e) {
    e.preventDefault();
    e.target.classList.remove('drop-zone');
    
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = parseInt(e.target.dataset.index);
    
    if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
        // Reorder tasks array
        const [movedTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movedTask);
        saveTasks();
        refreshTaskPreview();
        showToast("Tasks reordered!");
    }
}

// ---------------------------
// Display results with progress & actions
// ---------------------------
function displayResults(data) {
    const container = document.getElementById('results');
    
    if (!data.tasks || data.tasks.length === 0) {
        showEmptyState();
        return;
    }

    container.innerHTML = '';

    const tasksResult = data.tasks;

    tasksResult.forEach((task, idx) => {
        const card = document.createElement('div');
        card.className = `task-card ${priorityClass(task.priority_label)}`;
        card.setAttribute('draggable', 'true');
        card.dataset.index = idx;

        // Store original task ID if available
        if (task.id) {
            card.dataset.taskId = task.id;
        }

        // Drag events
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragover', dragOver);
        card.addEventListener('drop', drop);
        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        // Header
        const header = document.createElement('div');
        header.className = 'task-header';

        const title = document.createElement('div');
        title.className = 'task-title';
        title.textContent = task.title || 'Untitled Task';

        const rightSide = document.createElement('div');
        rightSide.className = 'task-score';
        rightSide.innerHTML = `
            <span class="badge ${priorityBadgeClass(task.priority_label)}">${task.priority_label}</span>
            <span class="score-text">Score: ${task.priority_score || task.score || 0}</span>
        `;

        header.appendChild(title);
        header.appendChild(rightSide);

        // Meta info
        const meta = document.createElement('div');
        meta.className = 'task-meta';
        
        let metaText = `Est: ${task.estimated_hours || 1}h · Imp: ${task.importance || 5}/10`;
        if (task.due_date) {
            const dueDate = new Date(task.due_date);
            metaText += ` · Due: ${dueDate.toLocaleDateString()}`;
        }
        meta.textContent = metaText;

        // Explanation
        const explanation = document.createElement('div');
        explanation.className = 'task-explanation';
        explanation.textContent = task.explanation || 'Prioritized based on selected strategy.';

        // Progress bar
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'progress-wrapper';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        // Calculate progress percentage based on priority score or index
        const progressPercent = task.priority_score 
            ? Math.min(100, Math.max(5, (task.priority_score / 10) * 100))
            : Math.min(100, Math.max(5, 100 - (idx * (90 / tasksResult.length))));
        
        progressBar.style.width = `${progressPercent}%`;
        progressWrapper.appendChild(progressBar);

        // Task Actions - Mark as Done button
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        const doneButton = document.createElement('button');
        doneButton.className = 'btn-done btn-small';
        doneButton.innerHTML = '<i class="fas fa-check"></i> Mark as Done';
        doneButton.addEventListener('click', () => {
            markTaskDone(task, card);
        });

        actions.appendChild(doneButton);

        // Assemble card
        card.appendChild(header);
        card.appendChild(meta);
        card.appendChild(explanation);
        card.appendChild(progressWrapper);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

// ---------------------------
// Analyze tasks
// ---------------------------
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    if (tasks.length === 0) {
        showToast("Please add tasks first!", "error");
        return;
    }

    showSpinner();
    
    try {
        // Simulate API call - replace with actual backend call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const strategy = document.getElementById('strategySelect').value;
        
        // Mock analysis result - replace with actual backend response
        const mockResult = {
            tasks: tasks.map((task, index) => ({
                ...task,
                priority_score: Math.floor(Math.random() * 10) + 1,
                priority_label: ['Low', 'Medium', 'High'][index % 3],
                explanation: `This task is ${['Low', 'Medium', 'High'][index % 3]} priority due to ${strategy.replace('_', ' ')}.`
            })).sort((a, b) => b.priority_score - a.priority_score)
        };
        
        displayResults(mockResult);
        showToast(`Tasks analyzed using ${strategy.replace('_', ' ')} strategy!`);
    } catch (error) {
        showToast("Analysis failed. Please try again.", "error");
        console.error('Analysis error:', error);
    } finally {
        hideSpinner();
    }
});

// ---------------------------
// Suggest top 3 tasks
// ---------------------------
document.getElementById('suggestBtn').addEventListener('click', async () => {
    if (tasks.length === 0) {
        showToast("Please add tasks first!", "error");
        return;
    }

    showSpinner();
    
    try {
        // Simulate API call - replace with actual backend call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const strategy = document.getElementById('strategySelect').value;
        
        // Mock top 3 result - replace with actual backend response
        const mockResult = {
            tasks: tasks.slice(0, 3).map((task, index) => ({
                ...task,
                priority_score: 10 - index,
                priority_label: ['High', 'Medium', 'Low'][index],
                explanation: `Top ${index + 1} recommendation using ${strategy.replace('_', ' ')} strategy.`
            }))
        };
        
        displayResults(mockResult);
        showToast("Top 3 tasks suggested!");
    } catch (error) {
        showToast("Suggestion failed. Please try again.", "error");
        console.error('Suggestion error:', error);
    } finally {
        hideSpinner();
    }
});

// ---------------------------
// Initialize app
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    console.log('Smart Task Analyzer initialized');
});