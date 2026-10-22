# COOKMATE — AI DEVELOPMENT RULES
## Bộ quy tắc làm việc, bảo vệ mã nguồn và duy trì tính nhất quán của dự án

**Dự án:** Website hỗ trợ nấu ăn CookMate  
**Giai đoạn hiện tại:** Xây dựng Frontend trước, tích hợp Backend sau  
**Công nghệ Frontend:** HTML5, CSS3, JavaScript thuần  
**Backend dự kiến:** Python Flask  
**Ngôn ngữ giao diện:** Tiếng Việt  
**Phong cách:** Modern Food Platform — hiện đại, ấm áp, chuyên nghiệp, mobile-first.

---

# PHẦN I. NGUYÊN TẮC BẮT BUỘC

## Điều 1. Bảo vệ mã nguồn hiện có

1. Không được tự ý xóa, ghi đè, thay thế hoặc viết lại toàn bộ dự án chỉ vì cho rằng cách viết mới tốt hơn.
2. Trước khi sửa bất kỳ file nào, phải kiểm tra cấu trúc thư mục và nội dung hiện tại của các file liên quan.
3. Phải xác định rõ:
   - File nào cần sửa.
   - File nào cần tạo mới.
   - File nào không được phép chỉnh sửa.
   - Các chức năng và thành phần có thể bị ảnh hưởng.
4. Chỉ sửa trong phạm vi công việc được giao. Không nhân tiện tái cấu trúc những phần không liên quan.
5. Không xóa chức năng, thành phần giao diện, hiệu ứng hoặc nội dung đã hoàn thành nếu chưa có sự đồng ý của người dùng.
6. Nếu phát hiện code hiện tại có vấn đề ngoài phạm vi, phải báo cáo và đề xuất phương án; không tự ý mở rộng phạm vi sửa đổi.
7. Không được giả định rằng một file không quan trọng chỉ vì tên file hoặc cấu trúc có vẻ dư thừa.
8. Không thay thế một file hoàn chỉnh bằng phiên bản rút gọn, bản demo hoặc code minh họa.

## Điều 2. Sao lưu và khả năng khôi phục

Trước khi thực hiện thay đổi có ảnh hưởng đáng kể:

1. Kiểm tra trạng thái Git và những thay đổi đang tồn tại.
2. Xác định các thay đổi do người dùng hoặc thành viên khác thực hiện.
3. Không ghi đè lên các thay đổi chưa được lưu hoặc chưa được hợp nhất.
4. Tạo điểm khôi phục bằng Git commit, nhánh riêng hoặc bản sao lưu phù hợp trước khi sửa lớn.
5. Không tự ý chạy các lệnh có nguy cơ xóa dữ liệu, xóa thư mục, ghi đè hàng loạt hoặc làm mất lịch sử.
6. Không xóa bản sao lưu cũ nếu chưa được cho phép.

Nếu không thể sao lưu hoặc không xác định được trạng thái hiện tại, phải dừng các thay đổi có rủi ro cao và báo cho người dùng.

## Điều 3. Không được bịa đặt kết quả kiểm thử

AI phải trung thực về những gì đã thực hiện.

- Không nói đã chạy thử nếu chưa thực sự chạy.
- Không nói đã kiểm tra toàn bộ dự án nếu chỉ đọc một vài file.
- Không khẳng định giao diện hoạt động hoàn hảo trên điện thoại nếu chưa kiểm tra phù hợp.
- Phân biệt rõ giữa lỗi đã xác nhận, nguy cơ tiềm ẩn và giả thuyết.
- Báo cáo những phần chưa kiểm tra được do thiếu công cụ, môi trường hoặc dữ liệu.

---

# PHẦN II. QUY TRÌNH TRƯỚC KHI CODE

## Điều 4. Bắt buộc khảo sát trước khi sửa

Trước mỗi nhiệm vụ, AI phải thực hiện quy trình sau:

### Bước 1 — Đọc quy tắc dự án
Đọc file `AI_RULES.md` và các tài liệu hướng dẫn liên quan đang có trong dự án.

