package com.examportal.controller;

import com.examportal.model.*;
import com.examportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private ExamRepository examRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ExamAttemptRepository attemptRepository;

    // ---- EXAM CRUD ----

    @GetMapping("/exams")
    public ResponseEntity<?> getAllExams() {
        List<Exam> exams = examRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Exam e : exams) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("title", e.getTitle());
            map.put("description", e.getDescription());
            map.put("durationMinutes", e.getDurationMinutes());
            map.put("totalMarks", e.getTotalMarks());
            map.put("passMarks", e.getPassMarks());
            map.put("isActive", e.isActive());
            map.put("questionCount", questionRepository.findByExamId(e.getId()).size());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/exams")
    public ResponseEntity<?> createExam(@RequestBody Map<String, Object> request, Authentication auth) {
        String email = auth.getName();
        User admin = userRepository.findByEmail(email).orElseThrow();

        Exam exam = new Exam();
        exam.setTitle((String) request.get("title"));
        exam.setDescription((String) request.get("description"));
        exam.setDurationMinutes((Integer) request.get("durationMinutes"));
        exam.setTotalMarks((Integer) request.get("totalMarks"));
        exam.setPassMarks((Integer) request.get("passMarks"));
        exam.setCreatedBy(admin);
        exam.setActive(true);

        examRepository.save(exam);
        return ResponseEntity.ok(Map.of("message", "Exam created successfully", "id", exam.getId()));
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<?> updateExam(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Exam exam = examRepository.findById(id).orElseThrow();
        exam.setTitle((String) request.get("title"));
        exam.setDescription((String) request.get("description"));
        exam.setDurationMinutes((Integer) request.get("durationMinutes"));
        exam.setTotalMarks((Integer) request.get("totalMarks"));
        exam.setPassMarks((Integer) request.get("passMarks"));
        exam.setActive((Boolean) request.get("isActive"));
        examRepository.save(exam);
        return ResponseEntity.ok(Map.of("message", "Exam updated successfully"));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        examRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
    }

    // ---- QUESTION CRUD ----

    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable Long examId) {
        List<Question> questions = questionRepository.findByExamId(examId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("questionText", q.getQuestionText());
            map.put("optionA", q.getOptionA());
            map.put("optionB", q.getOptionB());
            map.put("optionC", q.getOptionC());
            map.put("optionD", q.getOptionD());
            map.put("correctAnswer", q.getCorrectAnswer());
            map.put("marks", q.getMarks());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/exams/{examId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long examId, @RequestBody Map<String, Object> req) {
        Exam exam = examRepository.findById(examId).orElseThrow();

        Question q = new Question();
        q.setExam(exam);
        q.setQuestionText((String) req.get("questionText"));
        q.setOptionA((String) req.get("optionA"));
        q.setOptionB((String) req.get("optionB"));
        q.setOptionC((String) req.get("optionC"));
        q.setOptionD((String) req.get("optionD"));
        q.setCorrectAnswer(Question.Answer.valueOf((String) req.get("correctAnswer")));
        q.setMarks((Integer) req.getOrDefault("marks", 1));

        questionRepository.save(q);
        return ResponseEntity.ok(Map.of("message", "Question added successfully"));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted"));
    }

    // ---- RESULTS ----

    @GetMapping("/results")
    public ResponseEntity<?> getAllResults() {
        List<ExamAttempt> attempts = attemptRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (ExamAttempt a : attempts) {
            if (a.getStatus() == ExamAttempt.Status.COMPLETED) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", a.getId());
                map.put("studentName", a.getStudent().getName());
                map.put("examTitle", a.getExam().getTitle());
                map.put("score", a.getScore());
                map.put("totalMarks", a.getTotalMarks());
                map.put("percentage", (a.getTotalMarks() > 0) ?
                        Math.round((double) a.getScore() / a.getTotalMarks() * 100) : 0);
                map.put("passed", a.getScore() >= a.getExam().getPassMarks());
                map.put("endTime", a.getEndTime());
                result.add(map);
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT).count();
        long totalExams = examRepository.count();
        long totalAttempts = attemptRepository.findAll().stream()
                .filter(a -> a.getStatus() == ExamAttempt.Status.COMPLETED).count();

        return ResponseEntity.ok(Map.of(
                "totalStudents", totalStudents,
                "totalExams", totalExams,
                "totalAttempts", totalAttempts
        ));
    }
}
