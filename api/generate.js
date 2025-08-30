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
                <!-- Load site styles from /public/css so classes render correctly under /api/* -->
                <link rel="stylesheet" href="/css/styleguile.css" />
                <link rel="stylesheet" href="/css/style.css" />
                <link rel="stylesheet" href="/css/global.css" />
            </head>
            <body>
                <section>
                    <div class="giao-din-kt-qu-hin">
                        <div class="div">
                            <div class="overlap">
                                <img class="vector" src="/assets/img/Vector-2.png" />
                                <div class="group">
                                    <div class="name-label text-wrapper">${name || "Bạn"}</div>
                                    <div class="text-wrapper-2">ngoan xinh iu</div>
                                </div>
                            </div>
                            <p class="phi-n-b-n-n-y-qu-b-n">Phiên bản này quá đã<br/>Bạn đã đập hộp chưa?</p>
                            <div class="group-wrapper">
                                <div class="x-c-nh-n-wrapper"><div class="x-c-nh-n">ĐẬP HỘP NGAY</div></div>
                            </div>
                        </div>
                    </div>
                </section>
            </body>
        </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(ogHtml);
}
