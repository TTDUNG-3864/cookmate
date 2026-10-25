# CookMate — Website Hỗ Trợ Nấu Ăn Chuẩn Định Lượng

CookMate là nền tảng hỗ trợ nấu ăn hiện đại dành cho gia đình Việt Nam, tập trung vào trải nghiệm tra cứu món ngon, tự động co giãn định lượng nguyên liệu theo số người ăn, ước tính dinh dưỡng trên từng khẩu phần và chia sẻ công thức ẩm thực.

Dự án được xây dựng hoàn toàn từ con số 0 bằng **HTML5, CSS3 và Vanilla JavaScript**, chuẩn bị sẵn sàng cho việc tích hợp Backend Flask sau này.

---

## 1. Cấu trúc thư mục mã nguồn

```text
D:\cookmate\
│
├── AI_RULES.md                              # Quy tắc làm việc & bảo vệ mã nguồn (Chỉ đọc)
├── cookmate_website_h_tr_n_u_n.html         # Tài liệu HTML mẫu tham khảo (Chỉ đọc)
├── PROJECT_STATUS.md                        # Nhật ký và trạng thái tiến độ dự án
├── README.md                                # Hướng dẫn chạy và thông tin dự án
│
├── index.html                               # Trang chủ CookMate
│
├── pages/
│   ├── recipes.html                         # UC01 - Danh sách công thức (phân trang, sắp xếp)
│   ├── categories.html                      # UC02 - Danh mục món ăn
│   ├── new-recipes.html                     # UC03 - Công thức mới nhất
│   ├── featured-recipes.html                # UC04 - Công thức nổi bật nhất
│   ├── holiday-recipes.html                 # UC05 - Món ngon theo dịp lễ (Tết, Rằm, Giáng sinh...)
│   ├── recipe-detail.html                   # UC06 - Chi tiết công thức, Co giãn khẩu phần, Dinh dưỡng
│   ├── search.html                          # UC07 - Tìm kiếm và bộ lọc nâng cao
│   │
│   ├── auth/
│   │   ├── login.html                       # UC09 - Đăng nhập demo
│   │   └── register.html                    # UC08 - Đăng ký tài khoản
│   │
│   ├── account/
│   │   ├── profile.html                     # UC11 - Hồ sơ cá nhân & chỉnh sửa
│   │   ├── my-recipes.html                  # UC13 - Quản lý công thức của tôi
│   │   ├── favorites.html                   # UC15 - Quản lý món yêu thích
│   │   └── recipe-form.html                 # UC12 - Đăng / Chỉnh sửa công thức (động)
│   │
│   └── admin/
│       ├── index.html                       # UC21 - Tổng quan quản trị (Dashboard KPI & Hàng đợi duyệt)
│       ├── approve-recipes.html             # Duyệt công thức thành viên (Xem trước chi tiết, Duyệt, Từ chối)
│       ├── recipe-form.html                 # Thêm / Chỉnh sửa công thức Quản trị (Xuất bản công khai ngay)
│       ├── recipes.html                     # UC16 - Quản lý công thức (CRUD)
│       ├── categories.html                  # UC17 - Quản lý danh mục (CRUD)
│       ├── ingredients.html                 # UC18 - Quản lý nguyên liệu (CRUD dinh dưỡng)
│       ├── accounts.html                    # UC19 - Quản lý tài khoản (Khóa/Mở khóa)
│       ├── comments.html                    # UC20 - Quản lý bình luận (Xóa/Duyệt)
│       └── statistics.html                  # UC21 - Thống kê & Báo cáo trực quan
│
└── assets/
    ├── css/
    │   ├── variables.css                    # Design tokens: màu cam #E85D2A, xanh #2E7D4F, font, spacing
    │   ├── reset.css                        # Chuẩn hóa CSS reset
    │   ├── base.css                         # Typography Be Vietnam Pro, scrollbar, body
    │   ├── layout.css                       # Grid responsive, flexbox, containers
    │   ├── components.css                   # Header, footer, card, modal, toast, table, tag
    │   ├── pages.css                        # Style đặc thù từng trang (Hero, detail, kitchen mode)
    │   ├── admin.css                        # Layout sidebar và bảng điều khiển quản trị
    │   └── responsive.css                   # Breakpoints mobile (360px, 390px, 768px, 1024px+)
    │
    ├── js/
    │   ├── utils.js                         # Hàm tiện ích chuỗi, số, formatFraction, validate, debounce
    │   ├── storage.js                       # Quản lý localStorage (phiên đăng nhập, yêu thích, CRUD demo)
    │   ├── components.js                    # UI render (Toast, modal, confirm, recipe card, pagination)
    │   ├── navigation.js                    # Render Header, Footer, Menu mobile, Auth status
│   │   ├── admin-shell.js                   # Điều khiển Admin Shell, xem website tại chỗ, hamburger & icon rail
    │   ├── app.js                           # Khởi tạo ứng dụng DOMContentLoaded
    │   │
    │   └── data/
    │       ├── categories.js                # 8 danh mục ẩm thực Việt Nam chuẩn
    │       ├── ingredients.js               # 30 nguyên liệu kèm chỉ số Calo, Protein, Fat, Carbs, Fiber
    │       ├── users.js                     # 5 tài khoản demo (Admin & Member) kèm gợi ý đăng nhập
    │       └── recipes.js                   # 16 công thức nấu ăn phong phú, chi tiết từng bước
    │
    └── images/
        └── placeholders/
            └── recipe-placeholder.svg       # Ảnh dự phòng khi mạng lỗi
```

