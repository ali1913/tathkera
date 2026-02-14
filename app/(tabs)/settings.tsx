import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Directory, File } from 'expo-file-system';
import { router } from 'expo-router';
import { ArrowLeft, Download, Save } from 'lucide-react-native';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';



// const { StorageAccessFramework } = FileSystem;
// const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

const STORAGE_KEY = '@tracker_data_v3';

export default function SettingsScreen() {

  const copyToClipboard = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved || saved === '[]') return Alert.alert("No data", "Nothing to export.");

    await Clipboard.setStringAsync(saved);
  };

  const fetchCopiedText = async () => {
    const content = await Clipboard.getStringAsync();

    JSON.parse(content);

    Alert.alert(
      "Confirm Import",
      "This will replace all your current data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Import", onPress: async () => {
            await AsyncStorage.setItem(STORAGE_KEY, content);
            Alert.alert("Success", "Data imported! Please restart the app.");
            router.replace('/');
          }
        }
      ]
    );
  };

const exportData = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved || saved === '[]') return Alert.alert("No data", "Nothing to export.");

    // 1. Pick folder
    const selectedDir = await Directory.pickDirectoryAsync();
    if (!selectedDir) return;

    // 2. Create File instance
    const newFile = new File(selectedDir, 'export.json');

    // 3. MUST use await for create and write in the new API
    await newFile.create({ overwrite: true });
    await newFile.write(saved);

    Alert.alert("Success", "Saved to export.json!");
  } catch (e) {
    console.error("Export failed:", e);
    Alert.alert("Error", "Could not save file.");
  }
};


  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      let content = '';

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        content = await response.text();
      } else {
        // Modern SDK 54+ reading
        const file = new FileSystem.File(fileUri);
        content = await file.readAsStringAsync();
      }

      // Validate JSON before saving
      JSON.parse(content);

      Alert.alert(
        "Confirm Import",
        "This will replace all your current data. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Import", onPress: async () => {
              await AsyncStorage.setItem(STORAGE_KEY, content);
              Alert.alert("Success", "Data imported! Please restart the app.");
              router.replace('/');
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert("Error", "Invalid file format. Please select a valid JSON backup.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft color="#333" size={24} />
      </TouchableOpacity>

      <Text style={styles.title}>Data Management</Text>

      <TouchableOpacity style={styles.btn} onPress={copyToClipboard}>
        <Save color="white" size={20} />
        <Text style={styles.btnText}>copyToClipboard (JSON)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#059669' }]} onPress={fetchCopiedText}>
        <Download color="white" size={20} />
        <Text style={styles.btnText}>fetchCopiedText (JSON)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={exportData}>
        <Save color="white" size={20} />
        <Text style={styles.btnText}>Export Backup (JSON)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#059669' }]} onPress={importData}>
        <Download color="white" size={20} />
        <Text style={styles.btnText}>Import Backup (JSON)</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: Importing will overwrite all existing entries in your tracker.
      </Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  btn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 12 },
  note: { marginTop: 20, color: '#666', fontSize: 13, textAlign: 'center', fontStyle: 'italic' }
});
