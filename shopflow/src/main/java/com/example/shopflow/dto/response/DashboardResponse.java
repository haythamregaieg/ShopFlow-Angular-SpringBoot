package com.example.shopflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private long totalReviews;
    private BigDecimal chiffreAffaires;
    private Map<String, Integer> topProducts;
    private Map<String, BigDecimal> topSellers;
    private List<RecentOrderDto> recentOrders;
}
