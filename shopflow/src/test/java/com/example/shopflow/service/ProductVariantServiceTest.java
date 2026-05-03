package com.example.shopflow.service;

import com.example.shopflow.dto.request.VariantRequest;
import com.example.shopflow.dto.response.VariantResponse;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.ProductVariant;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductVariantServiceTest {

    @Mock private ProductVariantRepository variantRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks private ProductVariantService productVariantService;

    private Product product;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        product = Product.builder().id(1L).nom("iPhone 15 Pro").build();
        variant = ProductVariant.builder()
                .id(1L).product(product)
                .taille("M").couleur("Noir")
                .stock(10).build();
    }

    @Test
    void create_createsVariant() {
        VariantRequest request = new VariantRequest();
        request.setTaille("M");
        request.setCouleur("Noir");
        request.setStock(10);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(variantRepository.save(any(ProductVariant.class))).thenReturn(variant);

        VariantResponse response = productVariantService.create(1L, request);

        assertNotNull(response);
        verify(variantRepository).save(any(ProductVariant.class));
    }

    @Test
    void create_ShouldThrow_WhenProductNotFound() {
        VariantRequest request = new VariantRequest();
        request.setTaille("L");
        request.setCouleur("Blanc");
        request.setStock(5);

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productVariantService.create(999L, request));
    }
}