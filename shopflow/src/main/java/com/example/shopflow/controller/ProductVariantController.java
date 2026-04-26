package com.example.shopflow.controller;

import com.example.shopflow.dto.request.VariantRequest;
import com.example.shopflow.dto.response.VariantResponse;
import com.example.shopflow.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    @GetMapping("/products/{productId}/variants")
    public List<VariantResponse> listByProduct(@PathVariable Long productId) {
        return variantService.listByProduct(productId);
    }

    @GetMapping("/variants/{id}")
    public VariantResponse getById(@PathVariable Long id) {
        return variantService.getById(id);
    }

    @PostMapping("/products/{productId}/variants")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public VariantResponse create(@PathVariable Long productId, @Valid @RequestBody VariantRequest req,
                                  @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails user) {
        String username = user != null ? user.getUsername() : null;
        return variantService.createForUser(productId, req, username);
    }

    @PutMapping("/products/{productId}/variants/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public VariantResponse update(@PathVariable Long productId, @PathVariable Long id, @Valid @RequestBody VariantRequest req,
                                  @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails user) {
        String username = user != null ? user.getUsername() : null;
        return variantService.updateForUser(id, req, username);
    }

    @DeleteMapping("/products/{productId}/variants/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long productId, @PathVariable Long id,
                                       @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails user) {
        String username = user != null ? user.getUsername() : null;
        variantService.deleteForUser(id, username);
        return ResponseEntity.noContent().build();
    }
}
