package com.example.shopflow.service;

import com.example.shopflow.entity.Product;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private final ProductRepository productRepository;

    @Transactional
    public Product updateStock(Long productId, Integer newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        if (newStock < 0) {
            throw new BadRequestException("Le stock ne peut pas etre negatif");
        }
        product.setStock(newStock);
        return productRepository.save(product);
    }

    public List<Map<String, Object>> getLowStockProducts(int threshold) {
        return productRepository.findByActifTrue(Pageable.unpaged())
                .stream()
                .filter(p -> p.getStock() <= threshold)
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("nom", p.getNom());
                    map.put("stock", p.getStock());
                    map.put("alerte", p.getStock() == 0 ? "RUPTURE" : "STOCK_FAIBLE");
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void decrementStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        if (product.getStock() < quantity) {
            throw new BadRequestException("Stock insuffisant pour : " + product.getNom());
        }
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    @Transactional
    public void incrementStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
    }
}