const fs = require('fs');

let content = fs.readFileSync('PROJECT_STATUS.md', 'utf8');

const target = '   - *Kết quả kiểm thử tự động qua Chrome Headless CDP:* 100% đạt chuẩn trên 6 kích thước viewport (360x740, 375x812, 390x844, 430x932, 768x1024, 1280x800), 0 lỗi tràn ngang (`hasOverflow: false`), thẻ Auth hiển thị hoàn hảo, đăng nhập và đăng ký thành công.';

const addition = `   - *Kết quả kiểm thử tự động qua Chrome Headless CDP:* 100% đạt chuẩn trên 6 kích thước viewport (360x740, 375x812, 390x844, 430x932, 768x1024, 1280x800), 0 lỗi tràn ngang (\`hasOverflow: false\`), thẻ Auth hiển thị hoàn hảo, đăng nhập và đăng ký thành công.
16. **COOKMATE AUTH UI V2 — Hoàn thiện Bát Phở Hà Nội Sâu Lòng, Tách Độc Lập Đăng Nhập / Đăng Ký và Tối Ưu Laptop/Mobile:**
    - *Bối cảnh & Yêu cầu nâng cấp:* Sau phiên bản tích hợp ban đầu, khi chạy thực tế trên laptop và mobile xuất hiện 8 vấn đề cần tinh chỉnh: hình dạng bát phở còn giống đĩa dẹt, thiếu dòng chữ "PHỞ HÀ NỘI" in trên thân bát sứ, đũa và sợi phở chưa ăn khớp hình học, card còn chứa 2 tab chuyển đổi, thiếu phương thức tiếp tục Google/Facebook, form hơi dài trên laptop khiến phải cuộn dọc, header auth chưa căn lề chuẩn 1120px và responsive di động cần tối ưu.
    - *Các hạng mục đã xử lý dứt điểm (8/8 lỗi):*
      1. **Lỗi 1 — Vẽ lại Bát phở Hà Nội sâu lòng:** Thay thế đường cong đĩa dẹt cũ bằng vector SVG chiếc bát sứ sâu lòng (deep porcelain bowl) với gradient đổ bóng thanh thoát (\`#bowlShading\`), thành bát vuốt cong mượt mà từ miệng xuống đáy (\`M 75 145 C 75 240, 152 290, 230 290 C 308 290, 385 240, 385 145...\`), chân đế sứ vững chãi (\`M 166 288...\`), bóng đổ mềm mại trên bàn gỗ.
      2. **Lỗi 2 — In dòng chữ "PHỞ HÀ NỘI" lên mặt trước thân bát sứ:** Dòng chữ in rõ nét, thanh thoát ngay trên mặt cong thân bát sứ (\`letter-spacing: 3.5px\`, màu đỏ nâu/cam đất nung Bát Tràng \`#9A3412\`, font \`Be Vietnam Pro\` 800), kèm họa tiết gốm trang trí đối xứng 2 bên.
      3. **Lỗi 3 — Đôi đũa và Sợi phở gắn kết hình học chính xác:**
         - Ở trạng thái ban đầu, đôi đũa cắm xiên tự nhiên vào lòng bát, hoàn toàn không có sợi phở lơ lửng ngoài đũa (\`opacity: 0; transform: translateY(34px) scaleY(0.2)\`).
         - Khi chạm (Click / phím Enter / Space), đôi đũa nhấc lên (\`translate(-14px, -86px) rotate(-9deg)\`), và đỉnh của 4 dải sợi phở kéo lên **gắn chặt chính xác vào đầu gắp đũa** tại tọa độ \`(X: 198, Y: 88)\`, rủ xuống mềm mại theo trọng lực kèm giọt nước dùng nhỏ giọt.
      4. **Lỗi 4 — Tách riêng Đăng nhập và Đăng ký (Loại bỏ hoàn toàn 2 tab trên card):**
         - Đã xóa sạch thẻ tab và CSS tab khỏi cả 2 trang.
         - \`pages/auth/login.html\` CHỈ chứa duy nhất form Đăng nhập + link chuyển sang \`register.html\`.
         - \`pages/auth/register.html\` CHỈ chứa duy nhất form Đăng ký + link chuyển sang \`login.html\`.
      5. **Lỗi 5 — Phương thức tiếp tục với Google và Facebook:**
         - Bổ sung 2 nút UI hiện đại với icon SVG Google và Facebook chuẩn xác.
         - Xử lý trung thực: khi click, hiển thị Toast Notification thông báo tính năng đang phát triển và sẽ sớm ra mắt (không giả lập đăng nhập thành công khi chưa có OAuth).
      6. **Lỗi 6 — Thu gọn form trên Laptop (Hạn chế cuộn dọc thừa):**
         - Tối ưu padding (\`26px 30px\`), khoảng cách trường (\`margin-bottom: 13px\`), input (\`10px 38px\`), tổng chiều cao giao diện vừa vặn hoàn hảo trong ~620px trên các màn hình laptop chuẩn (1366x768, 1440x900, 1920x1080) mà không bị cắt xén nội dung.
      7. **Lỗi 7 — Thiết kế lại thanh đầu trang Auth:**
         - Chiều cao cố định chuẩn 60px, nền mờ kính \`backdrop-filter: blur(10px)\`.
         - Container căn lề \`max-width: 1120px\` đồng bộ tuyệt đối với khối form chính bên dưới.
         - Logo CookMate bên trái, nút "Về trang chủ" viên thuốc bo tròn tinh tế bên phải.
      8. **Lỗi 8 — Tối ưu di động (0% tràn ngang):**
         - Bố cục xếp chồng dọc tự nhiên, Bát phở co giãn mượt mà theo tỷ lệ viewBox SVG, 0% lỗi tràn ngang (\`hasHorizontalScroll: false\`) trên toàn bộ dải kích thước màn hình: 360px, 375px, 390px, 430px, 768px.
    - *File cập nhật:*
      - \`assets/css/auth.css\`: Viết lại hoàn toàn theo chuẩn Auth V2, tối ưu chiều cao laptop, responsive di động, animation đũa và phở.
      - \`assets/js/auth-ui.js\`: Bỏ logic tab switching, thêm event listener cho Google/Facebook, tối ưu chuyển động bát phở, quản lý form độc lập cho login & register.
      - \`pages/auth/login.html\`: Bát phở V2 sâu lòng in chữ \`PHỞ HÀ NỘI\`, form đăng nhập đơn lẻ, nút Google/Facebook, 1-click demo accounts.
      - \`pages/auth/register.html\`: Bát phở V2 sâu lòng in chữ \`PHỞ HÀ NỘI\`, form đăng ký đơn lẻ, nút Google/Facebook, password strength meter.
    - *Kết quả kiểm thử tự động toàn diện qua Chrome Headless CDP (\`scratch/test_pho_v2_cdp.js\`):*
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
      - Ảnh chụp màn hình kiểm chứng lưu trữ tại \`scratch/screenshots/\`:
        - \`auth_v2_login_laptop_1366.png\`
        - \`auth_v2_login_laptop_lifted.png\`
        - \`auth_v2_login_mobile_375.png\`
        - \`auth_v2_login_mobile_430.png\`
        - \`auth_v2_register_laptop_1366.png\`
        - \`auth_v2_register_mobile_375.png\``;

if (content.includes(target)) {
  content = content.replace(target, addition);
  fs.writeFileSync('PROJECT_STATUS.md', content, 'utf8');
  console.log('PROJECT_STATUS.md successfully updated!');
} else {
  console.error('Target not found in PROJECT_STATUS.md');
  process.exit(1);
}
