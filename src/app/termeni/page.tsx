import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termeni și Condiții | eShop",
}

export default function TermeniPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Termeni și Condiții</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none text-text/70">
        <h2 className="text-lg font-semibold text-text">1. Introducere</h2>
        <p>
          Acest site este administrat de eShop. Prin accesarea și utilizarea acestui site,
          sunteți de acord cu termenii și condițiile prezentate mai jos.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">2. Contul de utilizator</h2>
        <p>
          Pentru a plasa comenzi, trebuie să vă creați un cont. Sunteți responsabil pentru
          confidențialitatea parolei și pentru toate activitățile care au loc sub contul dumneavoastră.
          Putem suspenda un cont folosit abuziv sau pentru activități ilegale.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">3. Prețuri și comenzi</h2>
        <p>
          Toate prețurile sunt afișate în lei (RON) și includ TVA. Ne rezervăm dreptul de a
          modifica prețurile în orice moment, dar modificările nu afectează comenzile deja plasate.
          Comanda devine fermă după confirmarea ei. Dacă un produs nu mai este disponibil, vă
          contactăm pentru anulare sau înlocuire.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">4. Livrare</h2>
        <p>
          Termenii de livrare variază în funcție de metoda aleasă și sunt afișați înainte de
          plasarea comenzii. eShop nu este responsabil pentru întârzierile cauzate de partenerii
          de curierat.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">5. Dreptul de retragere</h2>
        <p>
          Conform legislației în vigoare, aveți dreptul de a returna produsele în termen de 14
          zile de la primire, fără a fi necesară justificarea. Costul returnării este suportat de
          cumpărător. Produsele trebuie returnate în stare bună, cu ambalajul și accesoriile
          originale. Rambursarea se face în cel mult 14 zile de la primirea returului.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">6. Răspundere</h2>
        <p>
          Ne străduim să afișăm informații corecte, dar nu garantăm că descrierile sau imaginile
          sunt lipsite de erori. Răspunderea noastră este limitată la valoarea comenzii.
          Prezentele limitări nu afectează drepturile legale ale consumatorilor.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">7. Date personale</h2>
        <p>
          Prelucrarea datelor personale se face conform politicii de confidențialitate. Nu
          partajăm datele dumneavoastră cu terțe părți fără un temei legal.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">8. Legea aplicabilă</h2>
        <p>
          Acești termeni sunt guvernați de legea română. Eventualele litigii se soluționează pe
          cale amiabilă sau de instanțele competente din România, fără a limita dreptul
          consumatorului de a se adresa instanței de la domiciliul său.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-text">9. Contact</h2>
        <p>
          Pentru întrebări legate de acești termeni, ne puteți contacta la adresa de email:
          contact@eshop.ro
        </p>

        <p className="mt-8 text-xs text-text/70">
          Ultima actualizare: Noiembrie 2026
        </p>
      </div>
    </div>
  )
}
