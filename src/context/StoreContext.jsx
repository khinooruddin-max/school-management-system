import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadData, saveData, clearData } from '../services/storage';
import { buildDemoData } from '../data/demoData';
import { uid } from '../utils/helpers';

const StoreContext = createContext(null);

const initialState = loadData() || buildDemoData();

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, [action.entity]: [...state[action.entity], action.item] };
    case 'update':
      return {
        ...state,
        [action.entity]: state[action.entity].map((item) => (item.id === action.item.id ? action.item : item)),
      };
    case 'remove':
      return { ...state, [action.entity]: state[action.entity].filter((item) => item.id !== action.id) };
    case 'setSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'saveAttendance': {
      const exists = state.attendance.find((a) => a.date === action.date && a.classId === action.classId);
      const attendance = exists
        ? state.attendance.map((a) => (a.id === exists.id ? { ...a, records: action.records } : a))
        : [...state.attendance, { id: uid('att'), date: action.date, classId: action.classId, records: action.records }];
      return { ...state, attendance };
    }
    case 'addPayment': {
      const fees = state.fees.map((f) => {
        if (f.id !== action.feeId) return f;
        const paid = Math.min(Number(f.total), Number(f.paid) + Number(action.amount));
        return { ...f, paid, payments: [...(f.payments || []), { date: action.date, amount: Number(action.amount) }] };
      });
      return { ...state, fees };
    }
    case 'reset': {
      clearData();
      return buildDemoData();
    }
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    saveData(state);
  }, [state]);

  const api = useMemo(() => ({
    ...state,
    addItem: (entity, item) => dispatch({ type: 'add', entity, item: { ...item, id: item.id || uid(entity.slice(0, 3)) } }),
    updateItem: (entity, item) => dispatch({ type: 'update', entity, item }),
    removeItem: (entity, id) => dispatch({ type: 'remove', entity, id }),
    setSettings: (patch) => dispatch({ type: 'setSettings', patch }),
    saveAttendance: (date, classId, records) => dispatch({ type: 'saveAttendance', date, classId, records }),
    addPayment: (feeId, amount, date) => dispatch({ type: 'addPayment', feeId, amount, date }),
    resetData: () => dispatch({ type: 'reset' }),
  }), [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
