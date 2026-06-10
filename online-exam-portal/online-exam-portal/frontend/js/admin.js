// ============================================
// ADMIN DASHBOARD LOGIC
// ============================================

if (!requireAuth('ADMIN')) {}

document.getElementById('adminName').textContent = localStorage.getItem('name');

let editingExamId = null;
let currentExamId = null;

// Load dashboard stats on start
loadStats();

async function loadStats() {
    try {
        const stats = await api.get('/admin/stats');
        document.getElementById('statStudents').textContent = stats.totalStudents;
        document.getElementById('statExams').textContent = stats.totalExams;
        document.getElementById('statAttempts').textContent = stats.totalAttempts;
    } catch (err) { console.error(err); }
}

async function loadExams() {
    try {
        const exams = await api.get('/admin/exams');
        const container = document.getElementById('adminExamsList');

        if (!exams || exams.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="icon">📋</div><p>No exams yet. Create your first exam!</p></div>`;
            return;
        }

        container.innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr><th>Title</th><th>Duration</th><th>Marks</th><th>Questions</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${exams.map(e => `
                            <tr>
                                <td><strong>${e.title}</strong><br><small style="color:#64748b">${e.description || ''}</small></td>
                                <td>${e.durationMinutes} mins</td>
                                <td>${e.totalMarks} (Pass: ${e.passMarks})</td>
                                <td><span class="badge badge-active">${e.questionCount} Qs</span></td>
                                <td><span class="badge ${e.isActive ? 'badge-active' : 'badge-inactive'}">${e.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td style="display:flex;gap:8px;flex-wrap:wrap">
                                    <button class="btn btn-outline btn-sm" onclick="manageQuestions(${e.id}, '${e.title}')">❓ Questions</button>
                                    <button class="btn btn-outline btn-sm" onclick="editExam(${e.id})">✏️ Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteExam(${e.id})">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) { console.error(err); }
}

function showCreateExamForm() {
    editingExamId = null;
    document.getElementById('examFormTitle').textContent = 'Create New Exam';
    document.getElementById('examTitle').value = '';
    document.getElementById('examDescription').value = '';
    document.getElementById('examDuration').value = '30';
    document.getElementById('examTotalMarks').value = '10';
    document.getElementById('examPassMarks').value = '6';
    document.getElementById('examForm').classList.remove('hidden');
    document.getElementById('examForm').scrollIntoView({ behavior: 'smooth' });
}

async function editExam(id) {
    const exams = await api.get('/admin/exams');
    const exam = exams.find(e => e.id === id);
    if (!exam) return;

    editingExamId = id;
    document.getElementById('examFormTitle').textContent = 'Edit Exam';
    document.getElementById('examTitle').value = exam.title;
    document.getElementById('examDescription').value = exam.description || '';
    document.getElementById('examDuration').value = exam.durationMinutes;
    document.getElementById('examTotalMarks').value = exam.totalMarks;
    document.getElementById('examPassMarks').value = exam.passMarks;
    document.getElementById('examForm').classList.remove('hidden');
    document.getElementById('examForm').scrollIntoView({ behavior: 'smooth' });
}

async function saveExam() {
    const title = document.getElementById('examTitle').value.trim();
    const description = document.getElementById('examDescription').value.trim();
    const durationMinutes = parseInt(document.getElementById('examDuration').value);
    const totalMarks = parseInt(document.getElementById('examTotalMarks').value);
    const passMarks = parseInt(document.getElementById('examPassMarks').value);

    if (!title) { alert('Please enter exam title'); return; }
    if (passMarks > totalMarks) { alert('Pass marks cannot exceed total marks'); return; }

    const payload = { title, description, durationMinutes, totalMarks, passMarks, isActive: true };

    try {
        if (editingExamId) {
            await api.put(`/admin/exams/${editingExamId}`, payload);
            alert('Exam updated successfully!');
        } else {
            await api.post('/admin/exams', payload);
            alert('Exam created successfully!');
        }
        cancelExamForm();
        loadExams();
    } catch (err) { alert('Failed to save exam: ' + err.message); }
}

function cancelExamForm() {
    document.getElementById('examForm').classList.add('hidden');
    editingExamId = null;
}

async function deleteExam(id) {
    if (!confirm('Delete this exam and all its questions? This cannot be undone.')) return;
    try {
        await api.delete(`/admin/exams/${id}`);
        loadExams();
    } catch (err) { alert('Failed to delete: ' + err.message); }
}

async function manageQuestions(examId, examTitle) {
    currentExamId = examId;
    document.getElementById('currentExamTitle').textContent = examTitle;
    showSection('questions');
    await loadQuestions();
}

async function loadQuestions() {
    try {
        const questions = await api.get(`/admin/exams/${currentExamId}/questions`);
        const container = document.getElementById('questionsList');

        if (!questions || questions.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="icon">❓</div><p>No questions yet. Add your first question!</p></div>`;
            return;
        }

        container.innerHTML = questions.map((q, i) => `
            <div class="card" style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
                    <div style="flex:1">
                        <div style="font-size:12px;color:#64748b;margin-bottom:6px">Q${i + 1} • ${q.marks} mark(s)</div>
                        <div style="font-weight:600;margin-bottom:12px">${q.questionText}</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                            ${['A','B','C','D'].map(opt => `
                                <div style="padding:8px 12px;border-radius:8px;font-size:13px;
                                    background:${q.correctAnswer === opt ? '#ecfdf5' : '#f8fafc'};
                                    border:1px solid ${q.correctAnswer === opt ? '#6ee7b7' : '#e2e8f0'};
                                    color:${q.correctAnswer === opt ? '#065f46' : '#1e293b'}">
                                    <strong>${opt}.</strong> ${q['option' + opt]}
                                    ${q.correctAnswer === opt ? ' ✅' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${q.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
}

function showAddQuestionForm() {
    document.getElementById('addQuestionForm').classList.remove('hidden');
    document.getElementById('addQuestionForm').scrollIntoView({ behavior: 'smooth' });
}

async function saveQuestion() {
    const questionText = document.getElementById('qText').value.trim();
    const optionA = document.getElementById('qOptA').value.trim();
    const optionB = document.getElementById('qOptB').value.trim();
    const optionC = document.getElementById('qOptC').value.trim();
    const optionD = document.getElementById('qOptD').value.trim();
    const correctAnswer = document.getElementById('qCorrect').value;
    const marks = parseInt(document.getElementById('qMarks').value);

    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        alert('Please fill all question fields');
        return;
    }

    try {
        await api.post(`/admin/exams/${currentExamId}/questions`,
            { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks });

        // Clear form
        ['qText','qOptA','qOptB','qOptC','qOptD'].forEach(id =>
            document.getElementById(id).value = '');
        document.getElementById('qMarks').value = '1';
        document.getElementById('addQuestionForm').classList.add('hidden');
        await loadQuestions();
    } catch (err) { alert('Failed to add question: ' + err.message); }
}

async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    try {
        await api.delete(`/admin/questions/${id}`);
        await loadQuestions();
    } catch (err) { alert('Failed to delete: ' + err.message); }
}

async function loadResults() {
    try {
        const results = await api.get('/admin/results');
        const container = document.getElementById('adminResultsList');

        if (!results || results.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="icon">📈</div><p>No exam results yet</p></div>`;
            return;
        }

        container.innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr><th>Student</th><th>Exam</th><th>Score</th><th>Percentage</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                            <tr>
                                <td><strong>${r.studentName}</strong></td>
                                <td>${r.examTitle}</td>
                                <td>${r.score} / ${r.totalMarks}</td>
                                <td>${r.percentage}%</td>
                                <td><span class="badge ${r.passed ? 'badge-pass' : 'badge-fail'}">${r.passed ? '✅ Pass' : '❌ Fail'}</span></td>
                                <td>${formatDate(r.endTime)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) { console.error(err); }
}

// Override showSection for admin
const _showSection = showSection;
window.showSection = function(name) {
    _showSection(name);
    if (name === 'exams') loadExams();
    if (name === 'results') loadResults();
    if (name === 'dashboard') loadStats();
};
