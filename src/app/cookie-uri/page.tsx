import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politica de cookie-uri | eShop",
}

export default function CookiePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Politica de cookie-uri</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none text-text/70">
        <p>
          Site-ul folosește numai stocare necesară funcționării. Nu folosim cookie-uri de
          publicitate sau de urmărire către terți.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">Cookie-uri</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Nume</th>
                <th className="py-2 pr-4">Scop</th>
                <th className="py-2 pr-4">Categorie</th>
                <th className="py-2">Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">sb-&lt;proiect&gt;-auth-token</td>
                <td className="py-2 pr-4">Menține sesiunea de autentificare</td>
                <td className="py-2 pr-4">Necesar</td>
                <td className="py-2">Până la deconectare sau expirarea sesiunii</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-6 text-lg font-semibold text-text">Stocare locală</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Cheie</th>
                <th className="py-2 pr-4">Scop</th>
                <th className="py-2 pr-4">Categorie</th>
                <th className="py-2">Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">eshop-cart</td>
                <td className="py-2 pr-4">Păstrează coșul de cumpărături</td>
                <td className="py-2 pr-4">Necesar</td>
                <td className="py-2">Până la golirea coșului sau ștergerea din browser</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">eshop-dark</td>
                <td className="py-2 pr-4">Reține tema luminoasă sau întunecată</td>
                <td className="py-2 pr-4">Necesar</td>
                <td className="py-2">Până la ștergerea din browser</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">eshop-recently-viewed</td>
                <td className="py-2 pr-4">Afișează produsele vizualizate recent</td>
                <td className="py-2 pr-4">Necesar</td>
                <td className="py-2">Până la ștergerea din browser</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-6 text-lg font-semibold text-text">Statistici</h2>
        <p>
          Evenimentele de utilizare (pagini vizitate, adăugări în coș) sunt trimise către
          serverul propriu și nu folosesc cookie-uri sau identificatori permanenți.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">Cum le poți controla</h2>
        <p>
          Poți șterge stocarea locală și cookie-urile din setările browserului. Blocarea
          cookie-urilor necesare împiedică autentificarea și păstrarea coșului.
        </p>

        <p className="mt-8 text-xs text-text/70">Ultima actualizare: Noiembrie 2026</p>
      </div>
    </div>
  )
}