### Bước 2 — Khảo sát cấu trúc
Xác định:
- Thư mục gốc và cấu trúc hiện tại.
- Các file HTML, CSS, JavaScript liên quan.
- Các thành phần giao diện dùng chung.
- Các thư viện hoặc tài nguyên đang được sử dụng.
- Các trang và chức năng đã hoàn thành.

### Bước 3 — Kiểm tra trạng thái trước khi làm
Nếu có Git, kiểm tra trạng thái thay đổi và lịch sử liên quan. Không tự ý khôi phục hoặc loại bỏ thay đổi của người khác.

### Bước 4 — Xác định phạm vi
Lập danh sách file sẽ tạo, sửa và giữ nguyên.

### Bước 5 — Đánh giá rủi ro
Xác định những thành phần có thể bị ảnh hưởng, đặc biệt là:
- CSS dùng chung.
- Header, footer và điều hướng.
- JavaScript dùng chung.
- Đường dẫn tài nguyên.
- Bố cục responsive.
- Các trang đang dùng lại component hoặc stylesheet.

### Bước 6 — Chốt phương án
Với nhiệm vụ lớn hoặc có rủi ro cao, trình bày phương án trước khi triển khai. Nếu yêu cầu chưa rõ hoặc có thể làm mất chức năng, hỏi người dùng trước khi thực hiện.

Đối với sửa lỗi nhỏ, có thể tiến hành ngay sau khi hoàn thành khảo sát nếu phạm vi đã rõ ràng.

---

# PHẦN III. QUY TẮC CODE FRONTEND COOKMATE

## Điều 5. Giữ nguyên công nghệ đã thống nhất

1. Sử dụng HTML5, CSS3 và JavaScript thuần cho Frontend.
2. Không tự ý chuyển sang React, Vue, Angular hoặc framework khác.
3. Không tự ý thêm thư viện, package hoặc dịch vụ bên ngoài nếu chưa cần thiết và chưa được phê duyệt.
4. Nếu đề xuất công nghệ mới, phải nêu rõ lợi ích, chi phí tích hợp và ảnh hưởng đến cấu trúc hiện tại.
5. Tổ chức code theo hướng có thể tích hợp Flask Backend về sau.

## Điều 6. Quy chuẩn giao diện

Toàn bộ website phải tuân thủ một hệ thống thiết kế chung:

- Phong cách: ẩm thực hiện đại, thân thiện, chuyên nghiệp.
- Màu chủ đạo: cam đất.
- Màu hỗ trợ: xanh lá, kem nhạt và màu chữ tối.
- Font chữ: sử dụng thống nhất một bộ font đã được nhóm chốt.
- Card, button, input, khoảng cách, đường viền và trạng thái tương tác phải đồng nhất.
- Header, footer và điều hướng phải giữ cùng một phong cách trên các trang.
- Trang quản trị có thể dùng bố cục riêng nhưng vẫn phải thuộc cùng hệ thống nhận diện CookMate.
- Ưu tiên ảnh món ăn rõ nét, tỷ lệ hợp lý và không làm méo hình.

Không tự ý thay đổi bảng màu, font chữ, hệ thống khoảng cách hoặc phong cách chung chỉ để làm đẹp một trang riêng lẻ.

Nếu cần thay đổi hệ thống thiết kế, phải đề xuất thay đổi ở cấp toàn dự án và được người dùng chấp thuận.

## Điều 7. Mobile-first và responsive

Mọi giao diện mới hoặc được chỉnh sửa phải tuân thủ:

1. Thiết kế cho màn hình điện thoại trước, sau đó mở rộng lên tablet và desktop.
2. Không cố định chiều rộng khiến nội dung tràn màn hình.
3. Không để xuất hiện thanh cuộn ngang ngoài ý muốn.
4. Menu, biểu mẫu, card, bảng dữ liệu và bộ lọc phải phù hợp với màn hình nhỏ.
5. Không để chữ, nút bấm hoặc thành phần tương tác chồng lấn.
6. Hình ảnh phải co giãn đúng tỷ lệ.
7. Các bảng quản trị phải có phương án hiển thị phù hợp trên điện thoại.
8. Không chỉ dựa vào việc thu nhỏ giao diện desktop để tạo giao diện mobile.

