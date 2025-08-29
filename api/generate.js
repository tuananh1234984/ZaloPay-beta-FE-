export default function handler(req, res) {
    // Accept params from query string
    const { name = "", size = "1-1", image, img, stickers = "" } = req.query;

  // Ảnh mặc định fallback
    const defaultImage =
        size === "9-16"
            ? "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-9-16.png"
            : "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-1-1.png";

  // Nếu có truyền image từ client (ảnh chụp dán sticker xong upload Cloudinary)
    // allow 'img' alias, fallback to defaultImage
    const imageUrl = image || img || defaultImage;

  // Open Graph tags
    const ogHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kết quả ZaloPay</title>
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${name || "Bạn"} - Phiên bản mới ZaloPay" />
            <meta property="og:description" content="Phiên bản này quá đã. Bạn đã đập hộp chưa?" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:image" content="${imageUrl}" />
            <!-- Use absolute paths to public assets so they resolve under /api route -->
            <link rel="preload" as="image" href="/assets/img/Vector-2.png" />
            <style>
                body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#111}
                .container{max-width:640px;margin:40px auto;padding:20px}
                .hero{position:relative}
                .hero img.main{width:100%;height:auto;border-radius:12px}
                .name-label{font-weight:700;font-size:22px;margin-top:12px}
                .stickers{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
                .sticker{width:64px;height:64px;object-fit:contain}
                .cta{display:inline-block;background:#00AEEF;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none}
            </style>
        </head>
        <body>
        <section class="container">
            <div class="hero">
                <img class="main" src="${imageUrl}" alt="preview" />
            </div>
            <div class="name-label">${name || "Bạn"} • Phiên bản mới</div>
            <p>Phiên bản này quá đã. Bạn đã đập hộp chưa?</p>
            <div class="stickers">
                ${ String(stickers)
                    .split(",")
                    .filter(Boolean)
                    .map((s) => `<img src="${s}" class="sticker" alt="sticker" />`)
                    .join("") }
            </div>
            <a class="cta" href="/">ĐẬP HỘP NGAY</a>
        </section>
    </body>
    </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(ogHtml);
}
