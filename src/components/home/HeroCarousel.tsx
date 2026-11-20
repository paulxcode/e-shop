"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CarouselSlide } from "@/lib/types"

interface Props {
  slides: CarouselSlide[]
}

export function HeroCarousel({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const active = slides.filter((s) => s.is_active)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % active.length)
  }, [active.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + active.length) % active.length)
  }, [active.length])

  useEffect(() => {
    if (isPaused || active.length <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [isPaused, active.length, next])

  if (active.length === 0) return null

  const slide = active[current]

  const resolvedHref = (s: CarouselSlide): string => {
    if (s.link_type === "category") return `/produse?categorie=${s.link_value}`
    if (s.link_type === "product") return `/produse/${s.link_value}`
    return s.link_value
  }

  const isExternal = slide.link_type === "custom"
  const Wrapper = isExternal ? "a" : Link

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-6 border-b border-border">
      <div
        className="relative h-[400px] overflow-hidden rounded-xl md:h-[500px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      {active.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== current}
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${s.image_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {i === current && (
            <Wrapper
              href={resolvedHref(s)}
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="mx-auto max-w-2xl px-4 text-center text-white">
                <h1 className="mb-2 text-3xl font-bold md:text-5xl">{s.title}</h1>
                {s.subtitle && (
                  <p className="mb-4 text-lg text-white/80 md:text-xl">{s.subtitle}</p>
                )}
                {s.button_text && (
                  <span className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                    {s.button_text}
                  </span>
                )}
              </div>
            </Wrapper>
          )}
        </div>
      ))}

      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Slide următor"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </section>
  )
}
