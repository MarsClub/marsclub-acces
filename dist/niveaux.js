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
/** Du plus large au plus étroit — sert à l'affichage, jamais aux droits. */
export const NIVEAUX = ['direction', 'management', 'equipe'];
export const LIBELLE_NIVEAU = {
    direction: 'Direction',
    management: 'Management',
    equipe: 'Équipe',
};
export function estNiveau(valeur) {
    return valeur === 'direction' || valeur === 'management' || valeur === 'equipe';
}
/**
 * Fabrique la garde d'un outil à partir de sa grille.
 *
 * La grille se lit en diagonale : chaque ligne dit quels niveaux possèdent
 * cette capacité, et l'ensemble tient sur un écran — c'est précisément le
 * but. Un outil dont la grille ne tient plus sur un écran a probablement
 * confondu capacités et écrans.
 */
export function creerGarde(grille) {
    return {
        /** Le seul test de droit de l'outil. */
        peut(niveau, capacite) {
            if (!niveau)
                return false;
            return grille[capacite]?.includes(niveau) ?? false;
        },
        /**
         * Les capacités d'un niveau — pour construire un menu qui ne montre que
         * des portes ouvertes, plutôt que des portes fermées à expliquer.
         */
        capacitesDe(niveau) {
            return Object.keys(grille).filter((c) => grille[c].includes(niveau));
        },
        /** La grille elle-même, en lecture — pour les écrans qui la présentent. */
        grille,
    };
}
