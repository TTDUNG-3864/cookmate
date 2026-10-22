# COOKMATE — UI/UX DESIGN SYSTEM & GUIDELINES

Tài liệu đặc tả hệ thống thiết kế giao diện (Design System) chuẩn hóa cho dự án **CookMate — Website hỗ trợ nấu ăn**.

---

## 1. TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

- **Phong cách:** *Modern Food Platform* — Hiện đại, ấm áp, thân thiện, đáng tin cậy và khơi gợi cảm hứng nấu ăn gia đình.
- **Tập trung người dùng:** Tối ưu cho trải nghiệm người đứng bếp thực tế (chữ to rõ, nút bấm dễ chạm, hỗ trợ chế độ Đứng bếp).
- **Mobile-First:** Tối ưu hóa từ màn hình điện thoại di động (360px - 430px) trước khi mở rộng lên Tablet (768px) và Desktop (1024px - 1440px).

---

## 2. BẢNG MÀU CHUẨN (COLOR PALETTE & DESIGN TOKENS)

Hệ thống biến CSS được khai báo tập trung tại `assets/css/variables.css`:

### 2.1. Màu thương hiệu (Brand Colors)
- **Primary (Cam đất / Năng lượng ẩm thực):**
  - `--primary: #E85D2A` (Màu nhận diện chính, nút bấm CTA, badge nổi bật)
  - `--primary-light: #FF7A45` (Hover, trạng thái tương tác)
  - `--primary-dark: #C74E22` (Active, viền nhấn)
- **Secondary (Xanh lá / Tươi sạch & Sức khỏe):**
  - `--secondary: #2E7D4F` (Điểm nhấn dinh dưỡng, nguyên liệu tươi, thẻ món chay)
  - `--secondary-light: #3A9D63`
  - `--secondary-dark: #225C3A`

### 2.2. Màu nền & Màu trung tính (Neutrals)
- `--bg: #FFF9F2` (Màu nền tổng thể website, tạo cảm giác ấm áp)
- `--bg-white: #FFFFFF` (Màu nền card nội dung, header, modal)
- `--bg-dark: #292524` (Nền footer, chữ tiêu đề đậm)
- `--text: #292524` (Màu chữ chính, đảm bảo độ tương phản cao WCAG AAA)
- `--text-secondary: #78716C` (Màu chú thích, meta thông tin, ngày tháng)
- `--text-light: #A8A29E` (Placeholder, icon phụ)
- `--border: #E7E5E4` (Đường viền card, bảng dữ liệu)
- `--border-light: #F5F5F4` (Đường ngăn cách nhẹ)

### 2.3. Màu trạng thái (Feedback Colors)
- **Success:** `--success: #16A34A` (Toast thành công, badge món mới)
- **Error:** `--error: #DC2626` (Báo lỗi biểu mẫu, nút xóa nguy hiểm)
- **Warning:** `--warning: #F59E0B` (Badge dịp lễ, lưu ý khẩu phần)
- **Info:** `--info: #3B82F6` (Thông tin tham khảo dinh dưỡng)

---

## 3. TYPOGRAPHY (HỆ THỐNG PHÔNG CHỮ)

