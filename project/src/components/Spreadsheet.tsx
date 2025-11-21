import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Bold,
  Save,
  Download,
  Upload,
  Type
} from 'lucide-react';

export type CellStyle = {
  bold?: boolean;
  fontSize?: number;
};

export type Cell = {
  value: string;
  style?: CellStyle;
  computed?: number | string;
};

type SpreadsheetProps = {
  onSave?: (data: Cell[][]) => void;
  initialData?: Cell[][];
};

const DEFAULT_ROWS = 14;
const DEFAULT_COLS = 13;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function Spreadsheet({ onSave, initialData }: SpreadsheetProps) {
  const [data, setData] = useState<Cell[][]>(() => {
    if (initialData) return initialData;

    const initial: Cell[][] = Array(DEFAULT_ROWS)
      .fill(null)
      .map(() =>
        Array(DEFAULT_COLS)
          .fill(null)
          .map(() => ({ value: '' }))
      );

    initial[0][0] = { value: 'Month', style: { bold: true } };
    initial[0][1] = { value: 'Data Plan', style: { bold: true } };
    initial[0][2] = { value: 'Unit Price', style: { bold: true } };
    initial[0][3] = { value: 'Total Sales', style: { bold: true } };

    MONTHS.forEach((month, idx) => {
      initial[idx + 1][0] = { value: month };
    });

    initial[13][0] = { value: 'TOTAL', style: { bold: true } };
    initial[13][1] = { value: '=SUM(B2:B13)', style: { bold: true } };
    initial[13][2] = { value: '=SUM(C2:C13)', style: { bold: true } };
    initial[13][3] = { value: '=SUM(D2:D13)', style: { bold: true } };

    for (let i = 1; i <= 12; i++) {
      initial[i][3] = { value: `=B${i + 1}*C${i + 1}` };
    }

    return initial;
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    const computed = computeFormulas(data);
    setData(computed);
  }, []);

  const computeFormulas = (grid: Cell[][]): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        const cell = newGrid[i][j];
        if (cell.value.startsWith('=')) {
          try {
            const result = evaluateFormula(cell.value, newGrid);
            cell.computed = result;
          } catch (e) {
            cell.computed = 'ERROR';
          }
        } else {
          cell.computed = cell.value;
        }
      }
    }

    return newGrid;
  };

  const evaluateFormula = (formula: string, grid: Cell[][]): number | string => {
    formula = formula.substring(1);

    if (formula.startsWith('SUM(')) {
      const range = formula.match(/SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/);
      if (range) {
        const startCol = columnToIndex(range[1]);
        const startRow = parseInt(range[2]) - 1;
        const endCol = columnToIndex(range[3]);
        const endRow = parseInt(range[4]) - 1;

        let sum = 0;
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startCol; j <= endCol; j++) {
            if (grid[i] && grid[i][j]) {
              const val = grid[i][j].computed || grid[i][j].value;
              const num = parseFloat(String(val));
              if (!isNaN(num)) sum += num;
            }
          }
        }
        return sum;
      }
    }

    const multiplyMatch = formula.match(/([A-Z]+)(\d+)\*([A-Z]+)(\d+)/);
    if (multiplyMatch) {
      const col1 = columnToIndex(multiplyMatch[1]);
      const row1 = parseInt(multiplyMatch[2]) - 1;
      const col2 = columnToIndex(multiplyMatch[3]);
      const row2 = parseInt(multiplyMatch[4]) - 1;

      const val1 = grid[row1]?.[col1]?.computed || grid[row1]?.[col1]?.value || '0';
      const val2 = grid[row2]?.[col2]?.computed || grid[row2]?.[col2]?.value || '0';

      const num1 = parseFloat(String(val1));
      const num2 = parseFloat(String(val2));

      if (!isNaN(num1) && !isNaN(num2)) {
        return num1 * num2;
      }
    }

    return 0;
  };

  const columnToIndex = (col: string): number => {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
  };

  const indexToColumn = (index: number): string => {
    let col = '';
    while (index >= 0) {
      col = String.fromCharCode((index % 26) + 65) + col;
      index = Math.floor(index / 26) - 1;
    }
    return col;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = data.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? { ...cell, value } : cell))
    );
    const computed = computeFormulas(newData);
    setData(computed);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
  };

  const toggleBold = () => {
    if (!selectedCell) return;

    const newData = data.map((r, i) =>
      r.map((cell, j) =>
        i === selectedCell.row && j === selectedCell.col
          ? {
              ...cell,
              style: { ...cell.style, bold: !cell.style?.bold }
            }
          : cell
      )
    );
    setData(newData);
  };

  const changeFontSize = (size: number) => {
    if (!selectedCell) return;

    const newData = data.map((r, i) =>
      r.map((cell, j) =>
        i === selectedCell.row && j === selectedCell.col
          ? {
              ...cell,
              style: { ...cell.style, fontSize: size }
            }
          : cell
      )
    );
    setData(newData);
  };

  const addRow = () => {
    const newRow = Array(data[0].length)
      .fill(null)
      .map(() => ({ value: '' }));
    setData([...data, newRow]);
  };

  const addColumn = () => {
    const newData = data.map(row => [...row, { value: '' }]);
    setData(newData);
  };

  const deleteRow = () => {
    if (!selectedCell || data.length <= 1) return;
    const newData = data.filter((_, i) => i !== selectedCell.row);
    setData(newData);
    setSelectedCell(null);
  };

  const deleteColumn = () => {
    if (!selectedCell || data[0].length <= 1) return;
    const newData = data.map(row => row.filter((_, j) => j !== selectedCell.col));
    setData(newData);
    setSelectedCell(null);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(data);
    }
  };

  const exportToCSV = () => {
    const csv = data
      .map(row =>
        row.map(cell => `"${cell.computed || cell.value}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voucher-data.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          title="Add Row"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Row</span>
        </button>

        <button
          onClick={addColumn}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          title="Add Column"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Column</span>
        </button>

        <button
          onClick={deleteRow}
          disabled={!selectedCell}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Row"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Delete Row</span>
        </button>

        <button
          onClick={deleteColumn}
          disabled={!selectedCell}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Column"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Delete Column</span>
        </button>

        <div className="w-px bg-slate-300 mx-2" />

        <button
          onClick={toggleBold}
          disabled={!selectedCell}
          className={`flex items-center gap-2 px-3 py-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedCell && data[selectedCell.row]?.[selectedCell.col]?.style?.bold
              ? 'bg-slate-200'
              : 'bg-white'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <select
          onChange={(e) => changeFontSize(parseInt(e.target.value))}
          disabled={!selectedCell}
          className="px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          value={selectedCell ? data[selectedCell.row]?.[selectedCell.col]?.style?.fontSize || 14 : 14}
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
        </select>

        <div className="w-px bg-slate-300 mx-2" />

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Save"
        >
          <Save className="w-4 h-4" />
          <span className="text-sm">Save</span>
        </button>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          title="Export CSV"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>
      </div>

      <div className="overflow-auto border border-slate-300 rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-12 bg-slate-100 border border-slate-300 text-xs text-slate-600"></th>
              {data[0]?.map((_, colIndex) => (
                <th
                  key={colIndex}
                  className="bg-slate-100 border border-slate-300 px-2 py-1 text-xs text-slate-600 font-semibold min-w-[120px]"
                >
                  {indexToColumn(colIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="sticky left-0 z-10 bg-slate-100 border border-slate-300 px-2 py-1 text-xs text-slate-600 text-center font-semibold">
                  {rowIndex + 1}
                </td>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className={`border border-slate-300 p-0 ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'ring-2 ring-blue-500 ring-inset'
                        : ''
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={cell.value}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        className="w-full px-2 py-1 outline-none"
                        style={{
                          fontWeight: cell.style?.bold ? 'bold' : 'normal',
                          fontSize: cell.style?.fontSize ? `${cell.style.fontSize}px` : '14px',
                        }}
                      />
                    ) : (
                      <div
                        className="px-2 py-1 min-h-[32px] cursor-cell"
                        style={{
                          fontWeight: cell.style?.bold ? 'bold' : 'normal',
                          fontSize: cell.style?.fontSize ? `${cell.style.fontSize}px` : '14px',
                        }}
                      >
                        {cell.computed !== undefined ? cell.computed : cell.value}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
