# 📚 Documentation API - Backend MERN

## 🔧 Configuration

### Variables d'environnement Frontend
Ajoutez dans votre fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:5000
```

Pour la production, remplacez par l'URL de votre serveur déployé :
```env
VITE_API_URL=https://votre-api.render.com
```

---

## 📡 Liste complète des APIs

### 🛍️ Products API

| Méthode | Endpoint | Description | Auth | Service Frontend |
|---------|----------|-------------|------|------------------|
| `GET` | `/api/products` | Liste tous les produits | ❌ | `productService.getAll()` |
| `GET` | `/api/products/:id` | Détails d'un produit | ❌ | `productService.getById(id)` |
| `POST` | `/api/products` | Créer un produit | ✅ Admin | `productService.create(product, token)` |
| `PUT` | `/api/products/:id` | Modifier un produit | ✅ Admin | `productService.update(id, product, token)` |
| `DELETE` | `/api/products/:id` | Supprimer un produit | ✅ Admin | `productService.delete(id, token)` |

**Exemple d'utilisation :**
```typescript
import { productService } from '@/services/api';

// Récupérer tous les produits
const products = await productService.getAll();

// Récupérer un produit
const product = await productService.getById('64f1a2b3c4d5e6f7g8h9i0j1');

// Créer un produit (admin)
const newProduct = await productService.create({
  title: 'Nouveau Produit',
  price: 99.99,
  description: 'Description du produit',
  category: 'categoryId',
  isActive: true
}, token);

// Modifier un produit (admin)
const updated = await productService.update('productId', {
  price: 79.99,
  promoPrice: 59.99
}, token);

// Supprimer un produit (admin)
await productService.delete('productId', token);
```

---

### 📂 Categories API

| Méthode | Endpoint | Description | Auth | Service Frontend |
|---------|----------|-------------|------|------------------|
| `GET` | `/api/categories` | Liste toutes les catégories | ❌ | `categoryService.getAll()` |
| `GET` | `/api/categories/:id` | Détails d'une catégorie | ❌ | `categoryService.getById(id)` |
| `GET` | `/api/categories/slug/:slug` | Catégorie par slug | ❌ | `categoryService.getBySlug(slug)` |
| `POST` | `/api/categories` | Créer une catégorie | ✅ Admin | `categoryService.create(category, token)` |
| `PUT` | `/api/categories/:id` | Modifier une catégorie | ✅ Admin | `categoryService.update(id, category, token)` |
| `DELETE` | `/api/categories/:id` | Supprimer une catégorie | ✅ Admin | `categoryService.delete(id, token)` |

**Exemple d'utilisation :**
```typescript
import { categoryService } from '@/services/api';

// Récupérer toutes les catégories
const categories = await categoryService.getAll();

// Récupérer par slug
const category = await categoryService.getBySlug('vetements-homme');

// Créer une catégorie (admin)
const newCategory = await categoryService.create({
  name: 'Nouvelle Catégorie',
  slug: 'nouvelle-categorie'
}, token);
```

---

### 📦 Orders API

| Méthode | Endpoint | Description | Auth | Service Frontend |
|---------|----------|-------------|------|------------------|
| `GET` | `/api/orders` | Liste toutes les commandes | ✅ Admin | `orderService.getAll(token)` |
| `GET` | `/api/orders/:id` | Détails d'une commande | ❌ | `orderService.getById(id)` |
| `POST` | `/api/orders` | Créer une commande | ❌ | `orderService.create(order)` |
| `PATCH` | `/api/orders/:id` | Modifier le statut | ✅ Admin | `orderService.updateStatus(id, status, token)` |
| `DELETE` | `/api/orders/:id` | Supprimer une commande | ✅ Admin | `orderService.delete(id, token)` |

**Statuts disponibles :** `pending`, `paid`, `shipped`, `delivered`, `returned`, `cancelled`

**Exemple d'utilisation :**
```typescript
import { orderService } from '@/services/api';

// Créer une commande (client)
const order = await orderService.create({
  customerName: 'Jean Dupont',
  customerEmail: 'jean@email.com',
  customerPhone: '+33123456789',
  customerAddress: '123 Rue Example, Paris',
  items: [
    {
      product: 'productId',
      productTitle: 'T-Shirt',
      productPrice: 29.99,
      quantity: 2
    }
  ],
  totalAmount: 59.98,
  couponCode: 'PROMO10',
  discountAmount: 5.99
});

// Récupérer toutes les commandes (admin)
const orders = await orderService.getAll(token);

// Modifier le statut (admin)
await orderService.updateStatus('orderId', 'shipped', token);
```

---

### 👤 Users / Auth API

| Méthode | Endpoint | Description | Auth | Service Frontend |
|---------|----------|-------------|------|------------------|
| `POST` | `/api/users/login` | Connexion | ❌ | `authService.login(email, password)` |
| `GET` | `/api/users` | Liste les utilisateurs | ✅ Super Admin | `authService.getAll(token)` |
| `POST` | `/api/users` | Créer un utilisateur | ✅ Super Admin | `authService.create(userData, token)` |
| `PUT` | `/api/users/:id` | Modifier un utilisateur | ✅ Super Admin | `authService.update(id, userData, token)` |
| `DELETE` | `/api/users/:id` | Supprimer un utilisateur | ✅ Super Admin | `authService.delete(id, token)` |

**Rôles disponibles :** `admin`, `super_admin`

**Exemple d'utilisation :**
```typescript
import { authService } from '@/services/api';

