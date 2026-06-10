package com.examportal.controller;

import com.examportal.model.*;
import com.examportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired private ExamRepository examRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ExamAttemptRepository attemptRepository;

    @GetMapping("/exams")
    public ResponseEntity<?> getAvailableExams() {
        List<Exam> exams = examRepository.findByActiveTrue();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Exam e : exams) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("title", e.getTitle());
            map.put("description", e.getDescription());
            map.put("durationMinutes", e.getDurationMinutes());
            map.put("totalMarks", e.getTotalMarks());
            map.put("passMarks", e.getPassMarks());
            map.put("questionCount", questionRepository.findByExamId(e.getId()).size());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/exams/{examId}/start")
    public ResponseEntity<?> startExam(@PathVariable Long examId, Authentication auth) {
        String email = auth.getName();
        User student = userRepository.findByEmail(email).orElseThrow();
        Exam exam = examRepository.findById(examId).orElseThrow();

        // Check if already in progress
        Optional<ExamAttempt> existing = attemptRepository
                .findByExamIdAndStudentIdAndStatus(examId, student.getId(), ExamAttempt.Status.IN_PROGRESS);
        if (existing.isPresent()) {
            return buildExamResponse(existing.get(), exam);
        }

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setStudent(student);
        attempt.setStartTime(LocalDateTime.now());
        attempt.setTotalMarks(exam.getTotalMarks());
        attemptRepository.save(attempt);

        return buildExamResponse(attempt, exam);
    }

    private ResponseEntity<?> buildExamResponse(ExamAttempt attempt, Exam exam) {
        List<Question> questions = questionRepository.findByExamId(exam.getId());
        List<Map<String, Object>> qList = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("questionText", q.getQuestionText());
            qMap.put("optionA", q.getOptionA());
            qMap.put("optionB", q.getOptionB());
            qMap.put("optionC", q.getOptionC());
            qMap.put("optionD", q.getOptionD());
            qMap.put("marks", q.getMarks());
            // NOTE: correctAnswer NOT sent to frontend
            qList.add(qMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", attempt.getId());
        response.put("examTitle", exam.getTitle());
        response.put("durationMinutes", exam.getDurationMinutes());
        response.put("startTime", attempt.getStartTime());
        response.put("questions", qList);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/exams/submit/{attemptId}")
    public ResponseEntity<?> submitExam(@PathVariable Long attemptId,
                                         @RequestBody Map<String, String> answers,
                                         Authentication auth) {
        ExamAttempt attempt = attemptRepository.findById(attemptId).orElseThrow();
        List<Question> questions = questionRepository.findByExamId(attempt.getExam().getId());

        int score = 0;
        List<StudentAnswer> studentAnswers = new ArrayList<>();

        for (Question q : questions) {
            String selectedStr = answers.get(String.valueOf(q.getId()));
            StudentAnswer sa = new StudentAnswer();
            sa.setAttempt(attempt);
            sa.setQuestion(q);

            if (selectedStr != null) {
                try {
                    Question.Answer selected = Question.Answer.valueOf(selectedStr);
                    sa.setSelectedAnswer(selected);
                    boolean correct = selected == q.getCorrectAnswer();
                    sa.setCorrect(correct);
                    if (correct) score += q.getMarks();
                } catch (IllegalArgumentException ignored) {}
            }
            studentAnswers.add(sa);
        }

        attempt.setScore(score);
        attempt.setEndTime(LocalDateTime.now());
        attempt.setStatus(ExamAttempt.Status.COMPLETED);
        attempt.setAnswers(studentAnswers);
        attemptRepository.save(attempt);

        boolean passed = score >= attempt.getExam().getPassMarks();
        int percentage = attempt.getTotalMarks() > 0 ?
                (int) Math.round((double) score / attempt.getTotalMarks() * 100) : 0;

        return ResponseEntity.ok(Map.of(
                "score", score,
                "totalMarks", attempt.getTotalMarks(),
                "percentage", percentage,
                "passed", passed,
                "passMarks", attempt.getExam().getPassMarks()
        ));
    }

    @GetMapping("/results")
    public ResponseEntity<?> getMyResults(Authentication auth) {
        String email = auth.getName();
        User student = userRepository.findByEmail(email).orElseThrow();
        List<ExamAttempt> attempts = attemptRepository.findCompletedByStudentId(student.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (ExamAttempt a : attempts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("examTitle", a.getExam().getTitle());
            map.put("score", a.getScore());
            map.put("totalMarks", a.getTotalMarks());
            map.put("percentage", a.getTotalMarks() > 0 ?
                    Math.round((double) a.getScore() / a.getTotalMarks() * 100) : 0);
            map.put("passed", a.getScore() >= a.getExam().getPassMarks());
            map.put("endTime", a.getEndTime());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
