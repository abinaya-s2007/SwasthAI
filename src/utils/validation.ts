export const isValidPhoneOrEmail = (value: string) => {
  const input = value.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const phone = /^\+?[\d\s()-]{7,20}$/.test(input) && input.replace(/\D/g, '').length >= 7;
  return email || phone;
};

export const isValidPhone = (value: string) =>
  /^\+?[\d\s()-]{7,20}$/.test(value.trim()) && value.replace(/\D/g, '').length >= 7;

export const isValidDateOfBirth = (value: string) => {
  const match = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(value.trim());
  if (!match) return false;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText), month = Number(monthText), year = Number(yearText);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date < new Date();
};
