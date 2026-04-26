package com.example.shopflow.controller;

import com.example.shopflow.entity.Order;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.repository.OrderRepository;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ReviewRepository;
import com.example.shopflow.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.shopflow.security.JwtAuthFilter;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;

@WebMvcTest(controllers = DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
public class DashboardControllerIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    OrderRepository orderRepository;

    @MockBean
    ProductRepository productRepository;

    @MockBean
    UserRepository userRepository;

    @MockBean
    ReviewRepository reviewRepository;

    @MockBean
    JwtAuthFilter jwtAuthFilter;

    @MockBean
    UserDetailsService userDetailsService;

    @Test
    void adminDashboard_returnsExpectedFields() throws Exception {
        Order o = Order.builder()
                .id(1L)
                .numeroCommande("C1")
                .statut(OrderStatus.PAID)
                .totalTTC(new BigDecimal("50.00"))
                .dateCommande(LocalDateTime.now())
                .build();

        when(orderRepository.findAll()).thenReturn(List.of(o));
    when(orderRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(2L);
        when(userRepository.count()).thenReturn(3L);
        when(reviewRepository.count()).thenReturn(4L);

        mockMvc.perform(get("/api/dashboard/admin").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(3))
                .andExpect(jsonPath("$.totalProducts").value(2))
                .andExpect(jsonPath("$.totalOrders").value(1))
                .andExpect(jsonPath("$.chiffreAffaires").exists());
    }
}
