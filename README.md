# 🧠 **Smart Task Analyzer**

A productivity tool that **intelligently prioritizes tasks** using deadlines, importance scores, estimated hours, and dependencies — helping you decide *what to work on next* with zero confusion.

This project includes:

* ✅ A **Django backend** for task scoring & analysis
* ✅ A **vanilla HTML/CSS/JavaScript frontend**
* ✅ **Deployment-ready setup** for Render.com
* ✅ Real-time task management (add → analyze → complete)
* ✅ Clean UX suitable for **internship, assignment, or portfolio submissions**

---

## 🚀 **Features**

### ✔ **Add Tasks**

Each task supports:

* Title
* Due date *(validated to prevent past dates)*
* Estimated hours
* Importance level **(1–10)**
* Optional dependency list

Input validation ensures:

* No duplicate task IDs
* No invalid dates
* No malformed dependency references

---

### ✔ **Intelligent Task Analyzer**

Sort and prioritize tasks using multiple strategies:

#### 🔹 **Smart Balance Mode**

Blends hours, importance, and deadlines into a weighted priority score.

#### 🔹 **Deadline-Based Sorting**

Prioritizes tasks that are due soon.

#### 🔹 **Importance-First Strategy**

Emphasizes high-impact tasks.

#### 🔹 **Quick Tasks First**

Manual productivity mode: shortest estimated hours rise to the top.

Includes advanced features:

* **Circular Dependency Detection**
* **Priority Scoring Engine**
* **Top 3 Recommendations** for focus
* **Verbose Explanation** for each task’s ranking

---

### ✔ **One-Click Task Completion**

* Completed tasks are removed instantly
* Backend + frontend remain perfectly synchronized
* Analyzer recalculates priorities in real time

---

### ✔ **Data Persistence**

Your tasks remain available even after reloads via:

* Browser **LocalStorage**
* Backend syncing via API
* Stateless and fast front-end rendering

---

## 🧩 **Project Structure**

```
task-analyzer/
│
├── backend/
│   ├── backend/           # Django core project config
│   ├── tasks/             # Task models, scoring logic, serializers, API views
│   ├── staticfiles/       # Auto-generated during collectstatic for production
│   └── manage.py
│
├── frontend/
│   ├── index.html         # Main UI
│   ├── styles.css         # Design & layout
│   └── script.js          # Frontend logic + API integration
│
├── venv/                  # Python virtual environment (ignored in Git)
├── requirements.txt       # Required backend packages
├── README.md
└── .gitignore
```

---

## ⚙ **Technology Stack**

### **Backend**

* Python **3.13**
* Django **5.x**
* SQLite (dev database)
* Gunicorn (production WSGI)
* WhiteNoise (static file serving)

### **Frontend**

* HTML5
* CSS3
* Vanilla JavaScript (no frameworks)

### **Deployment**

* **Render.com Web Service**

  * Auto-build using `requirements.txt`
  * `gunicorn` as entry point
  * Automatic `collectstatic` execution
  * Persistent file system disabled
  * Environment variables supported

---

## 🛠 **Installation & Setup**

### **1. Clone Repository**

```bash
git clone https://github.com/<your-username>/task-analyzer.git
cd task-analyzer
```

---

### **2. Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend will start at
👉 `http://127.0.0.1:8000/`

---

### **3. Frontend Setup**

No build step required.
Simply open:

```
frontend/index.html
```

Or serve it using Live Server in VS Code.

---

## 🚀 **Deploying to Render.com**

### **1. Create a New Web Service**

* Runtime: **Python 3**
* Start Command:

```bash
gunicorn backend.wsgi:application
```

### **2. Add Build Command**

```
pip install -r requirements.txt
python backend/manage.py collectstatic --noinput
```

### **3. Environment Variables**

* `SECRET_KEY=your-secret`
* `DEBUG=False`

### **4. Deploy**

Render will automatically:

* Install dependencies
* Run collectstatic
* Launch Gunicorn
* Host the site

---

## 📡 **API Endpoints**

### `GET /tasks/`

Returns all tasks.

### `POST /tasks/`

Adds a new task.

### `POST /tasks/analyze/`

Returns analysis, scoring, sorted results.

### `DELETE /tasks/<id>/`

Deletes a task after completion.

---

## 🧪 **Future Improvements**

* JWT authentication
* Multiple user accounts
* Task categories & tagging
* Drag-and-drop ordering synced to backend
* AI-assisted task description generator