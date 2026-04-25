import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  productId: number | null = null;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      prix: ['', [Validators.required, Validators.min(0)]],
      prixPromo: [''],
      stock: ['', [Validators.required, Validators.min(0)]],
      images: [''],
      categoryIds: [[]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.productId = +id;
      this.productService.getById(this.productId).subscribe(product => {
        this.form.patchValue({
          nom: product.nom,
          description: product.description,
          prix: product.prix,
          prixPromo: product.prixPromo,
          stock: product.stock,
          images: product.images
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const data = { ...this.form.value, categoryIds: [] };

    const action = this.isEdit && this.productId
      ? this.productService.update(this.productId, data)
      : this.productService.create(data);

    action.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => { this.error = err.error?.error || 'Erreur'; this.loading = false; }
    });
  }
}