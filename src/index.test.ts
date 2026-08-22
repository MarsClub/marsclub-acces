import { describe, expect, it } from 'vitest'
import {
  COOKIE_QUI,
  DUREE_IDENTITE_S,
  creerGarde,
  domaineCookies,
  empreinte,
  estJeton,
  estNiveau,
  lireIdentite,
  lireIdentiteLaPlusRecente,
  valeursDuCookie,
  signerIdentite,
  type Niveau,
} from './index.js'

const SECRET = 'secret-de-la-maison-pour-les-tests'
const QUAND = 1_787_000_000_000
const MOI = { personneId: '57408685-c21c-405c-8b86-5cb6a6dc6e91', niveau: 'management' as const }

describe('l’identité portée par le cookie', () => {
  it('se relit telle qu’elle a été signée', async () => {
    const cookie = await signerIdentite(MOI, SECRET, QUAND)
    expect(await lireIdentite(cookie, SECRET, QUAND + 1000)).toEqual(MOI)
  })

  it('refuse un niveau relevé à la main', async () => {
    const cookie = await signerIdentite(MOI, SECRET, QUAND)
    expect(await lireIdentite(cookie.replace('management', 'direction!'), SECRET, QUAND + 1000)).toBe(null)
  })

  it('refuse la signature d’un autre secret', async () => {
    const cookie = await signerIdentite(MOI, SECRET, QUAND)
    expect(await lireIdentite(cookie, 'un-autre-secret', QUAND + 1000)).toBe(null)
  })

  it('refuse un cookie périmé, ou daté du futur', async () => {
    const cookie = await signerIdentite(MOI, SECRET, QUAND)
    expect(await lireIdentite(cookie, SECRET, QUAND + DUREE_IDENTITE_S * 1000 + 1)).toBe(null)
    expect(await lireIdentite(cookie, SECRET, QUAND + DUREE_IDENTITE_S * 1000 - 1)).toEqual(MOI)
    // Une horloge qui saute ne doit pas prolonger un accès.
    const futur = await signerIdentite(MOI, SECRET, QUAND + 3_600_000)
    expect(await lireIdentite(futur, SECRET, QUAND)).toBe(null)
  })

  it('refuse l’absence, le vide et les formes bancales', async () => {
    for (const v of [undefined, null, '', 'nimporte', 'a.b.c', 'a.b.c.d.e', '..0.x']) {
      expect(await lireIdentite(v, SECRET, QUAND)).toBe(null)
    }
  })

  it('refuse un niveau qui n’existe pas, même correctement signé', async () => {
    const cookie = await signerIdentite(
      { personneId: MOI.personneId, niveau: 'patron' as never },
      SECRET,
      QUAND,
    )
    expect(await lireIdentite(cookie, SECRET, QUAND + 1000)).toBe(null)
  })

  it('l’empreinte ne transporte jamais le secret', async () => {
    const e = await empreinte('la-cantine-des-phoceens')
    expect(e).toHaveLength(64)
    expect(e).not.toContain('cantine')
  })
})

describe('la garde d’un outil', () => {
  // Une grille d'exemple : celle de Fama pourrait ressembler à ceci.
  const garde = creerGarde({
    'avis.lire': ['direction', 'management'],
    'avis.repondre': ['direction', 'management'],
    'avis.demander': ['direction'],
    'reglages': ['direction'],
  } as const satisfies Record<string, readonly Niveau[]>)

  it('répond selon la grille de CET outil', () => {
    expect(garde.peut('management', 'avis.repondre')).toBe(true)
    expect(garde.peut('management', 'avis.demander')).toBe(false)
    expect(garde.peut('equipe', 'avis.lire')).toBe(false)
  })

  it('sans niveau, aucune capacité', () => {
    expect(garde.peut(null, 'avis.lire')).toBe(false)
    expect(garde.peut(undefined, 'avis.lire')).toBe(false)
  })

  it('liste ce qu’un niveau peut, pour bâtir un menu sans porte fermée', () => {
    expect(garde.capacitesDe('management')).toEqual(['avis.lire', 'avis.repondre'])
    expect(garde.capacitesDe('equipe')).toEqual([])
  })

  it('reconnaît les trois niveaux, et rien d’autre', () => {
    expect(estNiveau('direction')).toBe(true)
    expect(estNiveau('patron')).toBe(false)
    expect(estNiveau(null)).toBe(false)
  })
})

describe('les cookies communs', () => {
  it('portent le même nom partout — c’est ce qui les rend partagés', () => {
    expect(COOKIE_QUI).toBe('mc_qui')
  })

  it('couvrent toute la maison depuis le vrai domaine', () => {
    expect(domaineCookies('planning.marsclub.fr')).toBe('.marsclub.fr')
    expect(domaineCookies('fama.marsclub.fr')).toBe('.marsclub.fr')
    expect(domaineCookies('marsclub.fr')).toBe('.marsclub.fr')
  })

  it('ne posent rien ailleurs — localhost et préversions rejetteraient un domaine étranger', () => {
    expect(domaineCookies('localhost:3010')).toBe(undefined)
    expect(domaineCookies('fama-git-staging.vercel.app')).toBe(undefined)
    expect(domaineCookies(null)).toBe(undefined)
  })

  it('ne se laissent pas prendre par un domaine qui imite le nôtre', () => {
    expect(domaineCookies('pasmarsclub.fr')).toBe(undefined)
    expect(domaineCookies('marsclub.fr.attaquant.com')).toBe(undefined)
  })

  it('valident la forme d’un jeton avant toute lecture en base', () => {
    expect(estJeton('57408685-c21c-405c-8b86-5cb6a6dc6e91')).toBe(true)
    expect(estJeton('devine')).toBe(false)
  })
})

describe('le cookie fantôme (22/08/2026)', () => {
  it('un navigateur peut porter deux cookies du même nom', () => {
    expect(valeursDuCookie('mc_qui=aaa; autre=x; mc_qui=bbb', 'mc_qui')).toEqual(['aaa', 'bbb'])
    expect(valeursDuCookie('', 'mc_qui')).toEqual([])
    expect(valeursDuCookie(null, 'mc_qui')).toEqual([])
  })

  it('c’est le dernier lien suivi qui l’emporte, pas le premier cookie', async () => {
    // Le cas vécu : une identité ancienne posée sans domaine masquait celle
    // que venait de poser un lien personnel. Le plus récent doit gagner.
    const ancien = await signerIdentite(MOI, SECRET, QUAND)
    const autre = { personneId: 'c1c1c1c1-2222-3333-4444-555555555555', niveau: 'equipe' as const }
    const recent = await signerIdentite(autre, SECRET, QUAND + 60_000)
    const lu = await lireIdentiteLaPlusRecente(
      `mc_qui=${ancien}; mc_qui=${recent}`,
      'mc_qui',
      SECRET,
      QUAND + 120_000,
    )
    expect(lu).toEqual(autre)
  })

  it('ignore une valeur mal signée sans se laisser distraire', async () => {
    const bon = await signerIdentite(MOI, SECRET, QUAND)
    const lu = await lireIdentiteLaPlusRecente(
      `mc_qui=nimportequoi; mc_qui=${bon}`,
      'mc_qui',
      SECRET,
      QUAND + 1000,
    )
    expect(lu).toEqual(MOI)
  })

  it('rend null quand aucune valeur ne tient', async () => {
    expect(await lireIdentiteLaPlusRecente('mc_qui=faux', 'mc_qui', SECRET, QUAND)).toBe(null)
  })
})