- **Font Family:** `'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Nhập trực tiếp từ Google Fonts với đầy đủ các mức độ đậm nhạt: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).
  - Tối ưu hóa 100% cho tiếng Việt (dấu thanh rõ nét, không bị lỗi đè dấu).

### Thang kích thước chữ:
- `--text-xs: 0.75rem (12px)` — Nhãn nhỏ, tag, thời gian
- `--text-sm: 0.875rem (14px)` — Chữ phụ, meta info, thông số dinh dưỡng
- `--text-base: 1rem (16px)` — Văn bản thân bài viết, nội dung các bước nấu
- `--text-lg: 1.125rem (18px)` — Tiêu đề card, nhãn form lớn
- `--text-xl: 1.25rem (20px)` — Tiêu đề nhóm, heading nhỏ
- `--text-2xl: 1.5rem (24px)` — Tiêu đề khu vực (Section title)
- `--text-3xl: 1.875rem (30px)` — Tiêu đề trang (Page title)
- `--text-4xl: 2.25rem (36px)` — Tiêu đề chính Hero Banner

---

## 4. QUY CHUẨN THÀNH PHẦN GIAO DIỆN (COMPONENTS)

### 4.1. Thẻ món ăn (`.recipe-card`)
- Tỷ lệ ảnh chuẩn: `aspect-ratio: 4/3` hoặc `16/9`, `object-fit: cover`.
- Hiệu ứng hover: Phóng to nhẹ ảnh `transform: scale(1.03)`, đổ bóng nâng nhẹ `box-shadow: var(--shadow-md)`.
- Huy hiệu (Badge): Đặt góc trên ảnh, bo góc tròn `--radius-full`.
- Nút Yêu thích (Trái tim): Nằm ở góc dưới card, đổi icon từ regular sang solid màu đỏ cam khi được chọn.

### 4.2. Bộ điều chỉnh khẩu phần (`.servings-control`)
- Thiết kế dạng Stepper trực quan với hai nút `[-]` và `[+]`.
- Con số khẩu phần hiển thị lớn, nổi bật ở giữa.
- Khi bấm nút, toàn bộ định lượng nguyên liệu tự động nhân chia tương ứng theo phân số đẹp (¼, ½, ¾, v.v.).

### 4.3. Bảng dinh dưỡng (`.nutrition-panel`)
- Hiển thị 5 chỉ số cốt lõi: Năng lượng (Kcal), Đạm (Protein), Chất béo (Fat), Tinh bột (Carbs), Chất xơ (Fiber).
- Đi kèm nhãn cảnh báo: *"Chỉ số dinh dưỡng mang tính chất ước tính tham khảo, không thay thế tư vấn chuyên gia y tế"*.

### 4.4. Chế độ Đứng bếp (`.kitchen-mode`)
- Nút bấm bật/tắt tiện lợi ngay đầu trang chi tiết món ăn.
- Tự động phóng to kích thước chữ lên 125%, tăng độ tương phản và khoảng cách các bước nấu để người nội trợ dễ đọc khi đặt điện thoại trên bàn bếp.

---

## 5. ĐIỂM GÃY RESPONSIVE (BREAKPOINTS)

1. **Mobile (Màn hình nhỏ & Phổ biến: ≤ 639px):**
   - Lưới chuyển sang 1 cột (`1fr`).
   - Nút bấm và vùng chạm cảm ứng có chiều cao tối thiểu 44px.
   - Menu chính thu gọn thành Navigation Drawer trượt từ cạnh phải màn hình.
   - Bảng dữ liệu quản trị hỗ trợ cuộn ngang mượt mà (`.table-responsive`).
2. **Tablet (640px – 1023px):**
   - Lưới hiển thị 2 cột cân đối.
   - Sidebar tìm kiếm và bố cục chi tiết tối ưu dạng khối đôi.
3. **Desktop (1024px – 1279px):**
   - Lưới món ăn 3 cột.
   - Menu thanh điều hướng mở rộng đầy đủ trên Header.
   - Layout trang chi tiết chia cột rõ ràng: Cột trái (Nguyên liệu + Dinh dưỡng), Cột phải (Các bước chế biến).
4. **Large Desktop (≥ 1280px):**
   - Giới hạn độ rộng tối đa theo `--container: 1280px` để không làm loãng giao diện trên màn hình 2K/4K.
   - Lưới món ăn hiển thị 4 cột đẹp mắt.

---

## 6. QUY TẮC HIỆU ỨNG & CHUYỂN ĐỘNG

- Mọi hiệu ứng chuyển động (`transition`) có thời gian tối ưu từ `150ms` đến `300ms` với `ease-in-out`.
- Tôn trọng thuộc tính hệ điều hành `@media (prefers-reduced-motion: reduce)`: Tự động tắt hiệu ứng chuyển động đối với người dùng nhạy cảm với chuyển động hình ảnh.
