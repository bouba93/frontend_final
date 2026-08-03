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
| Contenus | CRUD actualités, bourses, Palmarès, matières et documents |
| Support | création de ticket uniquement |
| Chat | liste des conversations et envoi de message |
| Administration | résumé global, CRUD utilisateurs, activation/suspension et journal d'activité |
| Kharandi École | CRUD écoles, classes, élèves, enseignants et affectations |

## Corps et paramètres envoyés

| Endpoint | Entrée frontend |
| --- | --- |
| `POST abacus/sessions/start` | `skill_id`, `mode` |
| `POST abacus/sessions/{id}/answer` | `question_id`, `answer`, `response_time_ms` |
| `POST exercises/start` | `qcm_id` |
| `POST ai/ask` | `message`, `conversation_id` optionnel |
| `POST ai/ask-image` | multipart `image`, `message` |
| `POST payments/checkout/initiate` | `product_code`, `quantity` |
| `POST marketplace/orders/redeem` | `items: [{product_id, quantity}]` |
| `POST chat/conversations/{id}/messages` | `body`, multipart `attachment` optionnel |
| `POST support/tickets` | `category`, `subject`, `message` |
| `PATCH auth/me` | `first_name`, `last_name`, `city`, `niveau` |
| `POST ecole/grades` | `student_id`, `subject_id`, `value`, `trimester` |
| `GET results` | `q`, `exam_type`, `year`, `centre` optionnels |
| `POST results/import/` | multipart `csv_file`, `exam_type`, `year` |

Pour les routes privées, Axios ajoute automatiquement `Authorization: Bearer <access_token>`. Aucun formulaire n'envoie son propre `user_id`.

## Voyage à l'étranger

La liste Xano ne contient aucune route `content/study-abroad`. Les six affiches déjà présentes dans le frontend sont donc conservées localement : Allemagne, Angleterre, Chine, Espagne, Malaisie et Canada. Les images sont chargées depuis leurs liens Google Drive publics.

## Palmarès

Les textes, la méthodologie, les huit dimensions et la fiche d'évaluation restent intégrés au frontend. La liste publique vient de `GET content/school-rankings/` et l'administration utilise les routes de création, modification, publication, archivage et restauration publiées.

## Limites imposées par la liste actuelle

- Kharandi École : écoles, classes, élèves et enseignants sont raccordés. Les absences, paiements scolaires, emplois du temps, badges, annonces et comptabilité attendent encore leurs endpoints.
- Support : aucun endpoint de liste ou de réponse aux tickets n'a été fourni.
- Messagerie : aucun endpoint séparé pour charger les messages ou marquer une conversation comme lue. Le frontend utilise les messages embarqués dans la réponse de `GET chat/conversations`.
- Les plans de paiement restent en lecture seule : aucun CRUD de forfait n'a été publié.
- L'import des résultats accepte uniquement CSV, conformément à la route fournie. Aucun endpoint de statut, publication ou dépublication de lot n'est appelé.
- Les exports PDF/Excel et la gestion vendeur avancée ne sont pas appelés tant que leurs routes ne sont pas créées.

## Variables

Dans Vercel :

```dotenv
VITE_API_URL=https://VOTRE_INSTANCE.xano.io/api:VOTRE_GROUPE_KHARANDI
```

Tous les secrets Nimba, LengoPay et IA restent dans les variables privées de Xano.
