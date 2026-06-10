// ============================================
// STUDENT DASHBOARD LOGIC
// ============================================

if (!requireAuth('STUDENT')) {}

document.getElementById('studentName').textContent = localStorage.getItem('name');

let currentAttemptId = null;
let currentQuestions = [];
let currentAnswers = {};
let currentIndex = 0;
let timerInterval = null;
let timeLeft = 0;

// Load exams on page load
loadExams();

async function loadExams() {
    try {
        const exams = await api.get('/student/exams');
        const container = document.getElementById('examsList');

        if (!exams || exams.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>No exams available right now</p></div>`;
            return;
        }

        container.innerHTML = exams.map(exam => `
            <div class="exam-card">
                <h3>${exam.title}</h3>
                <p>${exam.description || 'No description provided'}</p>
                <div class="exam-meta">
                    <span class="meta-tag">⏱️ ${exam.durationMinutes} mins</span>
                    <span class="meta-tag green">📝 ${exam.questionCount} Questions</span>
                    <span class="meta-tag orange">🎯 Pass: ${exam.passMarks}/${exam.totalMarks}</span>
                </div>
                <button class="btn btn-primary btn-full" onclick="startExam(${exam.id}, '${exam.title}', ${exam.durationMinutes})">
                    Start Exam →
                </button>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('examsList').innerHTML = `<div class="loading">Failed to load exams. Make sure backend is running.</div>`;
    }
}

async function startExam(examId, title, duration) {
    try {
        const data = await api.post(`/student/exams/${examId}/start`, {});
        currentAttemptId = data.attemptId;
        currentQuestions = data.questions;
        currentAnswers = {};
        currentIndex = 0;

        document.getElementById('examModalTitle').textContent = data.examTitle;
        document.getElementById('examModal').classList.remove('hidden');

        renderQuestion();
        renderDots();
        startTimer(duration * 60);
    } catch (err) {
        alert('Failed to start exam: ' + err.message);
    }
}

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    const total = currentQuestions.length;
    const selected = currentAnswers[q.id];

    document.getElementById('questionProgress').textContent = `Question ${currentIndex + 1} of ${total}`;
    document.getElementById('progressFill').style.width = `${((currentIndex + 1) / total) * 100}%`;
    document.getElementById('prevBtn').disabled = currentIndex === 0;
    document.getElementById('nextBtn').textContent = currentIndex === total - 1 ? 'Review →' : 'Next →';

    const options = ['A', 'B', 'C', 'D'];
    const optTexts = [q.optionA, q.optionB, q.optionC, q.optionD];

    document.getElementById('questionContainer').innerHTML = `
        <div class="question-num">Question ${currentIndex + 1} of ${total} • ${q.marks} mark(s)</div>
        <div class="question-text">${q.questionText}</div>
        <div class="options-list">
            ${options.map((opt, i) => `
                <label class="option-item ${selected === opt ? 'selected' : ''}" onclick="selectAnswer(${q.id}, '${opt}')">
                    <div class="option-label">${opt}</div>
                    <div class="option-text">${optTexts[i]}</div>
                </label>
            `).join('')}
        </div>
    `;
    renderDots();
}

function selectAnswer(questionId, answer) {
    currentAnswers[questionId] = answer;
    renderQuestion();
}

function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function renderDots() {
    const dots = document.getElementById('questionDots');
    dots.innerHTML = currentQuestions.map((q, i) => `
        <button class="q-dot ${i === currentIndex ? 'current' : ''} ${currentAnswers[q.id] ? 'answered' : ''}"
                onclick="jumpToQuestion(${i})">${i + 1}</button>
    `).join('');
}

function jumpToQuestion(index) {
    currentIndex = index;
    renderQuestion();
}

function startTimer(seconds) {
    timeLeft = seconds;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('examTimer');
        timerEl.textContent = `⏱️ ${mins}:${secs}`;

        if (timeLeft <= 60) timerEl.classList.add('warning');
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitExam(true);
        }
    }, 1000);
}

async function submitExam(autoSubmit = false) {
    if (!autoSubmit) {
        const answered = Object.keys(currentAnswers).length;
        const total = currentQuestions.length;
        if (answered < total) {
            if (!confirm(`You have answered ${answered} of ${total} questions. Submit anyway?`)) return;
        }
    }

    clearInterval(timerInterval);

    try {
        const answersPayload = {};
        currentQuestions.forEach(q => {
            answersPayload[q.id] = currentAnswers[q.id] || null;
        });

        const result = await api.post(`/student/exams/submit/${currentAttemptId}`, answersPayload);
        document.getElementById('examModal').classList.add('hidden');
        showResult(result);
    } catch (err) {
        alert('Failed to submit exam: ' + err.message);
    }
}

function showResult(result) {
    const passed = result.passed;
    const modal = document.getElementById('resultModal');
    document.getElementById('resultContent').innerHTML = `
        <div class="result-icon">${passed ? '🏆' : '😔'}</div>
        <div class="result-score ${passed ? 'pass' : 'fail'}">${result.percentage}%</div>
        <div class="result-label">${passed ? 'Congratulations! You Passed!' : 'Better luck next time!'}</div>
        <div class="result-details">
            <div class="result-detail-item">
                <div class="num">${result.score}</div>
                <div class="lbl">Your Score</div>
            </div>
            <div class="result-detail-item">
                <div class="num">${result.totalMarks}</div>
                <div class="lbl">Total Marks</div>
            </div>
            <div class="result-detail-item">
                <div class="num">${result.passMarks}</div>
                <div class="lbl">Pass Marks</div>
            </div>
            <div class="result-detail-item">
                <div class="num">${result.percentage}%</div>
                <div class="lbl">Percentage</div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeExamModal() {
    if (!confirm('Are you sure you want to exit? Your progress may be lost.')) return;
    clearInterval(timerInterval);
    document.getElementById('examModal').classList.add('hidden');
}

function closeResultModal() {
    document.getElementById('resultModal').classList.add('hidden');
    loadExams();
}

async function loadResults() {
    try {
        const results = await api.get('/student/results');
        const container = document.getElementById('resultsList');

        if (!results || results.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="icon">📊</div><p>No results yet. Take an exam to see your scores!</p></div>`;
            return;
        }

        container.innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Exam</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                            <tr>
                                <td><strong>${r.examTitle}</strong></td>
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
    } catch (err) {
        console.error(err);
    }
}

// Override showSection for student
const _showSection = showSection;
window.showSection = function(name) {
    _showSection(name);
    if (name === 'results') loadResults();
};