Sau khi chỉnh sửa CSS, phải kiểm tra các kích thước đại diện nếu môi trường cho phép, tối thiểu gồm:
- Điện thoại nhỏ: khoảng 360px.
- Điện thoại phổ biến: khoảng 390–430px.
- Tablet: khoảng 768px.
- Desktop: khoảng 1280px trở lên.

Các kích thước này là mốc kiểm tra tham khảo, không thay thế việc kiểm tra các điểm gãy thực tế của bố cục.

## Điều 8. Hiệu ứng và hoạt ảnh

1. Ưu tiên chuyển động mượt, có mục đích và không gây mất tập trung.
2. Chỉ bổ sung hiệu ứng liên quan trực tiếp đến trải nghiệm.
3. Không tạo quá nhiều animation, hiệu ứng parallax hoặc hiệu ứng nặng.
4. Không làm chậm thao tác, cản trở nội dung hoặc gây khó sử dụng trên điện thoại.
5. Tôn trọng thiết lập giảm chuyển động của hệ điều hành thông qua `prefers-reduced-motion` khi phù hợp.
6. Không tự ý xóa hiệu ứng hiện có nếu chưa kiểm tra tác động.
7. Không dùng hiệu ứng để che giấu lỗi bố cục hoặc lỗi tương tác.

## Điều 9. HTML, CSS và JavaScript

### HTML
- Dùng cấu trúc ngữ nghĩa phù hợp.
- Mỗi trang có tiêu đề và cấu trúc nội dung rõ ràng.
- Form phải có nhãn phù hợp cho các trường nhập.
- Nút thực hiện hành động phải sử dụng đúng loại phần tử.
- Không tạo ID trùng lặp trong cùng một trang.

### CSS
- Ưu tiên tái sử dụng biến CSS và thành phần chung.
- Không dùng `!important` tràn lan để ép giao diện.
- Không thêm các quy tắc toàn cục gây ảnh hưởng ngoài ý muốn.
- Không sao chép nhiều phiên bản CSS gần giống nhau.
- Trước khi chỉnh selector dùng chung, phải xác định tất cả trang có thể bị ảnh hưởng.
- Không sửa hàng loạt các giá trị màu, khoảng cách hoặc font bằng thay thế văn bản mù quáng.

### JavaScript
- Không xóa hoặc đổi tên hàm đang được file khác sử dụng nếu chưa cập nhật đầy đủ các nơi gọi.
- Không thêm event listener trùng lặp ngoài ý muốn.
- Không tạo biến toàn cục tùy tiện.
- Xử lý trường hợp thiếu dữ liệu và lỗi thao tác.
- Không để lỗi JavaScript làm hỏng toàn bộ trang.
- Tách dữ liệu mẫu khỏi phần xử lý giao diện khi hợp lý.

---

# PHẦN IV. QUY TẮC VỀ CHỨC NĂNG VÀ PHẠM VI

## Điều 10. Bám sát báo cáo CookMate

Báo cáo của nhóm là nguồn tham chiếu chính cho yêu cầu nghiệp vụ và phạm vi hệ thống.

Các nhóm giao diện dự kiến gồm:

1. Trang chủ, danh mục và danh sách công thức.
2. Tìm kiếm công thức.
3. Chi tiết công thức và điều chỉnh khẩu phần.
4. Đăng ký, đăng nhập, đăng xuất và hồ sơ cá nhân.
5. Đăng và quản lý công thức của người dùng.
6. Bình luận và công thức yêu thích.
7. Trang quản trị công thức, danh mục, nguyên liệu, tài khoản, bình luận và thống kê.

Danh sách cuối cùng phải được đối chiếu với các Use Case và yêu cầu trong báo cáo.

Không tự ý bổ sung các chức năng nằm ngoài phạm vi đã thống nhất như:
- Chatbot nấu ăn bằng AI.
- Nhận diện món ăn bằng AI.
- Tự động sinh công thức bằng AI.
- Thanh toán, thương mại điện tử hoặc giao hàng.

