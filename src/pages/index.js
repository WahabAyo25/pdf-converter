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
        <title>EFCC PDF to Word Converter</title>
        <meta name="description" content="Convert PDF files to Word documents for EFCC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <PDFToWordConverter />
      </main>
    </div>
  );
}