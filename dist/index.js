/**
 * Identité et droits partagés des outils internes Mārs Clūb.
 *
 * Un seul exemplaire de la garde pour Hora, Fama et les suivants : dupliquée,
 * elle aurait divergé, et une correction oubliée quelque part laisse une
 * porte ouverte que personne ne voit.
 *
 * Ce que ce paquet NE contient pas, volontairement : la grille de capacités
 * de chaque outil, ses chemins gardés, son middleware, et l'annuaire des
 * personnes — qui vit dans la base d'Hora. Chacun garde ce qui lui est propre.
 */
export { NIVEAUX, LIBELLE_NIVEAU, creerGarde, estNiveau, } from './niveaux.js';
export { DUREE_IDENTITE_S, empreinte, lireIdentite, lireIdentiteLaPlusRecente, memeChaine, signerIdentite, valeursDuCookie, } from './identite.js';
export { COOKIE_ACCES, COOKIE_QUI, domaineCookies, estJeton } from './cookies.js';
