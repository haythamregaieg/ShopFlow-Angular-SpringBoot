package com.example.shopflow.mapper;

import com.example.shopflow.dto.CreateProductRequest;
import com.example.shopflow.dto.ProductDto;
import com.example.shopflow.entity.Category;
import com.example.shopflow.entity.Product;
import com.example.shopflow.repository.CategoryRepository;
import com.example.shopflow.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductMapper(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public ProductDto toDto(Product p) {
        if (p == null) return null;
        List<String> catNames = p.getCategories() == null ? Collections.emptyList() :
                p.getCategories().stream().map(Category::getNom).collect(Collectors.toList());

        return ProductDto.builder()
                .id(p.getId())
                .sellerId(p.getSeller() != null ? p.getSeller().getId() : null)
                .nom(p.getNom())
                .description(p.getDescription())
                .prix(p.getPrix())
                .prixPromo(p.getPrixPromo())
                .stock(p.getStock())
                .categories(catNames)
                .images(p.getImages())
                .dateCreation(p.getDateCreation())
                .build();
    }

    public Product fromCreateRequest(CreateProductRequest r) {
        Product p = new Product();
        p.setNom(r.getNom());
        p.setDescription(r.getDescription());
        p.setPrix(r.getPrix());
        p.setPrixPromo(r.getPrixPromo());
        p.setStock(r.getStock());
        p.setImages(r.getImages());

        if (r.getSellerId() != null) {
            userRepository.findById(r.getSellerId()).ifPresent(p::setSeller);
        }

        if (r.getCategoryIds() != null && !r.getCategoryIds().isEmpty()) {
            List<Category> cats = r.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id).orElse(null))
                    .filter(c -> c != null)
                    .collect(Collectors.toList());
            p.setCategories(cats);
        }

        return p;
    }
}
