/**
 * Les trois niveaux de la maison, partagés par tous les outils internes.
 *
 * Décision Roch du 19/08/2026 : les mêmes trois niveaux partout, et des
 * droits qui changent fonction par fonction selon l'outil. C'est cette
 * seconde moitié qui explique la forme de ce fichier — il n'y a AUCUNE
 * grille ici, seulement le moteur qui en fait tourner une.
 *
 * Chaque outil déclare ses propres capacités : `semaine.publier` ne regarde
 * pas Fama, `avis.repondre` ne regarde pas Hora. Personne n'a besoin de lire
 * la grille des autres pour comprendre la sienne.
 */
export type Niveau = 'direction' | 'management' | 'equipe';
/** Du plus large au plus étroit — sert à l'affichage, jamais aux droits. */
export declare const NIVEAUX: readonly Niveau[];
export declare const LIBELLE_NIVEAU: Record<Niveau, string>;
export declare function estNiveau(valeur: unknown): valeur is Niveau;
/**
 * Fabrique la garde d'un outil à partir de sa grille.
 *
 * La grille se lit en diagonale : chaque ligne dit quels niveaux possèdent
 * cette capacité, et l'ensemble tient sur un écran — c'est précisément le
 * but. Un outil dont la grille ne tient plus sur un écran a probablement
 * confondu capacités et écrans.
 */
export declare function creerGarde<C extends string>(grille: Record<C, readonly Niveau[]>): {
    /** Le seul test de droit de l'outil. */
    peut(niveau: Niveau | null | undefined, capacite: C): boolean;
    /**
     * Les capacités d'un niveau — pour construire un menu qui ne montre que
     * des portes ouvertes, plutôt que des portes fermées à expliquer.
     */
    capacitesDe(niveau: Niveau): C[];
    /** La grille elle-même, en lecture — pour les écrans qui la présentent. */
    grille: Record<C, readonly Niveau[]>;
};
