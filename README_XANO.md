# Kharandi — frontend raccordé aux routes Xano actuelles

Cette archive est une copie indépendante du frontend historique. Elle conserve les affiches **Études à l'étranger**, les textes complets du **Palmarès**, les résultats nationaux et les autres rubriques Kharandi.

## Installation

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variable obligatoire :

```dotenv
VITE_API_URL=https://xxxxx.n7.xano.io/api:Kharandi
```

`VITE_STRICT_XANO_ROUTES` est optionnelle et active par défaut. Elle empêche le frontend d'appeler les anciennes routes Django/Firebase qui ne figurent pas dans la liste Xano fournie.

## Fonctionnalités raccordées

- authentification, OTP Nimba, mot de passe, profil, déconnexion et appareils de confiance ;
- Wallet serveur et historique des points ;
- Kharandi Abacus : niveaux, compétences et sessions ;
- Karamö texte et analyse d'image ;
- Exo Gagnant avec validation serveur ;
- bibliothèque, matières et progression de lecture ;
- Makiti : produits et échange sécurisé par points ;
- plans, initiation LengoPay et vérification serveur des transactions ;
- résultats BAC, BEPC général, BEPC franco-arabe et CEE ;
- import administrateur CSV des résultats ;
- actualités, bourses, Palmarès, notifications, recherche et création de tickets ;
- messagerie Xano ;
- fonctions Kharandi École disponibles dans le backend actuel.

Les six affiches **Allemagne, Angleterre, Chine, Espagne, Malaisie et Canada** restent intégrées comme contenu local avec leurs liens Google Drive. Aucune route `content/study-abroad` n'est appelée.

Les fonctions dont aucune route n'a été fournie restent visibles en lecture seule ou affichent un message clair. Consultez `docs/XANO_ROUTES_ACTUELLES.md` pour le détail exact.

## Sécurité

Les secrets Nimba, LengoPay, OpenRouter, Cloudinary et les secrets de webhooks restent exclusivement dans Xano. Le frontend ne crédite jamais lui-même le Wallet et ne confirme jamais un paiement à partir du simple retour du navigateur.

## Vérification et déploiement

```bash
npm run lint
npm run build
```

Créez d'abord un nouveau projet Vercel, ajoutez `VITE_API_URL`, puis testez son URL `*.vercel.app`. Déplacez ensuite le domaine de l'ancien projet vers le nouveau uniquement après validation. Ne supprimez pas l'ancien projet avant le déplacement du domaine.
