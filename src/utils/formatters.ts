import i18n from '../i18n';

/**
 * Sayıları dile göre formatlar
 *
 * @param num - Formatlanacak sayı
 * @param decimals - Ondalık basamak sayısı (varsayılan: 2)
 * @returns Formatlanmış sayı string olarak
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Para birimi sembolü ile birlikte sayıyı formatlar
 */
export const formatCurrency = (
  num: number,
  currencySymbol: string,
  decimals: number = 2
): string => {
  return `${currencySymbol}${formatNumber(num, decimals)}`;
};

/**
 * Büyük sayıları kısaltılmış formatta gösterir
 */
export const formatNumberAbbreviated = (num: number): string => {
  const isTr = i18n.language === 'tr';
  const locale = isTr ? 'tr-TR' : 'en-US';
  
  if (num >= 1000000000) {
    const label = isTr ? 'Mlr' : 'B';
    return `${(num / 1000000000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${label}`;
  } else if (num >= 1000000) {
    const label = isTr ? 'Mn' : 'M';
    return `${(num / 1000000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${label}`;
  } else if (num >= 1000) {
    const label = isTr ? 'B' : 'K';
    return `${(num / 1000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${label}`;
  }
  return num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

/**
 * Para birimi ile birlikte büyük sayıları kısaltılmış formatta gösterir
 *
 * @param num - Formatlanacak sayı
 * @param currencySymbol - Para birimi sembolü (₺, $, €, vb.)
 * @returns Kısaltılmış formatlanmış para birimi string'i
 *
 * @example
 * formatCurrencyAbbreviated(1500000000, '₺') // "₺1,5Mlr"
 * formatCurrencyAbbreviated(1500000, '₺') // "₺1,5Mn"
 * formatCurrencyAbbreviated(2500, '₺') // "₺2,5B"
 */
export const formatCurrencyAbbreviated = (num: number, currencySymbol: string): string => {
  return `${currencySymbol}${formatNumberAbbreviated(num)}`;
};

/**
 * Para birimi ile akıllı formatlama - büyük sayılar için kısaltma, küçük sayılar için tam format
 *
 * @param num - Formatlanacak sayı
 * @param currencySymbol - Para birimi sembolü (₺, $, €, vb.)
 * @param threshold - Kısaltma başlangıç eşiği (varsayılan: 100000)
 * @returns Formatlanmış para birimi string'i
 *
 * @example
 * formatCurrencySmart(1500000, '₺') // "₺1,5Mn"
 * formatCurrencySmart(50000, '₺') // "₺50.000,00"
 */
export const formatCurrencySmart = (
  num: number,
  currencySymbol: string,
  threshold: number = 100000
): string => {
  if (Math.abs(num) >= threshold) {
    return formatCurrencyAbbreviated(num, currencySymbol);
  }
  return formatCurrency(num, currencySymbol);
};

/**
 * Yüzde değerini formatlar
 *
 * @param num - Formatlanacak yüzde değeri (0-100 arası)
 * @param decimals - Ondalık basamak sayısı (varsayılan: 0)
 * @returns Formatlanmış yüzde string'i
 *
 * @example
 * formatPercentage(75.5, 1) // "%75,5"
 * formatPercentage(100) // "%100"
 */
export const formatPercentage = (num: number, decimals: number = 0): string => {
  return `%${formatNumber(num, decimals)}`;
};
