import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../brand-share/components/NavBar.css'
import '../brand-share/components/AnalysisTabs.css'
import '../brand-share/components/BrandHeader.css'
import '../brand-share/components/HeroTile.css'
import FloatingActionButton from '../components/FloatingActionButton'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <FloatingActionButton />
    </>
  )
}
