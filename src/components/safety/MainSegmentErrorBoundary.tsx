"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean; message?: string };

/**
 * Catches client-side render errors in the main segment so a broken child route
 * does not blank the entire chrome (header/footer stay mounted above this tree).
 */
export class MainSegmentErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: undefined };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[MainSegmentErrorBoundary]", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-[color:var(--espresso)]">
            This view could not be displayed.
          </p>
          <p className="text-sm text-muted">{this.state.message ?? "An unexpected error occurred."}</p>
          <button
            type="button"
            className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-6 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground transition-colors hover:border-[color:var(--hermes)]"
            onClick={() => this.setState({ hasError: false, message: undefined })}
          >
            Try again
          </button>
          <a
            href="/"
            className="text-xs uppercase tracking-[0.24em] text-muted underline-offset-4 hover:text-[color:var(--hermes)] hover:underline"
          >
            Home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
