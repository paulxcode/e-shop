import Link from "next/link"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">Magazin</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/produse" className="text-sm text-gray-400 hover:text-white">Toate produsele</Link>
              <Link href="/produse?sort=noutate" className="text-sm text-gray-400 hover:text-white">Noutăți</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">Cont</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/cont" className="text-sm text-gray-400 hover:text-white">Profilul meu</Link>
              <Link href="/comenzi" className="text-sm text-gray-400 hover:text-white">Comenzile mele</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">Asistență</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/termeni" className="text-sm text-gray-400 hover:text-white">Termeni și condiții</Link>
              <Link href="/confidentialitate" className="text-sm text-gray-400 hover:text-white">Confidențialitate</Link>
              <Link href="/cookie-uri" className="text-sm text-gray-400 hover:text-white">Cookie-uri</Link>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400">
          <p>&copy; {year} eShop. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  )
}
