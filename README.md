# Dấu Việt — Hành trình di sản

Game tham quan 3D nhiều người dùng **Three.js + Node.js + WebSocket**. Sáu điểm đến nằm trong **một bản đồ chung**: ba công trình ban đầu, Chùa Một Cột, quảng trường trống đồng Đông Sơn và khu trưng bày xe tăng. Có 11 vị trí nội thất/quan sát, cửa vào và cầu thang. Mô hình dựa trên tư liệu công khai, bố trí rút gọn cho mục đích học tập; không phải bản sao 1:1.

## Chạy tại máy

Cần Node.js **20+** (khuyên dùng Node 22 hoặc Node 24 LTS):

```sh
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển Vite (khuyên dùng khi lập trình / chạy thử)
npm run dev
```

Mở **http://127.0.0.1:3000** (hoặc `http://localhost:3000`). Máy khác cùng mạng Wi-Fi mở địa chỉ LAN do Vite hiển thị (ví dụ `http://192.168.x.x:3000`).

### Các lệnh npm khác:
- `npm run dev`: Khởi động Vite dev server (có HMR cập nhật tức thì và backend game tích hợp sẵn).
- `npm run build`: Đóng gói ứng dụng web vào thư mục `dist/`.
- `npm run preview`: Xem trước bản build trên máy với Vite preview.
- `npm start`: Chạy server production độc lập bằng Node.js.
- `npm test`: Chạy kiểm thử tự động toàn bộ tính năng và game server.

## Điều khiển và nhân vật

- **WASD:** đi theo hướng nhìn. **Chuột:** tự điều khiển góc nhìn thứ ba; quay trái nhìn trái, quay phải nhìn phải. Nhấn **Bắt đầu hành trình** yêu cầu khóa chuột ngay trong thao tác vào game; trình duyệt nhúng không hỗ trợ sẽ dùng chuột trên khung cảnh.
- **Esc:** thả chuột và mở menu. Chọn **Rời buổi tham quan** để về màn hình nhập tên; kết nối lại sẽ không tự bật sau khi chủ động rời.
- **Space:** nhảy; **Shift:** đi nhanh; **Enter:** chat; **E:** xem tư liệu; **R:** về điểm xuất phát. Trong phòng viếng, nhân vật chỉ đi bộ.

Chat: nhấn **Enter** mở ô nhập, Enter lần nữa để gửi; **Esc** mở menu. Tin mới nằm dưới cùng và danh sách tự cuộn khi đang xem tin mới nhất. Nếu cuộn lên đọc tin cũ, vị trí đọc được giữ nguyên và nút **Tin nhắn mới ↓** đưa về cuối. Toàn bộ tin nhắn được giữ trong thời gian phòng còn hoạt động, không cắt sau 25 tin; khi host kết thúc phòng, lịch sử phòng bị xóa. Phòng mới dùng lại cùng ID bắt đầu với lịch sử trống.
- Cuộn chuột chỉnh khoảng cách camera. Camera tự thu gần khi vướng tường/trần. Không còn thanh vật phẩm, đặt hay phá khối.
- Điện thoại: joystick trái để đi, vuốt khung cảnh để nhìn, nút ↑ để nhảy. Menu có ba mức chất lượng.
- Host mặc **sơ mi trắng tay ngắn, quần đen và cầm cờ Việt Nam**. Sinh viên mặc **polo FPT cam viền trắng, quần đen, giày sáng màu và đeo balo phía sau**. Trang phục được dựng theo ảnh tham khảo người dùng cung cấp. Đây là vai trò hiển thị, không phải tài khoản quản trị.

Chùa Một Cột nằm ở phía tây nam (-87, 83), có hồ, trụ đá, đài gỗ, mái cong và cầu thang lên. Khu trống đồng ở phía đông nam (98, 87): riêng thân trống cao **4,2 m**, mặt rộng **7,4 m**, cao hơn nhân vật khoảng 2,45 m. Có đài quan sát cạnh trống để xem hoa văn mặt trên. Cả hai khu nối với đường chính, không đổi map.

Menu có bản đồ chung và ghé thăm nhanh từng công trình/phòng; mọi nơi vẫn đi bộ tới được. Tư liệu và mức độ mô phỏng ở [SOURCES.md](./SOURCES.md), cũng đọc được bằng E trong game.

Khu trưng bày xe tăng nằm bên phải Dinh Độc Lập, tại **(110, -10)**, nối với đường chính và có nút ghé thăm nhanh trong menu. Xe giữ chi tiết, chất liệu và tỷ lệ của `3D/xe tăng.glb`; số hiệu nổi ở hai bên tháp pháo đã được sửa thành **390**. Xe đặt trên bục đá, bao quanh bằng rào kín bốn phía. Vùng va chạm dùng chung ở client/server chặn đi bộ, nhảy và di chuyển xuyên rào vào trong. Model chỉ bắt đầu tải khi người chơi đến gần khu này. Sau khi thay file gốc, chạy `npm run prepare:models -- "xe tăng"` rồi `npm run build`. Đây là khu bố trí thêm trong game; nguồn hình học là file người dùng cung cấp.

## Triển khai lên Render (Khuyên dùng - Ổn định, không bị tải lại game)

**Vì sao nên dùng Render thay vì Vercel?**
- Vercel hoạt động theo mô hình *Serverless Function*, tự động ngắt kết nối và giải phóng tiến trình sau một khoảng thời gian ngắn (timeout), dẫn đến việc WebSocket bị mất kết nối và game bị tải lại / reset vị trí người chơi sau mỗi vài phút.
- **Render** cung cấp môi trường **Web Service** chạy liên tục 24/7 (Node.js persistent server), hỗ trợ kết nối WebSocket thời gian thực lâu dài, giữ phòng ổn định và phục vụ cả giao diện 3D lẫn dữ liệu nhiều người chơi trên cùng một domain duy nhất.

