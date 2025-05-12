import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Link to the favicon */}
        <link rel="icon" href="/sccicon.webp" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
