package com.example.shopflow.service;

import com.example.shopflow.dto.request.ProductRequest;
import com.example.shopflow.dto.response.ProductResponse;
import com.example.shopflow.entity.Category;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.User;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.CategoryRepository;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ReviewRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        return productRepository.findByActifTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String nom, BigDecimal prixMin, BigDecimal prixMax, Pageable pageable) {
        return productRepository.searchProducts(nom, prixMin, prixMax, pageable).map(this::toResponse);
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
        try {
            if (p.getCategories() != null) {
                categories = p.getCategories().stream()
                        .map(Category::getNom)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            categories = List.of();
        }

        return ProductResponse.builder()
                .id(p.getId())
                .nom(p.getNom())
                .description(p.getDescription())
                .prix(p.getPrix())
                .prixPromo(p.getPrixPromo())
                .stock(p.getStock())
                .images(p.getImages())
                .actif(p.isActif())
                .dateCreation(p.getDateCreation())
                .sellerNom(sellerNom)
                .categories(categories)
                .noteMoyenne(note)
                .build();
    }
}