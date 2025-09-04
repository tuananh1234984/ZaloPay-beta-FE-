# ZaloPay-beta-FE-

Trải nghiệm web tĩnh kèm API serverless để tạo ảnh chia sẻ. Tối ưu tải ban đầu, UX đơn giản, và hiển thị xem trước (preview) ổn định trên Facebook/Twitter.

## Tính năng
- Ghép ảnh phía client bằng html2canvas và bộ sticker tuỳ chọn.
- Upload Cloudinary qua API serverless (ký số nếu có, hoặc fallback unsigned preset).
- Link chia sẻ ngắn gọn: tham số rút gọn và hỗ trợ Cloudinary `public_id` (pid).
- Trang Open Graph `/api/generate` chuyên dụng cho preview mạng xã hội.
- Tối ưu hiệu năng: preconnect, preload, fetchpriority, lazy-loading.

## Cấu trúc dự án
- `public/` — site tĩnh (HTML/CSS/JS và assets)
  - `index.html` — giao diện chính
  - `js/script.js` — logic chọn sticker, chụp ảnh, upload, chia sẻ
  - `css/` — style
  - `assets/` — hình ảnh và icon
- `api/` — hàm serverless kiểu Vercel
  - `generate.js` — trả về HTML tối giản + OG tags để crawler đọc preview
  - `upload.js` — upload ảnh chụp lên Cloudinary
- `.env.example` — biến môi trường mẫu

## Bắt đầu nhanh
Khuyến nghị deploy lên Vercel để có hosting tĩnh + serverless thuận tiện.

Tuỳ chọn chạy cục bộ:
- Chỉ xem tĩnh: mở `public/index.html` bằng static server bất kỳ.
- Đủ (tĩnh + API): dùng Vercel CLI để giả lập serverless.

Ví dụ trên Windows (CMD):
```cmd
:: Cài Vercel CLI
npm i -g vercel

:: Chạy dev tại thư mục repo
vercel dev
```
Lưu ý: Nếu không dùng Vercel, bạn cần tự ánh xạ `/api/*` vào các handler Node tương ứng.

## Biến môi trường
Thiết lập trong Vercel Project Settings → Environment Variables (không commit secrets).

Bắt buộc:
- `CLOUDINARY_CLOUD_NAME` — Cloud name Cloudinary của bạn

Khuyến nghị (upload ký số):
- `CLOUDINARY_API_KEY` — API key Cloudinary
- `CLOUDINARY_API_SECRET` — API secret Cloudinary

Không dùng ký số thì sẽ fallback unsigned — cần:
- `CLOUDINARY_UPLOAD_PRESET` — unsigned preset (vd: `zalopay_unsigned`)

Tuỳ chọn:
- `FB_APP_ID` — Facebook App ID, giúp Share Dialog/Debugger ổn định hơn

## Luồng chia sẻ (tóm tắt)
1) Người dùng nhập tên + chọn sticker.  
2) Ứng dụng render DOM ẩn ra canvas (html2canvas) → PNG data URL.  
3) Client POST `/api/upload` để server upload Cloudinary, nhận `secure_url` và `public_id`.  
4) Client mở link `/api/generate?...` với tham số rút gọn; nếu có `public_id` sẽ dùng `pid` để ngắn và ổn định.  
5) Crawler (Facebook/Twitter) tải `/api/generate`, đọc OG tags và hiển thị ảnh preview.

## API
### POST `/api/upload`
Upload ảnh base64 lên Cloudinary.

Body (JSON):
- `dataUrl` — PNG data URL (bắt buộc)
- `folder` — thư mục Cloudinary (tuỳ chọn, vd: `zalopay-shares`)
- `publicId` — đặt public id tuỳ chọn (tuỳ chọn)
- `tags` — tags ngăn cách bởi dấu phẩy (tuỳ chọn)

Response (JSON):
- `secure_url` — URL HTTPS của ảnh
- `public_id` — Cloudinary public id
- các trường Cloudinary khác

Chế độ xác thực:
- Ký số (ưu tiên): khi có `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`
- Unsigned: dùng `CLOUDINARY_UPLOAD_PRESET`

### GET `/api/generate`
Trả HTML tối giản kèm Open Graph tags.

Tham số rút gọn hỗ trợ:
- `n` — name (alias: `name`)
- `s` — size: `1-1` hoặc `9-16` (alias: `size`)
- `t` — tagline/phrase (alias: `tag`, `phrase`, `p`)
- `k` — danh sách sticker, phân tách bằng dấu phẩy (chấp nhận path `/assets/icons/...`)
- `i` — ảnh trực tiếp (alias: `img`, `image`)
- `pid` — Cloudinary `public_id` (nên dùng khi có)
- `v` — cache-buster (tuỳ chọn)

Ưu tiên chọn ảnh cho OG:
1) `i` (URL ảnh trực tiếp), nếu không có →  
2) `pid` (build thành `https://res.cloudinary.com/<cloud>/image/upload/<pid>`), nếu không →  
3) ảnh mặc định.

