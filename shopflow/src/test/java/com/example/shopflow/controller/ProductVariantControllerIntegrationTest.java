package com.example.shopflow.controller;

import com.example.shopflow.dto.request.VariantRequest;
import com.example.shopflow.dto.response.VariantResponse;
import com.example.shopflow.service.ProductVariantService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.example.shopflow.security.JwtAuthFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductVariantController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProductVariantControllerIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ProductVariantService variantService;

    @MockBean
    JwtAuthFilter jwtAuthFilter;

    @MockBean
    UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "seller@example.com", roles = {"SELLER"})
    void createVariant_sellerOwner_returnsCreated() throws Exception {
        VariantRequest req = new VariantRequest();
        req.setNom("Variant A");
        req.setPrixDelta(BigDecimal.ZERO);
        req.setStock(10);

        VariantResponse resp = VariantResponse.builder().id(123L).nom("Variant A").prixDelta(BigDecimal.ZERO).build();
        when(variantService.createForUser(eq(1L), org.mockito.ArgumentMatchers.any(), eq("seller@example.com"))).thenReturn(resp);

        mockMvc.perform(post("/api/products/1/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(123));
    }

    @Test
    @WithMockUser(username = "other@example.com", roles = {"SELLER"})
    void createVariant_sellerNotOwner_returnsForbidden() throws Exception {
        VariantRequest req = new VariantRequest();
        req.setNom("Variant A");
        req.setPrixDelta(BigDecimal.ZERO);
        req.setStock(10);

        when(variantService.createForUser(anyLong(), org.mockito.ArgumentMatchers.any(), eq("other@example.com")))
                .thenThrow(new AccessDeniedException("Not owner"));

        mockMvc.perform(post("/api/products/1/variants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }
}
