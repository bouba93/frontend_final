# Prompt maître Xano — backend complet de Kharandi

> **Important :** ce prompt décrit la cible backend complète à construire progressivement. Le frontend livré utilise immédiatement et strictement les endpoints déjà disponibles, documentés dans `docs/XANO_ROUTES_ACTUELLES.md`. Les routes supplémentaires de ce prompt ne doivent être considérées comme actives qu'après leur création et leurs tests dans Xano.

## Mode d'emploi

Copie le bloc « PROMPT À COLLER DANS XANO » dans Xano AI Assistant. Ce prompt est volontairement organisé en phases. Si Xano ne peut pas tout créer en une seule exécution, demande-lui d'exécuter la phase 0 puis les phases suivantes une par une, sans modifier les noms de tables, les routes ni les contrats déjà créés.

Avant de commencer, crée deux branches/environnements Xano : `development` et `production`. Réalise d'abord toute l'intégration dans `development` avec les identifiants de test.

Références fournisseur à contrôler au moment du branchement réel : [documentation officielle Nimba SMS](https://developers.nimbasms.com/) et documentation API accessible depuis le compte marchand [LengoPay](https://www.lengopay.com/). Les paramètres du compte marchand priment sur tout exemple de ce document.

---

## PROMPT À COLLER DANS XANO

Tu es l'architecte backend principal de **Kharandi**, une plateforme éducative guinéenne. Construis dans Xano le backend complet de production décrit ci-dessous. Il doit remplacer progressivement le backend Django actuel et rester compatible avec le frontend React/Vite existant.

Ne crée pas une simple démo et ne remplace aucune fonctionnalité par des données statiques. Crée les tables, relations, index, fonctions réutilisables, tâches planifiées, canaux Realtime, API, validations, règles d'accès, journalisation et tests. Si une capacité n'est pas disponible dans mon plan Xano, indique précisément la limitation et crée la meilleure implémentation de repli, sans prétendre que la fonctionnalité existe.

Travaille par phases. À la fin de chaque phase :

1. affiche les tables, fonctions et endpoints réellement créés ;
2. liste les variables d'environnement encore manquantes ;
3. lance les tests de la phase ;
4. corrige tous les tests rouges avant de continuer ;
5. donne un court compte rendu et attends ma commande `CONTINUER PHASE N` si la limite de contexte ou d'exécution est atteinte.

Ne renomme jamais une route, une table ou un enum après qu'une phase suivante en dépend. Toute modification doit être additive et rétrocompatible.

---

# 1. Objectif produit

Kharandi rassemble les fonctionnalités suivantes :

- inscription et connexion par téléphone, OTP Nimba SMS, mot de passe et appareil de confiance ;
- profils `STUDENT`, `TUTOR`, `PARENT`, `VENDOR`, `ADMIN`, plus les identités `SCHOOL_ADMIN` et `SCHOOL_TEACHER` ;
- bibliothèque de livres, cours, exercices, corrigés et vidéos ;
- suivi de lecture ;
- moteur de recherche global ;
- assistant pédagogique **Karamö IA** : conversation texte, analyse d'image et génération de QCM ;
- gamification, wallet de points et « Exo Gagnant » ;
- **Kharandi Abacus** : apprentissage progressif du boulier, calcul mental, Flash Anzan, défis chronométrés, progression, classements et suivi enseignant ;
- annuaire et annonces de répétiteurs ;
- Kharandi École : écoles, classes, élèves, parents, enseignants, notes, bulletins, badges, emplois du temps, devoirs, annonces, absences, paiements scolaires et comptabilité ;
- résultats nationaux CEE, BEPC et BAC ;
- bourses, études à l'étranger, palmarès d'écoles et actualités ;
- Kharandi Makiti : vendeurs, produits, variantes, promotions, commandes et achat avec points ;
- messagerie privée en temps réel ;
- abonnements et paiements LengoPay ;
- notifications internes et SMS Nimba ;
- support par tickets ;
- administration complète et exports PDF/Excel/CSV.

Devise principale : `GNF`. Pays principal : `GN`. Langue principale : français. Fuseau horaire : `Africa/Conakry`. Stocker toutes les dates en UTC et les afficher dans le fuseau de Conakry côté client.

---

# 2. Architecture Xano obligatoire

Crée un workspace/backend Xano nommé `Kharandi` et un groupe API versionné nommé `kharandi_v1`.

Le frontend utilise une seule variable `VITE_API_URL`, égale à l'URL de base du groupe API Xano. Toutes les routes ci-dessous doivent donc être exposées comme suffixes exacts de ce groupe, par exemple :

```text
VITE_API_URL=https://...xano.io/api:XXXXXXXX
POST {VITE_API_URL}/auth/otp/send/
GET  {VITE_API_URL}/learning/documents/
```

Accepte les routes avec ou sans slash final si Xano le permet. Sinon, crée exactement les routes avec slash final, car le frontend actuel les utilise ainsi.

Utilise :

- l'authentification native Xano pour générer les jetons d'accès ;
- un middleware/fonction `require_auth` pour les routes privées ;
- un middleware `require_role(roles[])` ;
- un middleware `require_active_user` ;
- un middleware `require_premium_or_quota(feature)` ;
- des fonctions réutilisables pour normaliser les téléphones, répondre au format standard, journaliser les audits, envoyer les SMS, créer les notifications et vérifier les droits multi-tenant des écoles ;
- Xano Realtime pour la messagerie et les notifications si disponible ;
- des tâches d'arrière-plan pour les relances, expirations et réconciliations de paiements ;
- des transactions de base de données ou opérations atomiques pour les paiements, stocks, points et récompenses.

Ne mets jamais un secret, un prix, un rôle privilégié, un montant de transaction ou une règle d'autorisation dans le frontend.

---

# 3. Variables d'environnement

Crée les variables d'environnement suivantes. Ne journalise jamais leur valeur.

## Xano et application

```text
APP_ENV=development
APP_NAME=Kharandi
APP_TIMEZONE=Africa/Conakry
APP_FRONTEND_URL=<valeur actuelle de FRONTEND_URL>
XANO_PUBLIC_API_BASE_URL=<URL publique du groupe kharandi_v1>
AUTH_ACCESS_TTL_MINUTES=60
AUTH_REFRESH_TTL_DAYS=30
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_SENDS_PER_PHONE_PER_HOUR=5
OTP_MAX_SENDS_PER_IP_PER_HOUR=20
KARAMO_FREE_DAILY_LIMIT=5
POINT_GNF_VALUE=100
```

## Nimba SMS

```text
NIMBA_ACCOUNT_SID=<valeur actuelle ; correspond au Service ID Nimba>
NIMBA_AUTH_TOKEN=<valeur actuelle ; correspond au Secret Token Nimba>
NIMBA_SENDER_NAME=Kharandi
NIMBA_API_BASE_URL=https://api.nimbasms.com/v1
NIMBA_WEBHOOK_SECRET=<si disponible dans le compte Nimba>
```

## LengoPay

```text
LENGOPAY_SITE_ID=<valeur actuelle de LENGOPAY_SITE_ID>
LENGOPAY_LICENSE_KEY=<secret>
LENGOPAY_API_BASE_URL=https://portal.lengopay.com/api/v1
LENGOPAY_CREATE_PAYMENT_PATH=/payments
LENGOPAY_STATUS_PATH=/transaction/status
LENGOPAY_CURRENCY=GNF
LENGOPAY_COUNTRY=GN
LENGOPAY_WEBHOOK_SECRET=<uniquement si LengoPay fournit officiellement une signature>
LENGOPAY_CALLBACK_TOKEN=<secret aléatoire temporaire pour le pilote>
LENGOPAY_RETURN_URL=<APP_FRONTEND_URL>/payment/success
```

Avant d'implémenter les appels LengoPay, compare les URLs, headers, champs, statuts et mécanismes de signature avec la documentation fournie dans mon compte marchand LengoPay. Les chemins ci-dessus doivent rester configurables, car l'API du fournisseur peut évoluer.

## IA et recherche externe

```text
OPENROUTER_API_KEY=<secret>
OPENROUTER_MODEL=<modèle texte/vision autorisé, par exemple Qwen compatible vision>
OPENROUTER_API_BASE_URL=https://openrouter.ai/api/v1
TAVILY_API_KEY=<optionnel>
AI_MAX_IMAGE_MB=8
AI_REQUEST_TIMEOUT_SECONDS=60
```

Si un service Cloudflare est utilisé pour l'IA ou le stockage, ajouter ses identifiants uniquement sous forme de variables d'environnement.

## Stockage Cloudinary et opérations internes

Le backend Django actuel utilise déjà Cloudinary. Conserver cette intégration dans Xano uniquement si les fichiers existants doivent continuer à être servis depuis Cloudinary ; sinon utiliser le stockage natif Xano et planifier une migration contrôlée.

```text
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=<secret existant>
CLOUDINARY_API_KEY=<secret existant>
CLOUDINARY_API_SECRET=<secret existant>
CRON_SECRET=<secret existant, à faire tourner avant production>
```

Créer `storage_upload`, `storage_delete` et `storage_signed_url` comme fonctions d'abstraction. Le reste du backend ne doit pas dépendre directement de Cloudinary : il appelle uniquement ces fonctions, afin de pouvoir changer de fournisseur plus tard.

## Correspondance avec le `.env` Django existant

Importer les valeurs du `.env` actuel dans les variables Xano **sans jamais les copier dans une table, un prompt, un log ou une réponse API**.

| Variable actuelle | Traitement dans Xano |
|---|---|
| `FRONTEND_URL` | valeur de `APP_FRONTEND_URL` |
| `NIMBA_ACCOUNT_SID` | conserver ; c'est le Service ID Nimba |
| `NIMBA_AUTH_TOKEN` | conserver ; c'est le Secret Token Nimba |
| `NIMBA_SENDER_NAME` | conserver le même nom et la même valeur |
| `LENGOPAY_SITE_ID` | conserver comme `LENGOPAY_SITE_ID` |
| `LENGOPAY_LICENSE_KEY` | conserver comme secret Xano |
| `LENGOPAY_CURRENCY`, `LENGOPAY_COUNTRY` | conserver |
| `OPENROUTER_API_KEY`, `TAVILY_API_KEY` | conserver comme secrets Xano |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | conserver seulement si Cloudinary reste actif |
| `CRON_SECRET` | conserver, puis le régénérer avant la production |
| `DEBUG` | remplacer par `APP_ENV=development` ou `production` |
| `CORS_ALLOWED_ORIGINS` | configurer dans la liste CORS du groupe API Xano |
| `CORS_ALLOW_ALL_ORIGINS` | ne jamais activer en production |
| `ALLOWED_HOSTS` | non requis dans Xano |
| `DATABASE_URL` | non requis : utiliser la base Xano |
| `REDIS_URL` | non requis : utiliser Tasks, cache et Realtime Xano |
| `SECRET_KEY` | non requis : l'authentification et les secrets sont gérés par Xano |
| `ADMIN_PHONE`, `ADMIN_PASSWORD` | ne pas importer ; créer le premier ADMIN manuellement puis utiliser un mot de passe neuf |

Les branches Xano d'un même workspace peuvent partager les variables d'environnement. Pour un véritable isolement, utiliser deux workspaces : `Kharandi Development` avec des clés de test et `Kharandi Production` avec des clés différentes. Ne jamais utiliser les identifiants de production Nimba/LengoPay dans les tests automatisés.

---

# 4. Contrat de réponse compatible avec le frontend

Toutes les routes applicatives doivent utiliser le même contrat.

Succès simple :

```json
{
  "success": true,
  "message": "Opération réussie.",
  "data": {}
}
```

Liste :

```json
{
  "success": true,
  "message": "Liste chargée.",
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "count": 0,
    "total_pages": 0,
    "next": null,
    "previous": null
  }
}
```

Erreur :

```json
{
  "success": false,
  "message": "Message compréhensible en français.",
  "code": "machine_readable_code",
  "errors": {}
}
```

Utilise les statuts HTTP corrects : `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `502`, `503`.

Les réponses d'authentification doivent contenir :

```json
{
  "success": true,
  "message": "Connexion réussie.",
  "data": {
    "tokens": {
      "access": "<jeton Xano>",
      "refresh": "<jeton opaque>"
    },
    "authToken": "<même jeton d'accès, alias Xano>",
    "device_token": "<jeton appareil opaque>",
    "user": {}
  }
}
```

La route `/auth/token/refresh/` doit aussi retourner, à la racine pour l'intercepteur Axios existant :

```json
{
  "access": "<nouveau jeton>",
  "refresh": "<nouveau refresh rotatif>"
}
```

Ne renvoie jamais le hash d'un mot de passe, d'un OTP, d'un refresh token ou d'un device token.

---

# 5. Modèle de données

Tous les identifiants sont des IDs Xano. Ajoute `created_at` et `updated_at` à toutes les tables métier. Ajoute `deleted_at` pour les entités nécessitant une suppression logique. Ajoute les index indiqués et des contraintes d'unicité dès que Xano les supporte.

## 5.1 Identité, sécurité et profils

### `user` — table d'authentification Xano

- `phone_e164` texte, obligatoire, unique, indexé ;
- champ d'authentification/mot de passe natif Xano ;
- `role` enum : `STUDENT`, `TUTOR`, `PARENT`, `VENDOR`, `ADMIN`, `SCHOOL_ADMIN`, `SCHOOL_TEACHER` ;
- `is_active` booléen, défaut `true` ;
- `phone_verified_at` datetime nullable ;
- `last_login_at` datetime nullable ;
- `last_login_ip_hash` texte nullable ;
- `onboarding_completed` booléen, défaut `false` ;
- `terms_accepted_at` datetime nullable ;
- `privacy_accepted_at` datetime nullable.

### `user_profile`

- relation unique `user_id` ;
- `first_name`, `last_name`, `display_name`, `avatar`, `birth_date`, `city`, `zone`, `bio` ;
- `school_level`, `niveau`, `serie` ;
- `parent_phone_e164` ;
- informations répétiteur : `tutor_status` (`PENDING`, `APPROVED`, `REJECTED`), `subjects` JSON, `levels` JSON, `hourly_price`, `years_experience` ;
- informations vendeur : `shop_name`, `shop_description`, `shop_logo`, `seller_status` ;
- `kyc_document`, `kyc_status` (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`) ;
- `points_balance` entier, défaut `0`, jamais négatif ;
- `preferred_language`, défaut `fr`.

