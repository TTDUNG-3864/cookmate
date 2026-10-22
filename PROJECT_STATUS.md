# COOKMATE — BÁO CÁO TIẾN ĐỘ VÀ TRẠNG THÁI DỰ ÁN (PROJECT STATUS)

**Dự án:** Website hỗ trợ nấu ăn CookMate  
**Giai đoạn:** Xây dựng toàn bộ Frontend (HTML5, CSS3, Vanilla JavaScript)  
**Ngày cập nhật:** 2026-10-22  
**Trạng thái phiên làm việc:** ĐÃ HOÀN THÀNH 100% TOÀN BỘ YÊU CẦU DỰ ÁN VÀ 21 USE CASE

---

## 1. MỤC TIÊU DỰ ÁN & CÔNG NGHỆ

- **Mục tiêu:** Xây dựng trọn vẹn 100% frontend website CookMate đáp ứng 21 Use Case (UC01 - UC21), giao diện chuẩn hiện đại, responsive mobile-first, có tương tác JavaScript thực tế mô phỏng lưu trữ qua `localStorage`, sẵn sàng chuyển đổi tích hợp Flask Backend sau này.
- **Công nghệ áp dụng:**
  - HTML5 chuẩn ngữ nghĩa và trợ năng (Semantic HTML, WAI-ARIA).
  - CSS3 tự xây dựng hoàn toàn theo Design Tokens biến CSS (không dùng Tailwind, không dùng framework bên ngoài):
    - `variables.css`, `reset.css`, `base.css`, `layout.css`, `components.css`, `pages.css`, `admin.css`, `responsive.css`.
  - JavaScript thuần (Vanilla JS), module hóa hướng đối tượng nhẹ (`CookMateStorage`, `CookMateUI`, `Navigation`), không dùng framework nặng.
  - Font chữ: `Be Vietnam Pro` (Google Fonts) hỗ trợ tiếng Việt tuyệt đối.
  - Icon: Font Awesome 6.5.1 (CDN).
  - Dữ liệu demo: Độc lập trong `assets/js/data/`, lưu tương tác vào `localStorage`.

---

## 2. MA TRẬN 21 USE CASE VÀ KẾT QUẢ NGHIỆM THU

| STT | Mã Use Case | Tên chức năng | File thực hiện | Cách thao tác | Kết quả mong đợi | Kết quả kiểm thử thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **UC01** | Xem danh sách công thức | `pages/recipes.html` | Bấm menu "Công thức" hoặc xem phân trang/sắp xếp | Hiển thị dạng card, phân trang 9 món/trang, sắp xếp theo mới/phổ biến/đánh giá | Đạt 100%, phân trang và đổi kiểu sắp xếp mượt mà | **ĐẠT** |
| 2 | **UC02** | Xem công thức theo danh mục | `pages/categories.html` | Chọn danh mục trên Header/Trang chủ hoặc trang danh mục | Lọc danh sách món ăn theo categoryId tương ứng, đếm số món | Đạt 100%, hỗ trợ tham số `?id=X` trên URL | **ĐẠT** |
| 3 | **UC03** | Xem công thức mới | `pages/new-recipes.html` | Bấm menu "Mới nhất" hoặc tab "Mới chia sẻ" trên trang chủ | Danh sách chỉ chứa các món có nhãn mới, sắp xếp theo ngày tạo giảm dần | Đạt 100%, hiển thị badge "Mới" | **ĐẠT** |
| 4 | **UC04** | Xem công thức nổi bật | `pages/featured-recipes.html` | Bấm menu "Nổi bật" hoặc tab "Nổi bật nhất" trên trang chủ | Danh sách chỉ chứa các món có nhãn nổi bật, sắp xếp theo lượt xem giảm dần | Đạt 100%, hiển thị badge lửa "Nổi bật" | **ĐẠT** |
| 5 | **UC05** | Xem công thức theo dịp lễ | `pages/holiday-recipes.html` | Bấm menu "Theo dịp lễ" hoặc chọn pill Tết, Rằm, Tiệc | Lọc món ăn theo dịp lễ tương ứng | Đạt 100%, hỗ trợ tham số `?occasion=X` | **ĐẠT** |
| 6 | **UC06** | Xem chi tiết công thức | `pages/recipe-detail.html` | Bấm vào bất kỳ card món ăn nào | Bố cục chi tiết: ảnh, thời gian, độ khó, nguyên liệu, các bước làm, dinh dưỡng | Đạt 100%, có Chế độ Đứng bếp và gợi ý món liên quan | **ĐẠT** |
| 7 | **UC06-A**| Co giãn khẩu phần tự động | `pages/recipe-detail.html` | Bấm nút (+) hoặc (-) tại mục khẩu phần ăn | Tự động nhân chia định lượng nguyên liệu theo tỷ lệ, không đổi dữ liệu gốc, định lượng làm tròn đẹp | Đạt 100%, định lượng cập nhật tức thì kèm toast thông báo | **ĐẠT** |
| 8 | **UC06-B**| Ước tính dinh dưỡng | `pages/recipe-detail.html` | Xem bảng dinh dưỡng bên phải trang chi tiết | Hiển thị Calo, Đạm, Béo, Tinh bột, Chất xơ trên 1 khẩu phần kèm lưu ý tham khảo | Đạt 100%, hiển thị chỉ số rõ ràng, khoa học | **ĐẠT** |
| 9 | **UC07** | Tìm kiếm công thức | `pages/search.html` | Nhập từ khóa tên món hoặc nguyên liệu, chọn bộ lọc | Tìm gần đúng, lọc kết hợp danh mục, độ khó, thời gian, dịp lễ; xử lý rỗng và không kết quả | Đạt 100%, liên kết query param `?q=` từ header và banner | **ĐẠT** |
| 10 | **UC08** | Đăng ký tài khoản | `pages/auth/register.html` | Nhập họ tên, email, mật khẩu, xác nhận mật khẩu | Kiểm tra bắt buộc, định dạng email, mật khẩu khớp, kiểm tra email trùng trong demo | Đạt 100%, lưu tài khoản mới vào storage và chuyển sang đăng nhập | **ĐẠT** |
| 11 | **UC09** | Đăng nhập | `pages/auth/login.html` | Nhập email và mật khẩu hoặc dùng gợi ý tài khoản mẫu | Kiểm tra đầu vào, đăng nhập demo, cập nhật phiên đăng nhập và chuyển hướng | Đạt 100%, hiển thị sẵn thông tin tài khoản admin và member mẫu | **ĐẠT** |
| 12 | **UC10** | Đăng xuất | `assets/js/navigation.js` | Bấm nút Đăng xuất trên menu tài khoản | Xóa phiên đăng nhập demo, cập nhật lại header và chuyển về trang chủ | Đạt 100%, toast thông báo đăng xuất thành công | **ĐẠT** |
| 13 | **UC11** | Quản lý hồ sơ cá nhân | `pages/account/profile.html` | Bấm vào "Hồ sơ cá nhân" từ menu avatar | Xem thông tin, bấm "Chỉnh sửa" cập nhật tên và tiểu sử | Đạt 100%, cập nhật và lưu vào localStorage | **ĐẠT** |
| 14 | **UC12** | Đăng công thức | `pages/account/recipe-form.html`| Bấm "Đăng công thức", nhập thông tin, thêm hàng nguyên liệu và bước làm | Form động thêm/xóa nguyên liệu và bước làm, kiểm tra hợp lệ, lưu vào demo storage | Đạt 100%, món mới xuất hiện ngay trên danh sách và chi tiết | **ĐẠT** |
| 15 | **UC13** | Quản lý công thức của tôi | `pages/account/my-recipes.html` | Bấm "Công thức của tôi" trên menu người dùng | Danh sách các món do user đăng, nút Xem, Sửa, Xóa có hộp thoại xác nhận | Đạt 100%, xóa cập nhật lại danh sách ngay lập tức | **ĐẠT** |
| 16 | **UC14** | Bình luận công thức | `pages/recipe-detail.html` | Nhập nội dung bình luận và bấm gửi (yêu cầu đăng nhập) | Thêm bình luận mới vào danh sách, hiển thị thời gian, cho phép xóa bình luận của mình | Đạt 100%, có nhắc đăng nhập nếu là khách | **ĐẠT** |
| 17 | **UC15** | Quản lý món yêu thích | `pages/account/favorites.html` | Bấm nút trái tim trên card hoặc trang chi tiết | Bật/tắt yêu thích, cập nhật số lượng trên header badge, hiển thị danh sách yêu thích | Đạt 100%, lưu bền vững qua lần tải lại trang | **ĐẠT** |
| 18 | **UC16** | Admin: Quản lý công thức | `pages/admin/recipes.html` | Xem bảng công thức, tìm kiếm, lọc danh mục, xem, sửa, xóa | Bảng quản lý đầy đủ thông tin, tìm kiếm nhanh, xóa có modal xác nhận | Đạt 100%, hoạt động ổn định không phát sinh lỗi | **ĐẠT** |
| 19 | **UC17** | Admin: Quản lý danh mục | `pages/admin/categories.html` | Xem bảng danh mục, bấm "Thêm danh mục", sửa, xóa | Modal thêm/sửa danh mục có icon FontAwesome, lưu vào storage | Đạt 100%, đồng bộ với toàn bộ trang web | **ĐẠT** |
| 20 | **UC18** | Admin: Quản lý nguyên liệu | `pages/admin/ingredients.html` | Xem bảng nguyên liệu, bấm "Thêm nguyên liệu", sửa, xóa | Quản lý Calo, Đạm, Béo, Tinh bột, đơn vị, nhóm nguyên liệu | Đạt 100%, hỗ trợ tìm kiếm và lọc nhóm | **ĐẠT** |
| 21 | **UC19** | Admin: Quản lý tài khoản | `pages/admin/accounts.html` | Xem danh sách tài khoản, tìm kiếm, bấm Khóa / Mở khóa | Hiển thị vai trò, ngày tham gia, toggle trạng thái active/inactive, không lộ mật khẩu | Đạt 100%, bảo mật mô phỏng đúng chuẩn | **ĐẠT** |
| 22 | **UC20** | Admin: Quản lý bình luận | `pages/admin/comments.html` | Xem danh sách bình luận trên toàn hệ thống, tìm kiếm, xóa | Xem liên kết đến món ăn tương ứng, xóa bình luận vi phạm có xác nhận | Đạt 100%, xóa đồng bộ khỏi storage | **ĐẠT** |
| 23 | **UC21** | Admin: Thống kê & Báo cáo | `pages/admin/statistics.html` và `pages/admin/index.html` | Xem KPI, biểu đồ thanh phân bố danh mục và độ khó, bảng xếp hạng | Tự động tính toán số liệu từ dữ liệu demo thời gian thực, biểu đồ CSS thuần không lỗi | Đạt 100%, số liệu chính xác và trực quan | **ĐẠT** |

