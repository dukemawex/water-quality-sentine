import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafetyScore from '../components/SafetyScore/SafetyScore';

describe('SafetyScore component', () => {
  it('renders the numeric score', () => {
    render(<SafetyScore score={87.3} rating="Safe" />);
    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('renders the safety rating', () => {
    render(<SafetyScore score={45} rating="Unsafe" />);
    expect(screen.getByText('Unsafe')).toBeInTheDocument();
  });

  it('renders Safe rating with correct label', () => {
    render(<SafetyScore score={95} rating="Safe" />);
    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.getByText('Safety Score')).toBeInTheDocument();
  });

  it('renders dash when score is undefined', () => {
    render(<SafetyScore rating="Unknown" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
