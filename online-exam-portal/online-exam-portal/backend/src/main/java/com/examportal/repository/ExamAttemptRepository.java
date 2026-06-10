package com.examportal.repository;

import com.examportal.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByStudentId(Long studentId);
    List<ExamAttempt> findByExamId(Long examId);
    Optional<ExamAttempt> findByExamIdAndStudentIdAndStatus(Long examId, Long studentId, ExamAttempt.Status status);

    @Query("SELECT ea FROM ExamAttempt ea WHERE ea.student.id = :studentId AND ea.status = 'COMPLETED' ORDER BY ea.endTime DESC")
    List<ExamAttempt> findCompletedByStudentId(Long studentId);
}
