package com.example.shopflow.controller;

import com.example.shopflow.dto.response.VariantResponse;
import com.example.shopflow.service.ProductVariantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ProductVariantControllerTest {

    private MockMvc mockMvc;

    private ProductVariantService variantService = Mockito.mock(ProductVariantService.class);

    @BeforeEach
    void setUp() {
        ProductVariantController controller = new ProductVariantController(variantService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        VariantResponse v = VariantResponse.builder().id(1L).nom("v").prixDelta(BigDecimal.ZERO).build();
        when(variantService.listByProduct(anyLong())).thenReturn(List.of(v));
        when(variantService.getById(1L)).thenReturn(v);
    }

    @Test
    void listByProduct_returnsOk() throws Exception {
        mockMvc.perform(get("/api/products/1/variants")).andExpect(status().isOk());
    }

    @Test
    void getById_returnsOk() throws Exception {
        mockMvc.perform(get("/api/variants/1")).andExpect(status().isOk());
    }
}
