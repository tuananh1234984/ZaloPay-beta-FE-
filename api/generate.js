module.exports = function handler(req, res) {
    // Accept params from query string (no external override for tagline)
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

    // Random tagline (no override; must come from allowed result phrases)
    const TAGLINES = [
        "ngoan xinh iu",
        "cháy năng lượng",
        "lấp lánh tự tin",
        "tinh tế chuẩn gu",
        "ấm áp đáng yêu",
        "ngầu nhẹ nhàng",
        "bứt phá dữ dội",
        "đa nhiệm đỉnh cao",
        "bình tĩnh điềm nhiên",
        "rực rỡ bản lĩnh",
    ];
    const chosenTag = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

    // Templates for 1:1 and 9:16 bodies (only UI card; no uploaded image in body)
    const bodyOneOne = `
        <section>
            <div class="size">
                <div class="div">
                    <div class="overlap">
                        <img class="vector" src="/assets/img/Vector-2.png" />
                        <div class="group">
                            <div class="name-label text-wrapper">${name || "Bạn"}</div>
                            <div class="text-wrapper-2">${chosenTag}</div>
                            ${toRender[0] ? `<img class="icon" src="${toRender[0]}" alt="Sticker 1" />` : ""}
                            ${toRender[1] ? `<img class="img" src="${toRender[1]}" alt="Sticker 2" />` : ""}
                            ${toRender[2] ? `<img class=\"icon-2\" src=\"${toRender[2]}\" alt=\"Sticker 3\" />` : ""}
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

    const bodyNineSixteen = `
        <section>
            <div class="size-9-16">
                <div class="div">
                    <div class="overlap">
                        <div class="group-wrapper">
                            <img class="vector" src="/assets/img/Vector-2.png" />
                            <div class="group">
                                <div class="name-label text-wrapper">${name || "Bạn"}</div>
                                <div class="text-wrapper-2">${chosenTag}</div>
                                ${toRender[0] ? `<img class="icon" src="${toRender[0]}" alt="Sticker 1" />` : ""}
                                ${toRender[1] ? `<img class="img" src="${toRender[1]}" alt="Sticker 2" />` : ""}
                                ${toRender[2] ? `<img class=\"icon-2\" src=\"${toRender[2]}\" alt=\"Sticker 3\" />` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

    const pageBody = size === "9-16" ? bodyNineSixteen : bodyOneOne;

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
                ${pageBody}
                <div style="display:flex;justify-content:center;margin-top:16px;">
                    <div class="x-c-nh-n-wrapper" role="button" tabindex="0" onclick="window.location.href='/'" onkeydown="if(event.key==='Enter'||event.key===' '){window.location.href='/' }">
                        <div class="x-c-nh-n">ĐẬP HỘP NGAY</div>
                    </div>
                </div>
            </body>
        </html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(ogHtml);
}
