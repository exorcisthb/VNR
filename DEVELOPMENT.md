# Kiến trúc bản tham quan

- `shared/architecture.mjs`: cấu kiện kích thước theo mét, phòng, điểm ghé thăm, hộp va chạm và nguồn. Cùng dữ liệu được dùng ở máy chủ và trình duyệt.
- `shared/landmarks.mjs`, `shared/environment.mjs`: ba khu, cảnh quan, vị trí cây xác định.
- `shared/world.mjs`: địa hình theo chunk 16×16×64, đọc dữ liệu lưu cũ; `src/mesher.js` gộp các mặt lộ ra của địa hình.
- `shared/physics.mjs`: trọng lực, AABB liên tục cho công trình, thân cây, tự bước lên bậc tối đa 32 cm và kiểm tra đoạn camera với vật cản. Không cần nhảy để leo cầu thang.
- `src/architecture.js`: gộp cấu kiện cùng hình học/vật liệu bằng InstancedMesh, giữ lỗ cầu thang, ô cửa và nội thất thật trong cảnh 3D.
- `src/materials.js`: vật liệu PBR và texture Canvas; tọa độ bề mặt theo thế giới để không kéo giãn vân đá trên tường dài.
- `src/avatars.js`: hai mẫu nhân vật, vai trò, nhãn tên, tay chân chuyển động và cờ gợn. Camera có nhân vật của chính người chơi.
- `src/main.js`: góc nhìn thứ ba, yêu cầu khóa chuột trong thao tác bắt đầu, fallback chuột trực tiếp trên khung cảnh, Esc luôn mở menu và thả chuột; người dùng rời thì hủy tự kết nối lại.
- `server/index.mjs`: một thế giới tối đa 32 người, vị trí 15 Hz, phân vai host ở server, chat giới hạn tần suất, chuyển host khi rời, kiểm tra va chạm, chặn sửa khối. Ghé thăm nhanh chỉ tới các điểm được khai báo trong dữ liệu.

## Lưu dữ liệu

File JSON phiên bản 1 được đọc và lưu thành phiên bản 2, có bản dự phòng trước đó. Dữ liệu khối cũ ngoài khu công trình được giữ; UI và server mới không cho tạo thao tác sửa khối. Công trình và nội thất luôn được sinh lại từ code. Không chạy hai server cùng ghi một WORLD_FILE; máy chủ QA dùng file riêng.

## Kiểm tra

`npm test` kiểm tra địa hình, rơi/nhảy, đường đi chung, cửa vào cả ba nơi, mọi điểm nội thất, hai lượt cầu thang lên/xuống, camera tránh tường/trần/cây, hai client WebSocket, phân vai, chat, ghé phòng, chuyển host, chế độ chỉ tham quan, chuyển file cũ và file hỏng.

Kiểm tra trình duyệt bổ sung: hình ảnh, điều khiển chuột/Esc, menu rời, hai mẫu nhân vật, các phòng, bố cục điện thoại. Kết quả trên máy phát triển không thay thế kiểm thử trên điện thoại thật hoặc đủ 32 người.
