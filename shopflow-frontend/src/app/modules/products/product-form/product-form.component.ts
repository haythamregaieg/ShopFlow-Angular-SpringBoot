import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { ProductVariant } from '../../../core/models/product.model';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  categories: Category[] = [];
  variants: ProductVariant[] = [];
  removedVariantIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
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
      categoryIds: [[]],
      fraisLivraisonLocal: [0, [Validators.min(0)]],
      fraisLivraisonInternational: [0, [Validators.min(0)]],
      variants: this.fb.array([])
    });
  }

  get variantsForm(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  get hasVariants(): boolean {
    return this.variantsForm.length > 0;
  }

  get totalVariantStock(): number {
    return this.variantsForm.controls.reduce((total, control) => {
      const stock = Number(control.get('stock')?.value ?? 0);
      return total + (Number.isFinite(stock) ? stock : 0);
    }, 0);
  }

  addVariant(v?: ProductVariant): void {
    const variantGroup = this.fb.group({
      id: [v?.id || null],
      taille: [v?.taille || ''],
      couleur: [v?.couleur || ''],
      stock: [v?.stock ?? 0, [Validators.required, Validators.min(0)]],
      prixDelta: [v?.prixDelta ?? 0],
      sku: [v?.sku || '']
    }, { validators: this.variantIdentityValidator });

    variantGroup.get('stock')?.valueChanges.subscribe(() => this.syncDisplayedStock());
    this.variantsForm.push(variantGroup);
    this.syncDisplayedStock();
  }

  removeVariant(index: number): void {
    const variant = this.variantsForm.at(index).value;
    if (variant.id) {
      this.removedVariantIds.push(variant.id);
    }
    this.variantsForm.removeAt(index);
    this.syncDisplayedStock();
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c || []);
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
          images: product.images,
          categoryIds: product.categoryIds || [],
          fraisLivraisonLocal: product.fraisLivraisonLocal ?? 0,
          fraisLivraisonInternational: product.fraisLivraisonInternational ?? 0
        });
      });
      this.productService.getVariants(this.productId).subscribe(variants => {
        this.variants = variants;
        this.variantsForm.clear();
        variants.forEach(v => this.addVariant(v));
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { variants, ...payload } = this.form.value;
    const hasVariants = (variants || []).length > 0;
    const data = { ...payload, stock: hasVariants ? 0 : payload.stock };

    const action = this.isEdit && this.productId
      ? this.productService.update(this.productId, data)
      : this.productService.create(data);

    action.subscribe({
      next: (product) => {
        const productId = this.productId || product.id;
        if (!productId) {
          this.router.navigate(['/products']);
          return;
        }

        const variantActions: Observable<any>[] = [];

        // Add/Update variants
        (variants || []).forEach((variant: ProductVariant) => {
          const payload = {
            nom: variant.nom?.trim() || `${variant.taille || ''} / ${variant.couleur || ''}`.trim(),
            taille: variant.taille,
            couleur: variant.couleur,
            stock: variant.stock,
            prixDelta: variant.prixDelta ?? 0,
            sku: variant.sku || ''
          };
          if (variant.id) {
            variantActions.push(this.productService.updateVariant(productId, variant.id, payload).pipe(
              catchError(err => { console.error(err); return of(null); })
            ));
          } else {
            variantActions.push(this.productService.createVariant(productId, payload).pipe(
              catchError(err => { console.error(err); return of(null); })
            ));
          }
        });

        // Delete removed variants
        this.removedVariantIds.forEach(id => {
          variantActions.push(this.productService.deleteVariant(productId, id).pipe(
            catchError(err => { console.error(err); return of(null); })
          ));
        });

        if (variantActions.length === 0) {
          this.router.navigate(['/products']);
          return;
        }

        forkJoin(variantActions).subscribe({
          next: (results) => {
            const hasVariantErrors = (results || []).some(r => r === null);
            if (hasVariantErrors) {
              this.error = 'Certaines variantes ne sont pas enregistrees. Verifiez les champs variante (taille, couleur, stock, prix delta).';
              this.loading = false;
              return;
            }
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.error = 'Erreur lors de la sauvegarde des variantes';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de la sauvegarde du produit';
        this.loading = false;
      }
    });
  }

  private variantIdentityValidator(group: FormGroup): null | { variantIdentity: true } {
    const taille = (group.get('taille')?.value || '').toString().trim();
    const couleur = (group.get('couleur')?.value || '').toString().trim();
    return (taille || couleur) ? null : { variantIdentity: true };
  }

  private syncDisplayedStock(): void {
    if (this.hasVariants) {
      this.form.get('stock')?.setValue(this.totalVariantStock, { emitEvent: false });
    }
  }
}
