# Vérification fonctionnelle Xano

Utilisez deux comptes de test et un environnement Xano de test avant la production.

## Parcours prioritaires

- OTP : demander un code, vérifier le SMS Nimba, tester expiration, limite d'essais et renvoi.
- Auth : création de compte, connexion, renouvellement du token, déconnexion et permissions par rôle.
- Paiement : créer un checkout LengoPay de test, revenir sur succès/échec, vérifier le webhook et l'idempotence.
- Wallet : vérifier que le solde ne change jamais par une simple modification du navigateur.
- Exo Gagnant : démarrer, soumettre, rejouer et vérifier qu'une tentative ne récompense qu'une fois.
- Makiti : échange avec solde suffisant, solde insuffisant, stock épuisé et double clic.
- Abacus : niveaux AB0 à AB10, compétences, démarrage de séance, réponses et fin de séance.
- Messagerie : liste avec messages embarqués, envoi, rafraîchissement et restrictions entre utilisateurs.
- École : connexion administrateur, écoles, élèves, classes et création de notes ; les autres écrans doivent rester sans fausse donnée tant que leurs routes ne sont pas ajoutées.
- Voyage : vérifier l'accès public aux six affiches Google Drive.
- Palmarès : vérifier les textes, la fiche d'évaluation et la liste en lecture seule issue de Xano.
- Résultats : recherche BAC/BEPC général/BEPC franco-arabe/CEE et import CSV administrateur.

## Contrats indispensables

- Toutes les réponses acceptent idéalement `{ "data": ... }`; les principaux services tolèrent aussi une réponse directe.
- Les erreurs doivent renvoyer un statut HTTP correct et un champ `message` lisible.
- Les dates sont en ISO 8601 et les montants sont des entiers en GNF.
- Les points suivent la règle serveur : **1 point = 100 GNF**.
- Les webhooks LengoPay vérifient la signature, le montant, la référence et l'idempotence avant toute activation.
- Toute route absente de `docs/XANO_ROUTES_ACTUELLES.md` doit être bloquée par le frontend, jamais simulée comme réussie.
