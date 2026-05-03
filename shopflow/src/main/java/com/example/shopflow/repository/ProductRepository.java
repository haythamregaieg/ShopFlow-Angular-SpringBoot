package com.example.shopflow.repository;

import com.example.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"categories", "seller"})
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.seller WHERE p.actif = true")
    Page<Product> findByActifTrue(Pageable pageable);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.actif = true
              AND (:q IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:prixMin IS NULL OR p.prix >= :prixMin)
              AND (:prixMax IS NULL OR p.prix <= :prixMax)
              AND (:categoryIds IS NULL OR EXISTS (SELECT 1 FROM p.categories c WHERE c.id IN :categoryIds))
              AND (:promoOnly = false OR p.prixPromo IS NOT NULL)
            """)
    Page<Product> searchProducts(@Param("q") String q,
                                 @Param("prixMin") BigDecimal prixMin,
                                 @Param("prixMax") BigDecimal prixMax,
                                 @Param("categoryIds") List<Long> categoryIds,
                                 @Param("promoOnly") boolean promoOnly,
                                 Pageable pageable);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.actif = true
              AND (:q IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:prixMin IS NULL OR p.prix >= :prixMin)
              AND (:prixMax IS NULL OR p.prix <= :prixMax)
              AND (:categoryIds IS NULL OR EXISTS (SELECT 1 FROM p.categories c WHERE c.id IN :categoryIds))
              AND (:promoOnly = false OR p.prixPromo IS NOT NULL)
            """)
    Page<Product> searchProductsByPopularity(@Param("q") String q,
                                             @Param("prixMin") BigDecimal prixMin,
                                             @Param("prixMax") BigDecimal prixMax,
                                             @Param("categoryIds") List<Long> categoryIds,
                                             @Param("promoOnly") boolean promoOnly,
                                             Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);
}
