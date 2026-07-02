import Hero from './components/Hero'
import About from './components/About'
import Work from './components/Work'
import Footer from './components/Footer'

export default function App() {
  return (
    <main className="min-h-screen bg-[#140d09]">
      <Hero />
      <About />
      <Work />
      <Footer />
    </main>
  )
}
