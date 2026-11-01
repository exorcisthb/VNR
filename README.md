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

## Đưa lên Vercel

Vercel build giao diện Vite trong `dist/` và backend `api/game.js`. `vercel.json` bật Fluid Compute và chuyển `/health`, `/api/rooms`, `/api/world`, `/ws` tới cùng một HTTP/WebSocket server. Giữ nguyên Framework Preset **Vite**, Build Command **npm run build**, Output Directory **dist**. Không cần đặt `VITE_WS_URL` khi dùng backend cùng domain; xóa giá trị cũ nếu nó trỏ tới máy chủ khác. Push GitHub để Vercel tạo deployment mới nếu đã liên kết repository.

Backend Functions không ghi vào thư mục ứng dụng chỉ đọc: thế giới tham quan được tạo trong RAM, còn máy chủ Node chạy bằng `npm start` tiếp tục dùng file lưu như trước. Các file GLB được phục vụ qua CDN, không đóng gói vào Function. Có thể kiểm tra trực tiếp `/health` (JSON, HTTP 200) và `/api/rooms` (mảng JSON).

**Giới hạn:** phòng và người chơi hiện nằm trong RAM của từng instance. Vercel có thể đưa kết nối mới sang instance khác hoặc đóng socket khi hết thời lượng Function; vì vậy bản này xử lý các route HTTP/WebSocket nhưng chưa bảo đảm cùng phòng qua nhiều instance hay qua deployment. Để vận hành đoàn nhiều người ổn định, dùng máy chủ Node một instance theo cấu hình Render bên dưới; nếu mở rộng Functions cần bổ sung kho trạng thái và pub/sub chung như Redis. Không dùng file `/tmp` làm kho phòng chung. Tham khảo [WebSockets trên Vercel](https://vercel.com/docs/functions/websockets).

## Đưa lên Render miễn phí

Nếu giữ giao diện trên Vercel nhưng chuyển backend sang Render/VPS để chơi lâu hơn giới hạn Function: đặt `VITE_GAME_SERVER_URL=https://<domain-backend>` trong môi trường build Vercel rồi redeploy. Biến này chuyển cả HTTP `/health`, `/api/rooms` và WebSocket `/ws` sang cùng backend. Trên backend đặt `GAME_ALLOWED_ORIGINS=https://vnr-livid.vercel.app` (nhiều origin phân cách bằng dấu phẩy); bỏ `VITE_WS_URL` cũ để tránh trỏ socket sang máy chủ khác. Không tự đặt `maxDuration: 1800` trên Hobby vì vượt giới hạn gói.

Cũng có thể đặt URL backend vào trường `origin` của `deployment/backend.json` rồi push GitHub thay vì chỉnh biến môi trường trên Vercel. Giá trị trống giữ nguyên backend cùng domain; không điền URL trước khi backend thực sự tồn tại và `/health` trả HTTP 200.

[Triển khai cấu hình miễn phí lên Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fexorcisthb%2FVNR). Cần đăng nhập tài khoản Render và xác nhận tạo dịch vụ. Giữ plan **Free** đã khai báo trong `render.yaml`. Render không áp giới hạn thời lượng cố định cho WebSocket, nhưng dịch vụ miễn phí vẫn có thể bị khởi động lại; đây không phải cam kết uptime. Kiểm tra phiên thực tế trên 30 phút sau khi có URL triển khai.

1. Đưa mã nguồn và `package-lock.json` lên GitHub. Bỏ qua `node_modules`, `dist`, `data`, `.tools`, `.env`.
2. Tại [Render](https://dashboard.render.com/) chọn **New → Web Service**, kết nối repository, chọn **Free**, một instance, Node 24 LTS.
3. **Build:** `npm ci --include=dev && npm run build`. **Start:** `npm start`. **Health:** `/health`. Hoặc dùng **New → Blueprint** với `render.yaml`.
4. Deploy xong lấy URL HTTPS gửi thầy. WebSocket tự dùng WSS cùng URL. Thử bằng hai thiết bị trước khi nộp.

[Render Free](https://render.com/docs/free) ngủ khi không có lưu lượng và không giữ file qua restart/redeploy. Thế giới gốc luôn sinh lại từ code. Muốn giữ dữ liệu file lâu dài cần ổ đĩa bền vững hoặc dịch vụ lưu trữ ngoài. Link Cloudflare tạm và cách mở lại nằm ở [DEMO.md](./DEMO.md).

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
