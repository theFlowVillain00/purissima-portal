export interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id_ordine: string;
  cliente: string;
  contatto: string;
  azienda: string;
  data: string;
  dipendente: string;
  data_consegna: string;
  autore_consegna: string;
  preso_in_carico_da: string;
  stato: string;
  ddt_consegnato: boolean;
  note: string;
  nickname_minecraft: string;
  nickname_telegram: string;
  prodotti: OrderProduct[];
}

const STORAGE_KEY = "app_orders";

const defaultOrders: Order[] = [
  {
    id_ordine: "ORD-001", cliente: "Steve", contatto: "@steve_tg", azienda: "DiamondCorp",
    data: "2026-02-01", dipendente: "", data_consegna: "", autore_consegna: "",
    preso_in_carico_da: "", stato: "In attesa", ddt_consegnato: false, note: "",
    nickname_minecraft: "Steve", nickname_telegram: "@steve_tg",
    prodotti: [{ name: "Diamanti x64", quantity: 2, price: 500 }],
  },
  {
    id_ordine: "ORD-002", cliente: "Alex", contatto: "@alex_tg", azienda: "NetheriteInc",
    data: "2026-02-03", dipendente: "Marco", data_consegna: "2026-02-10", autore_consegna: "Luca",
    preso_in_carico_da: "Admin", stato: "Completato", ddt_consegnato: true, note: "Consegnato in tempo",
    nickname_minecraft: "Alex", nickname_telegram: "@alex_tg",
    prodotti: [{ name: "Netherite Ingot x16", quantity: 1, price: 800 }],
  },
];

export function getOrders(): Order[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Initialize with defaults
  saveOrders(defaultOrders);
  return defaultOrders;
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function addOrder(order: Order) {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function generateOrderId(): string {
  const orders = getOrders();
  const maxNum = orders.reduce((max, o) => {
    const match = o.id_ordine.match(/ORD-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `ORD-${String(maxNum + 1).padStart(3, "0")}`;
}
