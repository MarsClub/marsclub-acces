/**
 * Les cookies d'entrée, communs à tous les outils de la maison.
 *
 * Leurs noms sont partagés pour que l'identité posée par un outil soit
 * reconnue par les autres : c'est tout l'objet du domaine commun.
 */

/** Qui entre, et à quel niveau. Posé par le lien personnel. */
export const COOKIE_QUI = 'mc_qui'

/** Le secret de la maison — seconde barrière de la direction. */
export const COOKIE_ACCES = 'mc_acces'

const MAISON = 'marsclub.fr'

/**
 * Le domaine à donner aux cookies, déduit de l'HÔTE de la requête.
 *
 * Jamais de `NODE_ENV` : il vaut « production » dès qu'on lance un build en
 * local, et le cookie porterait alors un domaine que `localhost` rejette —
 * l'outil devient inutilisable hors ligne, et sur les préversions en
 * `*.vercel.app` aussi. Constaté le 19/08/2026, avant que ça n'atteigne la
 * production.
 *
 * Sur le vrai domaine, le cookie vaut pour tous les sous-domaines : Hora,
 * Fama, et les suivants. Contrepartie assumée : il part aussi vers le site
 * public, qui ne le lit pas.
 */
export function domaineCookies(hote: string | null | undefined): string | undefined {
  if (!hote) return undefined
  const sansPort = hote.split(':')[0]?.toLowerCase()
  if (!sansPort) return undefined
  return sansPort === MAISON || sansPort.endsWith(`.${MAISON}`) ? `.${MAISON}` : undefined
}

/**
 * Les jetons sont des uuid v4 — 122 bits d'aléa, jamais devinables. Partagé
 * parce que chaque outil qui accepte un lien doit valider sa forme avant de
 * toucher à la base.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function estJeton(valeur: string): boolean {
  return UUID.test(valeur)
}
