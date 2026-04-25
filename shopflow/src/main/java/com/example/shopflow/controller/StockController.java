package com.example.shopflow.controller;

import com.example.shopflow.entity.Product;
import com.example.shopflow.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PutMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public Product updateStock(@PathVariable Long productId,
                               @RequestParam Integer stock) {
        return stockService.updateStock(productId, stock);
    }

    @GetMapping("/low")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public List<Map<String, Object>> getLowStock(
            @RequestParam(defaultValue = "5") int threshold) {
        return stockService.getLowStockProducts(threshold);
    }
}