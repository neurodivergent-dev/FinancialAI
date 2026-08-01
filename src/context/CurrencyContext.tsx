import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../store/mmkv-storage';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_STORAGE_KEY = '@currency_preference';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = () => {
    try {
      const savedCurrency = storage.getString(CURRENCY_STORAGE_KEY);
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const setCurrency = (newCurrency: string) => {
    try {
      storage.set(CURRENCY_STORAGE_KEY, newCurrency);
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
