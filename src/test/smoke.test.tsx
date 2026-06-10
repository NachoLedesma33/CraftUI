import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { StatusBar } from '@/components/ui/StatusBar';

describe('Smoke tests', () => {
  it('renders StatusBar without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <StatusBar mousePosition={null} />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  it('displays component count in StatusBar', () => {
    render(
      <ThemeProvider>
        <StatusBar mousePosition={null} />
      </ThemeProvider>
    );
    expect(screen.getByText(/Components:/)).toBeInTheDocument();
  });

  it('renders with mouse position', () => {
    render(
      <ThemeProvider>
        <StatusBar mousePosition={{ x: 100, y: 200 }} />
      </ThemeProvider>
    );
    expect(screen.getByText(/X:/)).toBeInTheDocument();
  });
});
