"use client"

import { Component, type ReactNode } from "react"
import { Button } from "./Button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h2 className="mb-2 text-xl font-bold text-text">A apărut o eroare</h2>
          <p className="mb-4 text-sm text-text/70">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>Reîncarcă pagina</Button>
        </div>
      )
    }
    return this.props.children
  }
}
