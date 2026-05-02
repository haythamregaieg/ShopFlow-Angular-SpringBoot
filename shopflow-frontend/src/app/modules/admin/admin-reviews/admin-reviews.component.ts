import { Component, OnInit } from '@angular/core';
import { Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;
  message = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getAllReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.totalPages = Math.ceil(this.reviews.length / this.pageSize);
        if (this.currentPage >= this.totalPages) this.currentPage = 0;
        this.loading = false;
      },
      error: () => {
        this.message = 'Erreur de chargement des avis';
        this.loading = false;
      }
    });
  }

  get paginatedReviews(): Review[] {
    const start = this.currentPage * this.pageSize;
    return this.reviews.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
  }

  approve(id: number): void {
    this.reviewService.approveReview(id).subscribe({
      next: () => {
        this.message = 'Avis approuvé ! ✅';
        this.loadReviews();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => this.message = 'Erreur lors de l’approbation'
    });
  }
}
