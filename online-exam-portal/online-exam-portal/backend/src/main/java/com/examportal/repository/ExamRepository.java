package com.examportal.repository;

import com.examportal.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByActiveTrue();
    List<Exam> findByCreatedById(Long adminId);
}
