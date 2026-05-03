package com.example.shopflow.service;

import com.example.shopflow.dto.request.ProductRequest;
import com.example.shopflow.dto.response.ProductResponse;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.User;
import com.example.shopflow.entity.enums.Role;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReviewRepository reviewRepository;

    @InjectMocks
    private ProductService productService;

    private User seller;
    private Product product;

    @BeforeEach
    void setUp() {
        seller = User.builder()
                .id(2L)
                .email("seller@test.com")
                .prenom("Jean")
                .nom("Dupont")
                .role(Role.SELLER)
                .build();

        product = Product.builder()
                .id(1L)
                .nom("iPhone 15 Pro")
                .description("Apple iPhone 15 Pro 256GB")
                .prix(new BigDecimal("1199.99"))
                .prixPromo(new BigDecimal("999.99"))
                .stock(25)
                .actif(true)
                .seller(seller)
                .categories(new ArrayList<>())
                .build();
    }

    @Test
    void getAllProducts_ShouldReturnPage_WhenProductsExist() {
        // Given
        Pageable pageable = PageRequest.of(0, 12);
        Page<Product> productPage = new PageImpl<>(List.of(product), pageable, 1);

        when(productRepository.findByActifTrue(any(Pageable.class))).thenReturn(productPage);
        when(reviewRepository.findAverageNoteByProductId(1L)).thenReturn(4.5);

        // When
        Page<ProductResponse> response = productService.getAllProducts(pageable);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("iPhone 15 Pro", response.getContent().get(0).getNom());
    }

    @Test
    void getById_ShouldReturnProduct_WhenFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(reviewRepository.findAverageNoteByProductId(1L)).thenReturn(null);

        // When
        ProductResponse response = productService.getById(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("iPhone 15 Pro", response.getNom());
        assertEquals(new BigDecimal("1199.99"), response.getPrix());
    }

    @Test
    void getById_ShouldThrow_WhenNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Then
        assertThrows(ResourceNotFoundException.class,
                () -> productService.getById(999L));
    }

    @Test
    void create_ShouldCreateProduct_WhenSellerExists() {
        // Given
        ProductRequest request = new ProductRequest();
        request.setNom("Samsung Galaxy S24");
        request.setDescription("Samsung S24 128GB");
        request.setPrix(new BigDecimal("899.99"));
        request.setStock(30);
        request.setCategoryIds(new ArrayList<>());

        when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
        when(categoryRepository.findAllById(any())).thenReturn(new ArrayList<>());
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(reviewRepository.findAverageNoteByProductId(any())).thenReturn(null);

        // When
        ProductResponse response = productService.create(request, "seller@test.com");

        // Then
        assertNotNull(response);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void delete_ShouldDeactivateProduct_WhenFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // When
        productService.delete(1L);

        // Then
        assertFalse(product.isActif());
        verify(productRepository).save(product);
    }

    @Test
    void delete_ShouldThrow_WhenNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Then
        assertThrows(ResourceNotFoundException.class,
                () -> productService.delete(999L));
    }
}