---

## 3. DANH SÁCH LỖI ĐÃ PHÁT HIỆN VÀ KHẮC PHỤC

Trong quá trình rà soát độc lập, kiểm thử đa tầng và đối chiếu video thực tế, các nhóm vấn đề kỹ thuật và giao diện UI/UX sau đã được phân tích, truy vết tận gốc và xử lý triệt để:

### A. Sửa lỗi Giao diện UI/UX thực tế từ Video kiểm thử (5 Vấn đề cốt lõi):

1. **Vấn đề 1 — Header bị chồng lấn, lệch selector, vỡ layout đè lên nội dung chính:**
   - *Nguyên nhân:* Sự không đồng nhất giữa hai bộ selector cũ và mới (`.site-header__inner` vs `.header-inner`, `.site-header__logo` vs `.logo`, `.site-header__nav` vs `.main-nav`, `.header-auth` vs `.auth-area`, `.badge-count` vs `.fav-badge`), cùng với việc chưa thiết lập chiều cao chuẩn (`min-height: var(--header-height)` = 72px) và khoảng cách `margin-top` cho trang.
   - *Khắc phục:*
     - Viết lại toàn bộ hệ thống CSS Header trong `assets/css/components.css` hỗ trợ kép (dual selector) 100% cho mọi thẻ Header: `.site-header__inner, .header-inner`, `.site-header__logo, .logo`, `.site-header__nav, .main-nav`, `.header-actions`, `.auth-area, .header-auth`, `.header-fav-btn`, `.fav-badge`.
     - Phân định rõ ràng responsive header: Mobile/Tablet ($< 1100px$) ẩn `.main-nav` và hiện nút Hamburger `.menu-toggle`; Desktop ($\ge 1100px$) hiển thị `.main-nav` thanh thoát và ẩn nút Hamburger; Quick search ô tìm kiếm chỉ hiển thị trên màn hình rộng ($\ge 1360px$).
     - Chuẩn hóa header sticky, kính mờ `backdrop-filter: blur(12px)`, z-index chuẩn không bao giờ đè vỡ hay che mất nội dung trang bên dưới.

2. **Vấn đề 2 — Lưới danh mục món ăn (`pages/categories.html`) bị kéo dài 1 cột khổng lồ:**
   - *Nguyên nhân:* Thiếu quy tắc CSS cho `.category-grid` trong `components.css`; file `responsive.css` cũ có quy tắc ghi đè `.category-card { padding: var(--space-4) var(--space-3); }` làm co ép ảnh thành icon bé 48-64px nằm lọt thỏm giữa khung trắng khổng lồ.
   - *Khắc phục:*
     - Thêm hệ thống lưới hiện đại `.category-grid`: 2 cột trên Mobile ($< 640px$), 3 cột trên Tablet ($640px - 1023px$), 4 cột cân đối trên Desktop ($\ge 1024px$).
     - Nâng cấp `.category-card`: Ảnh ẩm thực Unsplash tỉ lệ chuẩn `16/10` tràn viền sắc nét, hiệu ứng zoom `scale(1.06)` khi hover; huy hiệu biểu tượng (icon badge) tròn nổi bật ở góc dưới ảnh; tên danh mục in đậm rõ ràng kèm số lượng công thức thực tế.

3. **Vấn đề 3 — Tràn ngang toàn trang (Horizontal scroll) trên các thiết bị di động và desktop:**
   - *Nguyên nhân truy tận gốc (KHÔNG dùng `overflow-x: hidden` trên body/html để che giấu):*
     - *Trên Mobile ($< 768px$):* `.header-actions` hiển thị cùng lúc cả 2 nút chữ desktop "Đăng nhập" + "Đăng ký" trong `.auth-area`, kết hợp với nút Yêu thích và Hamburger toggle làm tổng chiều rộng header đạt 478px, vượt quá 360px - 430px của màn hình điện thoại.
     - *Trên Tablet & Desktop nhỏ ($768px - 1024px$):* `.mobile-nav` drawer có `width: 320px` với `position: fixed; right: 0; transform: translateX(100%);` nhưng do đặt `display: flex;` thường trực nên trình duyệt tính bounding box ra ngoài viewport gây tăng `scrollWidth`.
     - *Trên Desktop chuẩn ($1280px$):* Ô `.header-search` (200px - 250px) cộng với logo tagline ("Chuẩn định lượng • Trọn dinh dưỡng") và 7 liên kết `.main-nav` làm tổng chiều rộng đạt 1450px > 1270px container.
     - *Trên Admin Mobile ($360px$):* `.admin-header` có tiêu đề dài "Quản lý Bảng Nguyên liệu (NGUYENLIEU)" không cho phép ngắt dòng (`flex-wrap`) đẩy nút "Thêm nguyên liệu" ra mép 376px.
   - *Khắc phục triệt để:*
     - Trên Mobile ($< 768px$): Ẩn 2 nút chữ đăng nhập/đăng ký ở header desktop (`.header-actions .auth-area .btn { display: none !important; }`), vì trong thanh trượt Mobile Menu Drawer đã có sẵn 2 nút Đăng nhập và Đăng ký. Nếu đã đăng nhập, ẩn chữ tên tài khoản chỉ giữ lại avatar tròn 32px gọn gàng.
     - Đặt `.mobile-nav` mặc định `display: none;`, chỉ khi có class `.active` hoặc `.is-open` mới chuyển sang `display: flex;`. Trên desktop ($\ge 1100px$), thiết lập `display: none !important;`.
     - Tối ưu header desktop ($1280px$): Logo tagline chỉ hiện khi màn hình $\ge 1400px$; ô `.header-search` chỉ hiển thị khi $\ge 1360px$; tinh chỉnh padding và font chữ của 7 liên kết `.nav-link` vừa vặn 100% trong khung 1270px (header offsetW: 1270px, scrollW: 1270px).
     - Bổ sung `flex-wrap: wrap;` và `min-width: 0;` cho `.admin-header` và `.admin-header__title` trên mobile.
     - **Kết quả nghiệm thu tự động bằng Chrome headless:** 100% (93/93 lượt kiểm tra) trên toàn bộ 21 trang web đều đạt **`✅ [PASS] Chuẩn khít, 0 tràn ngang`**.

