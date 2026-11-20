import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | eShop",
}

export default function ConfidentialitatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Politica de Confidențialitate</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none text-text/70">
        <h2 className="text-lg font-semibold text-text">1. Ce date colectăm</h2>
        <ul>
          <li>Date de cont: nume, adresă de email, număr de telefon și parolă (stocată sub formă de hash de furnizorul de autentificare).</li>
          <li>Date de comandă: produsele comandate, adresa de livrare, telefonul și istoricul comenzilor.</li>
          <li>Conținut creat de tine: recenzii, voturi și lista de produse favorite.</li>
          <li>Date tehnice: pagini vizitate și acțiuni în magazin, înregistrate fără cookie-uri și fără identificatori permanenți.</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-text">2. Temeiul legal</h2>
        <ul>
          <li>Executarea contractului: procesarea și livrarea comenzilor (art. 6 alin. (1) lit. b GDPR).</li>
          <li>Consimțământ: crearea contului și acceptarea termenilor (art. 6 alin. (1) lit. a GDPR).</li>
          <li>Interes legitim: securitatea site-ului și statistici agregate (art. 6 alin. (1) lit. f GDPR).</li>
          <li>Obligație legală: păstrarea documentelor fiscale (art. 6 alin. (1) lit. c GDPR).</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-text">3. Cum folosim datele</h2>
        <p>
          Folosim datele pentru a procesa comenzile, a administra contul, a afișa recenziile și
          lista de favorite și pentru statistici agregate despre utilizarea site-ului. Nu vindem
          datele și nu le folosim pentru publicitate.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">4. Cui divulgăm datele</h2>
        <ul>
          <li>Furnizorul de bază de date și autentificare (Supabase), care găzduiește conturile și comenzile.</li>
          <li>Furnizorul de găzduire al site-ului.</li>
          <li>Curierul, pentru livrarea comenzilor.</li>
        </ul>
        <p>
          Acești furnizori prelucrează datele doar conform instrucțiunilor noastre. Dacă datele sunt
          transferate în afara Spațiului Economic European, transferul se face pe baza clauzelor
          contractuale standard aprobate de Comisia Europeană.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">5. Cât timp păstrăm datele</h2>
        <p>
          Datele contului se păstrează cât timp contul este activ și se șterg la cerere, din pagina
          de cont. Comenzile și documentele fiscale se păstrează conform termenelor legale.
          Recenziile și lista de favorite se șterg odată cu contul. Copiile de siguranță se
          elimină în cel mult 30 de zile.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">6. Drepturile dumneavoastră</h2>
        <p>
          Aveți dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție,
          precum și dreptul de a vă retrage consimțământul. Ștergerea contului se face direct din
          pagina de cont. Pentru celelalte drepturi ne puteți contacta la contact@eshop.ro. Aveți
          dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării
          Datelor cu Caracter Personal (ANSPDCP).
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">7. Cookie-uri</h2>
        <p>
          Folosim doar stocare necesară funcționării: sesiunea de autentificare, coșul, tema și
          produsele vizualizate recent. Nu folosim cookie-uri de publicitate sau de urmărire.
          Detalii în <Link href="/cookie-uri" className="text-primary underline">politica de cookie-uri</Link>.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">8. Securitate</h2>
        <p>
          Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja datele
          dumneavoastră împotriva accesului neautorizat, pierderii sau alterării.
        </p>

        <p className="mt-8 text-xs text-text/70">
          Ultima actualizare: Noiembrie 2026
        </p>
      </div>
    </div>
  )
}
