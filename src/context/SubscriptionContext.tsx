import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
// import Purchases, { PurchasesOffering, CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useProfile } from './ProfileContext'; // To identify the user to RevenueCat

// TODO: Replace with your actual RevenueCat API keys from your dashboard
// const REVENUECAT_API_KEYS = {
//   google: 'goog_YOUR_GOOGLE_API_KEY',
//   apple: 'appl_YOUR_APPLE_API_KEY',
// };

interface SubscriptionContextType {
  isPremium: boolean;
  // offerings: PurchasesOffering | null;
  // purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  loading: boolean;
  toggleDebugPremium: () => void; // For development testing
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useProfile();
  const [isPremiumReal, setIsPremiumReal] = useState(true); // Always premium
  const [isDebugPremium, setIsDebugPremium] = useState(false); // Developer mode state
  // const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false); // No loading needed

  // useEffect(() => {
  //   const setupRevenueCat = async () => {
  //     try {
  //       Purchases.setDebugLogsEnabled(__DEV__); // Enable debug logs in dev mode
  //       Purchases.configure({
  //         apiKey: Platform.OS === 'android' ? REVENUECAT_API_KEYS.google : REVENUECAT_API_KEYS.apple,
  //       });

  //       const fetchedOfferings = await Purchases.getOfferings();
  //       if (fetchedOfferings.current) {
  //         setOfferings(fetchedOfferings.current);
  //       }

  //       if (profile?.id) {
  //         await Purchases.logIn(profile.id);
  //       }

  //       Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

  //       const customerInfo = await Purchases.getCustomerInfo();
  //       handleCustomerInfoUpdate(customerInfo);

  //     } catch (e) {
  //       console.error('RevenueCat setup failed:', e);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   setupRevenueCat();

  //   return () => {
  //     Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
  //   };
  // }, [profile?.id]);

  // const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
  //   const premiumStatus = customerInfo.entitlements.active.premium?.isActive || false;
  //   setIsPremiumReal(premiumStatus);
  // };

  const purchasePackage = async (pkg: any): Promise<boolean> => {
    alert('Purchases are currently disabled.');
    return Promise.resolve(true);
  };

  const restorePurchases = async (): Promise<boolean> => {
    alert('Purchases are currently disabled.');
    return Promise.resolve(true);
  };

  const toggleDebugPremium = () => {
    if (__DEV__) {
      const newDebugStatus = !isDebugPremium;
      setIsDebugPremium(newDebugStatus);
      Alert.alert('Geliştirici Modu', `Premium Modu: ${newDebugStatus ? 'AKTİF' : 'DEVRE DIŞI'}`);
    }
  };

  const value = {
    isPremium: isPremiumReal || isDebugPremium, // Combine real and debug status
    offerings: null,
    purchasePackage,
    restorePurchases,
    loading,
    toggleDebugPremium,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};