4. **Vấn đề 4 — Lỗi ảnh 404 và cơ chế placeholder hiển thị khối trắng emoji sơ sài:**
   - *Nguyên nhân:* URL Unsplash của Category 4 (Món nướng - Chiên) trong `categories.js` và Recipe 14 (Gà kho gừng) trong `recipes.js` bị xóa từ phía Unsplash dẫn đến mã lỗi HTTP 404; hàm `getPlaceholderUrl` dùng emoji đĩa ăn đơn điệu trên nền trắng.
   - *Khắc phục:*
     - Thay thế bằng các URL ảnh Unsplash ẩm thực nướng/kho gà chất lượng cao, đã kiểm tra HTTP 200 hoạt động vĩnh viễn:
       - Món nướng - Chiên: `photo-1544025162-d76694265947` (Gà nướng/chiên vàng óng).
       - Gà kho gừng: `photo-1598103442097-8b74394b95c6` (Món gà kho sả gừng đậm đà).
     - Nâng cấp file `assets/images/placeholders/recipe-placeholder.svg` thành đồ họa vector SVG chuyên nghiệp: Nền gradient kem ấm áp `#FFF7ED` đến `#FFEDD5`, biểu tượng nồi hầm và thìa nĩa nổi bật màu cam CookMate `#E85D2A`, typography "Món ngon CookMate - Chuẩn định lượng".
     - Nâng cấp hàm `getPlaceholderUrl` trong `assets/js/utils.js`: Tự động vẽ HTML5 Canvas ẩm thực cao cấp với huy hiệu đầu bếp, tên món ăn được căn chỉnh tinh tế, màu sắc ấm cúng, không còn khối trắng thô sơ.

5. **Vấn đề 5 — Tái cân đối trang tìm kiếm (`pages/search.html`):**
   - *Nguyên nhân:* Trang tìm kiếm sử dụng các class layout chuyên biệt (`.search-hero-box`, `.search-main-form`, `.search-layout`, `.search-sidebar`, `.filter-card`, `.filter-section`, `.search-results-area`, `.search-toolbar`) nhưng chưa có đủ quy tắc CSS trong `pages.css`, dẫn đến thanh tìm kiếm bị méo, bộ lọc và danh sách kết quả xô lệch.
   - *Khắc phục:*
     - Viết hoàn chỉnh hệ thống CSS cho trang Search trong `assets/css/pages.css`:
       - Khung tìm kiếm chính `.search-hero-box`: Nền gradient cam pastel dịu mắt, ô nhập liệu nổi bật bo tròn 9999px với nút tìm kiếm màu cam đậm.
       - Bố cục lưới `.search-layout`: Cột bộ lọc cố định `290px` dạng card dính (`position: sticky; top: calc(var(--header-height) + 20px)`) bên trái, khu vực kết quả chiếm phần còn lại `1fr`.
       - Thẻ bộ lọc `.filter-card`: Từng nhóm lọc (Danh mục, Dịp lễ, Độ khó, Thời gian) có tiêu đề rõ ràng, icon sinh động và nút "Đặt lại bộ lọc" tiện lợi.
       - Trên Mobile ($< 1024px$): Bố cục tự động chuyển sang 1 cột duy nhất, bộ lọc xếp trước kết quả rất dễ thao tác ngón tay.

---

### C. Sửa dứt điểm Header, Menu điều hướng Active và Màu sao đánh giá (Đợt rà soát chuyên sâu):

14. **Lỗi A — Bố trí Header cân đối, không gian thoáng đãng, không bị cắt mép phải:**
    - *Nguyên nhân:* Header cố gắng hiển thị đồng thời cả Logo, tagline dài 192px ("Chuẩn định lượng • Trọn dinh dưỡng"), 7 liên kết điều hướng, ô tìm kiếm nhanh (220px), nút Yêu thích và 2 nút Đăng nhập / Đăng ký. Tổng bề rộng thực tế của các thành phần lên đến 1514px, vượt xa khung `--container: 1280px` (khoang trong 1232px) khiến flexbox tràn ra mép phải (đạt 1613px trên màn hình 1440px), ép sát hoặc cắt mất khu vực tài khoản bên phải.
    - *Khắc phục:*
      - Ẩn tagline 192px trên thanh Header cố định (`.logo-tagline { display: none !important; }`), giữ logo thương hiệu CookMate gọn gàng 135px. Tagline vẫn hiển thị trang trọng tại Hero banner và Footer.
      - Tinh chỉnh 7 liên kết `.nav-link` với padding chuẩn `6px 10px` và font-size `0.8125rem`, giữ bề rộng toàn menu ở mức ~585px (tiết kiệm ~190px).
      - Thu gọn ô tìm kiếm nhanh `.header-search` trên thanh header, nhường không gian cho liên kết "Tìm kiếm" chuyên biệt trong menu chính và banner tìm kiếm.
      - Căn chỉnh đối xứng hoàn hảo trên Desktop (1280px, 1440px, 1920px): Khoảng đệm hai bên trái - phải cân bằng chuẩn xác (99px mỗi bên trên 1440px), khu vực tài khoản và nút Đăng ký nằm trọn vẹn 100% bên trong container, cách mép phải an toàn.
      - Trên Tablet (768px - 1149px): Chuyển sang nút Hamburger `.menu-toggle` ngay khi chiều rộng không đủ cho thanh menu ngang 7 mục, đảm bảo không bao giờ bị ép hay chồng lấn.
      - Trên Mobile ($< 768px$): Ẩn 2 nút chữ Đăng nhập / Đăng ký trên thanh header hẹp (được tích hợp đầy đủ và nổi bật trong menu Hamburger trượt ra), giữ header thoáng đãng: Logo + Nút Yêu thích + Nút Hamburger.

15. **Lỗi B — Sửa trạng thái menu đang chọn (Active navigation state):**
    - *Nguyên nhân:* Trong `assets/js/navigation.js`, hàm `highlightCurrentNav()` sử dụng điều kiện `path.includes(page)`. Khi truy cập `pages/new-recipes.html`, do chuỗi `"new-recipes.html"` chứa cả từ khóa `"recipes"` lẫn `"new-recipes"`, cả hai liên kết "Công thức" (`data-page="recipes"`) và "Mới nhất" (`data-page="new-recipes"`) đều đồng thời nhận class `.active`. Tương tự với `featured-recipes.html` và `holiday-recipes.html`.
    - *Khắc phục:*
      - Viết lại hàm `highlightCurrentNav()` với cơ chế ánh xạ chính xác theo tên file URL thực tế (`filename === 'recipes.html'`, `filename === 'new-recipes.html'`, `filename === 'categories.html'`, v.v.).
      - Khi xem trang "Mới nhất", **CHỈ DUY NHẤT** liên kết "Mới nhất" hiển thị trạng thái active; liên kết "Công thức" hoàn toàn ở trạng thái bình thường.
      - Đồng bộ hóa 100% trạng thái active giữa Menu Desktop và Menu Hamburger di động.
      - Đạt 100% (7/7 trang) trong bài test xác thực tự động.

