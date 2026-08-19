# marsclub-acces

Identité et droits partagés des outils internes **Mārs Clūb** — une seule
garde pour Hora (planning), Fama (avis) et les suivants.

## Pourquoi ce dépôt existe

Dupliquée dans chaque outil, la vérification d'identité aurait divergé : une
correction appliquée ici et pas là, et la porte reste ouverte quelque part
sans que personne ne le voie. Le style peut dériver ; la garde, non.

## Ce qu'il contient

- **`signerIdentite` / `lireIdentite`** — le cookie signé qui porte « telle
  personne, tel niveau ». Signé, jamais chiffré : il n'y a rien de secret
  là-dedans, ce qu'il faut c'est que personne ne puisse le fabriquer.
- **`creerGarde`** — le moteur de capacités. Chaque outil lui donne SA grille.
- **`domaineCookies`** — le domaine commun, déduit de l'hôte de la requête.
- **`empreinte`**, **`estJeton`** — les utilitaires de la porte.

Aucune dépendance : ni framework, ni base de données. Web Crypto suffit, et
se trouve partout — Node, l'Edge, le navigateur.

## Ce qu'il ne contient pas, volontairement

La grille de capacités de chaque outil (`semaine.publier` ne regarde pas
Fama), ses chemins gardés, son middleware, et l'annuaire des personnes — qui
vit dans la base d'Hora. Chacun garde ce qui lui est propre.

## Installation

```bash
npm install github:MarsClub/marsclub-acces
```

Dépôt public : aucun jeton d'accès à poser dans les projets Vercel. Le code
ne contient aucune clé — la sécurité tient au secret partagé, jamais à
l'obscurité du code.

## Usage

```ts
import { creerGarde, lireIdentite, COOKIE_QUI } from 'marsclub-acces'

const garde = creerGarde({
  'avis.lire': ['direction', 'management'],
  'avis.demander': ['direction'],
} as const)

const identite = await lireIdentite(cookie, process.env.SECRET_MAISON!, Date.now())
if (garde.peut(identite?.niveau, 'avis.demander')) { /* … */ }
```

## Les trois niveaux

`direction` · `management` · `equipe` — les mêmes partout, avec des droits
qui changent fonction par fonction selon l'outil (décision du 19/08/2026).
