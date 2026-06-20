export function formatCO2(kg: number, precision = 2): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(precision)} t`;
  }
  return `${kg.toFixed(precision)} kg`;
}

export function formatCO2Short(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  if (kg >= 100) return `${Math.round(kg)}kg`;
  return `${kg.toFixed(1)}kg`;
}

export function formatTreeEquivalent(trees: number): string {
  if (trees < 0.1) return '<0.1 trees';
  if (trees >= 1000) return `${(trees / 1000).toFixed(1)}k trees`;
  return `${trees.toFixed(1)} trees`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export function formatPercentage(value: number, includeSign = false): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = includeSign && rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  return {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  }[difficulty];
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  return {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  }[priority];
}