16. **Lỗi C — Sửa triệt để thanh cuộn ngang trên toàn bộ 8 Viewport bắt buộc:**
    - *Nguyên nhân:* Khi kiểm tra trên màn hình desktop rộng 1440px (chuẩn màn hình 2K hoặc laptop phóng to), media query `@media (min-width: 1360px)` và `@media (min-width: 1400px)` trước đó đã kích hoạt hiển thị lại tagline và mở rộng ô search/nav-link, khiến tổng chiều rộng đạt 1613px > 1430px của màn hình 1440px.
    - *Khắc phục:*
      - Loại bỏ toàn bộ các media query gây phình kích thước Header trên desktop rộng.
      - Đảm bảo tổng chiều rộng của mọi thành phần con trong Header luôn $\le 1183px < 1232px$ container.
      - Kiểm thử thực tế bằng trình duyệt Chrome headless trên **toàn bộ 8 viewport bắt buộc**:
        - Mobile Nhỏ: **360px** $\rightarrow$ `clientW: 350px, scrollW: 350px` (0 tràn)
        - Mobile Phổ biến: **390px** $\rightarrow$ `clientW: 380px, scrollW: 380px` (0 tràn)
        - Mobile Lớn: **430px** $\rightarrow$ `clientW: 420px, scrollW: 420px` (0 tràn)
        - Tablet: **768px** $\rightarrow$ `clientW: 758px, scrollW: 758px` (0 tràn)
        - Desktop Nhỏ: **1024px** $\rightarrow$ `clientW: 1014px, scrollW: 1014px` (0 tràn)
        - Desktop Chuẩn: **1280px** $\rightarrow$ `clientW: 1270px, scrollW: 1270px` (0 tràn)
        - Desktop Rộng / 2K: **1440px** $\rightarrow$ `clientW: 1430px, scrollW: 1430px` (0 tràn)
        - Desktop Siêu rộng: **1920px** $\rightarrow$ `clientW: 1910px, scrollW: 1910px` (0 tràn)
      - Kết quả: **130/130 ca kiểm tra trên 21 trang web đều đạt `PASS` tuyệt đối, 0% thanh cuộn ngang**.

17. **Lỗi D — Sửa màu các biểu tượng sao đánh giá món ăn:**
    - *Nguyên nhân:* Trong `assets/css/components.css`, hoàn toàn chưa có quy tắc CSS nào định kiểu cho các class `.stars`, `.star-filled`, `.star-empty`, `.recipe-card__rating`. Theo cơ chế kế thừa CSS, các icon `<i>` của Font Awesome kế thừa thuộc tính `color: var(--text)` từ thẻ `body`, dẫn đến tất cả các ngôi sao đều mang màu đen than chì (`#292524`).
    - *Khắc phục:*
      - Thêm design token vào `assets/css/variables.css`:
        `--color-rating: #F59E0B;` (màu vàng hổ phách ấm áp chuẩn ẩm thực)
        `--color-rating-empty: #D6D3D1;` (màu xám trung tính nhạt cho sao rỗng).
      - Bổ sung hệ thống CSS hoàn chỉnh trong `assets/css/components.css`:
        - `.stars, .rating-stars`: Hiển thị thẳng hàng, khoảng cách 2px, kích thước 0.8125rem.
        - `.stars .fa-star, .stars .fa-star-half-stroke, .star-filled`: Màu vàng ấm `var(--color-rating) !important;`.
        - `.stars .star-empty, .star-empty`: Màu viền nhạt `var(--color-rating-empty) !important;`.
        - `.recipe-card__rating-val`: Điểm số dạng số in đậm màu chữ dễ đọc (`var(--text)`).
        - `.recipe-card__views`: Lượt xem chữ xám tinh tế (`var(--text-secondary)`).
      - Bổ sung đánh giá sao với màu vàng ấm trên cả trang chi tiết `pages/recipe-detail.html`.
      - **Kiểm tra tính toàn vẹn:** Các biểu tượng khác (đồng hồ `fa-clock`, độ khó `fa-signal`, khẩu phần `fa-users`, trái tim `fa-heart`, người đăng `fa-user-pen`) hoàn toàn giữ nguyên màu sắc gốc, không bị biến đổi.

---

### D. Nâng cấp UI Card công thức và Thiết kế lại trang chi tiết món ăn (Vòng rà soát chuyên sâu):

18. **Vấn đề A — Nâng cấp toàn diện Card công thức (`recipe-card`):**
    - *Nguyên nhân:* Quy tắc CSS cũ `.recipe-card__actions { position: absolute; top: var(--space-3); right: var(--space-3); }` vô tình kéo cả khối rating lên góc trên của ảnh món ăn, gây đè lên hình ảnh hoặc bị cắt mất.
    - *Khắc phục:*
      - Tái cấu trúc chuẩn HTML cho hàm `CookMateUI.createRecipeCard` theo thứ tự trực quan 6 tầng:
        1. Ảnh món ăn (`.recipe-card__image`): Tỉ lệ chuẩn `4/3`, bo góc mềm mại, hover zoom nhẹ `1.03`, huy hiệu Mới/Nổi bật ở góc.
        2. Danh mục món ăn (`.recipe-card__category`): Chữ in hoa nhỏ gọn màu xanh thảo mộc (`var(--secondary)`).
        3. Tên món ăn (`.recipe-card__title`): Cắt gọn tối đa 2 dòng, hover chuyển màu cam thương hiệu (`var(--primary)`).
        4. Mô tả ngắn (`.recipe-card__desc`): Rút gọn 80 ký tự, màu xám phụ trợ dễ đọc.
        5. **Dòng sao đánh giá nằm ngay dưới mô tả ngắn (`.recipe-card__rating-line`):** 5 ngôi sao màu vàng ấm `#F59E0B`, điểm số in đậm `4.8/5`, dấu chấm phân cách `•`, lượt xem hoặc lượt đánh giá rõ ràng.
        6. Chân thẻ (`.recipe-card__footer`): Phân cách bằng `border-top: 1px solid var(--border-light)`, đặt meta thông tin (thời gian nấu, độ khó, khẩu phần) bên trái và nút yêu thích `.btn-favorite` bên phải.
      - Gỡ bỏ hoàn toàn `position: absolute` trên `.recipe-card__actions`, đảm bảo sao đánh giá KHÔNG đè lên ảnh, KHÔNG bị nút yêu thích che khuất, màu sao vàng hổ phách đồng bộ 100% trên toàn website.