Nếu người dùng muốn thay đổi phạm vi, phải ghi nhận đây là thay đổi yêu cầu, đánh giá ảnh hưởng và chờ xác nhận.

## Điều 11. Dữ liệu mẫu không phải dữ liệu thật

Trong giai đoạn Frontend:

- Có thể sử dụng dữ liệu mẫu để trình diễn.
- Dữ liệu mẫu phải có cấu trúc nhất quán.
- Không tuyên bố đã lưu dữ liệu vào cơ sở dữ liệu khi chưa có Backend.
- Không coi trạng thái đăng nhập giả lập là xác thực thật.
- Không lưu mật khẩu thật trong JavaScript, HTML hoặc dữ liệu mẫu.
- Không đưa khóa API, mật khẩu, token hay thông tin bí mật vào mã nguồn.
- Không dùng dữ liệu cá nhân thật khi không cần thiết.

Các thao tác như đăng ký, đăng nhập, đăng công thức, yêu thích và quản trị phải được ghi nhận rõ là mô phỏng cho đến khi Backend hoàn thành.

## Điều 12. Chuẩn bị cho Flask Backend

Frontend cần được tổ chức sao cho sau này có thể tích hợp Flask mà không phải viết lại toàn bộ giao diện.

- HTML có thể chuyển vào thư mục `templates`.
- CSS, JavaScript và hình ảnh được tổ chức trong `static`.
- Các trang dùng chung có thể chuyển thành template kế thừa `base.html`.
- Tách dữ liệu mẫu và logic giao diện khỏi phần trình bày.
- Không phụ thuộc vào dữ liệu được viết cứng trong HTML ở quá nhiều nơi.
- Khi tích hợp Backend, sử dụng API hoặc cơ chế render của Flask theo kiến trúc đã thống nhất.
- Không tự tạo API giả rồi tuyên bố API đó đã tồn tại trong Backend.

Mọi thay đổi về cách trao đổi dữ liệu giữa Frontend và Backend phải được thống nhất trước khi triển khai.

---

# PHẦN V. QUY TẮC SỬ DỤNG AI CODE

## Điều 13. Phạm vi sửa đổi phải rõ ràng

Mỗi nhiệm vụ phải xác định:
- Mục tiêu cần đạt.
- File được phép sửa.
- File không được phép sửa.
- Chức năng phải giữ nguyên.
- Điều kiện nghiệm thu.
- Những thay đổi không được thực hiện.

Nếu nhiệm vụ yêu cầu sửa một hàm, phải ưu tiên sửa đúng hàm đó và các phần liên quan trực tiếp. Nếu người dùng yêu cầu viết lại toàn bộ hàm, phải cung cấp đầy đủ hàm hoàn chỉnh, không trả về đoạn chắp vá thiếu ngữ cảnh.

Không được tự tiện viết lại toàn bộ file chỉ để thay đổi một chi tiết nhỏ.

## Điều 14. Không tự ý mở rộng nhiệm vụ

Trong khi làm việc, AI có thể phát hiện những vấn đề khác. Tuy nhiên:

- Không tự sửa các lỗi ngoài phạm vi nếu việc sửa có thể ảnh hưởng chức năng.
- Không thêm trang, thư viện hoặc tính năng không được yêu cầu.
- Không tự thay đổi tên file, tên hàm, ID hoặc class được sử dụng ở nơi khác.
- Không tự di chuyển thư mục hoặc thay đổi cấu trúc dự án.
- Không xóa code chỉ vì cho rằng không sử dụng mà chưa xác minh.

Có thể đưa ra danh sách đề xuất cải tiến riêng để người dùng quyết định.

## Điều 15. Quy trình thực hiện một nhiệm vụ

Với mỗi yêu cầu, AI phải:

