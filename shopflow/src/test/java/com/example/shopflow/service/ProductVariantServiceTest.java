package com.example.shopflow.service;

import com.example.shopflow.dto.request.VariantRequest;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.ProductVariant;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ProductVariantServiceTest {

    private ProductVariantRepository variantRepository;
    private ProductRepository productRepository;
    private ProductVariantService service;

    @BeforeEach
    void setUp() {
        variantRepository = Mockito.mock(ProductVariantRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        service = new ProductVariantService(variantRepository, productRepository, null);
    }

    @Test
    void listByProduct_returnsVariants() {
        ProductVariant v = ProductVariant.builder().id(1L).nom("v1").build();
        when(variantRepository.findByProductId(1L)).thenReturn(List.of(v));

        var res = service.listByProduct(1L);
        assertThat(res).hasSize(1);
        assertThat(res.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void create_createsVariant() {
        Product p = new Product(); p.setId(2L);
        when(productRepository.findById(2L)).thenReturn(Optional.of(p));

        VariantRequest req = new VariantRequest();
        req.setNom("v2"); req.setStock(5); req.setPrixDelta(BigDecimal.ZERO);

        ProductVariant saved = ProductVariant.builder().id(10L).nom("v2").build();
        when(variantRepository.save(any())).thenReturn(saved);

        var res = service.create(2L, req);
        assertThat(res.getId()).isEqualTo(10L);
    }
}
