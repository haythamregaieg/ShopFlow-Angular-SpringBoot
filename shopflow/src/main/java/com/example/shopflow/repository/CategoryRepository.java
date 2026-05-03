package com.example.shopflow.repository;

import com.example.shopflow.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Catégories racines avec leurs sous-catégories chargées eagerly */
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.sousCategories WHERE c.parent IS NULL")
    List<Category> findByParentIsNull();
}
