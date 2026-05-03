package com.example.shopflow.controller;

import com.example.shopflow.dto.request.CategoryRequest;
import com.example.shopflow.dto.response.CategoryResponse;
import com.example.shopflow.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** Retourne l'arbre : catégories racines avec leurs sous-catégories */
    @GetMapping
    public List<CategoryResponse> getAll() {
        return categoryService.getAllTree();
    }

    /** Retourne la liste plate de toutes les catégories (pour les formulaires) */
    @GetMapping("/flat")
    public List<CategoryResponse> getAllFlat() {
        return categoryService.getAllFlat();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public CategoryResponse create(@RequestBody CategoryRequest request) {
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public CategoryResponse update(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
