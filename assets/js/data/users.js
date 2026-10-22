/**
 * CookMate - Dữ liệu người dùng demo
 * Lưu ý: Đây là dữ liệu demo, không phải hệ thống xác thực thực tế
 */

const USERS = [
  {
    id: 1,
    name: 'Nguyễn Văn Admin',
    email: 'admin@cookmate.vn',
    role: 'admin',
    avatar: '',
    joinDate: '2024-01-15',
    bio: 'Quản trị viên hệ thống CookMate',
    recipeCount: 0,
    status: 'active'
  },
  {
    id: 2,
    name: 'Trần Hương Giang',
    email: 'giang@cookmate.vn',
    role: 'member',
    avatar: '',
    joinDate: '2024-03-20',
    bio: 'Yêu nấu ăn, thích chia sẻ công thức gia đình',
    recipeCount: 0,
    status: 'active'
  },
  {
    id: 3,
    name: 'Lê Minh Đức',
    email: 'duc@cookmate.vn',
    role: 'member',
    avatar: '',
    joinDate: '2024-05-10',
    bio: 'Đầu bếp nghiệp dư, thích khám phá món mới',
    recipeCount: 0,
    status: 'active'
  },
  {
    id: 4,
    name: 'Phạm Thu Hà',
    email: 'ha@cookmate.vn',
    role: 'member',
    avatar: '',
    joinDate: '2024-06-01',
    bio: 'Mẹ bỉm sữa, nấu ăn cho gia đình mỗi ngày',
    recipeCount: 0,
    status: 'active'
  },
  {
    id: 5,
    name: 'Nguyễn Như Đạt',
    email: 'dat@cookmate.vn',
    role: 'admin',
    avatar: '',
    joinDate: '2024-02-10',
    bio: 'Quản trị viên CookMate',
    recipeCount: 0,
    status: 'active'
  }
];

// Demo credentials for login simulation (NOT real auth)
const DEMO_CREDENTIALS = [
  { email: 'admin@cookmate.vn', passwordHint: 'admin123', userId: 1 },
  { email: 'giang@cookmate.vn', passwordHint: 'giang123', userId: 2 },
  { email: 'duc@cookmate.vn', passwordHint: 'duc123', userId: 3 }
];
