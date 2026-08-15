# 📋 Cahier de Charges - Marketplace E-commerce Multi-Vendeurs

## 🎯 Vue d'ensemble

Plateforme e-commerce de prêt-à-porter avec mode multi-vendeurs optionnel, permettant à des vendeurs tiers de proposer leurs produits sous validation administrative.

---

## 👤 Espace Client (Public)

| Fonctionnalité | Description |
|----------------|-------------|
| **Navigation** | Menu dynamique avec catégories configurables par l'admin |
| **Catalogue** | Grille produits avec recherche, filtres (prix, catégorie), tri |
| **Fiche produit** | Images, variantes (tailles/couleurs), prix promo, infos vendeur |
| **Panier** | Ajout/suppression, calcul automatique, persistance session |
| **Checkout** | Formulaire client, application coupons, validation commande |
| **Page boutique** | `/shop/:vendorId` - Catalogue dédié par vendeur |
| **Contact vendeur** | Formulaire de message depuis la fiche produit |

---

## 🏪 Espace Vendeur (`/vendor`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Connexion** | Authentification email/mot de passe (créé par admin) |
| **Dashboard** | Statistiques : CA, commandes, produits |
| **Gestion produits** | CRUD produits (soumis à validation admin) |
| **Gestion catégories** | Proposition de nouvelles catégories (validation requise) |
| **Commandes** | Visualisation des commandes contenant ses produits |
| **Messages** | Réception et gestion des messages clients |

---

## ⚙️ Espace Admin (`/admin`)

### Gestion Catalogue

| Module | Actions |
|--------|---------|
| **Produits** | CRUD complet, variantes, images multiples, flash sales |
| **Catégories** | Hiérarchie parent/enfant, visibilité navbar |
| **Coupons** | Création codes promo (% ou fixe), limites d'usage |

### Gestion Commandes

| Module | Actions |
|--------|---------|
| **Commandes** | Suivi statuts (pending → paid → shipped → delivered), filtre par vendeur |

### Gestion Contenu

| Module | Actions |
|--------|---------|
| **Hero Slides** | Carrousel page d'accueil |
| **Partenaires** | Logos partenaires |
| **Témoignages** | Avis clients |
| **Statistiques** | Chiffres clés affichés |
| **Sections** | Visibilité des blocs homepage |

### Gestion Marketplace (Mode Multi-Vendeurs)

| Module | Actions |
|--------|---------|
| **Vendeurs** | CRUD, commissions, vérification, création comptes |
| **Approbation produits** | Validation/rejet des produits vendeurs |
| **Approbation catégories** | Validation/rejet des catégories proposées |
| **Messages boutiques** | Supervision des communications clients-vendeurs |
| **Toggle marketplace** | Activation/désactivation globale du mode multi-vendeurs |

### Gestion Utilisateurs & Sécurité

| Module | Actions |
|--------|---------|
| **Admins** | Création comptes admin (Super Admin uniquement) |
| **Rôles** | Super Admin / Admin avec permissions granulaires |
| **Permissions** | Par section : produits, commandes, vendeurs, etc. |

---

## 🔐 Architecture Sécurité

```
┌─────────────────────────────────────────────────────┐
│                    RÔLES                            │
├─────────────────────────────────────────────────────┤
│  Super Admin  →  Accès total + gestion admins       │
│  Admin        →  Accès selon permissions assignées  │
│  Vendor       →  Espace vendeur uniquement          │
│  Public       →  Boutique front-end                 │
└─────────────────────────────────────────────────────┘
```

### Mécanismes de sécurité

- **RLS Supabase** : Politiques de sécurité par table
- **Fonctions RPC** : `is_admin()`, `is_vendor()`, `has_role()`
- **Edge Functions** : Création/suppression sécurisée des comptes
- **Accès discret** : Pas de lien public vers `/admin`

---

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **State** | TanStack Query, Context API |
| **Backend actif** | Supabase (Lovable Cloud) |
| **Backend alternatif** | Node.js/Express/MongoDB (dossier `server/`) |
| **Auth** | Supabase Auth + rôles custom |
| **Storage** | Supabase Storage (images, logos) |

---

## 📊 Modèle de Données

### Tables principales

| Table | Description |
|-------|-------------|
| `products` | Catalogue produits avec vendor_id, is_approved |
| `categories` | Catégories hiérarchiques avec show_in_navbar |
| `orders` | Commandes clients avec statuts |
| `order_items` | Détails des commandes |
| `vendors` | Profils vendeurs avec commissions |
| `vendor_messages` | Messages clients vers vendeurs |
| `user_roles` | Rôles admin (super_admin, admin) |
| `vendor_roles` | Rôles vendeurs |
| `admin_permissions` | Permissions par section |
| `coupons` | Codes promotionnels |
| `hero_slides` | Carrousel homepage |
| `site_settings` | Paramètres globaux |

### Relations clés

```
products ──► categories (category_id)
products ──► vendors (vendor_id)
order_items ──► orders (order_id)
order_items ──► products (product_id)
vendor_messages ──► vendors (vendor_id)
vendor_roles ──► vendors (vendor_id)
```

---

## 💰 Configuration Monétaire

- **Devise** : TND (Dinar Tunisien)
- **Format** : `XX.XXX TND`
- **Commissions vendeurs** : Configurable par vendeur (%)

---

## 🚀 Fonctionnalités Avancées

### Mode Multi-Vendeurs

- Activation/désactivation globale
- Création de comptes vendeurs sécurisée (Edge Function)
- Modération des produits et catégories
- Calcul automatique du CA par vendeur

### Personnalisation

- Logo du site modifiable
- Sections homepage activables/désactivables
- Thème personnalisable
- Catégories navbar configurables

---

## 📱 Routes de l'Application

### Routes Publiques

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/products` | Catalogue complet |
| `/products/:id` | Fiche produit |
| `/category/:slug` | Produits par catégorie |
| `/shop/:vendorId` | Boutique vendeur |
| `/cart` | Panier |
| `/checkout` | Validation commande |

### Routes Vendeur (protégées)

| Route | Description |
|-------|-------------|
| `/vendor/login` | Connexion vendeur |
| `/vendor` | Dashboard vendeur |
| `/vendor/products` | Gestion produits |
| `/vendor/categories` | Gestion catégories |
| `/vendor/orders` | Commandes |
| `/vendor/messages` | Messages |

### Routes Admin (protégées)

| Route | Description |
|-------|-------------|
| `/admin/login` | Connexion admin |
| `/admin` | Dashboard admin |
| `/admin/products` | Gestion produits |
| `/admin/categories` | Gestion catégories |
| `/admin/orders` | Gestion commandes |
| `/admin/vendors` | Gestion vendeurs |
| `/admin/product-approvals` | Approbation produits |
| `/admin/category-approvals` | Approbation catégories |
| `/admin/users` | Gestion admins |
| `/admin/settings` | Paramètres |

---

## 📄 Documentation Technique

- **API Backend MERN** : `docs/API_DOCUMENTATION.md`
- **Structure serveur** : `server/README.md`

---

*Document généré le : Février 2026*
*Version : 1.0*
