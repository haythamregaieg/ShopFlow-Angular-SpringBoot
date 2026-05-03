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

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller WHERE p.actif = true")
    Page<Product> findByActifTrue(Pageable pageable);

    // --- Sans filtre catégorie ---

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller " +
           "WHERE p.actif = true " +
           "AND p.nom LIKE :pattern " +
           "AND (:prixMin IS NULL OR p.prix >= :prixMin) " +
           "AND (:prixMax IS NULL OR p.prix <= :prixMax) " +
           "AND (:promoOnly = false OR p.prixPromo IS NOT NULL)")
    Page<Product> searchProducts(
        @Param("pattern") String pattern,
        @Param("prixMin") BigDecimal prixMin,
        @Param("prixMax") BigDecimal prixMax,
        @Param("promoOnly") boolean promoOnly,
        Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller " +
           "WHERE p.actif = true " +
           "AND p.nom LIKE :pattern " +
           "AND (:prixMin IS NULL OR p.prix >= :prixMin) " +
           "AND (:prixMax IS NULL OR p.prix <= :prixMax) " +
           "AND (:promoOnly = false OR p.prixPromo IS NOT NULL)")
    Page<Product> searchProductsByPopularity(
        @Param("pattern") String pattern,
        @Param("prixMin") BigDecimal prixMin,
        @Param("prixMax") BigDecimal prixMax,
        @Param("promoOnly") boolean promoOnly,
        Pageable pageable);

    // --- Avec filtre catégorie ---

    @Query(value = "SELECT DISTINCT p FROM Product p JOIN p.categories c " +
                   "WHERE p.actif = true " +
                   "AND p.nom LIKE :pattern " +
                   "AND (:prixMin IS NULL OR p.prix >= :prixMin) " +
                   "AND (:prixMax IS NULL OR p.prix <= :prixMax) " +
                   "AND (:promoOnly = false OR p.prixPromo IS NOT NULL) " +
                   "AND c.id IN :categoryIds",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Product p JOIN p.categories c " +
                        "WHERE p.actif = true " +
                        "AND p.nom LIKE :pattern " +
                        "AND (:prixMin IS NULL OR p.prix >= :prixMin) " +
                        "AND (:prixMax IS NULL OR p.prix <= :prixMax) " +
                        "AND (:promoOnly = false OR p.prixPromo IS NOT NULL) " +
                        "AND c.id IN :categoryIds")
    Page<Product> searchProductsWithCategories(
        @Param("pattern") String pattern,
        @Param("prixMin") BigDecimal prixMin,
        @Param("prixMax") BigDecimal prixMax,
        @Param("categoryIds") List<Long> categoryIds,
        @Param("promoOnly") boolean promoOnly,
        Pageable pageable);

    @Query(value = "SELECT DISTINCT p FROM Product p JOIN p.categories c " +
                   "WHERE p.actif = true " +
                   "AND p.nom LIKE :pattern " +
                   "AND (:prixMin IS NULL OR p.prix >= :prixMin) " +
                   "AND (:prixMax IS NULL OR p.prix <= :prixMax) " +
                   "AND (:promoOnly = false OR p.prixPromo IS NOT NULL) " +
                   "AND c.id IN :categoryIds",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Product p JOIN p.categories c " +
                        "WHERE p.actif = true " +
                        "AND p.nom LIKE :pattern " +
                        "AND (:prixMin IS NULL OR p.prix >= :prixMin) " +
                        "AND (:prixMax IS NULL OR p.prix <= :prixMax) " +
                        "AND (:promoOnly = false OR p.prixPromo IS NOT NULL) " +
                        "AND c.id IN :categoryIds")
    Page<Product> searchProductsByPopularityWithCategories(
        @Param("pattern") String pattern,
        @Param("prixMin") BigDecimal prixMin,
        @Param("prixMax") BigDecimal prixMax,
        @Param("categoryIds") List<Long> categoryIds,
        @Param("promoOnly") boolean promoOnly,
        Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);
}