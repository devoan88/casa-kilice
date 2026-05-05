"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean; message?: string };

/**
 * Isolates the Muse portal from client render failures so a broken form or hook
 * does not take down unrelated parts of the app tree beneath this layout.
 */
export class MusePortalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: undefined };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[MusePortalErrorBoundary]", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[color:var(--sand)] px-6 py-20 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-[color:var(--espresso)]">
            Muse portal paused
          </p>
          <p className="max-w-md text-sm text-muted">{this.state.message ?? "Something went wrong in this view."}</p>
          <button
            type="button"
            className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--espresso)] transition-colors hover:border-[color:var(--hermes)]"
            onClick={() => this.setState({ hasError: false, message: undefined })}
          >
            Try again
          </button>
          <a
            href="/"
            className="text-[10px] uppercase tracking-[0.24em] text-muted underline-offset-4 hover:text-[color:var(--hermes)] hover:underline"
          >
            Home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
