import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/orders.json');

// Ensure data directory exists
try {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create orders data dir:', e.message);
}

let memoryOrders = [];

function loadOrdersFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryOrders = JSON.parse(data);
    }
  } catch (e) {
    console.warn('Could not read orders file, starting empty memory store:', e.message);
    memoryOrders = [];
  }
}

function saveOrdersToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryOrders, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write orders to file:', e.message);
  }
}

loadOrdersFromFile();

export const localOrderStore = {
  getAll: (phone) => {
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      return memoryOrders.filter(o => {
        const oPhone = String(o.customer?.phone || o.phoneNumber || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
        return oPhone === cleanPhone;
      });
    }
    return [...memoryOrders].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  },
  getById: (orderId) => {
    return memoryOrders.find(o => o.order_number === orderId || o.orderNumber === orderId || o.id === orderId);
  },
  save: (order) => {
    const existingIndex = memoryOrders.findIndex(o => o.order_number === order.order_number || o.orderNumber === order.order_number);
    if (existingIndex >= 0) {
      memoryOrders[existingIndex] = { ...memoryOrders[existingIndex], ...order };
    } else {
      memoryOrders.unshift(order);
    }
    saveOrdersToFile();
    return order;
  },
  updateStatus: (orderId, status) => {
    const order = memoryOrders.find(o => o.order_number === orderId || o.orderNumber === orderId || o.id === orderId);
    if (order) {
      order.order_status = status;
      order.orderStatus = status;
      order.updated_at = new Date().toISOString();
      order.updatedAt = order.updated_at;
      saveOrdersToFile();
      return order;
    }
    return null;
  }
};
