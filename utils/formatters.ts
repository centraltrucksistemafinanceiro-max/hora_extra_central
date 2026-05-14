
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  // Use UTC to avoid timezone shifts for dates only
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const getCurrentDateFormatted = (): string => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return `São Paulo, ${date.toLocaleDateString('pt-BR', options)}`;
};

export const formatTime = (time: string): string => {
    if (!time) return '00:00';
    return time.length === 5 ? `${time}:00` : time;
};
