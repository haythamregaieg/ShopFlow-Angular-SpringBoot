import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8081/api/reviews';

  constructor(private http: HttpClient) { }

  addReview(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, request);
  }

  addProductReview(request: ReviewRequest): Observable<Review> {
    return this.addReview(request);
  }

  getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  GetProductReviews(productId: number): Observable<Review[]> {
    return this.getProductReviews(productId);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  GetAllReviews(): Observable<Review[]> {
    return this.getAllReviews();
  }

  approveReview(id: number): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}/approve`, {});
  }

  updateReviewApprove(id: number): Observable<Review> {
    return this.approveReview(id);
  }
}
