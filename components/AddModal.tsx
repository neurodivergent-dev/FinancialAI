import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store'; // Correct the store path according to your needs
import { useCurrency } from '../src/context/CurrencyContext';

export default function AddModal() {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<'asset' | 'liability'>('asset'); // We choose what to add
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  // Pulling add functions from store
  const addAsset = useFinanceStore(state => state.addAsset);
  const addLiability = useFinanceStore(state => state.addLiability);
  const { currency } = useCurrency(); // Get the current currency from context

  const handleSave = () => {
    if (!name || !value) return; // Don't save if empty

    const amount = parseFloat(value);

    if (type === 'asset') {
      addAsset({
        id: Date.now().toString(),
        type: 'liquid', // Default liquid for now, will detail later
        name,
        value: amount,
        currency: currency, // Use selected currency instead of hardcoded 'TL'
      });
    } else {
      addLiability({
        id: Date.now().toString(),
        type: 'credit_card',
        name,
        currentDebt: amount,
      });
    }

    // Cleaning and Closing
    setName('');
    setValue('');
    setVisible(false);
  };

  return (
    <View>
      {/* 1. ADD BUTTON ON SCREEN (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 2. DATA ENTRY MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>YENİ GİRİŞ</Text>

            {/* Asset / Debt Selection (Tab) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, type === 'asset' && styles.activeTab]}
                onPress={() => setType('asset')}
              >
                <Text style={[styles.tabText, type === 'asset' && styles.activeTabText]}>VARLIK (GELİR)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, type === 'liability' && styles.activeTabRed]}
                onPress={() => setType('liability')}
              >
                <Text style={[styles.tabText, type === 'liability' && styles.activeTabText]}>BORÇ (GİDER)</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>İSİM / AÇIKLAMA</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Nakit, Akbank Kart..."
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>TUTAR ({currency})</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={value}
                onChangeText={setValue}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.buttonText}>İPTAL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>KAYDET</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// CYBERPUNK STYLE DESIGN
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00ff9d', // Neon Green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#00ff9d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  fabText: {
    fontSize: 30,
    color: '#000',
    fontWeight: 'bold',
    marginTop: -4
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.8)', // Darken the background
  },
  modalView: {
    width: '85%',
    backgroundColor: "#1a1a1a",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 2
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6
  },
  activeTab: {
    backgroundColor: '#00ff9d',
  },
  activeTabRed: {
    backgroundColor: '#ff4757',
  },
  tabText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 12
  },
  activeTabText: {
    color: '#000',
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    color: '#888',
    fontSize: 10,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 5
  },
  buttonCancel: {
    backgroundColor: '#333',
  },
  buttonSave: {
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold'
  }
});