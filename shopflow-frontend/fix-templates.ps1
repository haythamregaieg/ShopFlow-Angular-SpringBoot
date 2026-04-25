$utf8NoBOM = New-Object System.Text.UTF8Encoding $false

# Fix login.component.html
[System.IO.File]::WriteAllText("$PWD\src\app\modules\auth\login\login.component.html", @"
<div class="auth-page">
  <div class="auth-left">
    <div class="auth-logo">ShopFlow</div>
    <h1>ShopFlow</h1>
    <p>La plateforme e-commerce moderne pour gerer votre boutique en ligne</p>
    <div class="auth-features">
      <div class="feature">Gestion des produits et stocks</div>
      <div class="feature">Panier et commandes en temps reel</div>
      <div class="feature">Dashboard analytique complet</div>
      <div class="feature">Securite JWT avancee</div>
    </div>
  </div>
  <div class="auth-right">
    <div class="auth-form-container fade-in">
      <div class="auth-header">
        <h2>Bon retour !</h2>
        <p>Connectez-vous a votre compte ShopFlow</p>
      </div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Adresse email</label>
          <input type="email" formControlName="email" placeholder="votre@email.com" />
          <span class="error-msg" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
            Email invalide
          </span>
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input type="password" formControlName="motDePasse" placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading">
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>
      <p class="auth-link">Pas encore de compte ? <a routerLink="/auth/register">Creer un compte</a></p>
    </div>
  </div>
</div>
"@, $utf8NoBOM)

# Fix register.component.html
[System.IO.File]::WriteAllText("$PWD\src\app\modules\auth\register\register.component.html", @"
<div class="auth-page">
  <div class="auth-left">
    <div class="auth-logo">ShopFlow</div>
    <h1>Rejoignez-nous !</h1>
    <p>Creez votre compte et commencez a acheter</p>
  </div>
  <div class="auth-right">
    <div class="auth-form-container fade-in">
      <div class="auth-header">
        <h2>Creer un compte</h2>
        <p>Inscription gratuite en quelques secondes</p>
      </div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label>Prenom</label>
            <input type="text" formControlName="prenom" placeholder="Marie" />
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input type="text" formControlName="nom" placeholder="Dupont" />
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="votre@email.com" />
          <span class="error-msg" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
            Email invalide
          </span>
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input type="password" formControlName="motDePasse" placeholder="Minimum 6 caracteres" />
          <span class="error-msg" *ngIf="form.get('motDePasse')?.touched && form.get('motDePasse')?.invalid">
            Minimum 6 caracteres
          </span>
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading">
          {{ loading ? 'Inscription...' : 'S inscrire' }}
        </button>
      </form>
      <p class="auth-link">Deja un compte ? <a routerLink="/auth/login">Se connecter</a></p>
    </div>
  </div>
</div>
"@, $utf8NoBOM)

# Fix navbar.component.html
[System.IO.File]::WriteAllText("$PWD\src\app\shared\navbar\navbar.component.html", @"
<nav class="navbar">
  <div class="nav-container">
    <a routerLink="/products" class="nav-brand">
      <span class="brand-text">ShopFlow</span>
    </a>
    <div class="nav-links">
      <a routerLink="/products" routerLinkActive="active">Catalogue</a>
      <a routerLink="/cart" routerLinkActive="active" *ngIf="isLoggedIn">
        Panier
        <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
      </a>
      <a routerLink="/orders" routerLinkActive="active" *ngIf="isLoggedIn">Commandes</a>
      <a routerLink="/dashboard" routerLinkActive="active" *ngIf="isLoggedIn">Dashboard</a>
      <a routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin" class="admin-link">Admin</a>
    </div>
    <div class="nav-auth">
      <ng-container *ngIf="!isLoggedIn">
        <a routerLink="/auth/login" class="btn btn-ghost btn-sm">Connexion</a>
        <a routerLink="/auth/register" class="btn btn-primary btn-sm">Inscription</a>
      </ng-container>
      <ng-container *ngIf="isLoggedIn">
        <div class="user-menu">
          <div class="user-avatar">{{ userEmail.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <span class="user-email">{{ userEmail }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <button (click)="logout()" class="btn btn-ghost btn-sm">Deconnexion</button>
      </ng-container>
    </div>
  </div>
</nav>
"@, $utf8NoBOM)

Write-Host "Fichiers corriges avec succes"