### `otp_challenge`

- `phone_e164`, `purpose` (`LOGIN`, `REGISTER`, `PASSWORD_RESET`, `VERIFY_PHONE`, `SCHOOL_ACTIVATION`) ;
- `code_hash`, jamais le code brut ;
- `expires_at`, `attempts`, `max_attempts`, `verified_at`, `consumed_at` ;
- `send_count`, `provider_message_id`, `provider_status` ;
- `request_ip_hash`, `user_agent_hash` ;
- index composé sur `phone_e164 + purpose + created_at`.

### `auth_refresh_token`

- `user_id`, `token_hash`, `device_id`, `expires_at`, `last_used_at`, `revoked_at`, `replaced_by_id` ;
- token brut généré aléatoirement avec forte entropie, retourné une seule fois ;
- rotation à chaque usage et détection de réutilisation.

### `trusted_device`

- `user_id`, `device_token_hash`, `device_name`, `user_agent_hash`, `first_ip_hash`, `last_ip_hash` ;
- `trusted_until`, `last_used_at`, `revoked_at` ;
- maximum 10 appareils actifs par utilisateur.

### `audit_log`

- `actor_user_id` nullable, `actor_role`, `action`, `entity_type`, `entity_id` ;
- `school_id` nullable, `before_json`, `after_json`, `request_id`, `ip_hash`, `user_agent_hash` ;
- aucune clé secrète ni mot de passe dans les JSON.

### `idempotency_record`

- `scope`, `key`, `user_id` nullable, `request_hash`, `response_status`, `response_json`, `expires_at` ;
- unicité `scope + key`.

## 5.2 Abonnements, wallet et paiements

### `plan`

- `code` unique, `name`, `description`, `period` (`FREE`, `MONTHLY`, `SEMESTER`, `ANNUAL`, `ONE_TIME`) ;
- `price_gnf`, `features` JSON, `target_roles` JSON, `is_active`, `sort_order`.

### `catalog_product`

- `code` unique, `name`, `description`, `unit_price_gnf`, `billing_period`, `minimum_quantity`, `target_role`, `is_option`, `parent_product_codes` JSON, `is_active` ;
- prix créés par seed dans la section « catalogue tarifaire ».

### `subscription`

- `user_id`, `school_id` nullable, `plan_id` nullable, `product_code` ;
- `status` (`PENDING`, `ACTIVE`, `PAST_DUE`, `CANCELLED`, `EXPIRED`) ;
- `starts_at`, `ends_at`, `quantity`, `options_json`, `auto_renew` ;
- `source_transaction_id`, `cancelled_at` ;
- une seule souscription active par produit et bénéficiaire.

### `payment_transaction`

- `reference` unique et imprévisible ;
- `provider` défaut `LENGOPAY` ;
- `provider_pay_id` unique nullable ;
- `user_id`, `school_id`, `order_id`, `subscription_id` nullable ;
- `purpose` (`SUBSCRIPTION`, `CATALOG`, `ORDER`, `SCHOOL_FEE`, `OTHER`) ;
- `amount_gnf`, `currency` défaut `GNF`, `status` (`PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `EXPIRED`, `REFUNDED`) ;
- `payment_url`, `provider_status_raw`, `provider_response_json`, `verified_at`, `fulfilled_at`, `failure_reason` ;
- `idempotency_key`, `expires_at` ;
- index sur `reference`, `provider_pay_id`, `user_id + created_at`, `status + created_at`.

### `webhook_event`

- `provider`, `event_key` unique, `signature_valid` nullable, `payload_hash`, `payload_json` ;
- `received_at`, `processed_at`, `processing_status`, `error_message`, `attempt_count`.

### `point_transaction`

- `user_id`, `type` (`EARN`, `SPEND`, `ADJUSTMENT`, `REFUND`) ;
- `amount_points` signé, `balance_before`, `balance_after` ;
- `reason`, `source_type`, `source_id`, `idempotency_key` unique nullable ;
- toutes les modifications de points doivent passer par une fonction atomique `wallet_apply_transaction`.

## 5.3 Apprentissage et IA

### `subject`

- `name`, `slug` unique, `icon`, `color`, `is_active`, `sort_order`.

### `learning_document`

- `title`, `slug`, `description`, `document_type` (`BOOK`, `COURSE`, `EXERCISE`, `CORRECTION`, `VIDEO`) ;
- `subject_id`, `level`, `serie`, `author`, `publisher` ;
- `file`, `external_url`, `thumbnail`, `mime_type`, `file_size_bytes` ;
- `is_free`, `price_gnf`, `requires_premium`, `certification`, `content_text` ;
- `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `published_at`, `download_count`, `view_count` ;
- recherche plein texte sur titre, description, auteur et contenu.

### `reading_progress`

- unicité `user_id + document_id` ;
- `progress_percent` entre 0 et 100, `is_read`, `last_position`, `last_read_at`.

### `knowledge_entry`

- `category` (`GEOGRAPHY`, `HISTORY`, `CULTURE`, `EDUCATION`, `ECONOMY`, `ENVIRONMENT`, `INSTITUTIONS`) ;
- `title`, `content`, `keywords` JSON, `source_url`, `is_verified`, `priority`, `is_active` ;
- `embedding` si la base vectorielle Xano est disponible.

### `ai_conversation`

- `user_id`, `title`, `mode` (`TEXT`, `VISION`, `QCM`), `last_message_at`, `archived_at`.

### `ai_message`

- `conversation_id`, `role` (`USER`, `ASSISTANT`, `SYSTEM`), `content`, `image`, `model`, `tokens_in`, `tokens_out`, `latency_ms`, `safety_status`, `sources_json`.

### `ai_daily_usage`

- unicité `user_id + usage_date + feature` ;
- `feature` (`ASK`, `VISION`, `QCM`), `request_count`, `token_count`.

### `qcm`

- `creator_user_id`, `subject_id`, `level`, `topic`, `difficulty`, `questions_json`, `correct_answers_json_private`, `points_reward`, `status`.

Ne retourne jamais `correct_answers_json_private` avant la soumission.

### `qcm_attempt`

- unicité optionnelle `qcm_id + user_id` selon la règle de jeu ;
- `qcm_id`, `user_id`, `exam_series`, `exam_year`, `answers_json`, `score`, `max_score`, `percentage` ;
- `status` (`STARTED`, `SUBMITTED`, `EXPIRED`), `started_at`, `expires_at`, `completed_at`, `points_awarded` ;
- le serveur crée l'essai avant de retourner les questions et n'accepte qu'une soumission finale atomique.

## 5.4 Kharandi Abacus — boulier et calcul mental

Kharandi Abacus est un module pédagogique à part entière, pas un simple QCM. Son moteur arithmétique doit être déterministe et exécuté côté serveur. L'IA peut expliquer une méthode, mais elle ne calcule jamais la bonne réponse, le score ou la récompense.

### `abacus_level`

- `code` unique (`AB0` à `AB10`), `order`, `title`, `description`, `learning_objectives_json` ;
- `minimum_age` nullable, `is_free`, `requires_premium`, `unlock_rule_json`, `is_active` ;
- niveaux créés par seed dans la section dédiée.

### `abacus_skill`

- `level_id`, `code` unique, `title`, `description` ;
- `operation_type` (`NUMBER_READING`, `ADDITION`, `SUBTRACTION`, `MIXED`, `MULTIPLICATION`, `DIVISION`, `DECIMAL`) ;
- `digit_count`, `operand_count_min`, `operand_count_max`, `allows_negative`, `allows_decimal` ;
- `pedagogy_rule` (`DIRECT`, `FRIENDS_OF_5`, `FRIENDS_OF_10`, `CARRY`, `BORROW`, `MENTAL_IMAGE`) ;
- `prerequisite_skill_ids` JSON, `mastery_threshold`, `is_active`, `sort_order`.

### `abacus_lesson`

- `skill_id`, `title`, `slug` unique, `objective`, `explanation_text` ;
- `content_json`, `demonstration_steps_json`, `practice_config_json` ;
- `illustration`, `animation_asset`, `audio_fr`, `audio_pular`, `audio_soussou`, `audio_maninka` nullable ;
- `estimated_minutes`, `is_free`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`).

`demonstration_steps_json` décrit les mouvements de billes de façon structurée : tige, valeur, bille haute/basse, position avant/après et texte pédagogique. Ne pas stocker uniquement une vidéo : le frontend doit pouvoir animer chaque étape.

### `abacus_exercise_template`

- `skill_id`, `title`, `mode` (`GUIDED`, `PRACTICE`, `TIMED`, `FLASH_ANZAN`, `AUDIO`, `DAILY_CHALLENGE`, `DUEL`, `ASSESSMENT`) ;
- `generator_config_json_private`, `question_count`, `display_duration_ms`, `answer_duration_ms`, `max_attempts` ;
- `base_score`, `point_reward_max`, `daily_reward_limit`, `is_active` ;
- configuration privée : plages de nombres, opérateurs, nombre d'opérandes, retenues autorisées, compléments de 5/10, décimales et règle de difficulté.

### `abacus_session`

- `user_id`, `level_id`, `skill_id`, `template_id` nullable ;
- `assignment_id`, `daily_challenge_id`, `duel_id` nullable ;
- `mode`, `server_seed`, `config_snapshot_json`, `client_session_id` ;
- `status` (`STARTED`, `IN_PROGRESS`, `FINISHED`, `EXPIRED`, `ABANDONED`, `INVALIDATED`) ;
- `started_at`, `last_activity_at`, `finished_at`, `expires_at` ;
- `question_count`, `answered_count`, `correct_count`, `accuracy_percent`, `average_response_ms`, `score`, `stars`, `points_awarded` ;
- unicité `user_id + client_session_id` pour l'idempotence.

### `abacus_question`

- `session_id`, `sequence_number`, `operation_type`, `operands_json`, `operator_sequence_json` ;
- `display_config_json`, `correct_result_private`, `solution_steps_private_json`, `checksum` ;
- `shown_at`, `answer_deadline_at`, `answered_at` ;
- unicité `session_id + sequence_number`.

Ne jamais retourner `correct_result_private`, `solution_steps_private_json`, le seed ou le checksum avant que la question soit définitivement répondue.

### `abacus_answer`

- unicité `session_id + question_id + user_id` ;
- `answer_value`, `is_correct`, `response_time_ms`, `attempt_number`, `bead_moves_json` nullable ;
- `submitted_at`, `server_received_at`, `integrity_status`, `feedback_json` ;
- le serveur calcule `is_correct` et ignore tout score envoyé par le client.

### `abacus_progress`

- unicité `user_id + skill_id` ;
- `status` (`LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `MASTERED`) ;
- `mastery_percent`, `xp`, `stars`, `sessions_count`, `best_score`, `best_accuracy`, `best_average_response_ms` ;
- `current_streak_days`, `last_practiced_at`, `next_review_at`, `mastered_at` ;
- progression mise à jour atomiquement après une session valide.

