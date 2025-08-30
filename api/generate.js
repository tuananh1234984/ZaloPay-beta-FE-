module.exports = function handler(req, res) {
    // Accept params from query string
    const { name = "", size = "1-1", image, img, stickers = "" } = req.query;

    // Ảnh mặc định để hiển thị trên thẻ OG (không hiển thị trong body)
    const defaultImage =
        size === "9-16"
            ? "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-9-16.png"
            : "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-1-1.png";

    // Ảnh dùng cho preview Facebook (meta og:image)
    const imageUrl = image || img || defaultImage;

    // Danh sách sticker: nếu không có thì dùng sticker mặc định trong public/assets/icons
    const stickerList = String(stickers)
        .split(",")
        .filter(Boolean);
    const fallbackStickers = [
        "/assets/icons/icon-5-2.png",
        "/assets/icons/icon-1-2.png",
        "/assets/icons/icon-3-3.png",
    ];
    const toRender = stickerList.length ? stickerList.slice(0, 3) : fallbackStickers;

    // HTML: chỉ render UI giống mock, KHÔNG hiển thị ảnh đã upload trong body
    const ogHtml = `
        <!DOCTYPE html>
        <html lang="vi">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Kết quả ZaloPay</title>
                <meta property="og:type" content="website" />
                <meta property="og:title" content="${name || "Bạn"} - Phiên bản mới ZaloPay" />
                <meta property="og:description" content="Phiên bản này quá đã. Bạn đã đập hộp chưa?" />
                <meta property="og:image" content="${imageUrl}" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:image" content="${imageUrl}" />
                <link rel="preload" as="image" href="/assets/img/Vector-2.png" />
                <style>
                    :root{--blue:#0066ff;--green:#00d26a;--text:#0b1a33}
                    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7f9fc;color:var(--text)}
                    .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
                    .card{position:relative;width:360px;max-width:92vw;background:#fff;border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.08);padding:28px 18px 24px}
                    .bg{position:absolute;inset:0;pointer-events:none}
                    .bg img{position:absolute;top:10px;left:50%;transform:translateX(-50%);opacity:.12;width:85%}
                    .title{margin-top:72px;text-align:center;line-height:1.2}
                    .title .line1{font-weight:800;font-size:24px;color:#1a73e8}
                    .title .line2{font-weight:800;font-size:24px;color:#00b56a}
                    .sub{margin:14px auto 18px;text-align:center;color:#506079}
                    .stickers{position:relative;height:0}
                    .st{position:absolute;width:64px;height:64px;object-fit:contain}
                    .st.s1{top:48px;left:-8px}
                    .st.s2{top:6px;right:-4px}
                    .st.s3{top:132px;left:16px}
                    .cta{display:flex;align-items:center;justify-content:center;margin-top:12px}
                    .cta a{display:inline-block;background:var(--blue);color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700}
                </style>
            </head>
            <body>
                <div class="wrap">
                    <div class="card">
                        <div class="bg"><img src="/assets/img/Vector-2.png" alt="bg"/></div>
                        <div class="stickers">
                            <img class="st s1" src="${toRender[0]}" alt="sticker 1" />
                            <img class="st s2" src="${toRender[1]}" alt="sticker 2" />
                            <img class="st s3" src="${toRender[2]}" alt="sticker 3" />
                        </div>
                        <div class="title">
                            <div class="line1">${name || "Bạn"}</div>
                            <div class="line2">ngoan xinh iu</div>
                        </div>
                        <div class="sub">Phiên bản này quá đã<br/>Bạn đã đập hộp chưa?</div>
                        <div class="cta"><a href="/">ĐẬP HỘP NGAY</a></div>
                    </div>
                </div>
            </body>
        </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(ogHtml);
}
