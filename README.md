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

Une **capacité est un geste**, jamais un écran. C'est ce qui permet de donner
« clôturer un service » sans donner « arrêter les comptes du mois », alors
que les deux vivaient sous le même mot. Si la grille d'un outil ne tient plus
sur un écran, elle a probablement confondu capacités et pages.

## Brancher un nouvel outil

1. `npm install github:MarsClub/marsclub-acces`
2. Poser `SECRET_MAISON` dans ses variables — **le même que les autres
   outils**, sinon les cookies ne se reconnaissent pas.
3. Écrire sa grille avec `creerGarde()`, et une table des chemins gardés.
   Un chemin absent de cette table doit être **refusé** : un écran neuf ne
   devient jamais public par oubli.
4. Lire le cookie `mc_qui` côté serveur (cinq lignes de `next/headers` en
   Next) et poser les cookies avec `domaineCookies(host)`.
5. **Créer sa sitemap `/plan`** — voir la règle ci-dessous. Elle se fait au
   début, pas à la fin : c'est avec elle qu'on parcourt l'outil pour le
   tester pendant qu'on le construit.

Les liens personnels existants fonctionnent immédiatement : l'identité est
déjà posée sur `.marsclub.fr`. Rien à redistribuer.

## La sitemap, obligatoire dans chaque outil

**Règle Roch du 20/08/2026.** Tout outil interne porte une page `/plan` qui
liste **toutes** ses pages, réservée à la **direction** par une capacité
`plan` dédiée — pas en réutilisant `reglages` : on peut vouloir ouvrir la
carte sans ouvrir la mécanique.

Elle est réservée à la direction pour une raison précise : elle donne la
carte complète de l'outil, et les liens personnels qu'elle affiche **sont
des accès** — ouvrir celui de quelqu'un, c'est voir l'outil comme lui.

**Elle liste tout**, en particulier ce qu'aucun menu ne montre : les
téléchargements (PDF, exports CSV), les pages à jeton, les portes
(`/entrer`, la racine, `robots.txt`). Ce sont justement les routes qu'on
oublie de garder et qu'on oublie de tester.

**Rien n'y est écrit en dur** : les liens à jeton se lisent en base, et la
capacité affichée à côté de chaque écran vient de la même grille que la
garde. Une carte qui répète l'information à la main finit par la contredire.

**Et elle se vérifie toute seule.** Un plan tenu à la main se périme au
premier écran ajouté, sans que personne s'en aperçoive : une page absente
n'affiche rien qui manque. Chaque outil porte donc un test qui compare les
routes réellement présentes sur le disque aux chemins cités dans le plan,
**dans les deux sens** — une page oubliée le fait échouer, un chemin cité
qui n'existe plus aussi. Modèle à recopier :
`marsclub-planning/src/app/(admin)/plan/plan.test.ts`.

Ajouter un écran sans l'inscrire au plan casse alors la suite de tests, au
même titre qu'un écran ajouté sans capacité est refusé par la garde. C'est
ce qui fait la différence entre une règle et une intention.

### Deux pièges déjà rencontrés

**La garde du chemin ne protège pas les Server Actions.** Elles sont postées
sur l'URL de la page qui les héberge : quelqu'un ayant droit à `/planning`
atteindrait l'action de publication si celle-ci ne se gardait pas elle-même.
Chaque geste engageant doit exiger sa propre capacité.

**Ne jamais déduire le domaine de `NODE_ENV`** : il vaut « production » dès
qu'on lance un build en local, et le cookie porterait alors un domaine que
`localhost` rejette. `domaineCookies()` lit l'hôte de la requête, c'est fait
pour.

## Ce qu'il ne faut jamais faire

**Recopier ce code dans un outil.** C'est toute la raison de ce dépôt :
dupliquée, la garde diverge, et une correction oubliée quelque part laisse
une porte ouverte que personne ne voit. Le style peut dériver ; la
vérification d'identité, non.

## Où vit l'annuaire

Dans la base d'**Hora** (le planning) : les personnes, leurs jetons, et
l'écran Personnes qui les gère. Les autres outils **ne lisent jamais cette
base pour authentifier** — ils vérifient la signature du cookie. Corollaire
assumé : retirer un niveau prend effet à l'expiration du cookie (sept jours)
ou au prochain passage par le lien personnel.
