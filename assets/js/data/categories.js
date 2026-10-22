/**
 * CookMate - Danh sách danh mục món ăn
 * Dữ liệu chuẩn cho bảng DANHMUC
 */

const CATEGORIES = [
  {
    id: 1,
    name: 'Món chính',
    slug: 'mon-chinh',
    icon: 'fa-drumstick-bite',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=80',
    description: 'Các món ăn chính đậm đà, giàu năng lượng cho bữa cơm gia đình đầm ấm.',
    recipeCount: 0
  },
  {
    id: 2,
    name: 'Món canh - Súp',
    slug: 'mon-canh-sup',
    icon: 'fa-bowl-food',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80',
    description: 'Các món canh ngọt mát, súp thanh nhẹ giải nhiệt và bổ dưỡng.',
    recipeCount: 0
  },
  {
    id: 3,
    name: 'Món xào',
    slug: 'mon-xao',
    icon: 'fa-fire-burner',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80',
    description: 'Món xào giòn ngọt, chế biến nhanh gọn, màu sắc bắt mắt.',
    recipeCount: 0
  },
  {
    id: 4,
    name: 'Món nướng - Chiên',
    slug: 'mon-nuong-chien',
    icon: 'fa-fire',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    description: 'Món nướng thơm lừng, chiên giòn rụm kích thích vị giác.',
    recipeCount: 0
  },
  {
    id: 5,
    name: 'Món chay',
    slug: 'mon-chay',
    icon: 'fa-leaf',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
    description: 'Ẩm thực chay thanh tịnh, thuần khiết từ rau củ tươi ngon.',
    recipeCount: 0
  },
  {
    id: 6,
    name: 'Món tráng miệng',
    slug: 'mon-trang-mieng',
    icon: 'fa-cake-candles',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&auto=format&fit=crop&q=80',
    description: 'Chè ngọt ngào, bánh trái thanh mát khép lại bữa ăn hoàn hảo.',
    recipeCount: 0
  },
  {
    id: 7,
    name: 'Đồ uống',
    slug: 'do-uong',
    icon: 'fa-mug-hot',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=80',
    description: 'Sinh tố tươi mát, nước ép thanh lọc cơ thể và giải khát tức thì.',
    recipeCount: 0
  },
  {
    id: 8,
    name: 'Món khai vị',
    slug: 'mon-khai-vi',
    icon: 'fa-plate-wheat',
    image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500&auto=format&fit=crop&q=80',
    description: 'Gỏi nộm, nem cuốn giòn tan khởi đầu bữa tiệc thêm rộn rã.',
    recipeCount: 0
  }
];
