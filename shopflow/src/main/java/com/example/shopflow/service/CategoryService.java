package com.example.shopflow.service;

import com.example.shopflow.dto.request.CategoryRequest;
import com.example.shopflow.dto.response.CategoryResponse;
import com.example.shopflow.entity.Category;
import com.example.shopflow.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllTree() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::toResponseWithChildren)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllFlat() {
        return categoryRepository.findAll().stream()
                .map(this::toResponseFlat)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        category.setNom(request.getNom());
        category.setDescription(request.getDescription());
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Catégorie parent introuvable"));
            category.setParent(parent);
        }
        return toResponseFlat(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
        category.setNom(request.getNom());
        category.setDescription(request.getDescription());
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new RuntimeException("Une catégorie ne peut pas être son propre parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Catégorie parent introuvable"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        return toResponseFlat(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponseWithChildren(Category cat) {
        List<CategoryResponse> sousCategories = List.of();
        try {
            if (cat.getSousCategories() != null) {
                sousCategories = cat.getSousCategories().stream()
                        .map(this::toResponseFlat)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            sousCategories = List.of();
        }
        return CategoryResponse.builder()
                .id(cat.getId())
                .nom(cat.getNom())
                .description(cat.getDescription())
                .parentId(null)
                .parentNom(null)
                .sousCategories(sousCategories)
                .build();
    }

    public CategoryResponse toResponseFlat(Category cat) {
        Long parentId = null;
        String parentNom = null;
        try {
            if (cat.getParent() != null) {
                parentId = cat.getParent().getId();
                parentNom = cat.getParent().getNom();
            }
        } catch (Exception ignored) {}
        return CategoryResponse.builder()
                .id(cat.getId())
                .nom(cat.getNom())
                .description(cat.getDescription())
                .parentId(parentId)
                .parentNom(parentNom)
                .sousCategories(List.of())
                .build();
    }
}
