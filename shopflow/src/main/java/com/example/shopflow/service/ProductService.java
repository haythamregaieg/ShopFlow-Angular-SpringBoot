package com.example.shopflow.service;

import com.example.shopflow.dto.request.ProductRequest;
import com.example.shopflow.dto.response.ProductResponse;
import com.example.shopflow.entity.Category;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.ProductVariant;
import com.example.shopflow.entity.User;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.CategoryRepository;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ReviewRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "dateCreation")
        );
        return productRepository.findByActifTrue(sorted).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(
            String q,
            BigDecimal prixMin,
            BigDecimal prixMax,
            List<Long> categoryIds,
            boolean promoOnly,
            String sortBy,
            Pageable pageable
    ) {
        Page<Product> page;
        List<Long> categoryFilter = (categoryIds == null || categoryIds.isEmpty()) ? null : categoryIds;
        if ("popularite".equalsIgnoreCase(sortBy)) {
            page = productRepository.searchProductsByPopularity(q, prixMin, prixMax, categoryFilter, promoOnly, pageable);
        } else {
            Sort sort = switch (sortBy == null ? "nouveautes" : sortBy.toLowerCase()) {
                case "prix_asc" -> Sort.by(Sort.Direction.ASC, "prix");
                case "prix_desc" -> Sort.by(Sort.Direction.DESC, "prix");
                case "nouveautes" -> Sort.by(Sort.Direction.DESC, "dateCreation");
                default -> pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "dateCreation");
            };
            Pageable sorted = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    sort
            );
            page = productRepository.searchProducts(q, prixMin, prixMax, categoryFilter, promoOnly, sorted);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable"));
        List<Category> categories = categoryRepository.findAllById(
                request.getCategoryIds() != null ? request.getCategoryIds() : List.of()
        );
        Product product = Product.builder()
                .seller(seller)
                .nom(request.getNom())
                .description(request.getDescription())
                .prix(request.getPrix())
                .prixPromo(request.getPrixPromo())
                .stock(request.getStock())
                .images(request.getImages())
                .fraisLivraisonLocal(request.getFraisLivraisonLocal() != null ? request.getFraisLivraisonLocal() : BigDecimal.ZERO)
                .fraisLivraisonInternational(request.getFraisLivraisonInternational() != null ? request.getFraisLivraisonInternational() : BigDecimal.ZERO)
                .actif(true)
                .categories(categories)
                .build();
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
        List<Category> categories = categoryRepository.findAllById(
                request.getCategoryIds() != null ? request.getCategoryIds() : List.of()
        );
        product.setNom(request.getNom());
        product.setDescription(request.getDescription());
        product.setPrix(request.getPrix());
        product.setPrixPromo(request.getPrixPromo());
        product.setStock(request.getStock());
        product.setImages(request.getImages());
        product.setFraisLivraisonLocal(request.getFraisLivraisonLocal() != null ? request.getFraisLivraisonLocal() : BigDecimal.ZERO);
        product.setFraisLivraisonInternational(request.getFraisLivraisonInternational() != null ? request.getFraisLivraisonInternational() : BigDecimal.ZERO);
        product.setCategories(categories);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
        product.setActif(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ProductResponse> getProductsForSeller(org.springframework.data.domain.Pageable pageable, String sellerEmail) {
        com.example.shopflow.entity.User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable"));
        return productRepository.findBySellerId(seller.getId(), pageable).map(this::toResponse);
    }

    @Transactional
    public ProductResponse updateForUser(Long id, ProductRequest request, String sellerEmail, boolean isAdmin) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
        if (!isAdmin) {
            com.example.shopflow.entity.User seller = userRepository.findByEmail(sellerEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable"));
            if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Not owner");
            }
        }
        // reuse existing update logic
        return update(id, request);
    }

    @Transactional
    public void deleteForUser(Long id, String sellerEmail, boolean isAdmin) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
        if (!isAdmin) {
            com.example.shopflow.entity.User seller = userRepository.findByEmail(sellerEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable"));
            if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Not owner");
            }
        }
        delete(id);
    }

    @Transactional
    public void activateForUser(Long id, String sellerEmail, boolean isAdmin) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable : " + id));
        if (!isAdmin) {
            com.example.shopflow.entity.User seller = userRepository.findByEmail(sellerEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable"));
            if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Not owner");
            }
        }
        product.setActif(true);
        productRepository.save(product);
    }

    private ProductResponse toResponse(Product p) {
        Double note = reviewRepository.findAverageNoteByProductId(p.getId());

        // Accès sécurisé au seller
        String sellerNom = null;
        try {
            if (p.getSeller() != null) {
                sellerNom = p.getSeller().getNom();
            }
        } catch (Exception e) {
            sellerNom = "ShopFlow";
        }

        // Accès sécurisé aux catégories
        List<String> categories = List.of();
        List<Long> categoryIds = List.of();
        try {
            if (p.getCategories() != null) {
                categories = p.getCategories().stream()
                        .map(Category::getNom)
                        .collect(Collectors.toList());
                categoryIds = p.getCategories().stream()
                        .map(Category::getId)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            categories = List.of();
            categoryIds = List.of();
        }

        return ProductResponse.builder()
                .id(p.getId())
                .nom(p.getNom())
                .description(p.getDescription())
                .prix(p.getPrix())
                .prixPromo(p.getPrixPromo())
                .stock(getDisplayStock(p))
                .images(p.getImages())
                .actif(p.isActif())
                .dateCreation(p.getDateCreation())
                .sellerNom(sellerNom)
                .categories(categories)
                .categoryIds(categoryIds)
                .noteMoyenne(note)
                .fraisLivraisonLocal(p.getFraisLivraisonLocal())
                .fraisLivraisonInternational(p.getFraisLivraisonInternational())
                .promotion(p.getPrixPromo() != null && p.getPrixPromo().compareTo(p.getPrix()) < 0)
                .pourcentageRemise(calculateDiscountPercent(p.getPrix(), p.getPrixPromo()))
                .build();
    }

    private Integer calculateDiscountPercent(BigDecimal prix, BigDecimal prixPromo) {
        if (prix == null || prixPromo == null || prix.compareTo(BigDecimal.ZERO) <= 0 || prixPromo.compareTo(prix) >= 0) {
            return 0;
        }
        BigDecimal reduction = prix.subtract(prixPromo).multiply(BigDecimal.valueOf(100)).divide(prix, 0, java.math.RoundingMode.HALF_UP);
        return reduction.intValue();
    }

    private Integer getDisplayStock(Product product) {
        if (product.getVariantes() != null && !product.getVariantes().isEmpty()) {
            return product.getVariantes().stream()
                    .map(ProductVariant::getStock)
                    .filter(stock -> stock != null)
                    .mapToInt(Integer::intValue)
                    .sum();
        }
        return product.getStock() != null ? product.getStock() : 0;
    }
}