1. Đọc quy tắc và khảo sát code liên quan.
2. Xác định phạm vi sửa đổi.
3. Nêu phương án nếu nhiệm vụ có rủi ro cao.
4. Thực hiện thay đổi nhỏ nhất nhưng đủ để đạt mục tiêu.
5. Kiểm tra lỗi cú pháp và các liên kết phụ thuộc.
6. Chạy hoặc kiểm thử những gì môi trường cho phép.
7. So sánh kết quả với trạng thái ban đầu.
8. Báo cáo file đã tạo, file đã sửa, chức năng được giữ nguyên và kết quả kiểm thử.
9. Nêu rõ các giới hạn hoặc việc chưa kiểm tra được.

Không được đánh đổi chức năng đang hoạt động chỉ để đáp ứng một yêu cầu thẩm mỹ.

---

# PHẦN VI. QUY TẮC KHI DÙNG AI QUA NHIỀU PHIÊN

## Điều 16. Mỗi phiên làm việc phải khôi phục đúng bối cảnh

Không giả định AI luôn nhớ đầy đủ những gì đã làm ở phiên trước.

Khi bắt đầu phiên mới, AI phải kiểm tra các tài liệu hiện có như:

- `AI_RULES.md`: quy tắc làm việc.
- `README.md`: cách chạy dự án và cấu trúc tổng quan.
- `PROJECT_STATUS.md`: trạng thái hiện tại.
- `UI_GUIDELINES.md`: quy chuẩn thiết kế.
- `TASK_LOG.md`: các nhiệm vụ đã thực hiện và quyết định quan trọng.

Nếu những file này chưa tồn tại, chỉ tạo hoặc cập nhật khi phù hợp với nhiệm vụ và không ghi đè thông tin hiện có một cách mù quáng.

Trước khi tiếp tục một nhiệm vụ dang dở, cần xác định:
- Việc gì đã hoàn thành.
- Việc gì chưa hoàn thành.
- Những file nào đã thay đổi.
- Những quyết định nào đã được chốt.
- Những lỗi nào còn tồn tại.
- Bước tiếp theo được phép thực hiện.

Không tự suy đoán tiến độ dựa trên tên file hoặc câu trả lời của AI ở phiên trước.

## Điều 17. Cập nhật trạng thái sau mỗi nhiệm vụ lớn

Sau mỗi nhiệm vụ quan trọng, cập nhật nhật ký dự án với:
- Ngày thực hiện.
- Mục tiêu.
- File đã tạo hoặc sửa.
- Thay đổi giao diện và chức năng.
- Kiểm thử đã thực hiện.
- Lỗi còn tồn tại.
- Quyết định mới.
- Công việc tiếp theo.

Không ghi rằng một việc đã hoàn thành nếu mới chỉ tạo giao diện hoặc chưa kiểm thử.

Không tự ý xóa lịch sử nhiệm vụ cũ. Nếu thông tin cũ không còn đúng, đánh dấu trạng thái đã thay đổi và ghi rõ lý do.

## Điều 18. Ưu tiên quyết định mới nhất đã được người dùng xác nhận

Nếu các tài liệu hoặc yêu cầu mâu thuẫn:

1. Không âm thầm chọn một phương án.
2. Xác định nội dung mâu thuẫn.
3. Nêu ảnh hưởng của từng phương án.
4. Hỏi người dùng nếu mâu thuẫn ảnh hưởng đến kiến trúc, phạm vi hoặc dữ liệu.
5. Sau khi được xác nhận, cập nhật tài liệu liên quan.

Không được dùng một đề xuất của AI trước đó để phủ nhận quyết định mới của người dùng.

---

# PHẦN VII. KIỂM THỬ VÀ NGHIỆM THU

## Điều 19. Kiểm tra sau khi sửa

Tùy phạm vi thay đổi, cần kiểm tra:

- Trang có tải đúng không.
- CSS và hình ảnh có tải đúng không.
- Điều hướng có hoạt động không.
- Các nút có hành động đúng không.
- Form có hiển thị lỗi và thông báo phù hợp không.
- JavaScript có lỗi không.
- Có ảnh hưởng đến trang khác dùng chung CSS hoặc JS không.
- Responsive trên điện thoại và desktop có còn đúng không.
- Các hiệu ứng có gây giật, nhấp nháy hoặc cản trở thao tác không.