// Connexion
const { token, user } = await authService.login('admin@example.com', 'password123');

// Sauvegarder le token
authService.saveToken(token);

// Récupérer le token
const savedToken = authService.getToken();

// Déconnexion
authService.logout();

// Créer un utilisateur (super_admin)
const newUser = await authService.create({
  email: 'nouvel.admin@email.com',
  password: 'securePassword123',
  role: 'admin'
}, token);
```

---

### 🎟️ Coupons API

| Méthode | Endpoint | Description | Auth | Service Frontend |
|---------|----------|-------------|------|------------------|
| `POST` | `/api/coupons/validate` | Valider un coupon | ❌ | `couponService.validate(code, cartTotal)` |
| `GET` | `/api/coupons` | Liste tous les coupons | ✅ Admin | `couponService.getAll(token)` |
| `GET` | `/api/coupons/:id` | Détails d'un coupon | ✅ Admin | `couponService.getById(id, token)` |
| `POST` | `/api/coupons` | Créer un coupon | ✅ Admin | `couponService.create(coupon, token)` |
| `PUT` | `/api/coupons/:id` | Modifier un coupon | ✅ Admin | `couponService.update(id, coupon, token)` |
| `DELETE` | `/api/coupons/:id` | Supprimer un coupon | ✅ Admin | `couponService.delete(id, token)` |

**Types de réduction :** `percentage`, `fixed`

**Exemple d'utilisation :**
```typescript
import { couponService } from '@/services/api';

// Valider un coupon (client)
const result = await couponService.validate('PROMO20', 150.00);
if (result.valid) {
  console.log('Réduction:', result.coupon.discountValue);
}

// Créer un coupon (admin)
const coupon = await couponService.create({
  code: 'SUMMER2024',
  description: 'Réduction été',
  discountType: 'percentage',
  discountValue: 15,
  minimumAmount: 50,
  maximumUses: 100,
  startDate: '2024-06-01',
  endDate: '2024-08-31',
  isActive: true
}, token);
```

---

### 🏥 Health Check API

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/health` | Vérifier l'état du serveur | ❌ |

**Exemple :**
```typescript
import { API_ENDPOINTS } from '@/config/api';

const response = await fetch(API_ENDPOINTS.health);
const { status, message } = await response.json();
// { status: 'OK', message: 'API is running' }
```

---

## 🔐 Authentification

Toutes les requêtes protégées nécessitent un token JWT dans le header :

```
Authorization: Bearer <votre_token>
```

Le service `authService` gère automatiquement le stockage du token :

```typescript
import { authService } from '@/services/api';

// Après connexion
const { token } = await authService.login(email, password);
authService.saveToken(token);

// Pour les requêtes protégées
const token = authService.getToken();
await productService.create(product, token);
```

---

## 📁 Structure des fichiers

```
src/
├── config/
│   └── api.ts                 # Configuration URL et endpoints
│
└── services/
    └── api/
        ├── index.ts           # Export central
        ├── productService.ts  # Service produits
        ├── categoryService.ts # Service catégories
        ├── orderService.ts    # Service commandes
        ├── authService.ts     # Service authentification
        └── couponService.ts   # Service coupons
```

---

## 🔄 Import centralisé

```typescript
// Import de tous les services
import { 
  productService, 
  categoryService, 
  orderService, 
  authService, 
  couponService 
} from '@/services/api';

// Import des types
import type { 
  Product, 
  Category, 
  Order, 
  User, 
  Coupon 
} from '@/services/api';

// Import de la configuration
import { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  getAuthHeaders 
} from '@/services/api';
```

---

## 📝 Types TypeScript

### Product
```typescript
interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  promoPrice?: number;
  imageUrl?: string;
  images?: string[];
  category?: string;
  sizes?: Array<{ size: string; stock: number }>;
  colors?: Array<{ colorName: string; colorCode: string; imageUrl: string }>;
  isActive: boolean;
  isFlashSale: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Category
```typescript
interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  createdAt: string;
}
```

### Order
```typescript
interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  product: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
}
```

### User
```typescript
interface User {
  _id: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}
```

### Coupon
```typescript
interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  maximumUses?: number;
  currentUses: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## ⚡ Exemple d'intégration React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, authService } from '@/services/api';

// Hook pour récupérer les produits
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
  });
}

// Hook pour créer un produit
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const token = authService.getToken();

  return useMutation({
    mutationFn: (product: Partial<Product>) => 
      productService.create(product, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

---

## 🚀 Déploiement Backend

1. **Render.com** (recommandé)
   - Connectez votre repo GitHub
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

2. **Railway.app**
   - Importez depuis GitHub
   - Configurez les variables d'environnement

3. **Variables d'environnement requises :**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
   JWT_SECRET=votre_secret_jwt_tres_long_et_securise
   NODE_ENV=production
   ```

---

## 📌 Notes importantes

- Tous les IDs MongoDB sont des strings de 24 caractères
- Les dates sont retournées au format ISO 8601
- Les erreurs retournent un objet `{ message: string }`
- Le token JWT expire selon la configuration du serveur (par défaut 30 jours)
