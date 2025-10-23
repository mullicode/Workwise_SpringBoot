package com.example.employeemanagement.repository;

import com.example.employeemanagement.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/** This interface represents a repository for departments. */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
  List<Department> findByNameContainingIgnoreCase(String name);
}
