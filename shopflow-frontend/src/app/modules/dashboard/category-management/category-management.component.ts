import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  form: FormGroup;
  isEdit = false;
  selectedId: number | null = null;
  loading = false;
  error = '';

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des catégories';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const category: Category = this.form.value;

    if (this.isEdit && this.selectedId) {
      this.categoryService.update(this.selectedId, category).subscribe({
        next: () => this.resetForm(),
        error: () => { this.error = 'Erreur lors de la modification'; this.loading = false; }
      });
    } else {
      this.categoryService.create(category).subscribe({
        next: () => this.resetForm(),
        error: () => { this.error = 'Erreur lors de la création'; this.loading = false; }
      });
    }
  }

  edit(cat: Category): void {
    this.isEdit = true;
    this.selectedId = cat.id!;
    this.form.patchValue({
      nom: cat.nom,
      description: cat.description
    });
  }

  delete(id: number): void {
    if (confirm('Supprimer cette catégorie ?')) {
      this.categoryService.delete(id).subscribe(() => this.loadCategories());
    }
  }

  resetForm(): void {
    this.form.reset();
    this.isEdit = false;
    this.selectedId = null;
    this.loadCategories();
  }
}
