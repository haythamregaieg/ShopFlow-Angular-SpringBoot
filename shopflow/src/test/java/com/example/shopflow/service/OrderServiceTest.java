package com.example.shopflow.service;

import com.example.shopflow.dto.response.OrderResponse;
import com.example.shopflow.entity.*;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.entity.enums.Role;
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
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks private OrderService orderService;

    private User user;
    private Order order;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L).email("customer@test.com")
                .role(Role.CUSTOMER).actif(true).build();

        order = Order.builder()
                .id(1L).customer(user)
                .statut(OrderStatus.PENDING)
                .numeroCommande("ORD-12345678")
                .sousTotal(new BigDecimal("1199.99"))
                .fraisLivraison(BigDecimal.ZERO)
                .totalTTC(new BigDecimal("1199.99"))
                .lignes(new ArrayList<>()).build();
    }

    @Test
    void getMyOrders_ShouldReturnOrders_WhenUserExists() {
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(user));
        when(orderRepository.findByCustomerIdOrderByDateCommandeDesc(1L)).thenReturn(new ArrayList<>());

        List<OrderResponse> orders = orderService.getMyOrders("customer@test.com");

        assertNotNull(orders);
        assertTrue(orders.isEmpty());
    }

    @Test
    void getMyOrders_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.getMyOrders("unknown@test.com"));
    }

    @Test
    void cancel_ShouldCancelOrder_WhenStatusIsPending() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.cancel(1L, "customer@test.com");

        assertNotNull(response);
        assertEquals("CANCELLED", response.getStatut());
    }

    @Test
    void cancel_ShouldThrow_WhenOrderNotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.cancel(999L, "customer@test.com"));
    }

    @Test
    void updateStatus_ShouldUpdateStatus() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.updateStatus(1L, OrderStatus.SHIPPED);

        assertNotNull(response);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void updateStatus_ShouldThrow_WhenNotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.updateStatus(999L, OrderStatus.SHIPPED));
    }
}