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
  categories: Category[] = [];   // arbre
  allFlat: Category[] = [];      // liste plate pour le sélecteur de parent

  form: FormGroup;
  activeTab: 'principale' | 'sous' = 'principale';
  isEdit = false;
  selectedId: number | null = null;
  loading = false;
  error = '';

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      parentId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.loading = false;
      },
      error: () => { this.error = 'Erreur de chargement'; this.loading = false; }
    });
    this.categoryService.getAllFlat().subscribe({
      next: (data) => { this.allFlat = data || []; },
      error: () => {}
    });
  }

  get rootCategories(): Category[] {
    return this.categories;
  }

  get parentOptions(): Category[] {
    // Only roots as possible parents (no grandparent nesting)
    return this.allFlat.filter(c => !c.parentId);
  }

  switchTab(tab: 'principale' | 'sous'): void {
    this.activeTab = tab;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { nom, description, parentId } = this.form.value;
    const payload = {
      nom,
      description: description || '',
      parentId: this.activeTab === 'sous' ? (parentId || null) : null
    };

    const action = this.isEdit && this.selectedId
      ? this.categoryService.update(this.selectedId, payload)
      : this.categoryService.create(payload);

    action.subscribe({
      next: () => this.resetForm(),
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la sauvegarde';
        this.loading = false;
      }
    });
  }

  edit(cat: Category): void {
    this.isEdit = true;
    this.selectedId = cat.id;
    this.activeTab = cat.parentId ? 'sous' : 'principale';
    this.form.patchValue({
      nom: cat.nom,
      description: cat.description || '',
      parentId: cat.parentId || null
    });
  }

  delete(id: number): void {
    if (confirm('Supprimer cette catégorie ? Les sous-catégories seront aussi supprimées.')) {
      this.categoryService.delete(id).subscribe({
        next: () => this.loadCategories(),
        error: () => { this.error = 'Erreur lors de la suppression'; }
      });
    }
  }

  resetForm(): void {
    this.form.reset({ nom: '', description: '', parentId: null });
    this.isEdit = false;
    this.selectedId = null;
    this.loadCategories();
  }

  totalSubCount(): number {
    return this.categories.reduce((acc, c) => acc + (c.sousCategories?.length || 0), 0);
  }
}