### `abacus_daily_challenge`

- `challenge_date` unique, `level_id` nullable, `title`, `mode`, `generator_config_json_private` ;
- `question_count`, `reward_points`, `starts_at`, `ends_at`, `is_published` ;
- un utilisateur ne reçoit la récompense qu'une seule fois par défi.

### `abacus_assignment`

- `school_id`, `class_id`, `teacher_user_id`, `level_id`, `skill_id`, `template_id` nullable ;
- `title`, `instructions`, `config_override_json`, `starts_at`, `due_at`, `maximum_attempts`, `is_published` ;
- seuls les enseignants affectés à la classe et les admins de l'école peuvent créer une assignment.

### `abacus_duel`

- `created_by`, `opponent_user_id` nullable, `school_id` nullable, `level_id`, `skill_id`, `config_json` ;
- `status` (`WAITING`, `ACTIVE`, `FINISHED`, `CANCELLED`, `EXPIRED`), `starts_at`, `ends_at`, `winner_user_id` nullable ;
- les deux participants reçoivent exactement les mêmes questions et délais ;
- Xano Realtime diffuse uniquement l'état, jamais les bonnes réponses.

### `abacus_leaderboard_snapshot`

- `scope` (`GLOBAL`, `SCHOOL`, `CLASS`), `school_id`, `class_id` nullable ;
- `period` (`DAILY`, `WEEKLY`, `MONTHLY`, `ALL_TIME`), `period_start`, `period_end` ;
- `user_id`, `rank`, `score`, `accuracy_percent`, `average_response_ms`, `sessions_count` ;
- afficher un pseudonyme ou prénom autorisé, jamais le téléphone.

## 5.5 Contenus publics et répétiteurs

### `news`

- `title`, `slug`, `excerpt`, `content`, `image`, `category`, `author_user_id`, `status`, `published_at`, `featured`.

### `scholarship`

- `title`, `slug`, `provider`, `university`, `program`, `country`, `level` ;
- `deadline`, `amount_text`, `coverage_json`, `eligibility`, `application_url`, `excerpt`, `description`, `image` ;
- `status`, `featured`, `published_at`.

### `study_abroad_program`

- `title`, `slug`, `country`, `city`, `institution`, `program`, `level`, `duration`, `tuition_text`, `requirements`, `application_url`, `description`, `image`, `status`, `featured`.

### `school_ranking`

- `school_name`, `school_id` nullable, `year`, `exam_type`, `rank`, `success_rate`, `city`, `description`, `published` ;
- unicité `year + exam_type + rank`.

### `tutor_ad`

- `author_user_id`, `type` (`OFFER`, `REQUEST`), `subject_id`, `level`, `location`, `description`, `phone_e164`, `price_gnf` ;
- `is_boosted`, `boost_ends_at`, `status` (`PENDING`, `ACTIVE`, `REJECTED`, `EXPIRED`), `expires_at`.

### `tutor_review`

- `tutor_user_id`, `author_user_id`, `rating` de 1 à 5, `comment`, `status` ;
- unicité `tutor_user_id + author_user_id`.

## 5.6 Résultats nationaux

### `exam_result`

- `exam_type` (`CEE`, `BEPC_EG`, `BEPC_FA`, `BAC`) ;
- `year`, `region`, `dpe`, `rank`, `exam_number`, `full_name`, `centre`, `pv`, `origine`, `mention`, `serie` ;
- `is_published`, `import_batch_id`, `normalized_search_text` ;
- index sur `exam_type + year`, `pv`, `exam_number`, `full_name`, `centre`, plus recherche plein texte.

### `exam_import_batch`

- `file`, `exam_type`, `year`, `status`, `total_rows`, `valid_rows`, `invalid_rows`, `error_report_file`, `created_by`, `published_at`.

L'import doit supporter les CSV de résultats existants, traiter les lignes par lots, normaliser les accents/espaces pour la recherche, signaler les doublons et produire un rapport des lignes rejetées.

## 5.7 Marketplace et commandes

### `marketplace_product`

- `seller_user_id`, `title`, `slug`, `description`, `category`, `price_gnf`, `stock_quantity`, `image`, `images_json` ;
- `status` (`DRAFT`, `PENDING`, `ACTIVE`, `REJECTED`, `SOLD_OUT`, `ARCHIVED`) ;
- `is_boosted`, `boost_ends_at`, `view_count`.

### `product_variant`

- `product_id`, `name`, `sku`, `attributes_json`, `price_delta_gnf`, `stock_quantity`, `is_active`.

### `promo_code`

- `seller_user_id`, `code` indexé, `discount_type` (`PERCENT`, `FIXED_GNF`), `discount_value`, `minimum_amount_gnf`, `max_uses`, `use_count`, `starts_at`, `ends_at`, `is_active` ;
- la validation tient compte du vendeur et du panier.

### `commerce_order`

- `reference` unique, `buyer_user_id`, `seller_user_id` nullable ;
- `order_type` (`MARKETPLACE`, `DOCUMENT`) ;
- `status` (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `READY`, `SHIPPED`, `COMPLETED`, `CANCELLED`, `REFUNDED`) ;
- `subtotal_gnf`, `discount_gnf`, `total_gnf`, `currency`, `promo_code_id`, `payment_transaction_id`, `paid_with_points`, `delivery_json`.

### `commerce_order_item`

- `order_id`, `product_id` nullable, `document_id` nullable, `variant_id` nullable ;
- snapshot immuable : `title`, `unit_price_gnf`, `quantity`, `line_total_gnf`, `metadata_json`.

À la création d'une commande, recalculer tous les prix côté serveur, vérifier le stock, réserver ou décrémenter le stock de façon atomique et ignorer les montants envoyés par le client.

## 5.8 Messagerie et notifications

### `conversation`

- `type` (`DIRECT`, `SUPPORT`, `SCHOOL`), `created_by`, `last_message_at`, `last_message_preview`.

### `conversation_member`

- unicité `conversation_id + user_id` ;
- `role`, `joined_at`, `left_at`, `last_read_message_id`, `muted_until`.

### `chat_message`

- `conversation_id`, `sender_user_id`, `body`, `attachment`, `attachment_type`, `reply_to_message_id`, `edited_at`, `deleted_at` ;
- index `conversation_id + created_at`.

### `notification`

- `user_id`, `type`, `title`, `message`, `data_json`, `channel` (`IN_APP`, `SMS`, `BOTH`), `read_at`, `sent_at`, `delivery_status`.

### `sms_log`

- `user_id` nullable, `phone_e164`, `template_code`, `message_redacted`, `provider_message_id`, `provider_status`, `message_cost`, `error_code`, `sent_at`, `delivered_at`.

## 5.9 Support

### `support_ticket`

