/**
 * CookMate - Dữ liệu công thức nấu ăn mẫu
 * Danh sách món ăn Việt Nam truyền thống và hiện đại
 * Đầy đủ định lượng nguyên liệu, các bước nấu, dinh dưỡng ước tính và bình luận
 */

const RECIPES = [
  {
    id: 1,
    title: 'Phở bò Hà Nội truyền thống',
    slug: 'pho-bo-ha-noi-truyen-thong',
    description: 'Bát phở bò ngào ngạt hương thơm của hồi quế, nước dùng trong veo ngọt thanh từ xương ống bò hầm kỹ.',
    categoryId: 2, // Món canh - Súp
    occasion: 'Tết cổ truyền',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
    prepTime: 30,
    cookTime: 120,
    difficulty: 'Khó',
    servings: 4,
    ingredients: [
      { ingredientId: 3, name: 'Thịt bò (thăn hoặc nạm)', amount: 400, unit: 'g' },
      { ingredientId: 12, name: 'Bánh phở tươi', amount: 500, unit: 'g' },
      { ingredientId: 9, name: 'Hành tây', amount: 150, unit: 'g' },
      { ingredientId: 23, name: 'Gừng tươi nướng thơm', amount: 40, unit: 'g' },
      { ingredientId: 28, name: 'Hành lá và rau mùi', amount: 50, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm ngon', amount: 30, unit: 'ml' },
      { ingredientId: 15, name: 'Đường phèn', amount: 15, unit: 'g' },
      { ingredientId: 29, name: 'Tiêu sọ xay', amount: 5, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Rửa sạch xương và thịt bò, chần qua nước sôi cùng chút muối và gừng đập dập để khử mùi hôi.' },
      { step: 2, description: 'Nướng thơm gừng, hành tây và các loại quả hoa hồi, thảo quả, quế thanh; sau đó cạo sạch lớp cháy đen bên ngoài.' },
      { step: 3, description: 'Cho xương vào nồi lớn cùng 2.5 lít nước, thả gừng và hành nướng vào hầm lửa nhỏ liu riu trong 2-3 tiếng, vớt bọt liên tục để nước trong.' },
      { step: 4, description: 'Nêm nước mắm, đường phèn và muối cho vừa khẩu vị đậm đà thanh ngọt đặc trưng của nước dùng phở.' },
      { step: 5, description: 'Chần bánh phở qua nước sôi xếp vào bát, thêm thịt bò thái lát mỏng, rải hành lá chẻ, chan nước dùng sôi sùng sục và rắc tiêu thơm.' }
    ],
    nutrition: { calories: 485, protein: 32, fat: 12, carbs: 62, fiber: 2.5 },
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    views: 4520,
    authorId: 2,
    createdAt: '2024-01-20T08:30:00Z',
    comments: [
      { id: 101, userId: 3, userName: 'Lê Minh Đức', content: 'Nước dùng trong veo ngọt thanh đúng chuẩn vị Hà Nội!', createdAt: '2024-02-01T14:15:00Z' },
      { id: 102, userId: 4, userName: 'Phạm Thu Hà', content: 'Cả nhà mình ai cũng khen tấm tắc, công thức tính định lượng rất chuẩn.', createdAt: '2024-02-10T19:00:00Z' }
    ]
  },
  {
    id: 2,
    title: 'Bún chả Hà Nội nướng than hoa',
    slug: 'bun-cha-ha-noi-nuong-than-hoa',
    description: 'Chả miếng vàng óng, chả viên mềm thơm đượm khói than, ăn kèm bát nước mắm chua ngọt và bún tươi mát rượi.',
    categoryId: 4, // Món nướng - Chiên
    occasion: 'Tiệc gia đình',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80',
    prepTime: 40,
    cookTime: 35,
    difficulty: 'Trung bình',
    servings: 4,
    ingredients: [
      { ingredientId: 1, name: 'Thịt ba chỉ rút sườn', amount: 350, unit: 'g' },
      { ingredientId: 1, name: 'Thịt nạc vai băm', amount: 350, unit: 'g' },
      { ingredientId: 12, name: 'Bún tươi sợi nhỏ', amount: 600, unit: 'g' },
      { ingredientId: 17, name: 'Cà rốt làm dưa góp', amount: 100, unit: 'g' },
      { ingredientId: 10, name: 'Tỏi băm nhuyễn', amount: 20, unit: 'g' },
      { ingredientId: 21, name: 'Ớt sừng băm', amount: 10, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm truyền thống', amount: 50, unit: 'ml' },
      { ingredientId: 15, name: 'Đường caramel thắng màu', amount: 30, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Thịt ba chỉ thái lát mỏng vừa ăn. Thịt vai băm nhỏ để làm chả viên.' },
      { step: 2, description: 'Ướp riêng hai phần thịt với hành khô băm, tỏi băm, nước mắm ngon, hạt nêm, tiêu và nước hàng thắng màu trong ít nhất 45 phút.' },
      { step: 3, description: 'Viên thịt băm thành từng viên tròn dẹt, kẹp chả miếng vào vỉ nướng trên than hoa đỏ rực cho xém vàng thơm lừng hai mặt.' },
      { step: 4, description: 'Pha nước mắm chấm theo tỷ lệ 1 mắm : 1 đường : 1 giấm : 5 nước ấm, thêm tỏi ớt băm và dưa góp cà rốt đu đủ giòn sần sật.' },
      { step: 5, description: 'Thả chả nướng nóng hổi vào bát nước chấm ấm, ăn kèm bún tươi và đĩa rau sống tươi mát gồm xà lách, tía tô, kinh giới.' }
    ],
    nutrition: { calories: 540, protein: 34, fat: 22, carbs: 52, fiber: 3.1 },
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    views: 3890,
    authorId: 3,
    createdAt: '2024-02-12T10:00:00Z',
    comments: [
      { id: 103, userId: 2, userName: 'Trần Hương Giang', content: 'Chả ướp vừa miệng lắm, nướng nồi chiên không dầu cũng rất ngon!', createdAt: '2024-02-15T11:20:00Z' }
    ]
  },
  {
    id: 3,
    title: 'Cơm tấm sườn nướng mật ong Sài Gòn',
    slug: 'com-tam-suon-nuong-mat-ong',
    description: 'Miếng sườn cốt lết dày dặn ngấm đẫm sốt sả mật ong nướng vàng ươm, ăn kèm mỡ hành béo ngậy và nước mắm kẹo.',
    categoryId: 1, // Món chính
    occasion: null,
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=600&auto=format&fit=crop&q=80',
    prepTime: 30,
    cookTime: 25,
    difficulty: 'Dễ',
    servings: 2,
    ingredients: [
      { ingredientId: 1, name: 'Sườn cốt lết heo', amount: 350, unit: 'g' },
      { ingredientId: 11, name: 'Gạo tấm thơm', amount: 200, unit: 'g' },
      { ingredientId: 22, name: 'Sả băm thơm', amount: 30, unit: 'g' },
      { ingredientId: 10, name: 'Tỏi băm nhuyễn', amount: 15, unit: 'g' },
      { ingredientId: 28, name: 'Hành lá làm mỡ hành', amount: 40, unit: 'g' },
      { ingredientId: 14, name: 'Dầu ăn', amount: 20, unit: 'ml' },
      { ingredientId: 13, name: 'Nước mắm kẹo', amount: 25, unit: 'ml' },
      { ingredientId: 15, name: 'Mật ong nguyên chất', amount: 20, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Dùng sống dao dần mềm miếng sườn cốt lết để thịt mềm xốp và nhanh ngấm gia vị.' },
      { step: 2, description: 'Ướp sườn với sả băm, tỏi, mật ong, nước mắm, xì dầu, dầu hào và chút sữa đặc trong 1-2 tiếng.' },
      { step: 3, description: 'Nấu chín gạo tấm với lượng nước vừa phải để hạt cơm tơi xốp, thơm dẻo.' },
      { step: 4, description: 'Nướng sườn trên vỉ hoặc nồi chiên không dầu ở nhiệt độ 180°C khoảng 15 phút, lật mặt quét sốt nướng thêm 7 phút cho xém vàng.' },
      { step: 5, description: 'Làm mỡ hành bằng cách đổ dầu sôi vào bát hành lá thái nhỏ. Xới cơm tấm ra đĩa, đặt sườn nướng, rưới mỡ hành và chan nước mắm chua ngọt.' }
    ],
    nutrition: { calories: 610, protein: 36, fat: 20, carbs: 71, fiber: 2.0 },
    isFeatured: false,
    isNew: true,
    rating: 4.7,
    views: 2840,
    authorId: 4,
    createdAt: '2024-03-01T09:20:00Z',
    comments: [
      { id: 104, userId: 1, userName: 'Nguyễn Văn Admin', content: 'Bí quyết thêm chút sữa đặc vào sốt ướp làm thịt mềm mọng không bị khô!', createdAt: '2024-03-05T08:10:00Z' }
    ]
  },
  {
    id: 4,
    title: 'Gỏi cuốn tôm thịt thanh mát',
    slug: 'goi-cuon-tom-thit-thanh-mat',
    description: 'Từng cuốn gỏi trong veo lộ rõ tôm đỏ hồng và thịt luộc ngọt mềm, cuốn tròn cùng rau sống chấm tương đen bùi béo.',
    categoryId: 8, // Món khai vị
    occasion: 'Tiệc gia đình',
    image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&auto=format&fit=crop&q=80',
    prepTime: 25,
    cookTime: 15,
    difficulty: 'Dễ',
    servings: 3,
    ingredients: [
      { ingredientId: 4, name: 'Tôm sú tươi', amount: 300, unit: 'g' },
      { ingredientId: 1, name: 'Thịt ba chỉ ngon', amount: 250, unit: 'g' },
      { ingredientId: 12, name: 'Bún tươi', amount: 200, unit: 'g' },
      { ingredientId: 27, name: 'Giá đỗ sạch', amount: 100, unit: 'g' },
      { ingredientId: 25, name: 'Đậu phộng rang giã nhỏ', amount: 30, unit: 'g' },
      { ingredientId: 28, name: 'Hẹ tươi và rau thơm', amount: 50, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Luộc tôm với chút muối cho chín tới, vớt ra ngâm nước đá lạnh rồi bóc vỏ, chẻ đôi theo chiều dọc sống lưng.' },
      { step: 2, description: 'Luộc chín thịt ba chỉ trong nước có đập nhánh hành củ, sau đó thái lát mỏng vừa ăn.' },
      { step: 3, description: 'Nhúng ướt nhẹ bánh tráng, trải phẳng lên mặt phẳng sạch, xếp rau xà lách, rau thơm, giá đỗ và một lọn bún tươi.' },
      { step: 4, description: 'Đặt thịt luộc, tiếp theo là tôm áp mặt đỏ xuống dưới bánh tráng, thêm cọng hẹ thò đầu ra ngoài rồi cuốn chặt tay.' },
      { step: 5, description: 'Pha sốt tương đen xào tỏi, thêm bơ đậu phộng, ớt băm và rắc đậu phộng rang giòn lên mặt chấm kèm gỏi.' }
    ],
    nutrition: { calories: 320, protein: 24, fat: 8, carbs: 38, fiber: 3.2 },
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    views: 4120,
    authorId: 2,
    createdAt: '2024-01-18T14:40:00Z',
    comments: [
      { id: 105, userId: 3, userName: 'Lê Minh Đức', content: 'Món giải ngấy tuyệt hảo cho ngày hè oi bức!', createdAt: '2024-02-18T20:30:00Z' }
    ]
  },
  {
    id: 5,
    title: 'Canh chua cá basa bông điên điển',
    slug: 'canh-chua-ca-basa',
    description: 'Vị chua thanh mát của me hòa quyện với bùi béo của cá basa tươi, dứa thơm lừng và đậu bắp giòn ngọt miền Tây.',
    categoryId: 2, // Món canh - Súp
    occasion: null,
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop&q=80',
    prepTime: 20,
    cookTime: 20,
    difficulty: 'Dễ',
    servings: 4,
    ingredients: [
      { ingredientId: 5, name: 'Cá basa cắt khúc', amount: 450, unit: 'g' },
      { ingredientId: 8, name: 'Cà chua chín đỏ', amount: 150, unit: 'g' },
      { ingredientId: 27, name: 'Giá đỗ tươi', amount: 100, unit: 'g' },
      { ingredientId: 21, name: 'Ớt sừng cay', amount: 10, unit: 'g' },
      { ingredientId: 10, name: 'Tỏi phi vàng', amount: 15, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm cá cơm', amount: 30, unit: 'ml' },
      { ingredientId: 15, name: 'Đường cát trắng', amount: 20, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Làm sạch cá basa với muối và chanh để hết nhớt, khứa nhẹ hai bên rồi để ráo nước.' },
      { step: 2, description: 'Dầm me chín trong bát nước ấm lấy nước cốt me chua thanh.' },
      { step: 3, description: 'Phi thơm tỏi băm, xào sơ cà chua và dứa cho lên màu vàng đỏ hấp dẫn.' },
      { step: 4, description: 'Đổ 1.2 lít nước vào đun sôi, thả cá basa vào nấu chín trong 7-8 phút, hớt bọt thường xuyên.' },
      { step: 5, description: 'Cho nước me, nêm nước mắm đường cho chuẩn vị chua ngọt đậm đà, thêm giá đỗ, đậu bắp, ngò gai rồi múc ra bát rắc tỏi phi.' }
    ],
    nutrition: { calories: 285, protein: 26, fat: 9, carbs: 24, fiber: 2.8 },
    isFeatured: false,
    isNew: true,
    rating: 4.6,
    views: 1950,
    authorId: 2,
    createdAt: '2024-03-10T11:15:00Z',
    comments: [
      { id: 106, userId: 4, userName: 'Phạm Thu Hà', content: 'Canh chua chuẩn vị Nam Bộ, cá béo mềm không tanh chút nào.', createdAt: '2024-03-12T12:00:00Z' }
    ]
  },
  {
    id: 6,
    title: 'Thịt kho tàu nước dừa trứng vịt',
    slug: 'thit-kho-tau-nuoc-dua',
    description: 'Món ăn biểu tượng ngày Tết với miếng thịt ba chỉ vuông vức mềm tan ngập trong nước dừa xiêm hổ phách sánh mượt.',
    categoryId: 1, // Món chính
    occasion: 'Tết cổ truyền',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80',
    prepTime: 25,
    cookTime: 65,
    difficulty: 'Trung bình',
    servings: 4,
    ingredients: [
      { ingredientId: 1, name: 'Thịt ba chỉ heo dày', amount: 600, unit: 'g' },
      { ingredientId: 16, name: 'Trứng gà hoặc vịt luộc', amount: 6, unit: 'quả' },
      { ingredientId: 26, name: 'Nước dừa tươi', amount: 400, unit: 'ml' },
      { ingredientId: 10, name: 'Tỏi băm', amount: 15, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm ngon loại 1', amount: 45, unit: 'ml' },
      { ingredientId: 15, name: 'Đường thốt nốt', amount: 25, unit: 'g' },
      { ingredientId: 21, name: 'Ớt hiểm nguyên trái', amount: 5, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Thịt ba chỉ rửa sạch, thái miếng vuông dày khoảng 4-5cm. Luộc sơ qua nước sôi rồi vớt ráo.' },
      { step: 2, description: 'Ướp thịt với tỏi ớt băm nhuyễn, nước mắm ngon, hạt tiêu và chút đường trong 40 phút.' },
      { step: 3, description: 'Thắng nước hàng màu cánh gián từ đường thốt nốt, trút thịt vào đảo săn cho thấm đều màu áo vàng óng.' },
      { step: 4, description: 'Đổ nước dừa xiêm ngập mặt thịt, đun sôi bùng rồi hạ lửa liu riu, không đậy vung để nước kho trong và thịt trong veo.' },
      { step: 5, description: 'Khi thịt đã mềm rục thì thả trứng luộc vào kho thêm 15 phút cho ngấm gia vị sánh vàng.' }
    ],
    nutrition: { calories: 590, protein: 35, fat: 38, carbs: 18, fiber: 0.5 },
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    views: 5210,
    authorId: 2,
    createdAt: '2024-01-10T09:00:00Z',
    comments: [
      { id: 107, userId: 1, userName: 'Nguyễn Văn Admin', content: 'Thịt béo ngậy ăn với dưa cải muối chua thì hết sạch nồi cơm!', createdAt: '2024-01-25T18:30:00Z' }
    ]
  },
  {
    id: 7,
    title: 'Chè bưởi An Giang giòn sần sật',
    slug: 'che-buoi-an-giang',
    description: 'Cùi bưởi giòn giòn không chút đắng, đỗ xanh bở tơi ngậy thơm chan cùng nước cốt dừa béo ngọt nức mũi.',
    categoryId: 6, // Món tráng miệng
    occasion: 'Rằm tháng Giêng',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
    prepTime: 45,
    cookTime: 30,
    difficulty: 'Dễ',
    servings: 4,
    ingredients: [
      { ingredientId: 30, name: 'Bột năng áo cùi bưởi', amount: 150, unit: 'g' },
      { ingredientId: 26, name: 'Nước cốt dừa thơm béo', amount: 200, unit: 'ml' },
      { ingredientId: 15, name: 'Đường phèn thanh ngọt', amount: 120, unit: 'g' },
      { ingredientId: 25, name: 'Đậu phộng rang thơm', amount: 30, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Cùi bưởi gọt sạch vỏ xanh và phần xơ trong, thái hạt lựu rồi bóp kỹ nhiều lần với muối hột, xả nước sạch cho hết đắng hoàn toàn.' },
      { step: 2, description: 'Chần cùi bưởi qua nước sôi có pha chút đường, vớt ngay vào âu nước đá lạnh để giữ độ giòn sần sật.' },
      { step: 3, description: 'Trộn cùi bưởi còn ẩm với bột năng cho bột áo đều từng miếng, thả vào nồi nước sôi luộc đến khi cùi trong veo thì vớt ra âu nước lạnh.' },
      { step: 4, description: 'Hấp chín đậu xanh đã cà vỏ. Đun nồi nước đường phèn, hòa chút bột năng cho sánh rồi trút đậu xanh và cùi bưởi vào khuấy đều.' },
      { step: 5, description: 'Múc chè ra bát, chan thìa nước cốt dừa béo ngậy và rắc đậu phộng rang giòn lên trên cùng đá bào mát lạnh.' }
    ],
    nutrition: { calories: 310, protein: 5, fat: 9, carbs: 54, fiber: 2.1 },
    isFeatured: false,
    isNew: false,
    rating: 4.8,
    views: 2680,
    authorId: 4,
    createdAt: '2024-02-05T15:20:00Z',
    comments: [
      { id: 108, userId: 2, userName: 'Trần Hương Giang', content: 'Làm theo cách khử đắng cùi bưởi này giòn ngon xuất sắc luôn!', createdAt: '2024-02-20T16:10:00Z' }
    ]
  },
  {
    id: 8,
    title: 'Gà nướng sả ớt da giòn thơm lừng',
    slug: 'ga-nuong-sa-ot-da-gion',
    description: 'Thịt gà ta chắc ngọt thấm đẫm sả ớt cay nồng, lớp da gà vàng ruộm bóng loáng thích hợp cho tiệc sum họp cuối tuần.',
    categoryId: 4, // Món nướng - Chiên
    occasion: 'Tiệc gia đình',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
    prepTime: 30,
    cookTime: 45,
    difficulty: 'Trung bình',
    servings: 4,
    ingredients: [
      { ingredientId: 2, name: 'Thịt gà ta nguyên con', amount: 1200, unit: 'g' },
      { ingredientId: 22, name: 'Sả tươi băm nhuyễn', amount: 60, unit: 'g' },
      { ingredientId: 21, name: 'Ớt sừng và ớt cay', amount: 20, unit: 'g' },
      { ingredientId: 10, name: 'Tỏi băm thơm', amount: 25, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm đậm đà', amount: 30, unit: 'ml' },
      { ingredientId: 14, name: 'Dầu màu điều', amount: 20, unit: 'ml' },
      { ingredientId: 15, name: 'Mật ong quét da', amount: 25, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Làm sạch gà bằng muối và rượu gừng để khử mùi, mổ phanh theo ức để trải phẳng cả con gà.' },
      { step: 2, description: 'Giã nhuyễn sả, ớt, tỏi, hạt nêm, tiêu, dầu màu điều và nước mắm thành hỗn hợp sốt ướp thơm lừng.' },
      { step: 3, description: 'Xoa đều sốt ướp vào bên trong mình gà và nhẹ nhàng lùa sốt dưới da để thịt ngấm đậm vị trong 60 phút.' },
      { step: 4, description: 'Nướng gà trên than hoa hoặc lò nướng 200°C trong 35 phút cho gà chín đều từ bên trong.' },
      { step: 5, description: 'Pha mật ong với chút dầu màu điều, quét đều lên lớp da ngoài nướng thêm 7-10 phút cho da giòn vàng óng ánh.' }
    ],
    nutrition: { calories: 490, protein: 42, fat: 28, carbs: 12, fiber: 1.2 },
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    views: 3100,
    authorId: 3,
    createdAt: '2024-03-08T16:00:00Z',
    comments: [
      { id: 109, userId: 1, userName: 'Nguyễn Văn Admin', content: 'Gà nướng thơm nức cả gian bếp, da giòn rụm chấm muối tiêu chanh chuẩn bài.', createdAt: '2024-03-15T21:00:00Z' }
    ]
  },
  {
    id: 9,
    title: 'Rau muống xào tỏi xanh mướt giòn rụm',
    slug: 'rau-muong-xao-toi',
    description: 'Món ăn dân dã thân thương nhưng đòi hỏi lửa lớn để cọng rau giữ nguyên sắc xanh bóng, tỏi phi thơm nồng nàn.',
    categoryId: 3, // Món xào
    occasion: null,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    prepTime: 10,
    cookTime: 10,
    difficulty: 'Dễ',
    servings: 3,
    ingredients: [
      { ingredientId: 7, name: 'Rau muống non ngắt ngọn', amount: 400, unit: 'g' },
      { ingredientId: 10, name: 'Tỏi ta đập dập', amount: 35, unit: 'g' },
      { ingredientId: 14, name: 'Dầu ăn', amount: 25, unit: 'ml' },
      { ingredientId: 13, name: 'Nước mắm ngon', amount: 15, unit: 'ml' }
    ],
    steps: [
      { step: 1, description: 'Nhặt ngọn rau muống non, rửa sạch ngâm nước muối loãng rồi vớt ra rổ để thật ráo nước.' },
      { step: 2, description: 'Đun nồi nước sôi bùng với chút muối hột, chần nhanh rau muống trong 30 giây rồi vớt thả ngay vào âu nước đá lạnh.' },
      { step: 3, description: 'Đun nóng chảo với dầu ăn, phi một nửa lượng tỏi đập dập cho dậy mùi thơm nức.' },
      { step: 4, description: 'Mở lửa cực lớn, trút rau muống vào xào đảo nhanh tay, nêm hạt nêm và thìa nước mắm ngon.' },
      { step: 5, description: 'Cho nốt phần tỏi còn lại vào đảo đều thêm 30 giây rồi trút ra đĩa thưởng thức ngay khi còn nóng giòn.' }
    ],
    nutrition: { calories: 125, protein: 4, fat: 7, carbs: 11, fiber: 3.5 },
    isFeatured: false,
    isNew: false,
    rating: 4.7,
    views: 1820,
    authorId: 2,
    createdAt: '2024-02-22T17:10:00Z',
    comments: [
      { id: 110, userId: 3, userName: 'Lê Minh Đức', content: 'Mẹo ngâm nước đá giúp rau xào giòn và xanh ngắt rất hiệu quả!', createdAt: '2024-02-25T19:45:00Z' }
    ]
  },
  {
    id: 10,
    title: 'Đậu hũ sốt cà chua thanh đạm',
    slug: 'dau-hu-sot-ca-chua',
    description: 'Miếng đậu phụ vàng giòn ngập tràn trong làn sốt cà chua đỏ tươi óng ánh, thơm phưng phức hành hoa.',
    categoryId: 5, // Món chay
    occasion: null,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    prepTime: 10,
    cookTime: 15,
    difficulty: 'Dễ',
    servings: 2,
    ingredients: [
      { ingredientId: 6, name: 'Đậu hũ non mơ', amount: 300, unit: 'g' },
      { ingredientId: 8, name: 'Cà chua chín mềm', amount: 200, unit: 'g' },
      { ingredientId: 28, name: 'Hành hoa thái nhỏ', amount: 30, unit: 'g' },
      { ingredientId: 14, name: 'Dầu thực vật', amount: 30, unit: 'ml' },
      { ingredientId: 13, name: 'Nước mắm chay hoặc muối', amount: 15, unit: 'ml' },
      { ingredientId: 15, name: 'Đường làm dịu vị chua', amount: 10, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Đậu hũ thấm khô nước, thái miếng vuông vừa ăn kích cỡ 3x3cm.' },
      { step: 2, description: 'Chiên đậu trong chảo dầu nóng lửa vừa đến khi các mặt có lớp vỏ vàng giòn ruộm thì gắp ra ráo dầu.' },
      { step: 3, description: 'Cà chua băm nhuyễn xào nhừ trong chảo với chút dầu ăn và gia vị cho tan thành nước sốt sánh mịn.' },
      { step: 4, description: 'Thả đậu hũ rán vào đun liu riu cùng sốt cà chua trong 5 phút để đậu hút đẫm vị đậm đà.' },
      { step: 5, description: 'Rắc hành hoa và chút tiêu xay lên trên rồi múc ra đĩa ăn kèm cơm nóng ấm bụng.' }
    ],
    nutrition: { calories: 230, protein: 14, fat: 12, carbs: 16, fiber: 2.2 },
    isFeatured: false,
    isNew: true,
    rating: 4.6,
    views: 1640,
    authorId: 4,
    createdAt: '2024-03-14T10:30:00Z',
    comments: [
      { id: 111, userId: 2, userName: 'Trần Hương Giang', content: 'Món ăn giản dị cho ngày rằm thanh lọc cơ thể rất ngon.', createdAt: '2024-03-15T12:00:00Z' }
    ]
  },
  {
    id: 11,
    title: 'Bún bò Huế cay nồng chuẩn vị Cố đô',
    slug: 'bun-bo-hue-cay-nong',
    description: 'Sợi bún to tròn trong tô nước dùng đậm đà hương mắm ruốc và sả ớt, kèm bắp bò hoa và chả cua thơm giòn.',
    categoryId: 2, // Món canh - Súp
    occasion: 'Tiệc gia đình',
    image: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=600&auto=format&fit=crop&q=80',
    prepTime: 40,
    cookTime: 90,
    difficulty: 'Khó',
    servings: 4,
    ingredients: [
      { ingredientId: 3, name: 'Bắp bò hoa giòn', amount: 400, unit: 'g' },
      { ingredientId: 1, name: 'Giò heo khoanh tròn', amount: 400, unit: 'g' },
      { ingredientId: 12, name: 'Bún sợi to xứ Huế', amount: 500, unit: 'g' },
      { ingredientId: 22, name: 'Sả cây đập dập', amount: 80, unit: 'g' },
      { ingredientId: 13, name: 'Mắm ruốc Huế truyền thống', amount: 35, unit: 'g' },
      { ingredientId: 21, name: 'Sa tế ớt Huế cay nồng', amount: 25, unit: 'g' },
      { ingredientId: 28, name: 'Hành hoa và hoa chuối', amount: 100, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Chần bắp bò và giò heo qua nước sôi, rửa sạch lại rồi cuộn bắp bò bằng chỉ cho tròn đều.' },
      { step: 2, description: 'Hầm xương ống và giò heo cùng sả cây đập dập trong 1.5 giờ. Thả bắp bò vào luộc chín tới rồi vớt ra ngâm nước nguội thái lát mỏng.' },
      { step: 3, description: 'Hòa mắm ruốc với nước lạnh, đun sôi để lắng cặn, chỉ lấy phần nước trong châm vào nồi nước dùng.' },
      { step: 4, description: 'Xào sa tế ớt màu điều đổ vào nồi nước dùng để tạo màu đỏ cam lóng lánh và vị cay ấm nồng đặc trưng.' },
      { step: 5, description: 'Xếp bún vào tô lớn, bày thịt bò hoa, giò heo, rắc hành ngò chan nước dùng sôi sùng sục, ăn cùng bắp chuối bào và rau thơm.' }
    ],
    nutrition: { calories: 560, protein: 38, fat: 18, carbs: 58, fiber: 3.5 },
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    views: 4850,
    authorId: 3,
    createdAt: '2024-01-28T09:15:00Z',
    comments: [
      { id: 112, userId: 4, userName: 'Phạm Thu Hà', content: 'Hương vị chuẩn Huế, cay ấm rất đã miệng ngày đông!', createdAt: '2024-02-14T20:10:00Z' }
    ]
  },
  {
    id: 12,
    title: 'Bánh xèo miền Trung giòn rụm nhân tôm thịt',
    slug: 'banh-xeo-mien-trung',
    description: 'Vỏ bánh xèo mỏng tang vàng ươm nghệ tươi, giòn rụm cuốn bánh tráng rau rừng chấm nước mắm đậu phộng sánh béo.',
    categoryId: 4, // Món nướng - Chiên
    occasion: null,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80',
    prepTime: 30,
    cookTime: 25,
    difficulty: 'Trung bình',
    servings: 3,
    ingredients: [
      { ingredientId: 30, name: 'Bột gạo xay pha nghệ', amount: 250, unit: 'g' },
      { ingredientId: 4, name: 'Tôm đất nhỏ ngọt', amount: 200, unit: 'g' },
      { ingredientId: 1, name: 'Thịt ba rọi thái mỏng', amount: 200, unit: 'g' },
      { ingredientId: 27, name: 'Giá đỗ sạch', amount: 150, unit: 'g' },
      { ingredientId: 26, name: 'Nước cốt dừa thơm', amount: 100, unit: 'ml' },
      { ingredientId: 28, name: 'Hành lá cắt khúc', amount: 30, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Khuấy đều bột gạo với nước, nước cốt dừa, bột nghệ, hành lá thái nhỏ và chút muối để bột nghỉ 30 phút.' },
      { step: 2, description: 'Xào sơ tôm và thịt ba rọi trong chảo gang cho săn và thơm.' },
      { step: 3, description: 'Làm nóng chảo với chút dầu ăn, múc một muôi bột láng thật mỏng đều khắp lòng chảo.' },
      { step: 4, description: 'Rải tôm, thịt và một nắm giá đỗ lên nửa mặt bánh, đậy nắp chảo trong 2 phút cho bánh chín giòn rụm viền ngoài.' },
      { step: 5, description: 'Gập đôi chiếc bánh lại, gắp ra đĩa ăn kèm rau cải con, xà lách và bát nước mắm chua ngọt hoặc mắm nêm đậm đà.' }
    ],
    nutrition: { calories: 430, protein: 22, fat: 16, carbs: 48, fiber: 2.6 },
    isFeatured: false,
    isNew: false,
    rating: 4.8,
    views: 3240,
    authorId: 2,
    createdAt: '2024-02-19T13:45:00Z',
    comments: [
      { id: 113, userId: 1, userName: 'Nguyễn Văn Admin', content: 'Vỏ bánh siêu giòn, cuốn rau cải cay thì không ngán chút nào.', createdAt: '2024-03-02T18:00:00Z' }
    ]
  },
  {
    id: 13,
    title: 'Sinh tố bơ sáp nước cốt dừa béo mịn',
    slug: 'sinh-to-bo-sap',
    description: 'Thức uống bổ dưỡng từ bơ sáp Đắk Lắk dẻo quánh, vị béo ngọt tự nhiên kết hợp cùng sữa tươi và đá tuyết mát lạnh.',
    categoryId: 7, // Đồ uống
    occasion: null,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
    prepTime: 10,
    cookTime: 5,
    difficulty: 'Dễ',
    servings: 2,
    ingredients: [
      { ingredientId: 26, name: 'Nước cốt dừa hoặc sữa đặc', amount: 50, unit: 'ml' },
      { ingredientId: 15, name: 'Đường phèn hoặc mật ong', amount: 15, unit: 'g' },
      { ingredientId: 25, name: 'Đậu phộng rang rắc mặt', amount: 15, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Bơ sáp chín tới khía dọc, bỏ hạt, dùng thìa nạo lấy phần thịt bơ xanh vàng dẻo quánh.' },
      { step: 2, description: 'Cho bơ, sữa tươi không đường, sữa đặc, nước cốt dừa và đường vào cối xay sinh tố.' },
      { step: 3, description: 'Thêm đá viên đập nhỏ rồi bấm máy xay ở tốc độ cao trong 45 giây đến khi hỗn hợp nhuyễn mịn như kem tuyết.' },
      { step: 4, description: 'Rót sinh tố bơ ra ly thủy tinh cao, rắc đậu phộng rang giòn hoặc dừa non nạo sợi lên mặt thưởng thức ngay.' }
    ],
    nutrition: { calories: 290, protein: 4, fat: 19, carbs: 28, fiber: 6.8 },
    isFeatured: false,
    isNew: false,
    rating: 4.7,
    views: 1450,
    authorId: 4,
    createdAt: '2024-03-04T15:00:00Z',
    comments: [
      { id: 114, userId: 3, userName: 'Lê Minh Đức', content: 'Mịn mượt như kem, uống vào mùa hè cực kỳ sảng khoái.', createdAt: '2024-03-06T10:15:00Z' }
    ]
  },
  {
    id: 14,
    title: 'Gà kho gừng ấm nồng ngày trở gió',
    slug: 'ga-kho-gung-am-nong',
    description: 'Từng miếng thịt gà ta vàng ươm thơm lừng mùi gừng tươi cay ấm, nước kho sền sệt quyện chặt đưa cơm ngày mưa.',
    categoryId: 1, // Món chính
    occasion: 'Giáng sinh',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
    prepTime: 15,
    cookTime: 25,
    difficulty: 'Trung bình',
    servings: 3,
    ingredients: [
      { ingredientId: 2, name: 'Thịt đùi gà ta chặt miếng', amount: 500, unit: 'g' },
      { ingredientId: 23, name: 'Gừng non thái sợi dài', amount: 50, unit: 'g' },
      { ingredientId: 10, name: 'Tỏi băm nhỏ', amount: 15, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm ngon', amount: 30, unit: 'ml' },
      { ingredientId: 15, name: 'Đường caramel tạo màu', amount: 15, unit: 'g' },
      { ingredientId: 29, name: 'Tiêu đen xay thơm', amount: 5, unit: 'g' }
    ],
    steps: [
      { step: 1, description: 'Thịt gà chặt miếng vừa ăn, rửa sạch với nước muối loãng có pha chút rượu gừng cho hết mùi tanh.' },
      { step: 2, description: 'Ướp thịt gà với một nửa lượng gừng sợi, tỏi băm, nước mắm ngon, hạt tiêu và hạt nêm trong 20 phút.' },
      { step: 3, description: 'Thắng nước hàng màu cánh gián từ đường, phi thơm phần gừng sợi còn lại cho dậy mùi thơm nức.' },
      { step: 4, description: 'Cho thịt gà vào xào săn trên lửa lớn để miếng thịt chắc và ngấm màu vàng đều đẹp mắt.' },
      { step: 5, description: 'Châm thêm nửa chén nước nóng, đậy vung kho lửa nhỏ đến khi nước kho cạn sền sệt óng ánh thì tắt bếp.' }
    ],
    nutrition: { calories: 380, protein: 32, fat: 16, carbs: 12, fiber: 1.5 },
    isFeatured: false,
    isNew: false,
    rating: 4.8,
    views: 2210,
    authorId: 2,
    createdAt: '2024-02-28T18:20:00Z',
    comments: [
      { id: 115, userId: 1, userName: 'Nguyễn Văn Admin', content: 'Gừng kho cùng thịt gà dẻo quánh, ăn cơm mùa đông thì không gì sánh bằng.', createdAt: '2024-03-01T19:30:00Z' }
    ]
  },
  {
    id: 15,
    title: 'Chả giò rế tôm thịt giòn rụm cung đình',
    slug: 'cha-gio-re-tom-thit',
    description: 'Vỏ bánh tráng rế đan lưới chiên giòn tan trong miệng, nhân tôm thịt nấm mèo đậm đà hương vị truyền thống.',
    categoryId: 8, // Món khai vị
    occasion: 'Tết cổ truyền',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    prepTime: 35,
    cookTime: 20,
    difficulty: 'Trung bình',
    servings: 4,
    ingredients: [
      { ingredientId: 1, name: 'Thịt nạc vai băm nhỏ', amount: 300, unit: 'g' },
      { ingredientId: 4, name: 'Tôm tươi băm nhỏ', amount: 200, unit: 'g' },
      { ingredientId: 17, name: 'Cà rốt bào sợi', amount: 80, unit: 'g' },
      { ingredientId: 19, name: 'Nấm mèo ngâm nở thái nhỏ', amount: 40, unit: 'g' },
      { ingredientId: 16, name: 'Trứng gà', amount: 1, unit: 'quả' },
      { ingredientId: 14, name: 'Dầu ăn để chiên ngập', amount: 300, unit: 'ml' },
      { ingredientId: 13, name: 'Nước mắm chấm nem', amount: 30, unit: 'ml' }
    ],
    steps: [
      { step: 1, description: 'Trộn đều thịt băm, tôm băm, cà rốt, nấm mèo, hành hoa, trứng gà, hạt tiêu và chút hạt nêm làm nhân chả giò.' },
      { step: 2, description: 'Đặt bánh tráng rế lên thớt sạch, cho lượng nhân vừa phải vào cuộn tròn chặt tay hai đầu.' },
      { step: 3, description: 'Đun nóng chảo dầu ngập cuộn nem ở lửa vừa, thả chả giò vào chiên lần 1 cho chín tới và se mặt bánh.' },
      { step: 4, description: 'Trước khi ăn chiên lại lần 2 với dầu nóng già để lớp vỏ bánh rế giòn rụm vàng ươm và không ngậm dầu.' },
      { step: 5, description: 'Vớt chả giò ra giấy thấm dầu, xếp lên đĩa ăn kèm rau sống và chấm nước mắm tỏi ớt chua ngọt.' }
    ],
    nutrition: { calories: 410, protein: 26, fat: 22, carbs: 26, fiber: 2.4 },
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    views: 3780,
    authorId: 3,
    createdAt: '2024-01-15T11:00:00Z',
    comments: [
      { id: 116, userId: 2, userName: 'Trần Hương Giang', content: 'Bánh tráng rế chiên lên nhìn đẹp mắt mà giòn tan lâu hơn bánh thường!', createdAt: '2024-02-05T17:40:00Z' }
    ]
  },
  {
    id: 16,
    title: 'Canh bí đỏ hầm tôm tươi ngọt lịm',
    slug: 'canh-bi-do-ham-tom',
    description: 'Bí đỏ bở bùi sánh mịn nấu cùng thịt tôm tươi giã dập, thơm ngát mùi ngò gai thanh mát bổ dưỡng cho cả gia đình.',
    categoryId: 2, // Món canh - Súp
    occasion: null,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    prepTime: 15,
    cookTime: 20,
    difficulty: 'Dễ',
    servings: 4,
    ingredients: [
      { ingredientId: 24, name: 'Bí đỏ quả gọt vỏ cắt miếng', amount: 450, unit: 'g' },
      { ingredientId: 4, name: 'Tôm sú tươi lột vỏ', amount: 200, unit: 'g' },
      { ingredientId: 10, name: 'Hành tỏi băm nhuyễn', amount: 15, unit: 'g' },
      { ingredientId: 28, name: 'Ngò gai và rau ngổ', amount: 30, unit: 'g' },
      { ingredientId: 13, name: 'Nước mắm ngon', amount: 20, unit: 'ml' },
      { ingredientId: 14, name: 'Dầu ăn', amount: 15, unit: 'ml' }
    ],
    steps: [
      { step: 1, description: 'Bí đỏ gọt vỏ, bỏ ruột, rửa sạch rồi thái miếng vuông dày khoảng 2cm.' },
      { step: 2, description: 'Tôm tươi bóc vỏ, rút chỉ đen, giã dập nhẹ rồi ướp cùng chút hành băm, hạt nêm và tiêu trong 10 phút.' },
      { step: 3, description: 'Phi thơm hành tỏi băm trong nồi với dầu ăn, trút tôm vào xào săn chín hồng.' },
      { step: 4, description: 'Đổ 1 lít nước lọc vào đun sôi bùng, cho bí đỏ vào hầm lửa vừa khoảng 12 phút cho bí chín mềm bở.' },
      { step: 5, description: 'Nêm thìa nước mắm ngon cho canh đậm đà thanh ngọt, rắc ngò gai rau ngổ thái nhỏ rồi múc ra bát thưởng thức nóng.' }
    ],
    nutrition: { calories: 195, protein: 16, fat: 5, carbs: 22, fiber: 3.8 },
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    views: 1890,
    authorId: 4,
    createdAt: '2024-03-12T08:00:00Z',
    comments: [
      { id: 117, userId: 3, userName: 'Lê Minh Đức', content: 'Món canh ngọt tự nhiên từ tôm và bí đỏ, các bé nhà mình rất mê!', createdAt: '2024-03-16T19:00:00Z' }
    ]
  }
];

// Cập nhật số lượng công thức cho từng danh mục
if (typeof CATEGORIES !== 'undefined') {
  CATEGORIES.forEach(cat => {
    cat.recipeCount = RECIPES.filter(r => r.categoryId === cat.id).length;
  });
}
