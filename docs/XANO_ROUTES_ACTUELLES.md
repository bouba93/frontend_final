# Correspondance du frontend avec les routes Xano actuelles

Ce document décrit la version réellement raccordée. `VITE_API_URL` doit être l'URL de base du groupe API **Kharandi**.

## Modules opérationnels avec les routes fournies

| Module | Routes utilisées |
| --- | --- |
| Abacus | `GET abacus/levels`, `GET abacus/levels/{id}/skills`, démarrage, réponse et fin de session |
| Karamö | `POST ai/ask`, `POST ai/ask-image` |
| Authentification | OTP, login intelligent, login mot de passe, vérification, inscription, réinitialisation, profil et déconnexion |
| Wallet | `GET auth/wallet/`; aucune modification de points côté navigateur |
| Exercices | `POST exercises/start`, `POST exercises/{attempt_id}/submit` |
| Bibliothèque | documents, détail, matières et progression de lecture |
| Makiti | liste des produits et `POST marketplace/orders/redeem` |
| Paiement | plans, `payments/checkout/initiate`, statut par référence ; le webhook LengoPay reste serveur-à-serveur |
| Résultats | recherche `GET results/` et import administrateur CSV `POST results/import/` |
| Contenus | actualités, bourses, Palmarès et notifications en lecture |
| Support | création de ticket uniquement |
| Chat | liste des conversations et envoi de message |
| Administration | résumé global et liste des utilisateurs en lecture |

## Voyage à l'étranger

La liste Xano ne contient aucune route `content/study-abroad`. Les six affiches déjà présentes dans le frontend sont donc conservées localement : Allemagne, Angleterre, Chine, Espagne, Malaisie et Canada. Les images sont chargées depuis leurs liens Google Drive publics.

## Palmarès

Les textes, la méthodologie, les huit dimensions et la fiche d'évaluation sont intégrés au frontend. La liste des écoles vient exclusivement de `GET content/school-rankings/`. Les routes de création, modification et suppression n'ayant pas été fournies, cette rubrique est en lecture seule.

## Limites imposées par la liste actuelle

- Kharandi École : disponibles actuellement — connexion administrateur, écoles, détail d'une école, élèves d'une école, classes et création de notes. Les absences, paiements scolaires, enseignants, emplois du temps, badges, annonces et comptabilité attendent encore leurs endpoints.
- Support : aucun endpoint de liste ou de réponse aux tickets n'a été fourni.
- Messagerie : aucun endpoint séparé pour charger les messages ou marquer une conversation comme lue. Le frontend utilise les messages embarqués dans la réponse de `GET chat/conversations`.
- Actualités, bourses, Palmarès, utilisateurs, plans et documents sont en lecture seule depuis l'administration.
- L'import des résultats accepte uniquement CSV, conformément à la route fournie. Aucun endpoint de statut, publication ou dépublication de lot n'est appelé.
- Les exports PDF/Excel et la gestion vendeur avancée ne sont pas appelés tant que leurs routes ne sont pas créées.

## Variables

Dans Vercel :

```dotenv
VITE_API_URL=https://VOTRE_INSTANCE.xano.io/api:VOTRE_GROUPE_KHARANDI
```

Tous les secrets Nimba, LengoPay et IA restent dans les variables privées de Xano.
