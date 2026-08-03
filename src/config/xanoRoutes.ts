export class XanoEndpointUnavailableError extends Error {
  code = 'XANO_ENDPOINT_UNAVAILABLE';

  constructor(method: string, path: string) {
    super(`La route ${method.toUpperCase()} ${path} n'existe pas encore dans le groupe API Xano fourni.`);
    this.name = 'XanoEndpointUnavailableError';
  }
}

type RouteRule = { method: string; pattern: RegExp };

/**
 * Liste blanche correspondant exactement aux routes communiquées pour Xano.
 * Elle évite qu'un ancien appel Django/Firebase parte silencieusement vers Xano.
 */
const ROUTES: RouteRule[] = [
  { method: 'GET', pattern: /^\/abacus\/levels$/ },
  { method: 'GET', pattern: /^\/abacus\/levels\/[^/]+\/skills$/ },
  { method: 'POST', pattern: /^\/abacus\/sessions\/start$/ },
  { method: 'POST', pattern: /^\/abacus\/sessions\/[^/]+\/answer$/ },
  { method: 'POST', pattern: /^\/abacus\/sessions\/[^/]+\/finish$/ },
  { method: 'GET', pattern: /^\/admin\/dashboard\/summary$/ },
  { method: 'POST', pattern: /^\/ai\/ask$/ },
  { method: 'POST', pattern: /^\/ai\/ask-image$/ },

  { method: 'POST', pattern: /^\/auth\/login\/password\/$/ },
  { method: 'POST', pattern: /^\/auth\/login\/verify\/$/ },
  { method: 'POST', pattern: /^\/auth\/login\/$/ },
  { method: 'POST', pattern: /^\/auth\/logout\/$/ },
  { method: 'GET', pattern: /^\/auth\/me\/$/ },
  { method: 'PATCH', pattern: /^\/auth\/me\/$/ },
  { method: 'POST', pattern: /^\/auth\/otp\/send\/$/ },
  { method: 'POST', pattern: /^\/auth\/otp\/verify\/$/ },
  { method: 'POST', pattern: /^\/auth\/password\/reset\/request\/$/ },
  { method: 'POST', pattern: /^\/auth\/password\/reset\/confirm\/$/ },
  { method: 'POST', pattern: /^\/auth\/register\/$/ },
  { method: 'POST', pattern: /^\/auth\/register\/(eleve|parent|student|tutor|vendor)\/$/ },
  { method: 'POST', pattern: /^\/auth\/token\/refresh\/$/ },
  { method: 'GET', pattern: /^\/auth\/devices\/$/ },
  { method: 'DELETE', pattern: /^\/auth\/devices\/[^/]+\/$/ },
  { method: 'GET', pattern: /^\/auth\/users\/?$/ },
  { method: 'POST', pattern: /^\/auth\/users\/?$/ },
  { method: 'GET', pattern: /^\/auth\/users\/[^/]+\/?$/ },
  { method: 'PATCH', pattern: /^\/auth\/users\/[^/]+\/?$/ },
  { method: 'DELETE', pattern: /^\/auth\/users\/[^/]+\/?$/ },
  { method: 'POST', pattern: /^\/admin\/users\/[^/]+\/(activate|suspend|restore)\/?$/ },
  { method: 'GET', pattern: /^\/admin\/users\/[^/]+\/activity\/?$/ },
  { method: 'GET', pattern: /^\/auth\/wallet\/$/ },
  { method: 'POST', pattern: /^\/auth\/wallet\/admin-add\/$/ },

  { method: 'GET', pattern: /^\/chat\/conversations$/ },
  { method: 'POST', pattern: /^\/chat\/conversations\/[^/]+\/messages$/ },
  { method: 'GET', pattern: /^\/content\/news\/$/ },
  { method: 'POST', pattern: /^\/content\/news\/?$/ },
  { method: 'GET', pattern: /^\/content\/news\/[^/]+\/?$/ },
  { method: 'PATCH', pattern: /^\/content\/news\/[^/]+\/?$/ },
  { method: 'DELETE', pattern: /^\/content\/news\/[^/]+\/?$/ },
  { method: 'POST', pattern: /^\/content\/news\/[^/]+\/(publish|unpublish|restore)\/?$/ },
  { method: 'GET', pattern: /^\/content\/scholarships\/$/ },
  { method: 'POST', pattern: /^\/content\/scholarships\/?$/ },
  { method: 'GET', pattern: /^\/content\/scholarships\/[^/]+\/?$/ },
  { method: 'PATCH', pattern: /^\/content\/scholarships\/[^/]+\/?$/ },
  { method: 'DELETE', pattern: /^\/content\/scholarships\/[^/]+\/?$/ },
  { method: 'POST', pattern: /^\/content\/scholarships\/[^/]+\/(publish|unpublish|restore)\/?$/ },
  { method: 'GET', pattern: /^\/content\/school-rankings\/$/ },
  { method: 'POST', pattern: /^\/content\/school-rankings\/?$/ },
  { method: 'POST', pattern: /^\/content\/school-rankings\/import\/?$/ },
  { method: 'GET', pattern: /^\/content\/school-rankings\/[^/]+\/?$/ },
  { method: 'PATCH', pattern: /^\/content\/school-rankings\/[^/]+\/?$/ },
  { method: 'DELETE', pattern: /^\/content\/school-rankings\/[^/]+\/?$/ },
  { method: 'POST', pattern: /^\/content\/school-rankings\/[^/]+\/(publish|unpublish|restore)\/?$/ },
  { method: 'GET', pattern: /^\/admin\/school-rankings\/export\/?$/ },
  { method: 'GET', pattern: /^\/content\/notifications$/ },
  { method: 'POST', pattern: /^\/content\/reading-progress\/[^/]+\/$/ },
  { method: 'POST', pattern: /^\/content\/tutor-ads$/ },
  { method: 'POST', pattern: /^\/message\/send_welcome_email$/ },
  { method: 'GET', pattern: /^\/logs\/user\/my_events$/ },

  { method: 'POST', pattern: /^\/ecole\/login\/$/ },
  { method: 'GET', pattern: /^\/ecole\/schools$/ },
  { method: 'POST', pattern: /^\/ecole\/schools$/ },
  { method: 'GET', pattern: /^\/ecole\/schools\/[^/]+$/ },
  { method: 'PATCH', pattern: /^\/ecole\/schools\/[^/]+$/ },
  { method: 'DELETE', pattern: /^\/ecole\/schools\/[^/]+$/ },
  { method: 'POST', pattern: /^\/ecole\/schools\/[^/]+\/(approve|suspend|restore)$/ },
  { method: 'GET', pattern: /^\/ecole\/schools\/[^/]+\/students$/ },
  { method: 'POST', pattern: /^\/ecole\/schools\/[^/]+\/students$/ },
  { method: 'GET', pattern: /^\/ecole\/classes$/ },
  { method: 'POST', pattern: /^\/ecole\/classes$/ },
  { method: 'GET', pattern: /^\/ecole\/classes\/[^/]+$/ },
  { method: 'PATCH', pattern: /^\/ecole\/classes\/[^/]+$/ },
  { method: 'DELETE', pattern: /^\/ecole\/classes\/[^/]+$/ },
  { method: 'POST', pattern: /^\/ecole\/classes\/[^/]+\/restore$/ },
  { method: 'GET', pattern: /^\/ecole\/students\/[^/]+$/ },
  { method: 'PATCH', pattern: /^\/ecole\/students\/[^/]+$/ },
  { method: 'DELETE', pattern: /^\/ecole\/students\/[^/]+$/ },
  { method: 'POST', pattern: /^\/ecole\/students\/[^/]+\/restore$/ },
  { method: 'POST', pattern: /^\/ecole\/students\/import$/ },
  { method: 'GET', pattern: /^\/ecole\/students\/export$/ },
  { method: 'GET', pattern: /^\/ecole\/teachers$/ },
  { method: 'POST', pattern: /^\/ecole\/teachers$/ },
  { method: 'GET', pattern: /^\/ecole\/teachers\/[^/]+$/ },
  { method: 'PATCH', pattern: /^\/ecole\/teachers\/[^/]+$/ },
  { method: 'DELETE', pattern: /^\/ecole\/teachers\/[^/]+$/ },
  { method: 'POST', pattern: /^\/ecole\/teachers\/[^/]+\/(restore|assign-classes)$/ },
  { method: 'POST', pattern: /^\/ecole\/grades$/ },
  { method: 'POST', pattern: /^\/exercises\/start$/ },
  { method: 'POST', pattern: /^\/exercises\/[^/]+\/submit$/ },

  { method: 'GET', pattern: /^\/learning\/documents\/$/ },
  { method: 'GET', pattern: /^\/learning\/documents\/[^/]+\/$/ },
  { method: 'POST', pattern: /^\/learning\/documents\/?$/ },
  { method: 'PATCH', pattern: /^\/learning\/documents\/[^/]+\/?$/ },
  { method: 'DELETE', pattern: /^\/learning\/documents\/[^/]+\/?$/ },
  { method: 'POST', pattern: /^\/learning\/documents\/[^/]+\/(publish|unpublish|restore)\/?$/ },
  { method: 'GET', pattern: /^\/learning\/subjects\/$/ },
  { method: 'POST', pattern: /^\/learning\/subjects\/?$/ },
  { method: 'GET', pattern: /^\/learning\/subjects\/[^/]+\/?$/ },
  { method: 'PATCH', pattern: /^\/learning\/subjects\/[^/]+\/?$/ },
  { method: 'DELETE', pattern: /^\/learning\/subjects\/[^/]+\/?$/ },
  { method: 'POST', pattern: /^\/learning\/subjects\/[^/]+\/(activate|deactivate|restore)\/?$/ },
  { method: 'GET', pattern: /^\/marketplace\/products\/$/ },
  { method: 'POST', pattern: /^\/marketplace\/orders\/redeem$/ },
  { method: 'GET', pattern: /^\/payments\/plans\/$/ },
  { method: 'POST', pattern: /^\/payments\/checkout\/initiate$/ },
  { method: 'GET', pattern: /^\/payments\/transactions\/[^/]+\/status$/ },
  { method: 'GET', pattern: /^\/results\/$/ },
  { method: 'POST', pattern: /^\/results\/import\/$/ },
  { method: 'GET', pattern: /^\/search\/$/ },
  { method: 'POST', pattern: /^\/support\/tickets$/ },
];

export function isAllowedXanoRoute(method = 'GET', rawUrl = ''): boolean {
  const path = rawUrl.split('?')[0] || '/';
  return ROUTES.some(rule => rule.method === method.toUpperCase() && rule.pattern.test(path));
}

export function unsupportedXanoEndpoint(feature: string): never {
  throw new Error(`${feature} : la route correspondante n'est pas encore disponible dans Xano.`);
}
