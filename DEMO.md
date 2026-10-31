# Chơi thử ngay

- Link công khai tạm thời: **https://modeling-updates-book-ambient.trycloudflare.com**
- Trên máy này: **http://127.0.0.1:3000**
- Điện thoại cùng Wi-Fi: **http://192.168.0.102:3000** (địa chỉ LAN có thể đổi khi đổi mạng).

Link công khai đang chuyển đến bản production trên máy này qua [Cloudflare Quick Tunnel](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/). Máy cần bật, có Internet, và hai tiến trình Node.js/cloudflared cần tiếp tục chạy. Link sẽ ngừng khi dừng tunnel; tạo tunnel mới sẽ có tên mới. Không dùng link tạm làm địa chỉ nộp lâu dài; xem [README.md](./README.md) để triển khai Render.

Nếu muốn tự mở lại demo sau này, chạy ở hai terminal trong thư mục dự án:

```powershell
# Terminal 1
npm run build
npm start
```

```powershell
# Terminal 2 — công cụ chính thức đã tải ở .tools/ trên máy này
.\.tools\cloudflared.exe tunnel --url http://127.0.0.1:3000 --protocol http2 --no-autoupdate
```

Copy URL HTTPS mới mà terminal 2 in ra. Ctrl+C ở terminal 2 để đóng link công khai; Ctrl+C ở terminal 1 để dừng game và lưu thế giới. Nếu mã nguồn được chuyển sang máy khác, tải cloudflared từ [Cloudflare](https://developers.cloudflare.com/tunnel/downloads/) hoặc dùng Render, không cần công cụ này ở máy người chơi.

Đã xác minh trang HTML công khai trả HTTP 200, health check trả HTTP 200, WebSocket WSS nhận được thế giới và tên người chơi. Bộ kiểm tra cục bộ 12/12 đạt; bản build production thành công. Chưa kiểm thử tải đủ 32 người hay chạy trên điện thoại thật.
