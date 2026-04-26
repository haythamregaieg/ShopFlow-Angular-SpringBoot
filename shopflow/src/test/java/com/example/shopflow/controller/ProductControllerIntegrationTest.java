package com.example.shopflow.controller;

import com.example.shopflow.dto.CreateProductRequest;
import com.example.shopflow.dto.request.ProductRequest;
import com.example.shopflow.dto.response.ProductResponse;
import com.example.shopflow.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.shopflow.security.JwtAuthFilter;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProductControllerIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ProductService productService;

    @MockBean
    JwtAuthFilter jwtAuthFilter;

    @MockBean
    UserDetailsService userDetailsService;

    @Test
    void listProducts_returnsOk() throws Exception {
        mockMvc.perform(get("/api/products")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"SELLER"})
    void createProduct_seller_returnsCreated() throws Exception {
        ProductRequest req = new ProductRequest();
        req.setNom("P1");
        req.setPrix(new BigDecimal("10"));
        req.setStock(5);

        ProductResponse resp = ProductResponse.builder().id(1L).nom("P1").build();
        when(productService.create(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString())).thenReturn(resp);

        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }
}
