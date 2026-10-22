const fs = require('fs');

let content = fs.readFileSync('PROJECT_STATUS.md', 'utf8');

const target = '        - `auth_v2_register_mobile_375.png`';

const addition = `        - \`auth_v2_register_mobile_375.png\`
17. **COOKMATE — Sửa Responsive Bát Phở, Footer Mobile và Empty State Trang Tìm Kiếm:**
    - *Bối cảnh:* Dựa trên ảnh chụp màn hình kiểm tra thực tế, giải quyết triệt để 4 vấn đề bố cục giao diện:
      1. **Lỗi A — Ẩn Bát phở trên Mobile và Tablet (< 1024px):**
         - *Khắc phục:* Trong \`assets/css/auth.css\`, đặt quy tắc \`@media (max-width: 1023px) { .pho-stage { display: none !important; } }\`.
         - Khi ẩn: Bát phở bị loại bỏ 100% khỏi luồng layout (\`width: 0, height: 0\`), không giữ khoảng trống dư thừa, không để animation chạy nền vô ích.
         - Form card trên mobile/tablet được đưa lên sát ngay dưới header 60px (\`top: 73px\`), người dùng tiếp cận trường nhập liệu tức thì. Form đăng ký cho phép cuộn dọc tự nhiên không bị cắt xén.
         - Trên Desktop/Laptop (>= 1024px): Bát phở sâu lòng in chữ "PHỞ HÀ NỘI" và hiệu ứng đũa gắp phở hoạt động hoàn toàn nguyên vẹn.
      2. **Lỗi B — Sửa Footer trên Mobile không xuống dòng:**
         - *Nguyên nhân:* Trước đó trong \`components.css\`, CSS chỉ định nghĩa cho class \`.site-footer__nav-list\` mà không hỗ trợ \`.footer-links\` từ \`navigation.js\`, khiến các thẻ \`<a>\` trở thành inline và dính liền thành chuỗi text dài.
         - *Khắc phục:* Bổ sung hệ thống CSS chuẩn hóa hỗ trợ kép trong \`components.css\` và \`responsive.css\`:
           - \`.footer-links, .site-footer__nav-list { display: flex; flex-direction: column; gap: 10px; }\`
           - \`.footer-links a, .site-footer__nav-link { display: inline-flex; align-items: center; padding: 4px 0; word-break: break-word; }\`
           - Trên Mobile: \`.footer-grid, .site-footer__grid { display: flex; flex-direction: column; gap: 28px; }\` chia 4 nhóm rõ ràng (Thương hiệu, Khám phá, Tài khoản, Thông tin), mỗi liên kết nằm trên một dòng riêng biệt với khoảng cách tap thuận tiện, 0% tràn ngang.
      3. **Lỗi C — Sửa màu chữ "Cook" trong Logo Footer:**
         - *Nguyên nhân:* Thuộc tính \`.logo-name\` dùng màu \`var(--text)\` (#292524) giống màu nền tối của footer (#292524), khiến chữ "Cook" bị chìm vào bóng tối.
         - *Khắc phục:* Thiết lập quy tắc CSS chuyên biệt trong \`components.css\`:
           - \`.site-footer .logo-name { color: #FFF9F2 !important; }\` (Màu kem sáng ấm áp, tương phản rõ nét trên nền tối).
           - \`.site-footer .logo-accent { color: #E85D2A !important; }\` (Màu cam thương hiệu sáng rõ).
           - Giữ nguyên màu chữ \`.site-header .logo-name\` ở Header chính (màu tối trên nền sáng).
      4. **Lỗi D — Căn giữa trạng thái không tìm thấy công thức trên Desktop (pages/search.html):**
         - *Nguyên nhân:* Container kết quả \`#searchResultsGrid\` là một 3-column CSS Grid (\`grid-template-columns: repeat(3, 1fr)\`). Thẻ con duy nhất \`.empty-state\` mặc định chiếm cột 1 (1/3 độ rộng bên trái), khiến toàn bộ icon, tiêu đề, mô tả và nút đặt lại bị lệch sang trái.
         - *Khắc phục:*
           - Trong \`components.css\` và \`pages.css\`, thiết lập:
             - \`.recipe-grid > .empty-state, .search-results-area .empty-state { grid-column: 1 / -1; width: 100%; max-width: 520px; margin: 40px auto; justify-self: center; align-self: center; text-align: center; }\`
             - \`.search-results-area .recipe-grid:has(.empty-state) { display: flex; justify-content: center; align-items: center; min-height: 360px; }\`
           - Sidebar bộ lọc 280px bên trái giữ nguyên vị trí độc lập. Cụm empty state căn giữa cân đối tuyệt đối trong vùng kết quả (\`leftGap: 187px, rightGap: 187px, diff: 0px\`). Nút "Đặt lại bộ lọc" nằm giữa cụm. Toàn bộ logic tìm kiếm và lọc dữ liệu được bảo toàn 100%.
    - *Kết quả kiểm thử tự động toàn diện qua Chrome Headless CDP (\`scratch/test_responsive_fixes.js\`):*
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
      - Ảnh chụp màn hình kiểm chứng lưu trữ tại \`scratch/screenshots/\`:
        - \`fix_login_desktop_1366.png\`
        - \`fix_login_tablet_768.png\`
        - \`fix_login_mobile_375.png\`
        - \`fix_register_mobile_390.png\`
        - \`fix_footer_mobile_375.png\`
        - \`fix_footer_desktop_1366.png\`
        - \`fix_search_empty_desktop_1366.png\`
        - \`fix_search_empty_mobile_375.png\``;

if (content.includes(target)) {
  content = content.replace(target, addition);
  fs.writeFileSync('PROJECT_STATUS.md', content, 'utf8');
  console.log('PROJECT_STATUS.md successfully updated with Section 17!');
} else {
  console.error('Target not found in PROJECT_STATUS.md');
  process.exit(1);
}