### Cách triển khai lên Render trong 2 phút:

#### Cách 1: Triển khai nhanh bằng Blueprint (1-Click)
1. Truy cập: **[Triển khai lên Render với Blueprint](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fexorcisthb%2FVNR)**.
2. Đăng nhập tài khoản Render (bằng GitHub).
3. Render sẽ tự động đọc file `render.yaml` và cấu hình sẵn mọi thông số.
4. Bấm **Apply** để bắt đầu build và deploy.
5. Sau 2-3 phút, Render sẽ cấp cho bạn đường dẫn HTTPS (ví dụ: `https://dau-viet-mien-khoi.onrender.com`). Mở đường dẫn này là có thể chơi mượt mà không bị ngắt kết nối.

#### Cách 2: Tạo thủ công qua Render Dashboard
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/).
2. Chọn **New +** → **Web Service** → chọn repository **`exorcisthb/VNR`**.
3. Cấu hình các mục như sau:
   - **Name:** `dau-viet-mien-khoi` (hoặc tên tùy chọn)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
   - **Health Check Path:** `/health`
4. Bấm **Deploy Web Service** và chờ Render hoàn tất.

*Lưu ý gói Render Free:* Khi không có người truy cập trong 15 phút, server sẽ tạm ngủ để tiết kiệm tài nguyên. Khi có người mở lại web, lượt truy cập đầu tiên sẽ mất khoảng 30–50 giây để khởi động lại máy chủ. Khi đã có người trong phòng, kết nối WebSocket và cơ chế heartbeat 10s sẽ giữ server luôn thức và hoạt động ổn định.

## Kiểm tra, lưu và báo lỗi

Cây dùng hai mức chi tiết theo khoảng cách: bản nhẹ tải trước, bản chi tiết chỉ hiển thị ở gần; mức Hiển thị trong menu điều chỉnh khoảng cách này. Build tạo sẵn model nén Brotli và `npm start` phục vụ bản nén cho trình duyệt hỗ trợ. Bản cây xa được tạo bằng `npm run prepare:models -- "cây-xa"` sau khi có bản cây chi tiết. Các model nguồn trong `3D/` được giữ nguyên.

Mặt ngoài Lăng Bác và Văn phòng Chính phủ được dựng theo ảnh tham chiếu: đế đá phân cấp, khối cột và dòng chữ hai tầng của Lăng; mặt đứng trắng, cửa đứng, khối giữa cao và mái xanh thấp của Văn phòng Chính phủ. Các phòng, tường phía trong, cầu thang và nội thất được giữ theo bố trí hiện có. Tỷ lệ được điều chỉnh cho bản đồ game, không phải bản vẽ đo đạc thực tế. Phần ngoại thất nằm trong `shared/facades.mjs`.

Model thảm ở sảnh Dinh Độc Lập và hoa sen ở hai hồ cùng đôi bình hoa trong Chùa Một Cột được lấy từ `3D/thamr.glb` và `3D/hoa sen.glb`. Game dùng các bản giảm số tam giác trong `public/models/`, giữ chất liệu/UV gốc; các bông sen dùng chung hình học để giảm tải. Sau khi thay file gốc, chạy `npm run prepare:models` rồi `npm run build`. Các bản đã tối ưu có sẵn nên build thông thường không cần xử lý lại model.

Đèn chùm dùng `3D/đèn chùm.glb` tại 7 vị trí trong Phòng Khánh tiết, Phòng Nội các và Phòng Trình Quốc thư. Model được căn theo đỉnh treo, dùng chung hình học và thay các đèn dựng tạm sau khi tải xong. Có thể xử lý riêng bằng `npm run prepare:models -- "đèn chùm"`.

Tượng Bác tại Phòng Khánh tiết và Phòng họp Chính phủ dùng `3D/tượng bác.glb`, căn chân tượng trên bục và hướng về phía khách tham quan. Xử lý riêng model bằng `npm run prepare:models -- "tượng bác"`.

Phần thi hài trong phòng viếng Lăng dùng `3D/thi hài bác.glb`, xoay theo chiều dài hòm kính và căn trên bệ hiện có. Hòm kính, bệ đá và nội thất xung quanh được giữ nguyên. Xử lý riêng bằng `npm run prepare:models -- "thi hài bác"`.

Tượng Quan Âm trên ban thờ bên trong Chùa Một Cột dùng `3D/tượng quan âm.glb`, đặt trên bục và hướng về cửa vào. Xử lý riêng model bằng `npm run prepare:models -- "tượng quan âm"`.

```sh
npm test
npm run build
```

Server lưu `data/world.json` và bản trước `world.json.bak`; tự đọc file phiên bản cũ, bảo toàn dữ liệu thay đổi đã lưu. Bản tham quan không phát sinh thao tác sửa khối mới. Chat, vị trí và vai trò ở RAM. Đổi nơi lưu bằng biến `WORLD_FILE`; khôi phục JSON khi server đã dừng.

Chưa kiểm thử tải đủ 32 người hoặc trên điện thoại thật. Cần WebGL 2. Nội thất mới dựng các phòng tiêu biểu; không có toàn bộ hơn 100 phòng Dinh Độc Lập, tầng hầm chi tiết hay sơ đồ thật của trụ sở Chính phủ.

Báo lại **link + thiết bị/trình duyệt + các bước + kết quả mong đợi/thực tế**, kèm ảnh hoặc Console F12/log server. Chi tiết kỹ thuật ở [DEVELOPMENT.md](./DEVELOPMENT.md).
