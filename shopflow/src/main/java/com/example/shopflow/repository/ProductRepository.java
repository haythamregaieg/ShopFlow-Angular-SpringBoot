package com.example.shopflow.repository;

import com.example.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller WHERE p.actif = true")
    Page<Product> findByActifTrue(Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller WHERE p.actif = true AND (:nom IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :nom, '%'))) AND (:prixMin IS NULL OR p.prix >= :prixMin) AND (:prixMax IS NULL OR p.prix <= :prixMax)")
    Page<Product> searchProducts(@Param("nom") String nom, @Param("prixMin") BigDecimal prixMin, @Param("prixMax") BigDecimal prixMax, Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);
}