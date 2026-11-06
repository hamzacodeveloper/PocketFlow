export const monthNamesEn = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const monthNamesUr = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
];

export function getMonthName(monthKey: string, lang: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const idx = month - 1;
  return lang === 'ur' ? `${monthNamesUr[idx]} ${year}` : `${monthNamesEn[idx]} ${year}`;
}