- `reference` unique, `user_id`, `category` (`PAYMENT`, `TECHNICAL`, `CONTENT`, `SUBSCRIPTION`, `OTHER`) ;
- `subject`, `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `priority`, `assigned_admin_id`, `last_reply_at`, `resolved_at`.

### `support_reply`

- `ticket_id`, `author_user_id`, `message`, `attachment`, `is_internal_note`.

## 5.10 Kharandi École — multi-tenant strict

### `school`

- `name`, `slug`, `email`, `phone_e164`, `address`, `city`, `logo`, `type`, `approval_status`, `is_active` ;
- `current_academic_year`, `settings_json`, `student_capacity`.

### `school_activation`

- `school_id`, `code_hash`, `email`, `expires_at`, `verified_at`, `consumed_at`, `created_by_admin_id`.

### `school_membership`

- `school_id`, `user_id`, `membership_role` (`ADMIN`, `TEACHER`, `ACCOUNTANT`, `SECRETARY`), `status` ;
- unicité `school_id + user_id`.

### `school_class`

- `school_id`, `name`, `level`, `serie`, `academic_year`, `main_teacher_user_id`, `is_active` ;
- unicité `school_id + name + academic_year`.

### `school_student`

- `school_id`, `class_id`, `linked_user_id` nullable ;
- `matricule` unique et imprévisible, `first_name`, `last_name`, `birth_date`, `gender`, `parent_phone_e164`, `address`, `photo`, `enrollment_status`, `academic_year`.

### `guardian_student_link`

- `guardian_user_id`, `student_id`, `relationship`, `verified_at`, `revoked_at` ;
- un parent ne peut lire que les élèves liés et vérifiés.

### `teacher_profile`

- `school_id`, `user_id`, `employee_code`, `subjects_json`, `phone_e164`, `hire_date`, `status`.

### `teacher_class_assignment`

- `teacher_profile_id`, `class_id`, `subject_id`, `academic_year` ;
- unicité sur l'affectation.

### `school_grade`

- `school_id`, `student_id`, `class_id`, `subject_id`, `teacher_user_id` ;
- `assessment_type`, `value`, `max_value`, `coefficient`, `trimester` (`T1`, `T2`, `T3`), `academic_year`, `assessment_date`, `comment` ;
- seul un enseignant affecté, un admin d'école ou l'admin global peut écrire.

### `school_absence`

- `school_id`, `student_id`, `class_id`, `subject_id` nullable, `date`, `start_time`, `end_time`, `reason`, `is_justified`, `justification_file`, `recorded_by`.

### `school_schedule`

- `school_id`, `class_id`, `teacher_user_id`, `subject_id`, `day_of_week`, `start_time`, `end_time`, `room`, `academic_year` ;
- empêcher les conflits enseignant/classe/salle.

### `school_announcement`

- `school_id`, `author_user_id`, `title`, `body`, `audience_type`, `class_id` nullable, `published_at`, `expires_at`, `attachment`.

### `school_homework`

- `school_id`, `class_id`, `subject_id`, `teacher_user_id`, `title`, `description`, `attachment`, `assigned_at`, `due_at`, `status`.

### `school_fee`

- `school_id`, `student_id`, `label`, `academic_year`, `period`, `amount_gnf`, `due_at`, `status`, `payment_transaction_id` nullable.

### `school_payment`

- `school_id`, `student_id`, `fee_id` nullable, `receipt_number` unique, `amount_gnf`, `method` (`CASH`, `LENGOPAY`, `BANK`, `OTHER`), `paid_at`, `recorded_by`, `transaction_id` nullable, `status`.

### `school_expense`

- `school_id`, `category`, `label`, `amount_gnf`, `expense_date`, `payee`, `receipt_file`, `recorded_by`.

### `school_bulletin`

- `school_id`, `student_id`, `class_id`, `trimester`, `academic_year`, `average`, `rank`, `teacher_comment`, `principal_comment`, `status` (`DRAFT`, `PUBLISHED`), `pdf_file`, `published_at` ;
- unicité `student_id + trimester + academic_year`.

### `school_bulletin_line`

- `bulletin_id`, `subject_id`, `average`, `coefficient`, `weighted_average`, `teacher_comment`.

### `school_badge`

- `school_id`, `student_id`, `type`, `title`, `description`, `issued_by`, `issued_at`, `qr_token_hash`, `pdf_file`, `revoked_at`.

### `school_subscription`

- `school_id`, `status`, `student_quantity`, `bulletin_option`, `starts_at`, `ends_at`, `transaction_id`.

Toutes les requêtes Kharandi École doivent dériver le `school_id` de `school_membership` ou du lien parent authentifié. Ne jamais faire confiance à un `school_id` envoyé par le frontend sans vérifier l'appartenance.

---

# 6. Catalogue tarifaire côté serveur

Insère ces produits. Le frontend envoie uniquement `product_code`, `option_codes` et `quantity`. Xano calcule le total.

| Code | Prix GNF | Règle |
|---|---:|---|
| `STUDENT_ANNUAL` | 45 000 | 1 étudiant, annuel |
| `TUTOR_SEMESTER` | 50 000 | répétiteur, 6 mois |
| `TUTOR_HIGHLIGHT_MONTHLY` | 20 000 | option mensuelle |
| `SELLER_SEMESTER` | 50 000 | vendeur, 6 mois |
| `SELLER_HIGHLIGHT_MONTHLY` | 20 000 | option mensuelle |
| `SELLER_BOOST_WEEKLY` | 15 000 | option 7 jours |
| `SCHOOL_ANNUAL` | 60 000 par élève | minimum 10 élèves |
| `SCHOOL_BULLETINS_ANNUAL` | 40 000 par élève | option liée à `SCHOOL_ANNUAL` |
| `TRAINING_OFFICE_BASIC` | 100 000 | paiement unique |
| `TRAINING_OFFICE_ADVANCED` | 300 000 | paiement unique |

Crée une fonction `calculate_catalog_checkout(product_code, option_codes, quantity, authenticated_user)` qui :

- vérifie que le produit est actif et autorisé pour le rôle ;
- impose la quantité minimale ;
- refuse les options non compatibles ;
- calcule le montant depuis `catalog_product` ;
- retourne une ventilation détaillée ;
- ne prend jamais de montant arbitraire du client.

---

# 7. Authentification et OTP Nimba SMS

## 7.1 Normalisation du téléphone

Crée `normalize_guinea_phone(phone)` :

- supprime espaces, tirets et parenthèses ;
- accepte `6XXXXXXXX`, `2246XXXXXXXX` et `+2246XXXXXXXX` ;
- stocke toujours `+2246XXXXXXXX` ;
- rejette tout format invalide avec `422 invalid_phone`.

## 7.2 Envoi Nimba

Crée `nimba_send_sms(to_e164, message, template_code, user_id?)`.

- API : `POST {NIMBA_API_BASE_URL}/messages` ;
- authentification HTTP Basic à partir de `NIMBA_ACCOUNT_SID:NIMBA_AUTH_TOKEN`, conformément à la documentation Nimba active ;
- JSON : `to` comme tableau, `message`, `sender_name` ;
- timeout strict, deux nouvelles tentatives uniquement sur erreur réseau/5xx avec backoff ;
- journalise l'ID fournisseur, le statut et `message_cost` dans `sms_log` ;
- ne journalise pas le code OTP en clair ;
- accepte uniquement les numéros normalisés ;
- crée un endpoint webhook de statut SMS uniquement si la documentation Nimba du compte fournit la validation nécessaire.

## 7.3 Sécurité OTP

- générer un code cryptographiquement aléatoire de 6 chiffres ;
- stocker uniquement son hash salé ;
- expiration 5 minutes ;
- maximum 5 essais ;
- cooldown 60 secondes ;
- limites par téléphone et IP ;
- un seul challenge actif par téléphone et objectif ;
- invalider tous les anciens challenges lors d'un nouvel envoi ;
- réponse générique pour le reset afin de ne pas révéler si le compte existe ;
- consommation unique et atomique du challenge ;
- en `development`, permettre un `OTP_TEST_CODE` seulement s'il existe dans l'environnement ; ne jamais retourner le code dans l'API et interdire cette variable en production.

## 7.4 Routes d'authentification exactes

Crée :

| Méthode | Route | Règle |
|---|---|---|
| POST | `/auth/otp/send/` | body `phone`, `purpose`; envoie Nimba après rate limit |
| POST | `/auth/otp/verify/` | vérification générique sans créer de session |
| POST | `/auth/register/otp/send/` | alias historique de l'OTP REGISTER |
| POST | `/auth/login/` | body `phone`; connexion directe seulement avec `X-Device-Token` valide, sinon indique `otp_sent` ou `password_required` |
| POST | `/auth/login/password/` | téléphone + mot de passe |
| POST | `/auth/login/verify/` | téléphone + OTP LOGIN, crée la session |
| POST | `/auth/register/` | `phone`, `code`, `password`, `role`, `first_name`, `last_name`, `terms_accepted` et `privacy_accepted` obligatoires |
| POST | `/auth/register/student/` | alias d'inscription étudiant |
| POST | `/auth/register/eleve/` | alias français de l'inscription étudiant |
| POST | `/auth/register/parent/` | alias parent |
| POST | `/auth/register/tutor/` | alias répétiteur, statut KYC en attente |
| POST | `/auth/register/repetiteur/` | alias français répétiteur |
| POST | `/auth/register/vendor/` | alias vendeur, statut KYC en attente |
| POST | `/auth/register/vendeur/` | alias français vendeur |
| POST | `/auth/password/reset/request/` | envoie OTP sans énumération de compte |
| POST | `/auth/password/reset/confirm/` | consomme OTP, change mot de passe, révoque sessions/appareils |
| POST | `/auth/token/refresh/` | rotation du refresh token |
| POST | `/auth/logout/` | révoque le refresh et l'appareil courant si demandé |
| GET/PATCH | `/auth/me/` | profil courant |
| POST | `/auth/avatar/` | upload image sécurisé |
| GET | `/auth/wallet/` | solde et historique paginé |
| POST | `/auth/wallet/admin-add/` | ADMIN seulement, journalisé |
| POST | `/auth/me/points/` | alias historique ADMIN seulement ; jamais de crédit libre pour un utilisateur |
| POST | `/users/me/points/` | alias frontend obsolète : ADMIN seulement ou erreur `403 use_secure_points_flow` |
| GET | `/auth/devices/` | appareils du compte |
| DELETE | `/auth/devices/{id}/` | révoque un appareil |
| POST | `/auth/devices/reset/` | révoque tous les appareils sauf optionnellement l'actuel |
| GET/POST | `/auth/users/` | ADMIN; filtre `role`, création contrôlée |
| GET/PATCH/DELETE | `/auth/users/{id}/` | ADMIN; pas d'auto-suppression du dernier admin |

À l'inscription, `first_name` et `last_name` doivent contenir entre 2 et 80 caractères. Calculer `display_name` côté serveur à partir du prénom et du nom. `role` est obligatoire. Seuls `STUDENT`, `PARENT`, `TUTOR` et `VENDOR` sont acceptables depuis le public. Refuser `ADMIN`, `SCHOOL_ADMIN` et `SCHOOL_TEACHER`. `terms_accepted` et `privacy_accepted` doivent être strictement vrais ; le serveur écrit alors `terms_accepted_at` et `privacy_accepted_at` avec sa propre heure. Ne jamais accepter des dates de consentement choisies par le client. Mot de passe minimum 8 caractères, avec politique anti-mots de passe faibles. Hasher via l'auth native Xano.

Après la création du compte, `PATCH /auth/me/` accepte comme contrat commun `first_name`, `last_name`, `city`, `avatar`, `bio`, `school_level` et `serie`. Il peut aussi accepter les informations adaptées au rôle : `subjects`, `levels`, `hourly_price` et `years_experience` pour `TUTOR`; `shop_name` et `shop_description` pour `VENDOR`. `avatar` doit accepter un fichier en `multipart/form-data`. Ignorer ou refuser les champs incompatibles avec le rôle authentifié. Le rôle public ne peut jamais être élevé vers un rôle administratif par cette route.

## 7.5 Superadministrateur initial

Créer une procédure d'initialisation idempotente et non publique qui lit `SUPERADMIN_PHONE` et `SUPERADMIN_INITIAL_PASSWORD` depuis les variables secrètes Xano. Normaliser le téléphone, utiliser l'auth native Xano pour le mot de passe et créer le compte uniquement s'il n'existe pas avec `role = ADMIN`, `is_superadmin = true`, `is_active = true`, `phone_verified = true` et `must_change_password = true`. Ne jamais journaliser ni retourner le mot de passe. Aucun endpoint public ne peut créer ou promouvoir un administrateur.

Le frontend historique appelle parfois `/users/me/points/` après un exercice ou avant un achat. **Ne reproduis pas cette faille** : un client ne peut jamais choisir librement un crédit ou débit de points. Le crédit vient uniquement de la soumission serveur d'un QCM ; le débit vient uniquement de `/marketplace/orders/redeem/`. L'alias historique doit retourner une erreur explicite aux utilisateurs standards afin de rendre la migration visible.

---

# 8. Endpoints fonctionnels compatibles

Les routes listées ci-dessous sont obligatoires. Ajoute filtres, pagination, validation et RBAC. Les listes publiques ne retournent que les éléments publiés/actifs.

## 8.1 IA Karamö

| Méthode | Route |
|---|---|
| GET | `/ai/status/` |
| POST | `/ai/ask/` |
| POST | `/ai/ask/stream/` |
| POST | `/ai/ask-image/` |
| POST | `/ai/generate-qcm/` |
| POST | `/ai/qcm/{qcm_id}/submit/` |
| GET | `/ai/conversations/` |
| GET | `/ai/conversations/{id}/messages/` |
| DELETE | `/ai/conversations/{id}/` |
| POST | `/exercises/start/` |
| POST | `/exercises/{attempt_id}/submit/` |
| GET | `/exercises/history/` |

Implémentation Karamö :

- système pédagogique centré sur les programmes scolaires et le contexte guinéen ;
- réponses en français clair, adaptées au niveau de l'élève ;
- ne pas fabriquer de source ;
- rechercher d'abord dans `knowledge_entry` et `learning_document.content_text` ;
- si la recherche web Tavily est activée, l'utiliser seulement lorsque nécessaire et retourner les sources ;
- appel OpenRouter uniquement côté serveur ;
- stocker les conversations sans secrets ;
- quota gratuit de 5 demandes par jour, configurable, illimité ou supérieur pour les abonnés éligibles ;
- validation des types d'image, taille maximale et analyse vision ;
- modération des entrées/sorties et refus des contenus dangereux ;
- masquer les données personnelles dans les logs ;
- limiter la longueur d'historique et les tokens ;
- si le streaming HTTP n'est pas supporté par Xano, `/ai/ask/stream/` doit lancer une tâche, diffuser les morceaux via Xano Realtime ou permettre un polling avec un `request_id`. Documenter ce repli sans simuler un faux stream.

Génération QCM : exiger un JSON structuré validé, 4 choix par question, une seule bonne réponse, explication pédagogique privée jusqu'à soumission. Lors de la soumission, calculer le score côté serveur. Une réussite parfaite attribue par défaut `50` points une seule fois via `wallet_apply_transaction`.

`/exercises/start/` reçoit exactement `{ "qcm_id": <nombre> }` et crée un `qcm_attempt`. Il retourne `attempt_id`, le QCM et les choix **sans** `correct_index`, bonne réponse ni explication privée. `/exercises/{attempt_id}/submit/` reçoit toutes les réponses, vérifie que l'essai appartient à l'utilisateur, calcule le score et la récompense, marque l'essai soumis et retourne les corrections. Une répétition retourne le même résultat sans recréditer les points. `/ai/qcm/{qcm_id}/submit/` utilise exactement la même fonction interne.

Contrats Karamö utilisés par le frontend : `POST /ai/ask/` reçoit `message` et éventuellement `conversation_id`; `POST /ai/ask-image/` reçoit en `multipart/form-data` un fichier `image` et un texte `message`. Le serveur rattache automatiquement la demande à l'utilisateur authentifié.

## 8.2 Kharandi Abacus

### Routes apprenant

| Méthode | Route | Fonction |
|---|---|---|
| GET | `/abacus/status/` | disponibilité, abonnement, quota et version du curriculum |
| GET | `/abacus/levels/` | niveaux avec état verrouillé/disponible/maîtrisé |
| GET | `/abacus/levels/{level_id}/skills/` | compétences et progression de l'utilisateur |
| GET | `/abacus/lessons/` | filtres `level`, `skill`, `status` |
| GET | `/abacus/lessons/{id}/` | leçon, démonstration animable et ressources audio |
| POST | `/abacus/sessions/start/` | crée une session serveur et retourne la première question publique |
| GET | `/abacus/sessions/{id}/` | reprend uniquement la session de l'utilisateur |
| POST | `/abacus/sessions/{id}/answer/` | valide une réponse et retourne feedback + question suivante |
| POST | `/abacus/sessions/{id}/finish/` | clôture, calcule score/progression/récompense |
| POST | `/abacus/sessions/{id}/abandon/` | clôture sans récompense |
| GET | `/abacus/progress/` | tableau de progression global et par compétence |
| GET | `/abacus/history/` | historique paginé des sessions |

Contrats Abacus utilisés par le frontend : `/abacus/sessions/start/` reçoit `skill_id` (nombre) et `mode` parmi `GUIDED`, `PRACTICE`, `TIMED`, `FLASH_ANZAN`, `AUDIO`; `/abacus/sessions/{id}/answer/` reçoit `question_id` (nombre), `answer_value` (texte) et `response_time_ms` (nombre). Ne jamais accepter un `user_id` envoyé par le client.
| GET | `/abacus/daily-challenge/` | défi du jour adapté au niveau |
| POST | `/abacus/daily-challenge/start/` | crée l'unique tentative récompensable |
| GET | `/abacus/leaderboard/` | `scope`, `period`, `school_id`, `class_id` sécurisés |

### Routes enseignant et école

| Méthode | Route | Accès |
|---|---|---|
| GET/POST | `/abacus/assignments/` | enseignant affecté ou admin école |
| GET/PATCH/DELETE | `/abacus/assignments/{id}/` | auteur ou admin école |
| GET | `/abacus/assignments/{id}/results/` | résultats agrégés et élèves de la classe seulement |
| GET | `/abacus/students/{student_id}/progress/` | enseignant affecté, admin école ou parent lié |
| GET | `/abacus/classes/{class_id}/analytics/` | personnel autorisé de la même école |

### Routes duel Realtime

| Méthode | Route | Fonction |
|---|---|---|
| POST | `/abacus/duels/` | créer une invitation de niveau compatible |
| POST | `/abacus/duels/{id}/join/` | rejoindre si autorisé |
| POST | `/abacus/duels/{id}/answer/` | réponse privée validée côté serveur |
| GET | `/abacus/duels/{id}/` | état du duel pour les participants |
| POST | `/abacus/duels/{id}/cancel/` | annuler avant démarrage selon les règles |

Canal Realtime privé `abacus_duel:{id}`. Vérifier la participation avant abonnement. Diffuser seulement progression, score provisoire, présence et fin de duel. Ne jamais diffuser le résultat attendu, le seed ou la solution.

### Modes pédagogiques

- `GUIDED` : affiche le boulier et anime les mouvements de billes étape par étape ;
- `PRACTICE` : exercices sans pression avec correction pédagogique ;
- `TIMED` : séries chronométrées avec difficulté croissante ;
- `FLASH_ANZAN` : affiche rapidement une suite de nombres, puis demande le résultat mental ;
- `AUDIO` : lit les nombres/opérations sans les afficher pour entraîner l'écoute mentale ;
- `DAILY_CHALLENGE` : défi quotidien unique avec récompense plafonnée ;
- `DUEL` : deux apprenants reçoivent la même série ;
- `ASSESSMENT` : évaluation scolaire sans indice, avec résultats enseignants.

### Moteur arithmétique obligatoire

Créer `abacus_generate_question(server_seed, skill, config, sequence)` :

- générateur pseudo-aléatoire reproductible côté serveur ;
- respecte exactement le niveau, le nombre de chiffres, les opérandes, les compléments de 5/10, retenues/emprunts et limites ;
- garantit que toutes les étapes sont pédagogiquement réalisables sur le boulier ;
- calcule le résultat avec le moteur arithmétique Xano, jamais avec un LLM ;
- produit aussi `solution_steps_private_json` pour l'animation de correction ;
- refuse les divisions non entières tant que la compétence décimale n'est pas débloquée ;
- ne produit pas de résultat négatif avant les niveaux qui l'autorisent ;
- utilise des décimaux exacts, jamais une comparaison flottante imprécise.

Créer `abacus_public_question(question)` qui retire systématiquement réponse, solution, seed, checksum et configuration privée avant la réponse API.

### Progression et récompenses

- score conseillé : précision 70 %, vitesse adaptée au niveau 20 %, série sans erreur 10 % ;
- le seuil de maîtrise par défaut est 80 % avec au moins 3 sessions valides, configurable par compétence ;
- le déblocage d'un niveau dépend des prérequis maîtrisés, pas d'un simple champ envoyé par le frontend ;
- révision espacée : programmer `next_review_at` selon erreurs et maîtrise ;
- points uniquement pour première maîtrise, défi quotidien et assignments récompensables ;
- aucun point pour répéter indéfiniment le même exercice ;
- plafond journalier configurable ;
- toute attribution passe par `wallet_apply_transaction` avec une clé d'idempotence liée à la session ;
- sessions anormalement rapides, horodatages incohérents ou répétitions automatisées sont marquées `INVALIDATED` et ne donnent aucun point ;
- une activité hors ligne peut être conservée localement pour l'apprentissage, mais ne donne des points qu'après une validation serveur autorisée.

### Accessibilité et faible connexion

- interface et API adaptées aux téléphones Android et aux connexions lentes ;
- réponses compactes, ressources audio/animation mises en cache avec version ;
- français par défaut ; ressources audio optionnelles en pular, soussou et maninka ;
- instructions lisibles par synthèse vocale ;
- vitesse d'affichage réglable dans les limites pédagogiques du niveau ;
- ne pas utiliser la couleur comme seul indicateur de bonne/mauvaise réponse.

### Accès gratuit, Premium et école

- `AB0` et `AB1` sont gratuits ;
- `AB2` est accessible gratuitement avec une limite quotidienne configurable ;
- `AB3` à `AB10`, Flash Anzan avancé, audio avancé et statistiques détaillées sont inclus dans `STUDENT_ANNUAL` ;
- les élèves inscrits dans une école active peuvent recevoir l'accès via `SCHOOL_ANNUAL` selon les options de l'école ;
- un enseignant peut consulter le curriculum et préparer des assignments, mais l'accès des élèves reste contrôlé par leur droit individuel ou scolaire ;
- le backend retourne `access_source` (`FREE`, `PERSONAL_SUBSCRIPTION`, `SCHOOL_SUBSCRIPTION`, `ADMIN`) et `locked_reason` ;
- ne jamais déverrouiller un niveau sur la base d'un booléen envoyé par le client.

### Tâches planifiées Abacus

- chaque jour à `00:05 Africa/Conakry`, publier le défi quotidien à partir d'une configuration validée par ADMIN ;
- expirer régulièrement les sessions et duels abandonnés ;
- calculer les snapshots de classement quotidien, hebdomadaire et mensuel ;
- programmer les révisions espacées et créer une notification interne, sans spam SMS automatique ;
- recalculer les agrégats de classe en arrière-plan ;
- toutes les tâches doivent être idempotentes et journalisées.

## 8.3 Bibliothèque et recherche

| Méthode | Route |
|---|---|
| GET/POST | `/learning/documents/` |
| POST | `/learning/documents/upload/` |
| GET/PATCH/DELETE | `/learning/documents/{id}/` |
| GET | `/learning/subjects/` |
| GET/POST | `/content/reading-progress/{document_id}/` |
| GET | `/search/` |

Filtres documents : `q`, `subject`, `level`, `document_type`, `is_free`, `page`, `page_size`. Seuls ADMIN et éditeurs autorisés créent/modifient des documents. Utiliser des URLs signées ou des contrôles d'accès pour les fichiers premium. Incrémenter les compteurs sans race condition.

`/search/?q=&type=&limit=` recherche au minimum les documents et QCM, puis aussi les leçons/compétences Abacus, produits, répétiteurs, actualités, bourses, programmes d'étude et résultats selon `type`. Limiter `limit` et protéger contre les requêtes vides ou trop coûteuses.

## 8.4 Contenus

| Méthode | Route |
|---|---|
| GET/POST | `/content/news/` |
| GET/PATCH/DELETE | `/content/news/{id}/` |
| GET/POST | `/content/scholarships/` |
| GET/PATCH/DELETE | `/content/scholarships/{id}/` |
| GET/POST | `/content/study-abroad/` |
| GET/PATCH/DELETE | `/content/study-abroad/{id}/` |
| GET/POST | `/content/school-rankings/` |
| GET/PATCH/DELETE | `/content/school-rankings/{id}/` |
| GET/POST | `/content/tutor-ads/` |
| GET/PATCH/DELETE | `/content/tutor-ads/{id}/` |
| GET | `/content/notifications/` |
| POST | `/content/notifications/read/` |
| POST | `/content/notifications/{id}/read/` |

POST/PATCH/DELETE des actualités, bourses, programmes et palmarès : ADMIN uniquement. Un utilisateur ne peut modifier/supprimer que sa propre annonce de répétiteur, sauf ADMIN.

## 8.5 Résultats

| Méthode | Route |
|---|---|
| GET | `/results/` |
| GET | `/results/{id}/` |
| POST | `/results/import/` |
| GET | `/results/import/{batch_id}/status/` |
| POST | `/results/import/{batch_id}/publish/` |
| POST | `/results/import/{batch_id}/unpublish/` |

`GET /results/` est public et le contrat frontend envoie `q`, avec `exam_type` et `year` optionnels. Le backend peut proposer d'autres filtres (`dpe`, `centre`, `serie`, `mention`, `page`, `page_size`) sans les rendre obligatoires. Limiter les résultats, normaliser la recherche et ne pas exposer plus de données personnelles que les fichiers de résultats publics.

## 8.6 Notes générales hors école

| Méthode | Route |
|---|---|
| GET/POST | `/grades/` |
| GET | `/grades/students/` |

Un TUTOR ou enseignant autorisé voit seulement ses élèves et écrit seulement leurs notes. Un STUDENT voit seulement ses notes. Un PARENT voit seulement les élèves liés.

## 8.7 Marketplace et commandes

| Méthode | Route |
|---|---|
| GET/POST | `/marketplace/products/` |
| GET | `/marketplace/products/mine/` |
| GET/PATCH/DELETE | `/marketplace/products/{id}/` |
| GET/POST | `/marketplace/promos/` |
| PATCH/DELETE | `/marketplace/promos/{id}/` |
| POST | `/marketplace/promos/check/` |
| POST | `/marketplace/orders/` |
| POST | `/marketplace/orders/redeem/` |
| GET | `/marketplace/seller/orders/` |
| PATCH | `/marketplace/seller/orders/{id}/` |
| POST | `/store/orders/create/` |
| GET | `/store/orders/` |

Seuls les vendeurs approuvés créent des produits. Un vendeur ne voit et ne modifie que ses produits, promos et commandes. L'achat par points utilise `POINT_GNF_VALUE=100`, exige assez de points et débite le wallet atomiquement avec la commande. En cas d'échec, aucun débit et aucun stock ne doivent rester modifiés.

`POST /marketplace/orders/redeem/` reçoit exactement `product_id` (nombre) et `quantity` (nombre). L'utilisateur est toujours dérivé du Bearer token.

La règle canonique est **1 point = 100 GNF**, issue du backend Kharandi. Toujours retourner `point_gnf_value`, `points_cost` et `points_balance` depuis le serveur. Ignorer toute ancienne conversion locale du frontend, notamment `prix / 5`, et ne jamais accepter un `points_cost` calculé par le client.

## 8.8 Support

| Méthode | Route |
|---|---|
| GET/POST | `/support/tickets/` |
| GET/PATCH | `/support/tickets/{id}/` |

Un utilisateur ne voit que ses tickets. ADMIN voit tout. `PATCH` peut ajouter une réponse ; seul ADMIN change librement le statut ou l'assignation. Envoyer une notification à chaque réponse pertinente.

`POST /support/tickets/` reçoit `category`, `subject` et `message`. Accepter au minimum les catégories `TECHNICAL` et `BILLING`, plus `CONTENT`, `SUBSCRIPTION` et `OTHER` si activées.

## 8.9 Notifications et SMS

| Méthode | Route |
|---|---|
| POST | `/notifications/welcome/` |
| POST | `/notifications/custom/` |
| GET | `/notifications/stream/` |
| POST | `/notifications/nimba/webhook/` |

`/notifications/custom/` est ADMIN uniquement. Accepter `recipients` ou `phones`, `message`, `method`. Valider un maximum par lot, mettre en file d'attente, journaliser le résultat et ne jamais permettre à un utilisateur standard d'envoyer des SMS arbitraires. Pour `stream`, préférer Xano Realtime ; conserver une route de compatibilité documentée si SSE n'est pas disponible.

## 8.10 Messagerie privée

| Méthode | Route |
|---|---|
| GET/POST | `/chat/conversations/` |
| GET | `/chat/conversations/{id}/` |
| GET/POST | `/chat/conversations/{id}/messages/` |
| POST | `/chat/conversations/{id}/read/` |
| PATCH/DELETE | `/chat/messages/{id}/` |

Canal Realtime par conversation. Avant abonnement ou publication, vérifier que l'utilisateur est membre. Pour une conversation directe, garantir une seule conversation par paire d'utilisateurs. Paginer les messages par curseur. Ne jamais diffuser un message dans un canal global.

`POST /chat/conversations/{id}/messages/` reçoit `body` et éventuellement un fichier `attachment` en `multipart/form-data`. L'expéditeur est dérivé du Bearer token.

## 8.11 Rapports

| Méthode | Route |
|---|---|
| GET | `/reports/transactions/pdf/` |
| GET | `/reports/student/pdf/` |
| GET | `/reports/stats/excel/` |
| GET | `/reports/stats/csv/` |
| GET | `/reports/abacus/progress/pdf/` |
| GET | `/reports/abacus/classes/{class_id}/csv/` |

Appliquer le RBAC et le périmètre école/utilisateur. Si Xano ne peut pas produire nativement PDF/XLSX, utiliser une Lambda Xano ou un service de rendu configuré côté serveur. À défaut, créer immédiatement un export CSV correct et une vue HTML imprimable, puis signaler clairement la limite ; ne jamais retourner un faux PDF.

---

# 9. Kharandi École — endpoints exacts

Conserver les réponses dans `data`. Les connexions école et enseignant retournent le même format de tokens que l'auth générale, avec `profile.type` égal à `school` ou `teacher` pour compatibilité.

| Méthode | Route | Accès |
|---|---|---|
| GET/POST | `/ecole/schools/` | public lecture limitée / ADMIN création |
| GET/PATCH | `/ecole/schools/{id}/` | membre autorisé ou ADMIN |
| POST | `/ecole/activate/` | public avec code sécurisé |
| POST | `/ecole/login/` | public |
| POST | `/ecole/teacher/login/` | public |
| GET | `/ecole/parent/{matricule}/` | parent authentifié et lié ; sinon challenge OTP parent |
| GET/POST | `/ecole/schools/{school_id}/students/` | personnel autorisé |
| GET/PATCH/DELETE | `/ecole/students/{id}/` | personnel autorisé ; parent en lecture seulement |
| GET/POST | `/ecole/classes/` | membre de l'école |
| PATCH/DELETE | `/ecole/classes/{id}/` | admin école |
| GET/POST | `/ecole/teachers/` | admin école |
| GET/PATCH/DELETE | `/ecole/teachers/{id}/` | admin école |
| GET/POST | `/ecole/grades/` | selon affectation |
| PATCH/DELETE | `/ecole/grades/{id}/` | auteur/admin école |
| GET/POST | `/ecole/absences/` | membre autorisé |
| PATCH | `/ecole/absences/{id}/` | membre autorisé |
| GET/POST | `/ecole/payments/` | comptable/admin ; parent lecture |
| PATCH | `/ecole/payments/{id}/` | comptable/admin |
| GET/POST | `/ecole/fees/` | comptable/admin ; parent lecture |
| GET/POST | `/ecole/expenses/` | comptable/admin |

`POST /ecole/grades/` reçoit exactement `student_id`, `subject_id`, `class_id`, `value`, `trimester` et `assessment_type`. Valider que l'élève, la matière et la classe appartiennent à la même école autorisée. L'auteur/enseignant est dérivé du Bearer token ; ne jamais accepter `teacher_id` ou `user_id` comme preuve d'identité du client.
| GET/POST | `/ecole/schedules/` | membre/parent/élève lecture ; admin écriture |
| PATCH/DELETE | `/ecole/schedules/{id}/` | admin école |
| GET/POST | `/ecole/announcements/` | audience filtrée ; personnel écrit |
| GET/POST | `/ecole/homework/` | audience filtrée ; enseignant affecté écrit |
| PATCH/DELETE | `/ecole/homework/{id}/` | auteur/admin école |
| GET/POST | `/ecole/bulletins/` | génération admin/enseignant ; lecture liée |
| POST | `/ecole/bulletins/{id}/publish/` | admin école |
| GET | `/ecole/bulletins/{id}/pdf/` | accès lié |
| POST | `/ecole/badges/issue/` | admin école |
| GET | `/ecole/badges/history/` | membre autorisé |
| GET | `/ecole/badges/{id}/` | accès lié |
| GET | `/ecole/parent/student/{student_id}/badges/` | parent lié |
| GET | `/ecole/parent/student/{student_id}/badges/pdf/` | parent lié |
| GET | `/ecole/subscription/pricing/` | admin école |
| POST | `/ecole/subscription/checkout/` | admin école |
| GET | `/ecole/subscription/status/` | admin école |
| GET | `/ecole/dashboard/summary/` | membre autorisé, agrégats par rôle |

Règles supplémentaires :

- le matricule est généré côté serveur et unique ;
- ne jamais permettre de passer d'une école à une autre par modification d'ID ;
- bulletins calculés depuis les notes publiées avec coefficients ;
- rangs calculés de manière déterministe par classe/trimestre ;
- PDF bulletin et badge incluent école, élève, période, QR vérifiable, date et identifiant ;
- le QR contient un jeton public opaque, jamais un ID brut ou des données privées ;
- endpoint public minimal de vérification d'un badge : `/ecole/badges/verify/{token}/` ;
- les paiements scolaires LengoPay suivent le même pipeline sécurisé que les autres paiements ;
- comptabilité : total encaissé, impayés, dépenses et solde, filtrables par période.

Créer aussi les alias historiques ci-dessous, branchés sur les mêmes fonctions et permissions, afin de ne pas casser l'ancien backend/frontend :

- `GET /ecole/subscriptions/pricing/` → pricing école ;
- `POST /ecole/subscriptions/checkout-session/` → checkout école ;
- `GET /ecole/subscriptions/status/{school_id}/` → statut après vérification d'appartenance ;
- `POST /ecole/schools/badges/issue/` → émission badge ;
- `GET /ecole/schools/badges/history/{school_id}/` → historique sécurisé ;
- `GET /ecole/schools/badges/{badge_id}/` → détail badge ;
- `GET /ecole/parents/students/{student_id}/badges/` → badges parent lié ;
- `GET /ecole/parents/students/{student_id}/badges/{badge_id}/pdf/` → PDF badge sécurisé.

---

# 10. Paiements LengoPay

## 10.1 Principe de sécurité

Le frontend n'a jamais la clé LengoPay. Il n'envoie jamais un montant final fiable. Xano crée d'abord une `payment_transaction` `PENDING`, appelle LengoPay côté serveur, stocke immédiatement le `provider_pay_id` et l'URL, puis renvoie l'URL au frontend.

Un retour navigateur sur `/payment/success` n'est pas une preuve de paiement. Une transaction ne devient `SUCCESS` et aucun abonnement/produit/commande n'est livré tant qu'une vérification serveur-à-serveur auprès de LengoPay n'a pas confirmé :

- le même `provider_pay_id` ;
- le même montant ;
- `GNF` ;
- le bon `websiteid` ou marchand ;
- un statut final de succès.

## 10.2 Appel de création

Crée `lengopay_create_payment(transaction)` :

- `POST {LENGOPAY_API_BASE_URL}{LENGOPAY_CREATE_PAYMENT_PATH}` ;
- header `Authorization: Basic {LENGOPAY_LICENSE_KEY}` uniquement si c'est bien le format confirmé par la documentation marchande ; ne pas convertir en Basic standard si la documentation demande la clé directement ;
- `Content-Type: application/json` ;
- body construit côté serveur : `websiteid`, `amount`, `currency`, `country`, référence locale, `return_url`, `callback_url` HTTPS ;
- callback : `{XANO_PUBLIC_API_BASE_URL}/payments/webhook/lengopay/?token={LENGOPAY_CALLBACK_TOKEN}` pendant le pilote seulement ;
- timeout et gestion explicite des erreurs 4xx/5xx ;
- stocker `provider_pay_id`, `payment_url` et une réponse fournisseur nettoyée ;
- si l'appel fournisseur échoue, conserver la trace et mettre `FAILED` ou un état réessayable approprié, sans créer d'abonnement.

## 10.3 Vérification de statut

Crée `lengopay_verify_payment(provider_pay_id)` en utilisant la route de vérification active du compte marchand. La configuration proposée est :

```text
POST {LENGOPAY_API_BASE_URL}{LENGOPAY_STATUS_PATH}
Authorization: Basic {LENGOPAY_LICENSE_KEY}
Body: { "pay_id": "...", "websiteid": "..." }
```

Confirme cette forme dans la documentation LengoPay avant le test réel. Normalise les statuts fournisseurs vers `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`. Traite un statut inconnu comme `PENDING/UNVERIFIED`, jamais comme un succès.

## 10.4 Webhook

Crée `POST /payments/webhook/lengopay/`, public mais traité comme entrée non fiable.

1. limiter la taille du body ;
2. enregistrer l'événement avec un hash et un `event_key` idempotent ;
3. si LengoPay documente une signature officielle, la vérifier en temps constant avec le secret approprié ;
4. le token de callback est une protection de pilote seulement, pas une preuve de paiement ;
5. extraire le `pay_id`, retrouver la transaction ;
6. appeler obligatoirement `lengopay_verify_payment` ;
7. comparer montant, devise et bénéficiaire ;
8. dans une transaction atomique, passer à `SUCCESS`, écrire `verified_at`, puis exécuter une seule fois `fulfill_payment_transaction` ;
9. répondre `200` aux doublons déjà traités sans répéter l'activation ;
10. conserver les payloads nettoyés et erreurs pour l'audit.

## 10.5 Fulfillment atomique

`fulfill_payment_transaction` :

- `SUBSCRIPTION/CATALOG` : créer ou prolonger la souscription correcte ;
- `ORDER` : marquer la commande payée et confirmer le stock ;
- `SCHOOL_FEE` : enregistrer le paiement et générer le reçu ;
- écrire `fulfilled_at` une seule fois ;
- créer notification et reçu ;
- aucune double activation si le webhook ou le polling est répété.

## 10.6 Routes paiements exactes

| Méthode | Route | Fonction |
|---|---|---|
| GET/POST | `/payments/plans/` | lecture publique ; écriture ADMIN |
| PATCH/DELETE | `/payments/plans/{id}/` | ADMIN |
| GET | `/payments/subscriptions/status/` | utilisateur courant |
| POST | `/payments/subscriptions/initiate/` | ancien checkout par `plan_id` |
| POST | `/payments/checkout/initiate/` | catalogue sécurisé |
| POST | `/payments/initiate/` | paiement d'une commande existante |
| GET | `/payments/transactions/` | utilisateur : siennes ; ADMIN : toutes |
| GET | `/payments/transactions/{reference}/status/` | propriétaire ou ADMIN ; vérification fournisseur avec throttle si pending |
| POST | `/payments/webhook/lengopay/` | webhook public sécurisé et idempotent |
| POST | `/payments/webhook/` | alias historique du même webhook |
| POST | `/payments/run-cron/` | ADMIN seulement ; lance manuellement un petit lot de réconciliation |

Le contrat canonique de `POST /payments/checkout/initiate/` reçoit `product_code` (texte), `quantity` (nombre, valeur par défaut `1`) et éventuellement `option_codes` (tableau de textes). Ne pas exiger `order_id`, `amount`, `currency` ou `user_id` du frontend : le serveur retrouve le produit, le prix, la devise et l'utilisateur.

Les trois endpoints d'initiation doivent accepter un header `Idempotency-Key` et retourner la même transaction si la requête identique est répétée.

## 10.7 Réconciliation

Créer une tâche planifiée toutes les 5 à 10 minutes :

- sélectionner un petit lot de transactions `PENDING` récentes ;
- appeler la vérification LengoPay avec backoff ;
- effectuer le fulfillment si succès ;
- expirer les transactions trop anciennes ;
- ne jamais dépasser les limites du fournisseur ;
- journaliser métriques et erreurs sans secrets.

Le webhook doit utiliser une URL HTTPS publique. Un serveur local HTTP ne convient pas pour le test réel.

---

# 11. Administration

Crée les agrégats et routes ADMIN nécessaires au tableau de bord :

| Méthode | Route |
|---|---|
| GET | `/admin/dashboard/summary/` |
| GET | `/admin/dashboard/revenue/` |
| GET | `/admin/dashboard/users/` |
| GET | `/admin/dashboard/schools/` |
| GET | `/admin/audit-logs/` |
| POST | `/admin/schools/{id}/approve/` |
| POST | `/admin/tutors/{id}/approve/` |
| POST | `/admin/vendors/{id}/approve/` |
| GET/POST | `/admin/abacus/levels/` |
| GET/PATCH/DELETE | `/admin/abacus/levels/{id}/` |
| GET/POST | `/admin/abacus/skills/` |
| GET/PATCH/DELETE | `/admin/abacus/skills/{id}/` |
| GET/POST | `/admin/abacus/lessons/` |
| GET/PATCH/DELETE | `/admin/abacus/lessons/{id}/` |
| GET/POST | `/admin/abacus/templates/` |
| GET | `/admin/abacus/analytics/` |

Résumé : utilisateurs totaux/nouveaux/actifs par rôle, abonnements actifs, revenus confirmés par période, transactions pending/failed, tickets ouverts, documents publiés, écoles actives, produits en attente, volume SMS, utilisateurs Abacus actifs, sessions terminées, progression moyenne et compétences les plus difficiles. Ne compter comme revenu que les transactions `SUCCESS` vérifiées.

Toutes les actions sensibles doivent être dans `audit_log`. Empêcher qu'un admin se retire lui-même le dernier rôle ADMIN ou supprime le dernier admin actif.

---

# 12. Sécurité, confidentialité et robustesse

Applique obligatoirement :

- CORS limité aux domaines frontend autorisés, jamais `*` en production avec authentification ;
- authentification Bearer sur toutes les routes privées ;
- contrôle de propriété et de rôle dans chaque endpoint, pas seulement dans l'interface ;
- filtrage multi-tenant strict pour les écoles ;
- validation de tous les IDs, enums, montants, dates, fichiers et longueurs ;
- upload limité aux MIME/extensions autorisés, nom de fichier régénéré, taille maximale, pas de script exécutable ;
- rate limiting pour auth, OTP, IA, recherche, chat, paiement et endpoints publics lourds ;
- rate limiting et contrôle d'intégrité pour les sessions, réponses, défis et duels Abacus ;
- aucun secret dans réponse, log ou base en clair lorsque le hash suffit ;
- aucune donnée sensible dans les URLs ;
- protection contre l'énumération de comptes ;
- idempotence des paiements, webhooks, points, imports et envois de masse ;
- soft delete lorsque l'historique financier/scolaire doit être conservé ;
- audit de toutes les opérations admin, financières, scolaires et de wallet ;
- rétention limitée des IP/user agents sous forme de hash ;
- sauvegarde et restauration testées ;
- distinction claire `development`/`production` ;
- données de démonstration uniquement dans development ;
- aucun OTP fixe, callback permissif ou bypass auth en production.

Crée une fonction globale `sanitize_provider_payload` qui retire tokens, Authorization, mots de passe, OTP, documents KYC et données non nécessaires avant journalisation.

---

# 13. Index et performance

Ajoute au minimum :

- index unique `user.phone_e164` ;
- index composés OTP et refresh token ;
- index `payment_transaction.reference`, `provider_pay_id`, `status + created_at` ;
- index `subscription.beneficiary + status + ends_at` ;
- index plein texte documents, contenus, produits, répétiteurs et résultats ;
- index `chat_message.conversation_id + created_at` ;
- index `notification.user_id + read_at + created_at` ;
- index `school_*` commençant par `school_id` sur toutes les tables multi-tenant ;
- index `school_grade.student_id + trimester + academic_year` ;
- index `exam_result.exam_type + year` et champs de recherche ;
- index `support_ticket.user_id + status + updated_at`.
- index `abacus_session.user_id + started_at`, `status + expires_at` et `client_session_id` ;
- index `abacus_question.session_id + sequence_number` unique ;
- index `abacus_progress.user_id + skill_id` unique et `next_review_at` ;
- index `abacus_assignment.school_id + class_id + due_at` ;
- index `abacus_leaderboard_snapshot.scope + period + period_start + rank`.

Toutes les listes doivent être paginées. `page_size` par défaut 20, maximum 100, sauf imports administratifs internes. Éviter les N+1 en ajoutant les relations nécessaires dans une seule requête.

---

# 14. Seeds de développement

Dans `development` seulement, créer :

- matières : Mathématiques, Français, Physique-Chimie, SVT, Histoire-Géographie, Anglais, Philosophie, Informatique ;
- curriculum Kharandi Abacus ci-dessous ;
- les produits tarifaires de la section 6 ;
- un plan gratuit ;
- quelques contenus `DRAFT` non publics ;
- une école de démonstration, classes et comptes de test sans secret connu en production ;
- un jeu réduit de résultats de test clairement fictifs ;
- aucun vrai numéro de téléphone ni donnée d'élève réel.

### Curriculum initial Kharandi Abacus

| Code | Niveau | Contenu principal | Accès initial |
|---|---|---|---|
| `AB0` | Découverte du boulier | tiges, billes, position zéro, valeur de position | gratuit |
| `AB1` | Lire et représenter | nombres 0–99, unités et dizaines | gratuit |
| `AB2` | Calcul direct | additions et soustractions sans complément | gratuit limité |
| `AB3` | Amis de 5 | compléments de 5 et mouvements associés | premium/école |
| `AB4` | Amis de 10 | compléments de 10 | premium/école |
| `AB5` | Retenues et emprunts | additions/soustractions à plusieurs étapes | premium/école |
| `AB6` | Grands nombres | centaines, milliers et séries mixtes | premium/école |
| `AB7` | Multiplication | tables puis multiplication multi-chiffres | premium/école |
| `AB8` | Division | divisions exactes puis reste contrôlé | premium/école |
| `AB9` | Décimaux et vitesse | monnaie, décimaux et automatisation | premium/école |
| `AB10` | Calcul mental avancé | image mentale, Flash Anzan, audio et compétition | premium/école |

Créer pour chaque niveau au moins une compétence, une leçon guidée, une configuration d'entraînement et une évaluation. Les données seed sont pédagogiques et éditables par ADMIN ; le moteur ne doit pas dépendre de textes codés en dur dans le frontend.

Ne crée pas automatiquement de compte ADMIN avec un mot de passe public. Fournis une procédure sécurisée de création du premier admin dans la console Xano.

---

# 15. Tests d'acceptation obligatoires

Crée une collection de tests Xano ou un scénario reproductible pour tous les cas suivants.

## Auth et OTP

1. normalisation correcte des trois formats guinéens ;
2. numéro invalide rejeté ;
3. OTP stocké uniquement hashé ;
4. OTP expiré, faux, trop essayé et déjà consommé rejeté ;
5. rate limit envoi et resend ;
6. inscription publique avec rôle ADMIN rejetée ;
7. login mot de passe réussi/échoué ;
8. device token valide connecte, token révoqué échoue ;
9. refresh rotation et réutilisation d'un ancien token révoquent la chaîne ;
10. utilisateur inactif rejeté.

## Autorisations

11. un utilisateur ne lit pas le profil privé d'un autre ;
12. un vendeur ne modifie pas le produit d'un autre ;
13. un parent ne lit pas un élève non lié ;
14. un enseignant ne modifie pas une note hors affectation ;
15. un admin d'école A ne lit jamais l'école B ;
16. une route admin rejette tous les rôles non ADMIN.

## IA, QCM et points

17. quota gratuit appliqué puis réinitialisé au nouveau jour ;
18. clé OpenRouter absente retourne 503 propre, pas 500 avec secret ;
19. mauvaise image rejetée ;
20. réponses QCM correctes non exposées avant soumission ;
21. score calculé côté serveur ;
22. même tentative parfaite ne crédite jamais deux fois ;
23. wallet ne descend jamais sous zéro.

## Kharandi Abacus

24. la bonne réponse, les étapes privées, le seed et le checksum ne sont jamais retournés avant réponse ;
25. un même seed serveur et une même configuration reproduisent exactement la même question ;
26. les exercices `FRIENDS_OF_5` et `FRIENDS_OF_10` respectent réellement leurs règles pédagogiques ;
27. aucun résultat négatif n'est généré avant un niveau qui l'autorise ;
28. aucune division non entière n'est générée avant la compétence correspondante ;
29. une deuxième réponse à la même question est rejetée ou retourne le résultat idempotent sans modifier le score ;
30. terminer deux fois la même session ne crédite jamais deux fois les points ;
31. un utilisateur ne peut ni lire ni terminer la session Abacus d'un autre ;
32. le frontend ne peut pas déverrouiller lui-même une compétence ou falsifier la maîtrise ;
33. le défi quotidien récompense une seule fois ;
34. le plafond journalier de points est appliqué ;
35. un enseignant ne voit que les résultats Abacus de ses classes et de son école ;
36. les deux participants d'un duel reçoivent les mêmes questions, sans fuite des réponses ;
37. le classement n'expose jamais numéro de téléphone ou information privée ;
38. une panne OpenRouter n'empêche pas le moteur arithmétique Abacus de fonctionner.

## Marketplace

39. prix client falsifié ignoré ;
40. stock insuffisant rejeté ;
41. deux achats concurrents ne rendent pas le stock négatif ;
42. promo expirée ou d'un autre vendeur rejetée ;
43. achat par points atomique avec rollback sur erreur.

## École

44. matricule unique ;
45. conflits d'emploi du temps rejetés ;
46. bulletin calculé avec coefficients et rang correct ;
47. publication bulletin visible seulement aux personnes liées ;
48. QR badge ne révèle aucune donnée sensible ;
49. paiement école produit un reçu unique.

## Nimba

50. credentials absents retournent 503 propre ;
51. erreur fournisseur ne valide jamais un OTP ;
52. aucun OTP en clair dans les logs ;
53. répétition d'une tâche SMS ne duplique pas sans intention.

## LengoPay

54. montant catalogue recalculé côté serveur ;
55. même `Idempotency-Key` retourne la même transaction ;
56. appel LengoPay échoué ne crée aucun abonnement ;
57. webhook inconnu rejeté ou ignoré de manière sûre ;
58. mauvais montant/devise ne valide pas la transaction ;
59. statut fournisseur `PENDING` ne livre rien ;
60. retour navigateur seul ne livre rien ;
61. même webhook reçu plusieurs fois ne livre qu'une fois ;
62. polling et webhook concurrents ne livrent qu'une fois ;
63. vérification serveur `SUCCESS` active exactement le bon produit ;
64. expiration d'une transaction pending ;
65. secrets LengoPay absents retournent 503 propre.

## Contenus, résultats, chat et support

66. contenus brouillons invisibles au public ;
67. import CSV signale les lignes invalides et les doublons ;
68. recherche résultat accentuée/non accentuée cohérente ;
69. non-membre d'une conversation ne peut ni lire ni s'abonner au canal ;
70. ticket privé inaccessible à un autre utilisateur ;
71. export n'inclut que le périmètre autorisé.

---

# 16. Ordre d'exécution

Exécute dans cet ordre :

## Phase 0 — Fondation

- environnements et variables ;
- groupe API ;
- format de réponse ;
- fonctions communes ;
- tables identité/sécurité/audit ;
- CORS, limites et conventions.

## Phase 1 — Auth, OTP Nimba et profils

- auth Xano ;
- OTP ;
- mot de passe/reset ;
- refresh et trusted devices ;
- profils et RBAC ;
- routes `/auth/*` ;
- tests auth/Nimba.

## Phase 2 — Apprentissage, contenus, résultats et recherche

- matières/documents/progression ;
- actualités/bourses/études/palmarès ;
- résultats et import CSV ;
- recherche globale ;
- routes et tests.

## Phase 3 — Karamö IA, QCM, wallet et gamification

- RAG ;
- OpenRouter texte/vision ;
- quota ;
- QCM ;
- points atomiques ;
- tests IA/wallet.

## Phase 4 — Kharandi Abacus

- curriculum AB0 à AB10 ;
- leçons et démonstrations animables ;
- moteur arithmétique déterministe ;
- entraînement, Flash Anzan, audio, défis et duels ;
- progression, récompenses et révision espacée ;
- assignments et statistiques scolaires ;
- tests Abacus et anti-triche.

## Phase 5 — Répétiteurs, marketplace et commandes

- annonces/avis ;
- vendeurs/produits/promos ;
- commandes documents et marketplace ;
- achat par points ;
- tests de stock et propriété.

## Phase 6 — Kharandi École

- tenant école et activation ;
- élèves/parents/enseignants/classes ;
- notes/bulletins/badges ;
- horaires/devoirs/annonces/absences ;
- frais/paiements/dépenses ;
- tests multi-tenant.

## Phase 7 — LengoPay, abonnements et paiements

- catalogue ;
- initiation ;
- vérification serveur ;
- webhook ;
- fulfillment ;
- réconciliation ;
- tests concurrents/idempotents.

## Phase 8 — Chat, notifications, support, admin et rapports

- Realtime ;
- notifications internes/SMS ;
- tickets ;
- dashboard admin ;
- exports ;
- tests.

## Phase 9 — Recette et passage en production

- exécuter les 71 tests ;
- vérifier toutes les routes avec le contrat frontend ;
- produire OpenAPI/Swagger ;
- produire un tableau route → auth → rôle → tables → réponse ;
- vérifier les index et performances ;
- retirer seeds et bypass de development ;
- valider CORS, secrets, callbacks HTTPS, sauvegardes et alertes ;
- donner la valeur exacte de `VITE_API_URL` ;
- fournir une checklist de test Nimba réel puis LengoPay réel avec une transaction minimale.

Commence maintenant par **Phase 0**, puis continue automatiquement vers **Phase 1** uniquement si la capacité d'exécution le permet. N'avance jamais avec des tests rouges et ne marque jamais une fonctionnalité « terminée » si elle n'a pas été créée et testée dans Xano.

---

## Commandes de continuation à utiliser si Xano s'arrête

```text
CONTINUER PHASE 1. Relis les tables, fonctions, routes et conventions déjà créées. Ne renomme rien. Termine tous les tests auth/OTP Nimba avant de t'arrêter.
```

```text
CONTINUER PHASE 2. Respecte strictement le contrat frontend et les permissions définies dans le prompt maître. Termine contenus, bibliothèque, résultats, import CSV et recherche.
```

```text
CONTINUER PHASE 3. Implémente Karamö IA, RAG, vision, QCM, quotas et wallet atomique. Ne révèle aucune clé ni réponse QCM privée.
```

```text
CONTINUER PHASE 4. Implémente entièrement Kharandi Abacus : curriculum AB0–AB10, leçons, moteur arithmétique déterministe, sessions, Flash Anzan, audio, défis, duels, progression, école et tests anti-triche.
```

```text
CONTINUER PHASE 5. Implémente répétiteurs, marketplace, promotions, commandes, stocks atomiques et achat par points.
```

```text
CONTINUER PHASE 6. Implémente entièrement Kharandi École avec isolation multi-tenant stricte, suivi Abacus scolaire et tous les endpoints du prompt maître.
```

```text
CONTINUER PHASE 7. Vérifie d'abord les paramètres actuels de mon compte marchand LengoPay, puis implémente catalogue, initiation, vérification serveur, webhook, idempotence, fulfillment et réconciliation.
```

```text
CONTINUER PHASE 8. Implémente chat Xano Realtime, notifications, support, administration et rapports sans casser les routes existantes.
```

```text
CONTINUER PHASE 9. Lance la recette complète des 71 tests, corrige tous les tests rouges, génère OpenAPI et donne la checklist exacte de branchement du frontend.
```
