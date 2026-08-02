# Importer les résultats BAC, BEPC et CEE dans Xano

Le frontend permet la recherche publique pour quatre catégories :

- `BAC` — Baccalauréat ;
- `BEPC_EG` — Brevet, enseignement général ;
- `BEPC_FA` — Brevet, franco-arabe ;
- `CEE` — Certificat de fin d'études élémentaires / entrée en 7ᵉ année.

## Sources conservées dans l'archive

Le dossier `data/examens` conserve les documents transmis :

- BAC 2026 : PDF et extraction texte ;
- BEPC 2026 enseignement général : PDF et extraction texte ;
- BEPC 2026 franco-arabe : PDF et extraction texte ;
- CEE 2026 : CSV et XLSX.

Les PDF et fichiers texte sont des sources de vérification. L'import d'administration accepte des fichiers `.csv`, `.xlsx` ou `.xls` structurés.

## Colonnes normalisées

Utilisez le modèle `resultats_import_modele.csv` avec les colonnes suivantes :

`exam_type,year,region,dpe,rank,is_tied,full_name,center,pv,origin,mention,series,published`

Règles :

- `exam_type` doit être exactement `BAC`, `BEPC_EG`, `BEPC_FA` ou `CEE` ;
- `year` est une année sur quatre chiffres ;
- `pv` est conservé comme texte pour ne pas perdre les zéros initiaux ;
- `published` reste `false` pendant la vérification ;
- les doublons sont déterminés par `exam_type + year + pv` ;
- les noms et centres doivent être normalisés pour la recherche, sans modifier leur forme officielle affichée.

## Procédure

1. Connectez-vous avec un compte administrateur.
2. Ouvrez **Administration → Résultats d'Examens**.
3. Sélectionnez l'examen, la session et le fichier structuré.
4. Importez et attendez le statut `READY`, `VALIDATED` ou `COMPLETED`.
5. Comparez le nombre de lignes valides, rejetées et en doublon avec le fichier officiel.
6. Publiez seulement après validation.
7. Testez la recherche publique par nom, PV et centre.

Xano doit garder l'import idempotent : réimporter le même fichier ne doit pas créer de doublons.
