// /pages/+Head.js
// Environment: server

// import previewImage from './previewImage.jpg'
import favicon from './../assets/icons/favicon.png'
// import iconMobile from './iconMobile.png'

export function Head() {
  return (
    <>
      {/* Icon shown in the browser tab (aka favicon) */}
      <link rel="icon" href={favicon} type="image/svg+xml" />

      {/* Icon shown on mobile homescreens (PWA) */}
      {/* <link rel="apple-touch-icon" href={iconMobile} type="image/svg+xml" /> */}

      {/* Add script tag */}
      {/* <script type="text/javascript" src="https://example.com/some-script.js"></script> */}

      {/* Image shown when sharing on social sites (Twitter, WhatsApp, ...) */}
      {/* <meta property="og:image" content={favicon} /> */}
      {/* More Open Graph tags */}
      <meta property="og:type" content="website" />
      {/* <meta property="article:author" content="https://example.com/author" /> */}

      {/* Settings for search engine crawlers */}
      <meta name="robots" content="index, follow" />

      {/* PWA settings */}
      {/* <meta name="theme-color" content="#00f" /> */}
      {/* <link rel="manifest" href="/manifest.webmanifest" /> */}

      {/* CSP setting */}
      {/* <meta http-equiv="Content-Security-Policy" content="script-src 'self'" /> */}
    </>
  )
}