OG gồm: `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `twitter:card`, `twitter:image`, và `fb:app_id` (khi có `FB_APP_ID`).

## Tạo link chia sẻ
Ví dụ link ngắn:
```
/api/generate?n=Anh&s=1-1&k=/assets/icons/icon-5-2.png,/assets/icons/icon-4-2.png&pid=zalopay-shares/abc123&t=ngu%E1%BA%A7u&v=lmno12
```
Khi có `pid`, crawler sẽ tải ảnh dựa trên `public_id` Cloudinary.

## Ghi chú hiệu năng
- Preconnect tới CDN/Cloudinary upload host.
- Preload các ảnh LCP; dùng `fetchpriority="high"` cho hero image.
- Cân nhắc lazy-load html2canvas hoặc nhúng 1 lần cuối trang.
- Dùng `loading="lazy"` và `decoding="async"` cho ảnh không quan trọng.

## Khắc phục sự cố
- Debugger báo “URL chưa từng được chia sẻ”:
  - Đảm bảo URL trả HTTP 200 và có OG tags hợp lệ.
  - Deploy bản fix mới nhất lên production hoặc dùng URL preview đã có fix.
  - Nhấn “Scrape Again/Thu thập lại”.
- Cảnh báo “Thiếu fb:app_id”:
  - Không bắt buộc. Thêm `FB_APP_ID` để `/api/generate` tự chèn `<meta property="fb:app_id" ...>`.
  - Có thể thêm thẻ này vào `public/index.html` nếu muốn trang gốc (/) cũng có.
- Mã 206 (Partial Content) trong Debugger:
  - Thường do CDN dùng range request; thường vô hại, crawler vẫn đọc được. Có thể “Scrape Again” 1-2 lần.
- Không hiện ảnh khi share:
  - Đảm bảo `/api/generate` public, trả 200, `og:image` là HTTPS public.
  - Ưu tiên dùng link có `pid` để tránh URL quá dài.
- Upload lỗi:
  - Kiểm tra env: `CLOUDINARY_CLOUD_NAME` (bắt buộc). Unsigned: cần `CLOUDINARY_UPLOAD_PRESET`.
  - Ký số: thêm `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET`.
- 500 ở `/api/generate` (đã khắc phục):
  - Hãy deploy bản mới nhất. Nếu vẫn lỗi, mở URL đó trong tab ẩn danh để xem stack và báo lại.

## Mẹo phát triển
- UI trong `public/index.html`, style ở `public/css/`.
- Logic chính: `public/js/script.js` (chọn sticker, chụp ảnh, upload, share).
- Thay đổi trong `api/` cần deploy để áp dụng. Có thể test bằng Vercel CLI.

## Quy trình hoạt động (chi tiết)

### 1) Tổng quan
- Frontend (tĩnh) phục vụ UI/UX và dựng ảnh bằng html2canvas.
- Backend (serverless) chỉ làm 2 việc: upload ảnh lên Cloudinary và trả trang OG hiển thị preview.
- Chia sẻ: người dùng mở link `/api/generate?...`, Facebook/Twitter crawler đọc OG để hiển thị ảnh.

### 2) Luồng người dùng trên UI
1. Vào `index.html`, nhấn “CHƠI NGAY”.
2. Nhập tên, chọn tối đa 3 sticker.
3. Ứng dụng có thể pre-upload ảnh ở nền (tùy flow) để rút ngắn thời gian chờ khi chia sẻ.
4. Khi bấm chia sẻ, app chụp DOM → canvas → PNG, gọi `/api/upload`.
5. Nhận về `secure_url` và `public_id`, dựng link `/api/generate` dạng ngắn (ưu tiên `pid`).
6. Mở cửa sổ share Facebook (Share Dialog hoặc sharer) với link đó.

### 3) Phía client (script.js)
- Chuẩn bị DOM off-screen để đảm bảo layout ổn định khi chụp.
- Gọi `html2canvas(target, { useCORS: true, allowTaint: true, scale: 2 })` rồi `canvas.toDataURL('image/png')`.
- POST `/api/upload` với JSON `{ dataUrl, folder, tags }`.
- Lưu `lastUploadedUrl` và `lastUploadedPublicId`; tạo URL `/api/generate?n=...&k=...&pid=...&s=...&t=...&v=...`.
- Mở Share Dialog (nếu có `FB_APP_ID`) hoặc fallback sharer.

### 4) API upload (serverless)
- Nếu có `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`: ký số payload và gọi Cloudinary signed upload.
- Nếu không: dùng `CLOUDINARY_UPLOAD_PRESET` để upload unsigned.
- Trả JSON gồm `secure_url`, `public_id`, v.v.

### 5) API generate (serverless)
- Đọc query: rút gọn `n/s/t/k/i/pid` (và alias cũ).
- Xác định ảnh:
  1) `i` (trực tiếp) → 2) `pid` (build URL Cloudinary) → 3) ảnh mặc định.
- Render HTML tối giản + OG tags: `og:title`, `og:image`, `og:url`, `og:site_name`, `twitter:card`, `twitter:image`, và `fb:app_id` (nếu có env).
- Có trạng thái trống (empty) khi thiếu toàn bộ dữ liệu có ý nghĩa; cung cấp nút “Thử lại”.

### 6) Chia sẻ Facebook và bộ nhớ đệm
- Facebook cache theo URL. Mỗi thay đổi nội dung cần “Scrape Again”.
- Audience “Only me” vẫn cho crawler truy cập và cache.
- Tránh URL preview/riêng tư; nên dùng domain production làm canonical (`og:url`).
- Mã 206 từ CDN thường không sao; Scraper vẫn đọc OG.

### 7) Sơ đồ tuần tự (giản lược)
```
Người dùng        Trình duyệt (UI)                 API                Cloudinary          Facebook
    |                  |                            |                      |                   |
    |  nhập/chọn      |                            |                      |                   |
    |----------------->|                            |                      |                   |
    |  bấm chia sẻ     | html2canvas → PNG          |                      |                   |
    |----------------->|--------------------------->|  /api/upload         |                   |
    |                  |                            |--------------------->|  upload           |
    |                  |                            |<---------------------|  secure_url,pid   |
    |                  |  tạo /api/generate?pid=... |                      |                   |
    |                  |----------------------------|                      |                   |
    |  mở share FB     |                            |  trả HTML + OG       |                   |
    |----------------->|                                                       ^ crawler fetch  |
    |                  |                                                       |---------------|
