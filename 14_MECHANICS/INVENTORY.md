**Tags:** inventory

# INVENTORY

Версия: 1.0

---

## Что это

Хранилище предметов. Используется в merge, tycoon, survivor.

---

## Структура

```ts
interface InventoryItem {
  id: string;
  type: 'consumable' | 'material' | 'equipment' | 'cosmetic';
  count: number;
  metadata?: any;
}

interface InventoryState {
  items: InventoryItem[];
  capacity: number;
  isFull: boolean;
}
```

## Типы

```ts
{ id: 'boost_2x', type: 'consumable', count: 3 }
{ id: 'wood',     type: 'material',   count: 50 }
{ id: 'sword_1',  type: 'equipment',   count: 1, metadata: { damage: 10, level: 1 } }
{ id: 'skin_1',   type: 'cosmetic',    count: 1 }
```

## API

```ts
class Inventory {
  add(item: InventoryItem): boolean {
    if (this.isFull() && !this.hasItem(item.id)) return false;
    const items = [...this.state.items];
    const existing = items.findIndex(i => i.id === item.id);
    if (existing >= 0 && this.canStack(item)) {
      items[existing].count += item.count;
    } else {
      items.push(item);
    }
    this.state.set({ inventory: { items, capacity: this.capacity } });
    return true;
  }

  remove(itemId: string, count = 1): boolean {
    const items = [...this.state.items];
    const existing = items.findIndex(i => i.id === itemId);
    if (existing < 0) return false;
    if (items[existing].count < count) return false;
    items[existing].count -= count;
    if (items[existing].count === 0) items.splice(existing, 1);
    this.state.set({ inventory: { items, capacity: this.capacity } });
    return true;
  }

  has(itemId: string, count = 1): boolean {
    const item = this.state.get().inventory.items.find(i => i.id === itemId);
    return item ? item.count >= count : false;
  }
}
```

## UI

### Компактный

```
🎒 12/30
```

## Чек-лист

- [ ] Add/remove работает
- [ ] Capacity limit
- [ ] Stack логика
- [ ] UI в HUD
- [ ] Сохранение в state