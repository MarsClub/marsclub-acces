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
import { estNiveau, type Niveau } from './niveaux.js'

/**
 * Durée de vie du cookie d'identité : sept jours. Assez long pour ne pas
 * redemander le lien à chaque service, assez court pour qu'un départ ne
 * laisse pas un accès ouvert des mois.
 */
export const DUREE_IDENTITE_S = 60 * 60 * 24 * 7

export interface Identite {
  personneId: string
  niveau: Niveau
}

async function cle(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function versBase64Url(octets: ArrayBuffer): string {
  let binaire = ''
  for (const o of new Uint8Array(octets)) binaire += String.fromCharCode(o)
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Comparaison à temps constant — la durée d'un test ne renseigne sur rien. */
export function memeChaine(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let ecart = 0
  for (let i = 0; i < a.length; i++) ecart |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return ecart === 0
}

/** La valeur à poser dans le cookie : `personneId.niveau.émisLe.signature`. */
export async function signerIdentite(
  identite: Identite,
  secret: string,
  emisLe: number,
): Promise<string> {
  const corps = `${identite.personneId}.${identite.niveau}.${emisLe}`
  const signature = await crypto.subtle.sign('HMAC', await cle(secret), new TextEncoder().encode(corps))
  return `${corps}.${versBase64Url(signature)}`
}

/**
 * L'identité portée par un cookie, ou null s'il est absent, malformé, mal
 * signé ou périmé. Un seul point de sortie pour tous les échecs : un cookie
 * douteux n'est jamais « à moitié » valide.
 */
export async function lireIdentite(
  valeur: string | undefined | null,
  secret: string,
  maintenant: number,
): Promise<Identite | null> {
  if (!valeur) return null
  const morceaux = valeur.split('.')
  if (morceaux.length !== 4) return null
  const [personneId, niveau, emisLeTexte] = morceaux
  if (!personneId || !niveau || !emisLeTexte) return null

  if (!estNiveau(niveau)) return null
  const emisLe = Number(emisLeTexte)
  if (!Number.isFinite(emisLe)) return null
  // Périmé, ou daté du futur — une horloge qui saute ne doit pas prolonger
  // un accès.
  if (maintenant - emisLe > DUREE_IDENTITE_S * 1000 || emisLe > maintenant + 60_000) return null

  const attendu = await signerIdentite({ personneId, niveau }, secret, emisLe)
  if (!memeChaine(attendu, valeur)) return null

  return { personneId, niveau }
}

/**
 * Empreinte d'un secret : c'est elle qui voyage dans le cookie de seconde
 * barrière, jamais le secret lui-même — un cookie volé ne rend pas le mot
 * de passe de la maison.
 */
export async function empreinte(secret: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return Array.from(new Uint8Array(octets))
    .map((o) => o.toString(16).padStart(2, '0'))
    .join('')
}
