/**
 * Qui entre, et à quel niveau — le cœur partagé de tous les outils.
 *
 * Ce fichier est la seule raison d'être de ce dépôt. Dupliqué dans chaque
 * outil, il aurait divergé : une correction appliquée ici et pas là, et la
 * porte reste ouverte quelque part sans que personne ne le voie. Le style,
 * on peut se permettre de le laisser dériver ; la vérification d'identité,
 * non.
 *
 * Le contenu du cookie est SIGNÉ, jamais chiffré : il n'y a rien de secret
 * dans « telle personne, niveau management » — ce qu'il faut, c'est que
 * personne ne puisse le fabriquer.
 *
 * Aucune dépendance : ni framework, ni base de données. Web Crypto suffit,
 * et se trouve partout — Node, l'Edge, le navigateur. Un outil qui n'est pas
 * en Next peut s'en servir tel quel.
 */
import { type Niveau } from './niveaux.js';
/**
 * Durée de vie du cookie d'identité : sept jours. Assez long pour ne pas
 * redemander le lien à chaque service, assez court pour qu'un départ ne
 * laisse pas un accès ouvert des mois.
 */
export declare const DUREE_IDENTITE_S: number;
export interface Identite {
    personneId: string;
    niveau: Niveau;
}
/** Comparaison à temps constant — la durée d'un test ne renseigne sur rien. */
export declare function memeChaine(a: string, b: string): boolean;
/** La valeur à poser dans le cookie : `personneId.niveau.émisLe.signature`. */
export declare function signerIdentite(identite: Identite, secret: string, emisLe: number): Promise<string>;
/**
 * L'identité portée par un cookie, ou null s'il est absent, malformé, mal
 * signé ou périmé. Un seul point de sortie pour tous les échecs : un cookie
 * douteux n'est jamais « à moitié » valide.
 */
export declare function lireIdentite(valeur: string | undefined | null, secret: string, maintenant: number): Promise<Identite | null>;
/**
 * Empreinte d'un secret : c'est elle qui voyage dans le cookie de seconde
 * barrière, jamais le secret lui-même — un cookie volé ne rend pas le mot
 * de passe de la maison.
 */
export declare function empreinte(secret: string): Promise<string>;
/**
 * Toutes les valeurs portées par un cookie d'un nom donné, dans l'en-tête brut.
 *
 * ⚠️ **Un navigateur peut en porter PLUSIEURS du même nom** — c'est le piège
 * du 22/08/2026. Une identité posée sans domaine (attachée à
 * `planning.marsclub.fr`) et une autre posée sur `.marsclub.fr` coexistent :
 * les deux partent dans la requête, et l'API standard n'en rend qu'une, la
 * première. Résultat vécu : suivre le lien personnel de quelqu'un d'autre
 * laissait identifié comme soi-même, sans le moindre signe.
 *
 * On ne peut pas compter sur l'effacement pour s'en sortir : poser et effacer
 * un cookie du même nom dans une seule réponse s'annulent l'un l'autre.
 */
export declare function valeursDuCookie(entete: string | null | undefined, nom: string): string[];
/**
 * L'identité la PLUS RÉCEMMENT posée parmi celles que porte la requête.
 *
 * C'est la seule lecture sûre quand plusieurs cookies du même nom coexistent :
 * le dernier lien suivi doit l'emporter, sinon un cookie fantôme fige
 * l'identité de quelqu'un d'autre. La fraîcheur se lit dans la valeur signée
 * elle-même, donc elle n'est pas falsifiable sans le secret.
 */
export declare function lireIdentiteLaPlusRecente(entete: string | null | undefined, nom: string, secret: string, maintenant: number): Promise<Identite | null>;
