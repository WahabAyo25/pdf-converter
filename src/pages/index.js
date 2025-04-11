// pages/index.js
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import the component with no SSR
const PDFToWordConverter = dynamic(
  () => import('../components/PDFToWordConverter'),
  { ssr: false }
);

export default function Home() {
  return (
    <div>
      <Head>
        <title>PDF to Word Converter</title>
        <meta name="description" content="Convert PDF files to Word documents easily" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main>
        <PDFToWordConverter />
      </main>
    </div>
  );
}