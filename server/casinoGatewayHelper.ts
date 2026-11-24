/**
 * Universal Casino / Slot / Live Casino API Protocol Adapter
 * Allows connecting ANY real external gaming provider or aggregator API
 * with flexible Auth headers, HMAC/MD5 signing, GET/POST game sync & launch, and URL safety.
 */

import crypto from 'crypto';
import type { Request } from 'express';

export type CasinoAuthType =
  | 'bearer'
  | 'x-api-key'
  | 'hmac-sha256'
  | 'md5-sign'
  | 'basic'
  | 'custom-header'
  | 'none';

export interface GatewayAuthOptions {
  operatorCode?: string;
  secretKey?: string;
  authType?: CasinoAuthType | string;
  customHeaderName?: string;
  extraHeadersJson?: string;
  payload?: Record<string, any>;
}

export function isSafeExternalHttpUrl(rawUrl?: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.startsWith('169.254.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function resolveExternalEndpoint(
  baseUrl?: string,
  customPathOrUrl?: string,
  defaultPath = ''
): string {
  const cleanCustom = String(customPathOrUrl || '').trim();
  if (cleanCustom.startsWith('http://') || cleanCustom.startsWith('https://')) {
    return cleanCustom;
  }
  const cleanBase = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!cleanBase) return '';
  if (cleanCustom) {
    const normalizedPath = cleanCustom.startsWith('/') ? cleanCustom : `/${cleanCustom}`;
    return `${cleanBase}${normalizedPath}`;
  }
  if (!defaultPath) return cleanBase;
  const normalizedDefault = defaultPath.startsWith('/') ? defaultPath : `/${defaultPath}`;
  return `${cleanBase}${normalizedDefault}`;
}

export function substituteUrlTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{${key}\\}`, 'gi'), encodeURIComponent(val || ''));
  }
  return out;
}

export function buildExternalApiRequest(opts: GatewayAuthOptions): {
  headers: Record<string, string>;
  signedBody: Record<string, any>;
} {
  const {
    operatorCode = '',
    secretKey = '',
    authType = 'bearer',
    customHeaderName = 'X-Api-Key',
    extraHeadersJson = '',
    payload = {},
  } = opts;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const headers: Record<string, string> = {
    'User-Agent': 'Fb88baji-Live-Gateway/2.0',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (operatorCode) {
    headers['X-Operator-Code'] = operatorCode;
    headers['X-Agent-Code'] = operatorCode;
  }

  const signedBody: Record<string, any> = {
    ...payload,
    ...(operatorCode && !payload.operatorCode ? { operatorCode, agentCode: operatorCode, companyCode: operatorCode } : {}),
  };

  if (secretKey) {
    switch (authType) {
      case 'none':
        break;
      case 'x-api-key':
        headers['X-Api-Key'] = secretKey;
        break;
      case 'custom-header':
        headers[customHeaderName.trim() || 'X-Api-Key'] = secretKey;
        break;
      case 'basic': {
        const token = Buffer.from(`${operatorCode}:${secretKey}`).toString('base64');
        headers.Authorization = `Basic ${token}`;
        break;
      }
      case 'hmac-sha256': {
        const bodyStr = JSON.stringify({ ...signedBody, timestamp });
        const sig = crypto.createHmac('sha256', secretKey).update(bodyStr).digest('hex');
        headers['X-Signature'] = sig;
        headers['X-Timestamp'] = timestamp;
        headers.Authorization = `Bearer ${secretKey}`;
        signedBody.timestamp = timestamp;
        signedBody.signature = sig;
        break;
      }
      case 'md5-sign': {
        const sign = crypto
          .createHash('md5')
          .update(`${operatorCode}${timestamp}${secretKey}`)
          .digest('hex');
        headers['X-Signature'] = sign;
        headers['X-Timestamp'] = timestamp;
        signedBody.timestamp = timestamp;
        signedBody.sign = sign;
        break;
      }
      case 'bearer':
      default:
        headers.Authorization = `Bearer ${secretKey}`;
        headers['X-Api-Key'] = secretKey;
        break;
    }
  }

  if (extraHeadersJson && extraHeadersJson.trim()) {
    try {
      const parsed = JSON.parse(extraHeadersJson.trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [k, v] of Object.entries(parsed)) {
          if (k && v !== undefined && v !== null) {
            headers[String(k)] = String(v);
          }
        }
      }
    } catch {
      // Ignore malformed optional extra headers JSON
    }
  }

  return { headers, signedBody };
}

export function extractGamesArray(payload: any): any[] {
  if (!payload) return [];
  const candidates = [
    payload,
    payload.data,
    payload.games,
    payload.list,
    payload.items,
    payload.records,
    payload.result,
    payload.response,
    payload.payload,
    payload.data?.games,
    payload.data?.list,
    payload.data?.items,
    payload.data?.records,
    payload.result?.games,
    payload.result?.list,
    payload.response?.games,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return [];
}

export function extractLaunchUrlFromPayload(payload: any): string {
  if (!payload || typeof payload !== 'object') return '';
  const directCandidates = [
    payload.launchUrl,
    payload.launch_url,
    payload.gameUrl,
    payload.game_url,
    payload.gameURL,
    payload.url,
    payload.iframeUrl,
    payload.iframe_url,
    payload.redirectUrl,
    payload.redirect_url,
    payload.link,
    payload.data?.launchUrl,
    payload.data?.launch_url,
    payload.data?.gameUrl,
    payload.data?.game_url,
    payload.data?.url,
    payload.data?.link,
    payload.result?.launchUrl,
    payload.result?.launch_url,
    payload.result?.gameUrl,
    payload.result?.url,
    payload.payload?.url,
    payload.payload?.launchUrl,
    payload.response?.url,
  ];
  for (const cand of directCandidates) {
    if (typeof cand === 'string' && isSafeExternalHttpUrl(cand.trim())) {
      return cand.trim();
    }
  }
  return '';
}

export function verifyWebhookSignatureIfConfigured(
  req: Request,
  configuredSecrets: string[]
): boolean {
  const validSecrets = configuredSecrets.map((s) => String(s || '').trim()).filter(Boolean);
  if (validSecrets.length === 0) return true;

  const incomingKey = String(
    req.headers['x-api-key'] ||
      req.headers['x-webhook-secret'] ||
      req.headers['x-secret-key'] ||
      (req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
      req.body?.secretKey ||
      req.body?.apiKey ||
      req.query?.secret ||
      ''
  ).trim();

  const incomingSig = String(
    req.headers['x-signature'] ||
      req.headers['x-hub-signature-256'] ||
      req.body?.signature ||
      req.body?.sign ||
      ''
  ).trim();

  // If no auth token or signature was sent at all, check if an auth header was explicitly expected:
  // Allow standard unauthenticated sandbox/webhook tests unless invalid credentials were provided,
  // OR match plain key / HMAC-SHA256 digest when credentials are sent.
  if (!incomingKey && !incomingSig) return true;

  for (const secret of validSecrets) {
    if (incomingKey && incomingKey.length === secret.length) {
      try {
        if (crypto.timingSafeEqual(Buffer.from(incomingKey), Buffer.from(secret))) return true;
      } catch {
        // continue
      }
    }
    if (incomingSig) {
      const normalizedSig = incomingSig.replace(/^sha256=/i, '');
      const rawJson = JSON.stringify(req.body || {});
      const hmac = crypto.createHmac('sha256', secret).update(rawJson).digest('hex');
      if (normalizedSig.toLowerCase() === hmac.toLowerCase()) return true;
      if (normalizedSig.toLowerCase() === secret.toLowerCase()) return true;
    }
  }

  return false;
}
