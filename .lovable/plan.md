
Objectif
- Faire en sorte que lorsque vous tapez /admin dans l’aperçu (preview), vous ne voyiez pas la page de connexion si vous êtes déjà connectée, mais une redirection automatique vers l’admin (ex: /admin/products).

Constat (ce qui explique votre “déconnexion”)
- Dans le code actuel, /admin affiche toujours le composant de login (AdminLogin).
- Les pages protégées (/admin/products, /admin/orders, etc.) sont derrière AdminRoute. Donc:
  - Si vous allez sur /admin/products et que vous êtes connectée, ça marche.
  - Si vous allez sur /admin, vous retombez sur le formulaire de login même si la session existe, ce qui donne l’impression d’être déconnectée.

Solution proposée (sans toucher aux réglages JWT)
1) Rendre /admin “intelligent”
- Ajouter dans AdminLogin une vérification de session au chargement:
  - Installer un écouteur de session (auth state change) puis vérifier la session existante.
  - Si une session existe: rediriger automatiquement vers /admin/products (ou la page demandée si l’utilisateur venait d’être redirigé).
  - Sinon: afficher le formulaire de connexion normalement.

2) Redirection “retour à la page demandée”
- Aujourd’hui, AdminRoute renvoie vers /admin avec state.from (la page qui nécessitait la connexion).
- Améliorer AdminLogin pour, après connexion réussie (ou si session déjà existante), rediriger vers:
  - state.from.pathname si présent (ex: /admin/products),
  - sinon /admin/products par défaut.
- Résultat: si vous tapez directement /admin/products sans être connectée, vous arrivez sur /admin, vous vous connectez, puis vous revenez automatiquement sur /admin/products.

3) UX: éviter l’effet “je vois le formulaire donc je suis déconnectée”
- Ajouter un état “Chargement…” dans AdminLogin pendant la vérification de session.
- Optionnel: un petit texte “Session détectée, redirection…” si session existante (très court).

Fichiers concernés
- src/pages/admin/AdminLogin.tsx
  - Ajouter useEffect, useLocation, et l’abonnement aux changements de session + getSession.
  - Rediriger si session déjà active.
  - Utiliser state.from pour la destination après login.
- (Optionnel, si on préfère une route dédiée)
  - Créer un petit composant “AdminEntry” (ou “AdminGate”) et l’utiliser sur la route /admin à la place de AdminLogin. Mais ce n’est pas obligatoire: on peut tout faire directement dans AdminLogin.

Points d’attention (sécurité / stabilité)
- Ne pas appeler de fonctions backend “en cascade” dans le callback onAuthStateChange; uniquement mettre à jour l’état et naviguer.
- Ne pas réintroduire de lien “admin” public dans le header (on garde l’accès par URL directe comme actuellement).
- On ne change pas la durée JWT via l’interface backend (vous ne la voyez pas, et ce n’est pas nécessaire pour corriger ce comportement).

Plan de test (dans l’aperçu)
1) Se connecter sur /admin avec vos identifiants → vous arrivez sur /admin/products.
2) Dans la barre d’adresse, taper /admin
   - Attendu: redirection automatique vers /admin/products (sans revoir le formulaire).
3) Ouvrir un nouvel onglet sur la même URL preview → taper /admin
   - Attendu: redirection automatique si session toujours présente.
4) Cliquer “Déconnexion” → retourner sur /admin
   - Attendu: formulaire visible (normal).
5) Taper directement /admin/products en étant déconnectée
   - Attendu: redirection vers /admin, login, puis retour automatique à /admin/products.

Résultat attendu
- /admin devient un “point d’entrée” pratique: si vous êtes déjà connectée, vous ne retombez plus sur l’écran de login et vous avez vraiment l’impression de “rester connectée”.
