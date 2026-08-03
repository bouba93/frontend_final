# Kharandi — frontend Xano complet

Cette livraison est une copie indépendante du frontend historique. Elle est conçue pour être importée dans un **nouveau projet Vercel** sans modifier l'ancien.

Consultez `README_XANO.md` pour l'installation, les variables d'environnement, les fonctions disponibles et la procédure de déploiement. Les contrats d'API complets sont décrits dans `PROMPT_XANO_KHARANDI_COMPLET.md`.

## Démarrage rapide

```bash
npm install
cp .env.example .env.local
npm run dev
```

Dans `.env.local`, renseignez uniquement l'URL publique de votre groupe API Xano :

```dotenv
VITE_API_URL=https://x8ki-letl-twmt.n7.xano.io/api:kharandi_v1
```

Les secrets Nimba SMS, LengoPay, OpenRouter, Cloudinary et les secrets d'administration restent exclusivement dans Xano.

## Vérification

```bash
npm run lint
npm run build
```

Le frontend couvre notamment l'OTP Nimba, LengoPay, le Wallet et les points côté serveur, Exo Gagnant, Kharandi Abacus AB0 à AB10, Karamö IA, Makiti, Kharandi École, les affiches Voyage à l'étranger, les textes du Palmarès, ainsi que la recherche et l'import des résultats BAC, BEPC général, BEPC franco-arabe et CEE.

Lors de l'inscription, le prénom, le nom, le rôle et les deux consentements sont obligatoires dans l'interface. Le frontend transmet à Xano les champs publiés `phone`, `code`, `password`, `role`, `first_name` et `last_name`. Les rôles envoyés sont `STUDENT`, `PARENT`, `TUTOR` ou `VENDOR`.

La correspondance exacte avec les routes actuellement disponibles se trouve dans `docs/XANO_ROUTES_ACTUELLES.md`.

## Contrats Xano alignés dans la v3.5

Les formulaires envoient les champs réellement publiés : `skill_id/mode` et `question_id/answer/response_time_ms` pour Abacus, `qcm_id` pour les QCM, `message/conversation_id` ou `image/message` pour Karamö, `product_code/quantity` pour LengoPay, `items` pour les échanges Makiti, `category/subject/message` pour le support, `student_id/subject_id/value/trimester` pour les notes et `q/exam_type/year/centre` pour les résultats. La v3.5 raccorde aussi les CRUD administratifs Utilisateurs, Contenus, Matières, Documents et Kharandi École. L'identité utilisateur vient toujours du Bearer token.
