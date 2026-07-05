import Navbar from '@/components/Navbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Contenido principal: margen izquierdo en desktop, padding bottom en móvil */}
      <main className="md:ml-60 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
