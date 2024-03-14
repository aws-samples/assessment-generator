export const titlise = (input: string) => {
  return input
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

export const optionise = (value: string) => ({ value });
