package com.example.shopflow.repository;

import com.example.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.seller WHERE p.actif = true")
    Page<Product> findByActifTrue(Pageable pageable);

    @Query("""
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN p.seller s
            LEFT JOIN p.categories c
            WHERE p.actif = true
              AND (
                    :q IS NULL
                    OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :q, '%'))
                    OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                    OR LOWER(COALESCE(c.nom, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                  )
              AND (:prixMin IS NULL OR p.prix >= :prixMin)
              AND (:prixMax IS NULL OR p.prix <= :prixMax)
              AND (:categoryIds IS NULL OR c.id IN :categoryIds)
              AND (:promoOnly = false OR p.prixPromo IS NOT NULL)
            """)
    Page<Product> searchProducts(@Param("q") String q,
                                 @Param("prixMin") BigDecimal prixMin,
                                 @Param("prixMax") BigDecimal prixMax,
                                 @Param("categoryIds") List<Long> categoryIds,
                                 @Param("promoOnly") boolean promoOnly,
                                 Pageable pageable);

    @Query("""
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN p.seller s
            LEFT JOIN p.categories c
            WHERE p.actif = true
              AND (
                    :q IS NULL
                    OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :q, '%'))
                    OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                    OR LOWER(COALESCE(c.nom, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                  )
              AND (:prixMin IS NULL OR p.prix >= :prixMin)
              AND (:prixMax IS NULL OR p.prix <= :prixMax)
              AND (:categoryIds IS NULL OR c.id IN :categoryIds)
              AND (:promoOnly = false OR p.prixPromo IS NOT NULL)
            ORDER BY (
               SELECT COUNT(r.id)
               FROM Review r
               WHERE r.product.id = p.id AND r.approuve = true
            ) DESC, p.dateCreation DESC
            """)
    Page<Product> searchProductsByPopularity(@Param("q") String q,
                                             @Param("prixMin") BigDecimal prixMin,
                                             @Param("prixMax") BigDecimal prixMax,
                                             @Param("categoryIds") List<Long> categoryIds,
                                             @Param("promoOnly") boolean promoOnly,
                                             Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);
}