```

### 7b) Sơ đồ tuần tự (chi tiết đầy đủ)

```mermaid
sequenceDiagram
  autonumber
  participant U as Người dùng
  participant B as Trình duyệt (UI)
  participant H as html2canvas
  participant AU as API /api/upload
  participant C as Cloudinary
  participant AG as API /api/generate
  participant F as Facebook Crawler

  U->>B: Mở trang gốc /
  B->>B: Preconnect/Preload CSS/ảnh; khởi tạo JS (script.js)
  B->>B: Gắn listener, khởi tạo TAGLINES, set crossorigin=anonymous cho ảnh

  U->>B: Nhập tên, chọn tối đa 3 sticker
  opt (Pre-upload nền, tăng tốc chia sẻ)
    B->>H: Lazy-load thư viện (nếu cần)
    B->>B: Dựng DOM off-screen theo size
    B->>H: toCanvas(useCORS, allowTaint, scale=2)
    H-->>B: Canvas
    B->>AU: POST /api/upload { dataUrl, folder, tags=preupload }
    alt Signed upload
      AU->>C: Gọi Cloudinary (ký số)
    else Unsigned upload
      AU->>C: Gọi Cloudinary (unsigned preset)
    end
    C-->>AU: { secure_url, public_id }
    AU-->>B: JSON
    B->>B: Ghi window.lastUploadedUrl/PublicId
  end

  U->>B: Bấm nút chia sẻ
  alt Chưa có canvas sẵn
    B->>H: toCanvas(...)
    H-->>B: Canvas
  end
  B->>AU: POST /api/upload { dataUrl, tags=share }
  AU->>C: Upload (signed/unsigned)
  C-->>AU: { secure_url, public_id }
  AU-->>B: JSON
  B->>B: Build URL /api/generate?n&k&pid&s&t&v (ưu tiên pid)
  B->>F: Mở Share Dialog/Sharer với URL

  F->>AG: GET /api/generate?... (no auth)
  AG->>AG: Parse query: n/s/t/k/i/pid; tính canonical og:url → prod
  AG->>AG: Chọn ảnh: i → pid (CLOUD_NAME) → default
  AG->>AG: Render HTML + meta: og:image/width/height, og:title, site_name, twitter, fb:app_id
  AG-->>F: 200 HTML (Content-Type: text/html; Cache-Control: no-store)
  F->>F: Parse OG, cache theo URL
  F-->>U: Hiển thị preview trong composer

  U->>B: Click CTA "ĐẬP HỘP NGAY"
  B->>B: Điều hướng về /

  %% Nhánh lỗi/biên
  par Lỗi upload
    AU-->>B: 4xx/5xx | body không có secure_url
    B-->>U: Hiện slide lỗi/nhắc thử lại
  and Lỗi generate
    AG-->>F: 5xx → Debugger báo lỗi | preview rỗng
    U->>B: "Scrape Again" sau khi deploy fix
  and 206 từ CDN
    F-->>U: Preview vẫn hoạt động; có thể cảnh báo nhưng không chặn
  end
```

### 8) Tình huống mép và xử lý
- 500 tại `/api/generate`: kiểm tra log; đảm bảo không tham chiếu biến chưa định nghĩa; deploy bản fix.
- Upload lỗi: thiếu `CLOUDINARY_CLOUD_NAME` hoặc preset; kiểm tra env trên Vercel và redeploy.
- Link quá dài: dùng `pid` thay vì `i` để rút gọn.
- Crawler không thấy ảnh: chắc chắn ảnh là HTTPS public, `og:image` đúng, và không chặn robots.

## Giấy phép
Nội bộ (tùy chỉnh theo nhu cầu).