---

## 2. Hướng dẫn chạy dự án

### Cách 1: Sử dụng Python HTTP Server (Khuyên dùng)
Mở terminal tại thư mục dự án và chạy:
```powershell
cd d:\cookmate
python -m http.server 8000
```
Sau đó mở trình duyệt và truy cập: [http://localhost:8000](http://localhost:8000)

### Cách 2: Sử dụng Node.js (npx serve hoặc http-server)
```powershell
cd d:\cookmate
npx serve . -p 8000
```

### Cách 3: Mở trực tiếp file HTML
Bạn có thể nhấp đúp trực tiếp vào file `d:\cookmate\index.html` trong File Explorer để mở bằng Chrome, Edge hoặc Firefox. Mọi tương tác giao diện và `localStorage` đều hoạt động mượt mà.

---

## 3. Tài khoản demo kiểm thử

Hệ thống cung cấp sẵn các tài khoản demo (đã được cấu hình trong `assets/js/data/users.js`):

| Vai trò | Email đăng nhập | Mật khẩu gợi ý | Tên hiển thị |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@cookmate.vn` | `admin123` | Nguyễn Văn Admin |
| **Quản trị viên (Admin)** | `dat@cookmate.vn` | `admin123` | Nguyễn Như Đạt |
| **Thành viên (Member)** | `giang@cookmate.vn` | `giang123` | Trần Hương Giang |
| **Thành viên (Member)** | `duc@cookmate.vn` | `duc123` | Lê Minh Đức |

> **Lưu ý bảo mật:** Đây là môi trường Frontend demo mô phỏng, trạng thái đăng nhập được lưu trữ qua `localStorage` và không lưu mật khẩu thô để đảm bảo an toàn.

---

## 4. Các tính năng nổi bật & 21 Use Case

1. **Khám phá đa dạng (UC01 - UC05):** Tìm kiếm theo danh mục, món mới, món nổi bật, mâm cỗ Tết, tiệc gia đình.
2. **Co giãn khẩu phần tự động (UC06):** Thay đổi số người ăn (1, 2, 4, 8...), hệ thống tự động nhân chia định lượng nguyên liệu theo tỷ lệ chuẩn, hiển thị số đo dạng phân số đẹp mắt (ví dụ: ½ thìa, 1 ¼ quả).
3. **Ước tính dinh dưỡng (UC06):** Tự động tính toán Calo, Đạm (Protein), Chất béo (Fat), Tinh bột (Carbs) và Chất xơ trên mỗi khẩu phần ăn.
4. **Chế độ Đứng bếp (Kitchen Mode):** Giao diện chữ lớn, tương phản cao, thuận tiện đặt điện thoại hoặc máy tính bảng trên kệ bếp khi đang thao tác nấu.
5. **Tìm kiếm & Bộ lọc thông minh (UC07):** Tìm gần đúng theo tên món hoặc nguyên liệu trong tủ lạnh; lọc kết hợp nhiều điều kiện; có thông báo khi từ khóa rỗng hoặc không có kết quả.
6. **Tài khoản & Tương tác (UC08 - UC15):** Đăng ký, đăng nhập, hồ sơ cá nhân, đăng công thức động với nhiều bước làm, quản lý công thức cá nhân, yêu thích và bình luận.
7. **Khu vực Quản trị toàn diện (UC16 - UC21):** 7 màn hình quản trị quản lý công thức, danh mục, nguyên liệu, tài khoản, bình luận và biểu đồ thống kê trực quan.