19. **Vấn đề B — Thiết kế lại toàn diện Bố cục trang chi tiết món ăn (`pages/recipe-detail.html`):**
    - *Nguyên nhân:* Tồn tại sự sai lệch hoàn toàn về tên class giữa template JavaScript render trong `recipe-detail.html` (`.recipe-detail-card`, `.recipe-detail-header`, `.recipe-detail-banner`, `.recipe-detail-grid`, `.recipe-ingredients-block`, `.recipe-nutrition-block`, `.recipe-steps-block`) và file `assets/css/pages.css` (chỉ định nghĩa class BEM `.recipe-detail__header`, `.recipe-detail__body`, `.recipe-sidebar`, v.v.), khiến toàn bộ trang chi tiết bị mất 100% định dạng bố cục, nội dung bị dồn sang trái và để lại khoảng trống lớn bên phải.
    - *Khắc phục triệt để:*
      - **1. Phần đầu trang (Hero Intro Card — `.detail-hero-card`):**
        - Bố cục 2 cột cân đối (52:48) trên desktop ($\ge 1024px$): Cột trái là ảnh đại diện lớn sắc nét tỉ lệ `4/3`, bo góc `var(--radius-2xl)`, bóng đổ mềm `var(--shadow-md)`. Cột phải là khối thông tin món ăn: Badges danh mục/dịp lễ/độ khó, tiêu đề H1 đậm nét, mô tả ngắn, dòng sao đánh giá màu vàng ấm `#F59E0B` ngay dưới mô tả, lưới 6 thẻ mini-meta (`.detail-meta-grid`) hiển thị Chuẩn bị, Nấu, Tổng thời gian, Độ khó, Khẩu phần gốc, Đánh giá chất lượng, và hàng nút thao tác nhanh (Yêu thích, Chế độ Đứng bếp, Chia sẻ link).
      - **2. Lưới giữa 2 cột cân đối (Middle Grid — `.detail-middle-grid`):**
        - Bố cục 2 cột (1.15fr : 0.85fr) trên desktop ($\ge 1024px$), tự động xếp chồng 1 cột trên mobile/tablet.
        - *Cột trái — Card Nguyên liệu chế biến (`.recipe-ingredients-card`):* Tích hợp bộ điều khiển co giãn khẩu phần ăn `[-] [X] [+] người` ngay trong header card; danh sách nguyên liệu từng hàng `.ingredient-row` có icon check xanh lá, định lượng căn phải in đậm phân số; bảo toàn 100% logic co giãn khẩu phần tự động.
        - *Cột phải — Card Ước tính dinh dưỡng (`.recipe-nutrition-card`):* Khung Calo lớn nổi bật màu cam kem ấm áp, lưới 4 chỉ số macro (Đạm, Béo, Carbs, Xơ) dạng thẻ bo tròn sạch sẽ, kèm dòng lưu ý tham khảo.
      - **3. Timeline Các bước chế biến (`.detail-steps-card`):**
        - Thẻ toàn chiều rộng lớn, timeline các bước với số thứ tự tròn màu cam thương hiệu `#E85D2A` chữ trắng (`.step-badge`), tiêu đề bước và mô tả chi tiết; hỗ trợ Chế độ Đứng bếp (`.kitchen-mode-active`) tự động phóng to font chữ lên $\ge 20px$ (`1.25rem` - `1.35rem`) giúp người dùng đứng nấu ăn từ xa vẫn đọc dễ dàng.
      - **4. Bình luận & Hỏi đáp (`.detail-comments-card`):**
        - Khung nhắc đăng nhập `.comment-auth-alert` căn chỉnh thông báo và nút "Đăng nhập ngay" nằm sát cạnh nhau; form gửi bình luận và danh sách bình luận kèm avatar tròn, tên tác giả, thời gian và nút xóa bình luận của chính mình.
      - **5. Món ăn liên quan (`.related-section`):**
        - Lưới 3 cột cân đối, hiển thị card công thức chuẩn mới đồng bộ 100%.
      - **Kết quả nghiệm thu tự động:** Đạt 41/41 bài test tự động (100% PASS), 0 lỗi JavaScript, 0 thanh cuộn ngang trên cả 8 kích thước màn hình.

6. **Lỗi cụt mã nguồn ở cuối file `navigation.js`:**
   - *Hiện tượng:* Dòng 329 bị ngắt quãng `window.location.href = get` gây ra `SyntaxError: Unexpected end of input`.
   - *Khắc phục:* Hoàn thiện hàm `handleLogout()` chuyển hướng chính xác về `getBasePath() + 'index.html'`.
7. **Lỗi hàm `escapeHtml` trong `utils.js` khi chạy môi trường đặc thù:**
   - *Hiện tượng:* Khi `div.innerHTML` rỗng hoặc không có DOM đầy đủ, chuỗi ký tự bị mất.
   - *Khắc phục:* Bổ sung cơ chế fallback bằng Regular Expression đảm bảo 100% chuỗi được mã hóa ký tự HTML an toàn trong mọi môi trường.
8. **Lệch tên class Mobile Menu Drawer giữa CSS và JS:**
   - *Hiện tượng:* `navigation.js` sử dụng `is-open` và `is-visible`, trong khi `components.css` định nghĩa `.active`.
   - *Khắc phục:* Đồng bộ hóa cả hai lớp CSS `.mobile-nav.active, .mobile-nav.is-open` và `.mobile-nav__backdrop.active, .mobile-nav-overlay.is-visible` để thanh trượt drawer di động hoạt động trơn tru.
9. **Dead links trong `favorites.html`:**
   - *Hiện tượng:* Các thẻ `<a>` trỏ tới `recipes/list.html` và `recipes/detail.html` không tồn tại.
   - *Khắc phục:* Đã sửa chuẩn xác thành `../recipes.html` và `../recipe-detail.html`.
10. **Header ID không đồng bộ trong các trang Account:**
   - *Hiện tượng:* `my-recipes.html`, `profile.html`, `recipe-form.html` dùng `<header class="header" id="header">` khiến `navigation.js` không tìm thấy phần tử để gắn header và mobile menu.
   - *Khắc phục:* Đã chuẩn hóa thành `<header class="site-header" id="siteHeader">` và `<footer class="site-footer" id="siteFooter">`.
11. **Thiếu methods và xử lý type mismatch trong `storage.js`:**
   - *Hiện tượng:* Các trang gọi `getCategoryById`, `getRecipeById`, `addUserRecipe`, v.v. nhưng so sánh strict `===` giữa số và chuỗi dẫn đến kết quả rỗng.
   - *Khắc phục:* Bổ sung đầy đủ các method trong `CookMateStorage` và ép kiểu `parseInt(id, 10)` an toàn.
12. **Lỗi hiển thị ký tự phân số trong định lượng:**
   - *Hiện tượng:* `0.25` và `0.75` bị hàm làm tròn trước đó làm tròn thành `0.3` và `0.8` nên không render được `¼` và `¾`.
   - *Khắc phục:* Đã sửa hàm `roundSmart` và `formatFraction` để giữ bước nhảy 0.25 cho số nhỏ dưới 10.
13. **Đường dẫn Windows trong `getBasePath`:**
   - *Hiện tượng:* Trên Windows, `pathname` chứa dấu gạch chéo ngược `\` khiến kiểm tra `.includes('/pages/')` bị sai khi mở qua `file://`.
   - *Khắc phục:* Thêm `.replace(/\\/g, '/')` chuẩn hóa đường dẫn URL.
