/* ==========================================================================
   DRAGON BALL 3D PORTAL — GOOGLE ANALYTICS 4 (GA4) & FIREBASE TELEMETRY
   Loaded as an external script so Content-Security-Policy stays strict
   without 'unsafe-inline' or 'unsafe-eval'.
   ========================================================================== */

(function () {
  'use strict';

  const GA_MEASUREMENT_ID = 'G-KWW7MHLDJE';
  const FIREBASE_APP_ID = '1:697625214430:web:ea413334c49b79f882f14f';
  const PROPERTY_ID = '521061448';
  const PRODUCTION_HOSTS = [
    'dragonball-3d-portal.web.app',
    'dragonball-3d-portal.firebaseapp.com'
  ];

  let initialized = false;

  function initAnalytics() {
    if (typeof window === 'undefined' || initialized) return;
    initialized = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;

    const isProdHost = PRODUCTION_HOSTS.indexOf(window.location.hostname) !== -1;
    const isDebugGa = /[?&]debug_ga=1/.test(window.location.search);
    const privacyOptOut =
      (typeof navigator !== 'undefined' &&
        (navigator.globalPrivacyControl === true ||
          navigator.doNotTrack === '1' ||
          navigator.doNotTrack === 'yes')) ||
      window.doNotTrack === '1';

    if ((!isProdHost && !isDebugGa) || privacyOptOut) {
      window['ga-disable-' + GA_MEASUREMENT_ID] = true;
    }

    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname + window.location.search,
      site_name: 'dragonball-3d-portal',
      firebase_app_id: FIREBASE_APP_ID,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      restricted_data_processing: true,
      ads_data_redaction: true
    });

    window.__dbPortalAnalytics = {
      measurementId: GA_MEASUREMENT_ID,
      firebaseAppId: FIREBASE_APP_ID,
      propertyId: PROPERTY_ID,
      productionHosts: PRODUCTION_HOSTS,
      privacyOptOut: Boolean(privacyOptOut),
      disabledOnLocal: Boolean(window['ga-disable-' + GA_MEASUREMENT_ID])
    };
  }

  function trackEvent(eventName, params) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    try {
      window.gtag('event', eventName, params || {});
    } catch (_e) {
      // Never let telemetry interrupt UI interactions
    }
  }

  initAnalytics();

  window.DB_ANALYTICS = {
    GA_MEASUREMENT_ID,
    FIREBASE_APP_ID,
    trackEvent
  };
})();
