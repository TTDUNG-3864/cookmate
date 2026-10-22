/**
 * CookMate - Danh sách nguyên liệu
 * Thông tin dinh dưỡng trên 100g/100ml
 */

const INGREDIENTS = [
  { id: 1, name: 'Thịt heo (nạc)', unit: 'g', calories: 143, protein: 26, fat: 3.5, carbs: 0, fiber: 0, category: 'Thịt' },
  { id: 2, name: 'Thịt gà (ức)', unit: 'g', calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, category: 'Thịt' },
  { id: 3, name: 'Thịt bò', unit: 'g', calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0, category: 'Thịt' },
  { id: 4, name: 'Tôm sú', unit: 'g', calories: 85, protein: 18, fat: 1.2, carbs: 0, fiber: 0, category: 'Hải sản' },
  { id: 5, name: 'Cá basa', unit: 'g', calories: 90, protein: 17, fat: 2.5, carbs: 0, fiber: 0, category: 'Hải sản' },
  { id: 6, name: 'Đậu hũ', unit: 'g', calories: 76, protein: 8, fat: 4.8, carbs: 1.9, fiber: 0.3, category: 'Đậu' },
  { id: 7, name: 'Rau muống', unit: 'g', calories: 19, protein: 2.6, fat: 0.3, carbs: 3.1, fiber: 2.1, category: 'Rau' },
  { id: 8, name: 'Cà chua', unit: 'g', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, category: 'Rau' },
  { id: 9, name: 'Hành tây', unit: 'g', calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7, category: 'Rau' },
  { id: 10, name: 'Tỏi', unit: 'g', calories: 149, protein: 6.4, fat: 0.5, carbs: 33, fiber: 2.1, category: 'Gia vị' },
  { id: 11, name: 'Gạo tẻ', unit: 'g', calories: 365, protein: 7, fat: 0.7, carbs: 80, fiber: 1.3, category: 'Ngũ cốc' },
  { id: 12, name: 'Bún tươi', unit: 'g', calories: 108, protein: 3.4, fat: 0.2, carbs: 23, fiber: 0.4, category: 'Ngũ cốc' },
  { id: 13, name: 'Nước mắm', unit: 'ml', calories: 35, protein: 5.1, fat: 0, carbs: 3.6, fiber: 0, category: 'Gia vị' },
  { id: 14, name: 'Dầu ăn', unit: 'ml', calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, category: 'Dầu mỡ' },
  { id: 15, name: 'Đường', unit: 'g', calories: 387, protein: 0, fat: 0, carbs: 100, fiber: 0, category: 'Gia vị' },
  { id: 16, name: 'Trứng gà', unit: 'quả', calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0, category: 'Trứng sữa' },
  { id: 17, name: 'Cà rốt', unit: 'g', calories: 41, protein: 0.9, fat: 0.2, carbs: 10, fiber: 2.8, category: 'Rau' },
  { id: 18, name: 'Khoai tây', unit: 'g', calories: 77, protein: 2, fat: 0.1, carbs: 17, fiber: 2.2, category: 'Rau củ' },
  { id: 19, name: 'Nấm rơm', unit: 'g', calories: 35, protein: 3.1, fat: 0.3, carbs: 5.1, fiber: 1.1, category: 'Nấm' },
  { id: 20, name: 'Bắp cải', unit: 'g', calories: 25, protein: 1.3, fat: 0.1, carbs: 5.8, fiber: 2.5, category: 'Rau' },
  { id: 21, name: 'Ớt', unit: 'g', calories: 40, protein: 1.9, fat: 0.4, carbs: 8.8, fiber: 1.5, category: 'Gia vị' },
  { id: 22, name: 'Sả', unit: 'g', calories: 99, protein: 1.8, fat: 0.5, carbs: 25, fiber: 0, category: 'Gia vị' },
  { id: 23, name: 'Gừng', unit: 'g', calories: 80, protein: 1.8, fat: 0.8, carbs: 18, fiber: 2, category: 'Gia vị' },
  { id: 24, name: 'Bí đỏ', unit: 'g', calories: 26, protein: 1, fat: 0.1, carbs: 6.5, fiber: 0.5, category: 'Rau' },
  { id: 25, name: 'Đậu phộng', unit: 'g', calories: 567, protein: 26, fat: 49, carbs: 16, fiber: 8.5, category: 'Hạt' },
  { id: 26, name: 'Nước cốt dừa', unit: 'ml', calories: 230, protein: 2.3, fat: 24, carbs: 6, fiber: 0, category: 'Nước' },
  { id: 27, name: 'Giá đỗ', unit: 'g', calories: 31, protein: 3, fat: 0.2, carbs: 6, fiber: 1.8, category: 'Rau' },
  { id: 28, name: 'Hành lá', unit: 'g', calories: 32, protein: 1.8, fat: 0.2, carbs: 7.3, fiber: 2.6, category: 'Rau' },
  { id: 29, name: 'Tiêu', unit: 'g', calories: 251, protein: 10, fat: 3.3, carbs: 64, fiber: 25, category: 'Gia vị' },
  { id: 30, name: 'Bột mì', unit: 'g', calories: 364, protein: 10, fat: 1, carbs: 76, fiber: 2.7, category: 'Bột' }
];