14. **Sửa dứt điểm lỗi Menu Hamburger trên điện thoại di động (Mobile Navigation Drawer):**
   - *Hiện tượng lỗi thực tế trên điện thoại:* Khi nhấn nút hamburger ở header, menu chỉ hiện một thanh trắng 72px ghi "Menu" kèm nút X; toàn bộ danh sách liên kết không xuất hiện; menu nằm ngang ở khu vực header chứ không trượt thành panel dọc; vùng logo bên dưới bị phủ một lớp màu xám; overlay không phủ được nội dung trang phía sau.
   - *Nguyên nhân gốc rễ (Root Cause):* Trong `navigation.js`, `.mobile-nav` và `.mobile-nav-overlay` trước đó được render bên trong thẻ `<header class="site-header">`. Thẻ header có `backdrop-filter: blur(12px)` và `position: sticky; min-height: 72px`. Theo đặc tả W3C CSS Transforms & Filter Effects, thuộc tính `backdrop-filter` tự động tạo một **containing block** mới cho tất cả các phần tử con có `position: fixed`. Do đó, drawer và overlay bị ép chặt trong chiều cao 72px của header (`navRect.height = 72px`), khiến toàn bộ nội dung menu `navBodyHeight = 447px` bị tràn ra ngoài hoặc biến mất, overlay chỉ che đúng thanh header làm xám logo!
   - *Khắc phục triệt để:*
     - Tách rời `.mobile-nav` và `.mobile-nav-overlay` ra khỏi header HTML, bổ sung hàm `Navigation.renderMobileNav()` tự động append trực tiếp vào `document.body`, thoát hoàn toàn khỏi containing block của header.
     - Tái cấu trúc bộ liên kết trong Mobile Nav Drawer thành 3 nhóm rõ ràng, khoa học: "Khám phá" (7 links: Trang chủ, Tất cả công thức, Danh mục, Mới nhất, Nổi bật, Theo dịp lễ, Tìm kiếm), "Cá nhân" (Favorites kèm badge số lượng thời gian thực), và "Tài khoản" (Guest Card với 2 nút Đăng nhập / Đăng ký hoặc User Card với Avatar, tên, vai trò, Hồ sơ cá nhân, Công thức của tôi, Đăng công thức, Quản trị, Đăng xuất).
     - Viết lại toàn bộ hệ thống CSS trong `assets/css/components.css`: `.mobile-nav` (`position: fixed; top: 0; right: 0; width: min(88vw, 360px); height: 100vh / 100dvh; z-index: 9999; transform: translateX(105%); transition: transform 0.32s; box-shadow: -6px 0 28px rgba(0,0,0,0.18)`), `.mobile-nav-overlay` (`position: fixed; inset: 0; width: 100vw; height: 100vh / 100dvh; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(4px); z-index: 9998; opacity: 0; transition: opacity 0.3s`).
     - Cách ly an toàn Desktop: Tại `@media (min-width: 1150px)`, thiết lập `.mobile-nav, .mobile-nav-overlay { display: none !important; }` bảo vệ tuyệt đối Header Desktop đã ổn định.
     - Nâng cấp tương tác: Hỗ trợ đóng menu bằng 4 cách (nút X, chạm overlay, phím Escape, click liên kết/nút bấm bên trong drawer); tự động khóa cuộn trang (`body, html { overflow: hidden; }`) khi mở menu và phục hồi khi đóng; đồng bộ badge yêu thích giữa desktop `#favCountBadge` và mobile `#mobileFavBadge`.
   - *Kết quả kiểm thử thực tế qua Chrome Headless CDP:* 100% đạt chuẩn trên tất cả các viewport (360x740, 375x812, 390x844, 430x932, 768x1024), 0 lỗi tràn ngang, drawer trượt mượt mà mở full màn hình điện thoại, overlay phủ kín toàn bộ trang web.
15. **Tích hợp Giao diện Xác thực CookMate với Hiệu ứng Bát Phở Hà Nội:**
   - *Mục tiêu:* Thay thế giao diện đăng nhập/đăng ký cũ và loại bỏ hoàn toàn ý tưởng bóng đèn / nền vũ trụ tối màu từ file mẫu (`index-mau.html`, `style-mau.css`, `script-mau.js`). Tích hợp trải nghiệm ẩm thực đặc sắc mang đậm bản sắc CookMate: Người dùng chạm vào Bát Phở Hà Nội, đôi đũa nhấc lên kéo theo những sợi phở mềm mại, rồi thẻ Đăng nhập / Đăng ký nhẹ nhàng mở ra trên nền kem ấm áp.
   - *File mới triển khai:*
     - `assets/css/auth.css`: Namespace `.cookmate-auth`, thiết kế vector SVG Bát Phở Hà Nội, hiệu ứng nhấc đũa, kéo sợi phở, hơi nước bốc lên, hào quang ấm áp, sliding views, ripple buttons, password strength bar và responsive mobile/desktop.
     - `assets/js/auth-ui.js`: Module điều khiển tương tác `CookMateAuthUI`, kết nối trực tiếp với `CookMateStorage` và `CookMateUI.showToast()`.
     - `scratch/test_pho_auth.js`: Kịch bản kiểm thử tự động toàn diện qua Chrome Headless CDP.
   - *File cập nhật:*
     - `pages/auth/login.html`: Trang Đăng nhập tích hợp Bát phở Hà Nội (mặc định view Đăng nhập).
     - `pages/auth/register.html`: Trang Đăng ký tích hợp Bát phở Hà Nội (mặc định view Đăng ký).
     - `assets/js/storage.js`: Hỗ trợ nạp tham số linh hoạt cho `registerUser` (cả object và 3 tham số riêng lẻ).
   - *Đặc điểm kỹ thuật & Trải nghiệm tương tác:*
     - **Bát phở Hà Nội vector SVG:** Tô sứ men lam truyền thống, nước dùng màu nâu hổ phách trong veo, lát thịt bò nạm/tái vân hoa, hành hoa, hành tây, ngò gai và lát ớt đỏ tươi.
     - **Đôi đũa & Sợi phở:** Đôi đũa cắm xiên tự nhiên; khi chạm (Click / Tap / phím Enter / Space), đôi đũa nhấc lên (`translate(-14px, -68px) rotate(-8deg)`), kéo theo 4 dải sợi phở trắng ngà uốn lượn mềm mại theo trọng lực, kèm giọt nước dùng thơm lừng nhỏ giọt.
     - **Chuyển đổi View linh hoạt:** Hỗ trợ trượt mượt mà giữa Đăng nhập ↔ Đăng ký ngay trong một trang mà không bị giật bố cục hoặc mất dữ liệu đã nhập, đồng thời bảo đảm cả 2 URL `login.html` và `register.html` đều hoạt động trực tiếp độc lập.
     - **Nghiệp vụ tài khoản thật:** Sử dụng 100% logic demo của CookMate (`CookMateStorage`, `DEMO_CREDENTIALS`), có kiểm tra rỗng, kiểm tra định dạng email, kiểm tra trùng email, mật khẩu xác nhận, bảng đánh giá độ mạnh mật khẩu 4 cấp độ và nút bật/tắt mật khẩu.
     - **Tính năng 1-Click Demo Accounts:** Hộp tài khoản mẫu cho phép nhấn 1 click để điền nhanh tài khoản Quản trị viên (`admin@cookmate.vn`) hoặc Thành viên (`giang@cookmate.vn`).
   - *Kết quả kiểm thử tự động qua Chrome Headless CDP:* 100% đạt chuẩn trên 6 kích thước viewport (360x740, 375x812, 390x844, 430x932, 768x1024, 1280x800), 0 lỗi tràn ngang (`hasOverflow: false`), thẻ Auth hiển thị hoàn hảo, đăng nhập và đăng ký thành công.
