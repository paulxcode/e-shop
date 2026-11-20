import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
      <p className="mb-6 text-lg text-text/70">Pagina nu a fost găsită</p>
      <Link href="/">
        <Button>Înapoi la magazin</Button>
      </Link>
    </div>
  )
}
