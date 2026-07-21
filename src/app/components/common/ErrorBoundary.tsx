import React from "react";

interface Props extends React.PropsWithChildren {
  fallback?: React.ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Visual module failed", error);
  }

  componentDidUpdate(previousProps: Props) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-[260px] items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
          <div>
            <h2 className="font-manrope text-xl font-bold text-[var(--color-text-main)]">This visual module paused safely.</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">A static fallback is available while the page remains usable.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
