import { useState, useEffect } from 'react';
import { Plus, Loader2, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Spreadsheet, Cell } from './Spreadsheet';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type VoucherSheet = {
  id: string;
  name: string;
  data: Cell[][];
  created_at: string;
  updated_at: string;
};

export function VoucherPage() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<VoucherSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<VoucherSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewSheetDialog, setShowNewSheetDialog] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');

  useEffect(() => {
    loadSheets();
  }, [user]);

  const loadSheets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('voucher_sheets')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setSheets(data as VoucherSheet[]);
        setActiveSheet(data[0] as VoucherSheet);
      }
    } catch (error) {
      console.error('Error loading sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSheet = async () => {
    if (!newSheetName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('voucher_sheets')
        .insert([
          {
            user_id: user?.id,
            name: newSheetName,
            data: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSheet = data as VoucherSheet;
        setSheets([newSheet, ...sheets]);
        setActiveSheet(newSheet);
        setShowNewSheetDialog(false);
        setNewSheetName('');
      }
    } catch (error) {
      console.error('Error creating sheet:', error);
    }
  };

  const saveSheet = async (data: Cell[][]) => {
    if (!activeSheet) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('voucher_sheets')
        .update({
          data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeSheet.id);

      if (error) throw error;

      setActiveSheet({ ...activeSheet, data, updated_at: new Date().toISOString() });

      const updatedSheets = sheets.map(sheet =>
        sheet.id === activeSheet.id
          ? { ...sheet, data, updated_at: new Date().toISOString() }
          : sheet
      );
      setSheets(updatedSheets);
    } catch (error) {
      console.error('Error saving sheet:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSheet = async (sheetId: string) => {
    if (!confirm('Are you sure you want to delete this sheet?')) return;

    try {
      const { error } = await supabase
        .from('voucher_sheets')
        .delete()
        .eq('id', sheetId);

      if (error) throw error;

      const updatedSheets = sheets.filter(sheet => sheet.id !== sheetId);
      setSheets(updatedSheets);

      if (activeSheet?.id === sheetId) {
        setActiveSheet(updatedSheets[0] || null);
      }
    } catch (error) {
      console.error('Error deleting sheet:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Voucher Data Tracking</h2>
        <button
          onClick={() => setShowNewSheetDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Sheet
        </button>
      </div>

      {showNewSheetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Sheet</h3>
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Sheet name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
              onKeyDown={(e) => e.key === 'Enter' && createNewSheet()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewSheetDialog(false);
                  setNewSheetName('');
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewSheet}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {sheets.length > 0 && (
        <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="relative group">
              <button
                onClick={() => setActiveSheet(sheet)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeSheet?.id === sheet.id
                    ? 'bg-white border-t-2 border-x-2 border-blue-500 text-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-medium">{sheet.name}</span>
              </button>
              {sheets.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSheet(sheet.id);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSheet ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          {saving && (
            <div className="mb-4 flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
          <Spreadsheet
            key={activeSheet.id}
            initialData={activeSheet.data.length > 0 ? activeSheet.data : undefined}
            onSave={saveSheet}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No sheets yet</h3>
          <p className="text-slate-500 mb-4">Create your first voucher sheet to get started</p>
          <button
            onClick={() => setShowNewSheetDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Sheet
          </button>
        </div>
      )}
    </div>
  );
}
