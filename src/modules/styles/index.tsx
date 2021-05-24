export const sizes = {
  box: 4,
  drawer: 8,
  closet: 12,
  room: 14,
  house: 16,
  street: 24,
  town: 32,
  city: 40,
  state: 48,
  country: 56,
};

export const lightTheme = `
  --sp-color-bg-normal: hsl(0, 0%, 100%);
  --sp-color-bg-base: hsl(240, 20%, 99%);
  --sp-color-bg-accent: hsla(0, 0%, 98%);

  --sp-color-text-normal: hsla(217, 26%, 23%);
  --sp-color-text-masked: hsla(215, 8%, 61%);

  --sp-color-border-normal: hsla(216, 8%, 88%);

  --sp-color-primary-normal: hsl(127, 51%, 47%);
  --sp-color-primary-hover: hsl(127, 51%, 40%);

  --sp-tooltip-border: none;
  --sp-tooltip-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
`;

export const darkTheme = `
  --sp-color-bg-normal: hsl(217, 6%, 19%);
  --sp-color-bg-base: hsl(217, 6%, 15%);
  --sp-color-bg-accent: hsl(217, 6%, 26%);

  --sp-color-text-normal: hsla(217, 26%, 23%);
  --sp-color-text-masked: hsla(215, 8%, 61%);

  --sp-color-border-normal: hsla(216, 8%, 88%);

  --sp-color-primary-normal: hsl(127, 51%, 47%);
  --sp-color-primary-hover: hsl(127, 51%, 40%);

  --sp-tooltip-border: 1px solid var(--sp-color-border-normal);
  --sp-tooltip-shadow: none;
`;

export const autoTheme = `
  ${lightTheme};

  @media (prefers-color-scheme: dark) {
    ${darkTheme};
  }
`;
