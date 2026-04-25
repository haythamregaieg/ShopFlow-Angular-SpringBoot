package com.example.shopflow.controller;

import com.example.shopflow.dto.request.OrderRequest;
import com.example.shopflow.dto.response.OrderResponse;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@AuthenticationPrincipal UserDetails userDetails,
                                @Valid @RequestBody OrderRequest request) {
        return orderService.createOrder(userDetails.getUsername(), request);
    }

    @GetMapping("/my")
    public List<OrderResponse> myOrders(@AuthenticationPrincipal UserDetails userDetails) {
        return orderService.getMyOrders(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    @PutMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id,
                                @AuthenticationPrincipal UserDetails userDetails) {
        return orderService.cancel(id, userDetails.getUsername());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> getAll() {
        return orderService.getMyOrders(null);
    }
}