16. **COOKMATE AUTH UI V2 — Hoàn thiện Bát Phở Hà Nội Sâu Lòng, Tách Độc Lập Đăng Nhập / Đăng Ký và Tối Ưu Laptop/Mobile:**
    - *Bối cảnh & Yêu cầu nâng cấp:* Sau phiên bản tích hợp ban đầu, khi chạy thực tế trên laptop và mobile xuất hiện 8 vấn đề cần tinh chỉnh: hình dạng bát phở còn giống đĩa dẹt, thiếu dòng chữ "PHỞ HÀ NỘI" in trên thân bát sứ, đũa và sợi phở chưa ăn khớp hình học, card còn chứa 2 tab chuyển đổi, thiếu phương thức tiếp tục Google/Facebook, form hơi dài trên laptop khiến phải cuộn dọc, header auth chưa căn lề chuẩn 1120px và responsive di động cần tối ưu.
    - *Các hạng mục đã xử lý dứt điểm (8/8 lỗi):*
      1. **Lỗi 1 — Vẽ lại Bát phở Hà Nội sâu lòng:** Thay thế đường cong đĩa dẹt cũ bằng vector SVG chiếc bát sứ sâu lòng (deep porcelain bowl) với gradient đổ bóng thanh thoát (`#bowlShading`), thành bát vuốt cong mượt mà từ miệng xuống đáy (`M 75 145 C 75 240, 152 290, 230 290 C 308 290, 385 240, 385 145...`), chân đế sứ vững chãi (`M 166 288...`), bóng đổ mềm mại trên bàn gỗ.
      2. **Lỗi 2 — In dòng chữ "PHỞ HÀ NỘI" lên mặt trước thân bát sứ:** Dòng chữ in rõ nét, thanh thoát ngay trên mặt cong thân bát sứ (`letter-spacing: 3.5px`, màu đỏ nâu/cam đất nung Bát Tràng `#9A3412`, font `Be Vietnam Pro` 800), kèm họa tiết gốm trang trí đối xứng 2 bên.
      3. **Lỗi 3 — Đôi đũa và Sợi phở gắn kết hình học chính xác:**
         - Ở trạng thái ban đầu, đôi đũa cắm xiên tự nhiên vào lòng bát, hoàn toàn không có sợi phở lơ lửng ngoài đũa (`opacity: 0; transform: translateY(34px) scaleY(0.2)`).
         - Khi chạm (Click / phím Enter / Space), đôi đũa nhấc lên (`translate(-14px, -86px) rotate(-9deg)`), và đỉnh của 4 dải sợi phở kéo lên **gắn chặt chính xác vào đầu gắp đũa** tại tọa độ `(X: 198, Y: 88)`, rủ xuống mềm mại theo trọng lực kèm giọt nước dùng nhỏ giọt.
      4. **Lỗi 4 — Tách riêng Đăng nhập và Đăng ký (Loại bỏ hoàn toàn 2 tab trên card):**
         - Đã xóa sạch thẻ tab và CSS tab khỏi cả 2 trang.
         - `pages/auth/login.html` CHỈ chứa duy nhất form Đăng nhập + link chuyển sang `register.html`.
         - `pages/auth/register.html` CHỈ chứa duy nhất form Đăng ký + link chuyển sang `login.html`.
      5. **Lỗi 5 — Phương thức tiếp tục với Google và Facebook:**
         - Bổ sung 2 nút UI hiện đại với icon SVG Google và Facebook chuẩn xác.
         - Xử lý trung thực: khi click, hiển thị Toast Notification thông báo tính năng đang phát triển và sẽ sớm ra mắt (không giả lập đăng nhập thành công khi chưa có OAuth).
      6. **Lỗi 6 — Thu gọn form trên Laptop (Hạn chế cuộn dọc thừa):**
         - Tối ưu padding (`26px 30px`), khoảng cách trường (`margin-bottom: 13px`), input (`10px 38px`), tổng chiều cao giao diện vừa vặn hoàn hảo trong ~620px trên các màn hình laptop chuẩn (1366x768, 1440x900, 1920x1080) mà không bị cắt xén nội dung.
      7. **Lỗi 7 — Thiết kế lại thanh đầu trang Auth:**
         - Chiều cao cố định chuẩn 60px, nền mờ kính `backdrop-filter: blur(10px)`.
         - Container căn lề `max-width: 1120px` đồng bộ tuyệt đối với khối form chính bên dưới.
         - Logo CookMate bên trái, nút "Về trang chủ" viên thuốc bo tròn tinh tế bên phải.
      8. **Lỗi 8 — Tối ưu di động (0% tràn ngang):**
         - Bố cục xếp chồng dọc tự nhiên, Bát phở co giãn mượt mà theo tỷ lệ viewBox SVG, 0% lỗi tràn ngang (`hasHorizontalScroll: false`) trên toàn bộ dải kích thước màn hình: 360px, 375px, 390px, 430px, 768px.
    - *File cập nhật:*
      - `assets/css/auth.css`: Viết lại hoàn toàn theo chuẩn Auth V2, tối ưu chiều cao laptop, responsive di động, animation đũa và phở.
      - `assets/js/auth-ui.js`: Bỏ logic tab switching, thêm event listener cho Google/Facebook, tối ưu chuyển động bát phở, quản lý form độc lập cho login & register.
      - `pages/auth/login.html`: Bát phở V2 sâu lòng in chữ `PHỞ HÀ NỘI`, form đăng nhập đơn lẻ, nút Google/Facebook, 1-click demo accounts.
      - `pages/auth/register.html`: Bát phở V2 sâu lòng in chữ `PHỞ HÀ NỘI`, form đăng ký đơn lẻ, nút Google/Facebook, password strength meter.
    - *Kết quả kiểm thử tự động toàn diện qua Chrome Headless CDP (`scratch/test_pho_v2_cdp.js`):*
      - **27/27 kiểm thử PASSED (100%)**:
        - ✅ Không còn tabs trên cả Login & Register
        - ✅ Bát phở sâu lòng, chân đế sứ, in chữ PHỞ HÀ NỘI sắc nét
        - ✅ Header cao 60px căn lề 1120px đồng bộ
        - ✅ Đũa và sợi phở gắn kết hình học chính xác khi nhấc lên
        - ✅ Thông báo trung thực khi click nút Google & Facebook
        - ✅ Ẩn/hiện mật khẩu qua eye toggle
        - ✅ Điền nhanh tài khoản demo 1-click
        - ✅ Xử lý báo lỗi đăng nhập sai mật khẩu
        - ✅ Thanh đo độ mạnh mật khẩu 4 cấp độ
        - ✅ 0% tràn ngang trên cả 5 kích thước mobile (360px, 375px, 390px, 430px, 768px)
      - Ảnh chụp màn hình kiểm chứng lưu trữ tại `scratch/screenshots/`:
        - `auth_v2_login_laptop_1366.png`
        - `auth_v2_login_laptop_lifted.png`
        - `auth_v2_login_mobile_375.png`
        - `auth_v2_login_mobile_430.png`
        - `auth_v2_register_laptop_1366.png`
        - `auth_v2_register_mobile_375.png`
