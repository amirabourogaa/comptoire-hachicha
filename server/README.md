# Backend MERN - E-Commerce API

## 🚀 Installation

```bash
cd server
npm install
```

## ⚙️ Configuration

1. Copier le fichier `.env.example` en `.env`
2. Configurer les variables d'environnement :

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=votre_secret_jwt_ici
NODE_ENV=development
```

## 🏃 Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 📚 API Endpoints

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Liste tous les produits | Non |
| GET | `/api/products/:id` | Détails d'un produit | Non |
| POST | `/api/products` | Créer un produit | Admin |
| PUT | `/api/products/:id` | Modifier un produit | Admin |
| DELETE | `/api/products/:id` | Supprimer un produit | Admin |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Liste toutes les catégories | Non |
| GET | `/api/categories/:id` | Détails d'une catégorie | Non |
| GET | `/api/categories/slug/:slug` | Catégorie par slug | Non |
| POST | `/api/categories` | Créer une catégorie | Admin |
| PUT | `/api/categories/:id` | Modifier une catégorie | Admin |
| DELETE | `/api/categories/:id` | Supprimer une catégorie | Admin |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | Liste toutes les commandes | Admin |
| GET | `/api/orders/:id` | Détails d'une commande | Non |
| POST | `/api/orders` | Créer une commande | Non |
| PATCH | `/api/orders/:id` | Modifier le statut | Admin |
| DELETE | `/api/orders/:id` | Supprimer une commande | Admin |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/login` | Connexion | Non |
| GET | `/api/users` | Liste les utilisateurs | Super Admin |
| POST | `/api/users` | Créer un utilisateur | Super Admin |
| PUT | `/api/users/:id` | Modifier un utilisateur | Super Admin |
| DELETE | `/api/users/:id` | Supprimer un utilisateur | Super Admin |

### Coupons
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/coupons/validate` | Valider un coupon | Non |
| GET | `/api/coupons` | Liste tous les coupons | Admin |
| POST | `/api/coupons` | Créer un coupon | Admin |
| PUT | `/api/coupons/:id` | Modifier un coupon | Admin |
| DELETE | `/api/coupons/:id` | Supprimer un coupon | Admin |

## 🔐 Authentification

L'API utilise JWT pour l'authentification. Incluez le token dans le header :

```
Authorization: Bearer <votre_token>
```

## 📁 Structure MVC

```
server/
├── controllers/     # Logique métier
├── models/          # Schémas Mongoose
├── routes/          # Routes Express
├── middleware/      # Middleware (auth, etc.)
├── server.js        # Point d'entrée
└── package.json
```

## 🌐 Déploiement

Recommandé : [Render](https://render.com), [Railway](https://railway.app), ou [Heroku](https://heroku.com)
