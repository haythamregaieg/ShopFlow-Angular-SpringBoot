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

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getAllReviews().subscribe({
      next: (r) => {
        this.reviews = r || [];
        this.loading = false;
      },
      error: () => {
        this.message = 'Erreur lors du chargement des avis';
        this.loading = false;
      }
    });
  }

  approve(id: number): void {
    this.reviewService.approveReview(id).subscribe({
      next: () => {
        this.message = 'Avis approuvé ! ✅';
        this.loadReviews();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => this.message = 'Erreur lors de l\'approbation'
    });
  }
}
