package com.example.shopflow.controller;

import com.example.shopflow.entity.Order;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.repository.OrderRepository;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ReviewRepository;
import com.example.shopflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class DashboardControllerTest {

    private MockMvc mockMvc;

    private OrderRepository orderRepository = Mockito.mock(OrderRepository.class);
    private ProductRepository productRepository = Mockito.mock(ProductRepository.class);
    private UserRepository userRepository = Mockito.mock(UserRepository.class);
    private ReviewRepository reviewRepository = Mockito.mock(ReviewRepository.class);

    @BeforeEach
    void setUp() {
        DashboardController controller = new DashboardController(orderRepository, productRepository, userRepository, reviewRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        Order o = Order.builder()
                .id(1L)
                .numeroCommande("CMD-1")
                .statut(OrderStatus.PAID)
                .totalTTC(new BigDecimal("100.00"))
                .dateCommande(LocalDateTime.now())
                .lignes(List.of())
                .build();

        when(orderRepository.findAll()).thenReturn(List.of(o));
        when(productRepository.count()).thenReturn(0L);
        when(userRepository.count()).thenReturn(0L);
        when(reviewRepository.count()).thenReturn(0L);
    }

    @Test
    void adminDashboard_returnsOkAndHasChiffreAffaires() throws Exception {
        mockMvc.perform(get("/api/dashboard/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chiffreAffaires").exists());
    }
}
