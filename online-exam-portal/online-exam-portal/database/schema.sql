-- ============================================
-- ONLINE EXAM PORTAL - MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS exam_portal;
USE exam_portal;

-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams Table
CREATE TABLE exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    total_marks INT NOT NULL DEFAULT 0,
    pass_marks INT NOT NULL DEFAULT 0,
    created_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Questions Table
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(300) NOT NULL,
    option_b VARCHAR(300) NOT NULL,
    option_c VARCHAR(300) NOT NULL,
    option_d VARCHAR(300) NOT NULL,
    correct_answer ENUM('A','B','C','D') NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Exam Attempts Table
CREATE TABLE exam_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    score INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    status ENUM('IN_PROGRESS','COMPLETED','TIMED_OUT') DEFAULT 'IN_PROGRESS',
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Student Answers Table
CREATE TABLE student_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer ENUM('A','B','C','D'),
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- ============================================
-- Sample Data
-- ============================================

-- Default Admin (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@exam.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');

-- Sample Student (password: student123)
INSERT INTO users (name, email, password, role) VALUES 
('John Student', 'student@exam.com', '$2a$10$slYQmyNdgTY18LqVr73YFuoRaA3K6S1W.F5QkISGOzXqyCqLHFmkm', 'STUDENT');

-- Sample Exam
INSERT INTO exams (title, description, duration_minutes, total_marks, pass_marks, created_by) VALUES
('Java Programming Basics', 'Test your knowledge of Java fundamentals', 30, 10, 6, 1);

-- Sample Questions
INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES
(1, 'Which keyword is used to define a class in Java?', 'class', 'Class', 'define', 'struct', 'A', 1),
(1, 'What is the default value of an int variable in Java?', '1', 'null', '0', 'undefined', 'C', 1),
(1, 'Which method is the entry point of a Java program?', 'start()', 'main()', 'run()', 'init()', 'B', 1),
(1, 'What does JVM stand for?', 'Java Virtual Machine', 'Java Visual Module', 'Java Verified Method', 'Java Variable Manager', 'A', 1),
(1, 'Which of these is NOT a primitive data type in Java?', 'int', 'boolean', 'String', 'char', 'C', 1),
(1, 'What is the size of int in Java?', '2 bytes', '4 bytes', '8 bytes', '16 bytes', 'B', 1),
(1, 'Which concept means hiding internal details?', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'C', 1),
(1, 'How do you create an object in Java?', 'object Car = new Car()', 'Car obj = new Car()', 'create Car()', 'new object Car()', 'B', 1),
(1, 'What does the "static" keyword mean?', 'Variable can change', 'Belongs to class not object', 'Cannot be inherited', 'Private access', 'B', 1),
(1, 'Which loop is guaranteed to execute at least once?', 'for', 'while', 'do-while', 'foreach', 'C', 1);