Nếu không có môi trường chạy trình duyệt, phải ghi rõ rằng mới kiểm tra tĩnh hoặc kiểm tra code, chưa xác nhận hành vi thực tế.

## Điều 20. Điều kiện nghiệm thu

Một nhiệm vụ chỉ được coi là hoàn thành khi:

1. Đạt mục tiêu được giao.
2. Không có thay đổi ngoài phạm vi chưa được chấp thuận.
3. Các chức năng hiện có trong phạm vi kiểm tra vẫn hoạt động.
4. Không phát sinh lỗi nghiêm trọng đã xác nhận.
5. Giao diện đáp ứng các tiêu chí responsive liên quan.
6. Những gì chưa kiểm thử được đã được báo cáo.
7. Người dùng có thể xác định rõ file nào đã thay đổi và cách kiểm tra kết quả.

---

# PHẦN VIII. MẪU BÁO CÁO SAU MỖI LẦN AI CODE

Sau khi hoàn thành nhiệm vụ, AI phải báo cáo theo mẫu:

### 1. Kết quả
- Mục tiêu đã xử lý.
- Phần đã hoàn thành.
- Phần chưa hoàn thành.

### 2. Danh sách file
- File mới.
- File đã sửa.
- File đã xóa, nếu được cho phép.
- File được giữ nguyên.

### 3. Thay đổi
- Giao diện hoặc chức năng đã thay đổi.
- Lý do thay đổi.
- Các phụ thuộc có liên quan.

### 4. Kiểm thử
- Kiểm tra đã thực hiện.
- Kết quả thực tế.
- Lỗi còn tồn tại.
- Phần chưa thể xác minh.

### 5. An toàn và khả năng khôi phục
- Điểm khôi phục hoặc trạng thái Git nếu có.
- Rủi ro còn lại.
- Các thay đổi chưa được hợp nhất.

### 6. Bước tiếp theo
- Việc nên làm tiếp theo.
- Những vấn đề cần người dùng quyết định.
- Không tự động tiếp tục sang nhiệm vụ mới nếu chưa được cho phép.

---

# PHẦN IX. LỆNH BẮT BUỘC DÀNH CHO AI

Trước mỗi nhiệm vụ, hãy tuân thủ chỉ thị sau:

“Bạn đang làm việc trên dự án CookMate hiện có, không phải tạo một dự án mới từ đầu.

Trước khi hành động, hãy đọc `AI_RULES.md`, kiểm tra cấu trúc dự án, khảo sát các file liên quan và xác định trạng thái thay đổi hiện tại.

Không tự ý xóa, ghi đè, viết lại toàn bộ dự án, thay đổi công nghệ, đổi cấu trúc thư mục, sửa file ngoài phạm vi hoặc loại bỏ chức năng đang hoạt động.

Hãy xác định rõ mục tiêu, phạm vi, file được phép sửa, phụ thuộc và tiêu chí nghiệm thu. Ưu tiên thay đổi nhỏ nhất nhưng đầy đủ để đạt mục tiêu.

Nếu phát hiện rủi ro lớn, xung đột thay đổi, yêu cầu mơ hồ hoặc nguy cơ mất dữ liệu, hãy dừng phần thay đổi có rủi ro và hỏi người dùng.

Sau khi sửa, hãy kiểm tra những gì có thể kiểm tra, đối chiếu với trạng thái ban đầu và báo cáo trung thực. Không tuyên bố đã chạy hoặc kiểm thử nếu chưa thực hiện.

Khi kết thúc, cập nhật trạng thái dự án và nhật ký nếu nhiệm vụ đủ lớn. Không tự động chuyển sang nhiệm vụ tiếp theo.

Mọi thay đổi phải tuân thủ quy tắc dự án, báo cáo CookMate và những quyết định mới nhất đã được người dùng xác nhận.”

**Nguyên tắc cuối cùng:** Bảo vệ code đang có, giữ đúng phạm vi, thay đổi có kiểm soát, kiểm thử trung thực và luôn đảm bảo khả năng tiếp tục công việc ở phiên sau.