package com.example.shopflow.controller;

import com.example.shopflow.dto.request.ProductRequest;
import com.example.shopflow.dto.response.ProductResponse;
import com.example.shopflow.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<ProductResponse> getAll(Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/search")
    public Page<ProductResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BigDecimal prixMin,
            @RequestParam(required = false) BigDecimal prixMax,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(defaultValue = "false") boolean promoOnly,
            @RequestParam(defaultValue = "nouveautes") String sortBy,
            Pageable pageable) {
        return productService.searchProducts(q, prixMin, prixMax, categoryIds, promoOnly, sortBy, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ProductResponse create(@Valid @RequestBody ProductRequest request,
                                  @AuthenticationPrincipal UserDetails userDetails) {
        return productService.create(request, userDetails.getUsername());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductRequest request,
                                  @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return productService.updateForUser(id, request, userDetails.getUsername(), isAdmin);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // For delete, require the caller to be either the seller who owns the product or an admin
        // The ProductService will enforce ownership
        // Try to obtain the current authenticated user (if present)
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false;
        String username = null;
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails ud) {
            username = ud.getUsername();
            isAdmin = ud.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        }
        productService.deleteForUser(id, username, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public org.springframework.data.domain.Page<ProductResponse> getSellerProducts(org.springframework.data.domain.Pageable pageable,
                                                                                     @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return productService.getProductsForSeller(pageable, userDetails.getUsername());
    }
}