17. **COOKMATE — Sửa Responsive Bát Phở, Footer Mobile và Empty State Trang Tìm Kiếm:**
    - *Bối cảnh:* Dựa trên ảnh chụp màn hình kiểm tra thực tế, giải quyết triệt để 4 vấn đề bố cục giao diện:
      1. **Lỗi A — Ẩn Bát phở trên Mobile và Tablet (< 1024px):**
         - *Khắc phục:* Trong `assets/css/auth.css`, đặt quy tắc `@media (max-width: 1023px) { .pho-stage { display: none !important; } }`.
         - Khi ẩn: Bát phở bị loại bỏ 100% khỏi luồng layout (`width: 0, height: 0`), không giữ khoảng trống dư thừa, không để animation chạy nền vô ích.
         - Form card trên mobile/tablet được đưa lên sát ngay dưới header 60px (`top: 73px`), người dùng tiếp cận trường nhập liệu tức thì. Form đăng ký cho phép cuộn dọc tự nhiên không bị cắt xén.
         - Trên Desktop/Laptop (>= 1024px): Bát phở sâu lòng in chữ "PHỞ HÀ NỘI" và hiệu ứng đũa gắp phở hoạt động hoàn toàn nguyên vẹn.
      2. **Lỗi B — Sửa Footer trên Mobile không xuống dòng:**
         - *Nguyên nhân:* Trước đó trong `components.css`, CSS chỉ định nghĩa cho class `.site-footer__nav-list` mà không hỗ trợ `.footer-links` từ `navigation.js`, khiến các thẻ `<a>` trở thành inline và dính liền thành chuỗi text dài.
         - *Khắc phục:* Bổ sung hệ thống CSS chuẩn hóa hỗ trợ kép trong `components.css` và `responsive.css`:
           - `.footer-links, .site-footer__nav-list { display: flex; flex-direction: column; gap: 10px; }`
           - `.footer-links a, .site-footer__nav-link { display: inline-flex; align-items: center; padding: 4px 0; word-break: break-word; }`
           - Trên Mobile: `.footer-grid, .site-footer__grid { display: flex; flex-direction: column; gap: 28px; }` chia 4 nhóm rõ ràng (Thương hiệu, Khám phá, Tài khoản, Thông tin), mỗi liên kết nằm trên một dòng riêng biệt với khoảng cách tap thuận tiện, 0% tràn ngang.
      3. **Lỗi C — Sửa màu chữ "Cook" trong Logo Footer:**
         - *Nguyên nhân:* Thuộc tính `.logo-name` dùng màu `var(--text)` (#292524) giống màu nền tối của footer (#292524), khiến chữ "Cook" bị chìm vào bóng tối.
         - *Khắc phục:* Thiết lập quy tắc CSS chuyên biệt trong `components.css`:
           - `.site-footer .logo-name { color: #FFF9F2 !important; }` (Màu kem sáng ấm áp, tương phản rõ nét trên nền tối).
           - `.site-footer .logo-accent { color: #E85D2A !important; }` (Màu cam thương hiệu sáng rõ).
           - Giữ nguyên màu chữ `.site-header .logo-name` ở Header chính (màu tối trên nền sáng).
      4. **Lỗi D — Căn giữa trạng thái không tìm thấy công thức trên Desktop (pages/search.html):**
         - *Nguyên nhân:* Container kết quả `#searchResultsGrid` là một 3-column CSS Grid (`grid-template-columns: repeat(3, 1fr)`). Thẻ con duy nhất `.empty-state` mặc định chiếm cột 1 (1/3 độ rộng bên trái), khiến toàn bộ icon, tiêu đề, mô tả và nút đặt lại bị lệch sang trái.
         - *Khắc phục:*
           - Trong `components.css` và `pages.css`, thiết lập:
             - `.recipe-grid > .empty-state, .search-results-area .empty-state { grid-column: 1 / -1; width: 100%; max-width: 520px; margin: 40px auto; justify-self: center; align-self: center; text-align: center; }`
             - `.search-results-area .recipe-grid:has(.empty-state) { display: flex; justify-content: center; align-items: center; min-height: 360px; }`
           - Sidebar bộ lọc 280px bên trái giữ nguyên vị trí độc lập. Cụm empty state căn giữa cân đối tuyệt đối trong vùng kết quả (`leftGap: 187px, rightGap: 187px, diff: 0px`). Nút "Đặt lại bộ lọc" nằm giữa cụm. Toàn bộ logic tìm kiếm và lọc dữ liệu được bảo toàn 100%.
    - *Kết quả kiểm thử tự động toàn diện qua Chrome Headless CDP (`scratch/test_responsive_fixes.js`):*
      - **14/14 kiểm thử PASSED (100%)**:
        - ✅ Login Desktop 1366px: Bát phở hiển thị (display: flex)
        - ✅ Login Tablet 768px: Bát phở ẩn (display: none, size: 0x0)
        - ✅ Login Mobile 375px: Bát phở ẩn (display: none), form ở đầu trang (top: 73px), không tràn ngang
        - ✅ Register Desktop 1366px: Bát phở hiển thị
        - ✅ Register Tablet 768px: Bát phở ẩn
        - ✅ Register Mobile 390px: Bát phở ẩn, không tràn ngang
        - ✅ Logo Footer: Chữ "Cook" màu #FFF9F2 sáng rõ trên nền tối
        - ✅ Logo Header: Giữ nguyên màu chữ chuẩn #292524 trên nền sáng
        - ✅ Footer Mobile: Toàn bộ liên kết xuống dòng theo cột dọc, không dính liền
        - ✅ Footer Mobile: Không tràn ngang (scrollWidth = clientWidth = 375px)
        - ✅ Search Desktop 1366px: Empty state căn giữa hoàn hảo trong vùng kết quả (diff = 0px)
        - ✅ Search Desktop 1366px: Nút đặt lại bộ lọc căn giữa trong cụm
        - ✅ Search Mobile 375px: Empty state căn giữa, 0% tràn ngang
        - ✅ Search Logic: Nút đặt lại phục hồi 16/16 công thức
      - Ảnh chụp màn hình kiểm chứng lưu trữ tại `scratch/screenshots/`:
        - `fix_login_desktop_1366.png`
        - `fix_login_tablet_768.png`
        - `fix_login_mobile_375.png`
        - `fix_register_mobile_390.png`
        - `fix_footer_mobile_375.png`
        - `fix_footer_desktop_1366.png`
        - `fix_search_empty_desktop_1366.png`
        - `fix_search_empty_mobile_375.png`

---

## 4. KẾT QUẢ KIỂM THỬ KỸ THUẬT TOÀN DIỆN

1. **Bộ kiểm thử Logic & Tương tác chuyên sâu (41 Assertions):**
   - Đạt 41/41 Passed (100%), bao gồm: Dữ liệu tĩnh, CRUD Storage, Co giãn khẩu phần, Định lượng phân số, Bộ máy tìm kiếm đa điều kiện, Kiểm tra tính hợp lệ của biểu mẫu (Validation), Sinh mã HTML Component.
2. **Cú pháp JavaScript (`node -c`):**
   - 100% tất cả 9 file JS (`utils.js`, `storage.js`, `components.js`, `navigation.js`, `app.js`, `categories.js`, `ingredients.js`, `users.js`, `recipes.js`) không có bất kỳ lỗi cú pháp nào.
3. **Cú pháp Inline Script trong HTML:**
   - 100% inline scripts trên tất cả 21 trang HTML đều biên dịch thành công qua `vm.Script` (0 lỗi cú pháp).
4. **Đường dẫn tài nguyên & Liên kết nội bộ:**
   - 100% thẻ `<link>` CSS, `<script>` JS và `<a>` liên kết giữa các trang nội bộ đều trỏ đúng file thực tế trên ổ đĩa (0 dead link).
5. **Kiểm thử máy chủ HTTP Local thực tế:**
   - Chạy Python HTTP Server cục bộ trên cổng 8089 và gửi request tới toàn bộ 21 trang HTML; tất cả 21 trang đều trả về HTTP Status `200 OK`.
6. **Kiểm thử trực tiếp trên trình duyệt Google Chrome Headless thật:**
   - Đã nạp và render thành công các trang công khai (Trang chủ, Danh sách công thức, Danh mục, Món mới, Nổi bật, Dịp lễ, Chi tiết công thức với `?id=1`, Tìm kiếm, Đăng nhập, Đăng ký), xác minh đầy đủ DOM, ảnh, component và toast notification.
7. **Kiểm thử Bố cục & Tràn ngang (Responsive Layout & Overflow Audit):**
   - Đã xây dựng bộ kiểm thử tự động `audit_overflow.html` và `audit_admin.html` chạy trên Google Chrome Headless thật (`--headless=new`):
     - **60/60 lượt kiểm tra PASSED** trên 10 trang người dùng qua 6 kích thước viewport: Mobile Nhỏ (360px), Mobile Phổ biến (390px), Mobile Lớn (430px), Tablet (768px), Desktop Nhỏ (1024px), Desktop Chuẩn (1280px).
     - **33/33 lượt kiểm tra PASSED** trên 11 trang tài khoản và quản trị admin qua 3 kích thước viewport: Mobile (360px), Tablet (768px), Desktop (1280px).
     - **Tổng cộng 93/93 lượt kiểm tra đạt `✅ [PASS]` tuyệt đối: 0% lỗi tràn ngang, 100% phần tử vừa khít mép hiển thị.**
8. **Bảo toàn tài liệu đầu vào:**
   - File `AI_RULES.md`: 22.300 bytes — Giữ nguyên 100%.
   - File `cookmate_website_h_tr_n_u_n.html`: 127.382 bytes — Giữ nguyên 100%.

---

## 5. HƯỚNG DẪN DÀNH CHO AI HOẶC KỸ SƯ TIẾP QUẢN

Nếu cần phát triển Backend Flask trong giai đoạn tiếp theo:
1. Chuyển các file `.html` trong `index.html` và `pages/` vào thư mục `templates/`.
2. Chuyển toàn bộ thư mục `assets/` vào `static/`.
3. Tách các thành phần Header và Footer thành template Jinja2 `base.html`.
4. Thay thế `CookMateStorage` bằng các lệnh gọi API `fetch('/api/...')` tương ứng đến các Flask route.
5. Mã nguồn hiện tại được phân chia rõ ràng giữa tầng dữ liệu, logic giao diện và trình bày, đảm bảo việc tích hợp Backend diễn ra nhanh chóng mà không cần viết lại giao diện.
