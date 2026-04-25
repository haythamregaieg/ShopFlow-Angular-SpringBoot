package com.example.shopflow.controller;

import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.ProductVariant;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public List<ProductVariant> getVariants(@PathVariable Long productId) {
        return productVariantRepository.findByProductId(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ProductVariant addVariant(@PathVariable Long productId,
                                     @RequestBody ProductVariant variant) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        variant.setProduct(product);
        return productVariantRepository.save(variant);
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ProductVariant updateVariant(@PathVariable Long variantId,
                                        @RequestBody ProductVariant variant) {
        ProductVariant existing = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variante introuvable"));
        existing.setAttribut(variant.getAttribut());
        existing.setValeur(variant.getValeur());
        existing.setStockSupplementaire(variant.getStockSupplementaire());
        existing.setPrixDelta(variant.getPrixDelta());
        return productVariantRepository.save(existing);
    }

    @DeleteMapping("/{variantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public void deleteVariant(@PathVariable Long variantId) {
        productVariantRepository.deleteById(variantId);
    }
}