package com.example.shopflow.service;

import com.example.shopflow.dto.request.CartItemRequest;
import com.example.shopflow.dto.response.CartResponse;
import com.example.shopflow.entity.*;
import com.example.shopflow.entity.enums.Role;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private CouponRepository couponRepository;

    @InjectMocks private CartService cartService;

    private User user;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L).email("test@test.com")
                .prenom("Test").nom("User")
                .role(Role.CUSTOMER).actif(true).build();

        product = Product.builder()
                .id(1L).nom("iPhone 15 Pro")
                .prix(new BigDecimal("1199.99"))
                .stock(25).actif(true).build();

        cart = Cart.builder()
                .id(1L).customer(user)
                .lignes(new ArrayList<>()).build();
    }

    @Test
    void getCart_ShouldReturnCart_WhenUserExists() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));

        CartResponse response = cartService.getCart("test@test.com");

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getCart_ShouldCreateCart_WhenCartDoesNotExist() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.getCart("test@test.com");

        assertNotNull(response);
        verify(cartRepository, atLeastOnce()).save(any(Cart.class));
    }

    @Test
    void getCart_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> cartService.getCart("unknown@test.com"));
    }

    @Test
    void addItem_ShouldAddProduct_WhenStockAvailable() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(1L);
        request.setQuantite(2);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.addItem("test@test.com", request);

        assertNotNull(response);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addItem_ShouldThrow_WhenStockInsufficient() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(1L);
        request.setQuantite(100);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(BadRequestException.class,
                () -> cartService.addItem("test@test.com", request));
    }

    @Test
    void addItem_ShouldThrow_WhenProductNotActive() {
        product.setActif(false);
        CartItemRequest request = new CartItemRequest();
        request.setProductId(1L);
        request.setQuantite(1);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(BadRequestException.class,
                () -> cartService.addItem("test@test.com", request));
    }
}