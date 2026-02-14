import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Check, MinusIcon, Plus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

// const { StorageAccessFramework } = FileSystem;

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const STORAGE_KEY = '@tracker_data_v3';

interface TableRow {
  id: number;
  date: string;
  type: 'boolean' | 'counter';
  c1: number; c2: number; c3: number; c4: number; c5: number;
}

export default function App() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setRows(JSON.parse(saved));
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const addRow = (type: 'boolean' | 'counter') => {
    const newRow: TableRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type,
      c1: 0, c2: 0, c3: 0, c4: 0, c5: 0
    };
    setRows([...rows, newRow]);
  };

  const handlePress = (id: number, col: keyof TableRow, type: 'boolean' | 'counter') => {
    setRows(rows.map(r => {
      if (r.id !== id) return r;
      if (type === 'boolean') return { ...r, [col]: r[col] === 1 ? 0 : 1 };
      return { ...r, [col]: (r[col] as number) - 1 };
    }));
  };

  const handleLongPress = (id: number, col: keyof TableRow) => {
    setRows(rows.map(r => r.id === id ? { ...r, [col]: 0 } : r));
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
  };

  // Logic: Sums 1s for booleans and adds the actual values for counters
  const getSum = (col: keyof TableRow) => {
    return rows.reduce((acc, row) => acc + (row[col] as number), 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTitle}>
        <Text style={styles.title}>تذكرة</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
            {/* <TouchableOpacity onPress={exportData}><Save color="#2563eb" size={24} /></TouchableOpacity> */}
            {/* <Link href="/settings" asChild>
                <TouchableOpacity><Settings color="#2563eb" size={24} /></TouchableOpacity>
            </Link> */}
        </View>
      </View>

      <View style={[styles.row, styles.headerLabel]}>
        <Text style={[styles.cell, { flex: 2, textAlign: 'center', fontWeight: 'bold' }]}>اليوم</Text>
        {['ص', 'ظ', 'ع', 'غ', 'ش'].map(h => (
            <Text key={h} style={[styles.cell, { textAlign: 'center', fontWeight: 'bold' }]}>{h}</Text>
        ))}
        {/* This 40px spacer balances the Trash icon in data rows */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <Pressable style={[styles.cell, { flex: 2 }]}
                onPress={() => { setActiveRowId(row.id); setShowPicker(true); }}
            >
              <Text style={styles.dateText}>{row.date}</Text>
            </Pressable>

            {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map(col => (
              <TouchableOpacity
                key={col} style={styles.cell}
                onPress={() => handlePress(row.id, col, row.type)}
                onLongPress={() => handleLongPress(row.id, col)}
              >
                {row.type === 'boolean' ? (
                  row[col] === 1 ? <Check color="#22c55e" size={20} /> : <X color="#ef4444" size={20} />
                ) : (
                  <Text style={styles.counterText}>{row[col]}</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteRow(row.id)} >
              <Trash2 color="#9ca3af" size={16} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* --- ADDED SUM ROW --- */}
      <View style={[styles.row, styles.sumRow]}>
        <Text style={[styles.cell, { flex: 2, textAlign: 'center', fontWeight: 'bold' }]}>المجموع</Text>
        {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map(col => (
            <Text key={col} style={styles.sumText}>{getSum(col)}</Text>
        ))}
        {/* This 40px spacer balances the Trash icon in data rows */}
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#eb253f' }]} onPress={() => addRow('boolean')}>
          <Plus color="white" size={20} />
          <Text style={styles.addBtnText}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#22a039' }]} onPress={() => addRow('counter')}>
          <MinusIcon color="white" size={20} />
          {/* <Text style={styles.addBtnText}>-</Text> */}
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={new Date()} mode="date"
          onChange={(e, d) => {
            setShowPicker(false);
            if (d && activeRowId) setRows(rows.map(r => r.id === activeRowId ? {...r, date: d.toISOString().split('T')[0]} : r));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  headerTitle: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' },
  headerLabel: { backgroundColor: '#f9fafb', paddingVertical: 10 },
  sumRow: { backgroundColor: '#f0fdf4', borderTopWidth: 2, borderColor: '#22c55e' }, // Light green sum row
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  dateText: { fontSize: 12, color: '#4b5563', fontWeight: '500' },
  counterText: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  sumText: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#166534' },
  deleteBtn: { width: 40, alignItems: 'center' },
  footer: { padding: 15, borderTopWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', gap: 10 },
  addBtn: { flex: 1, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 }
});
