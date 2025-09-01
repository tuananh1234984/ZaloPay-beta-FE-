module.exports = function handler(req, res) {
    // Accept params from query string; prefer tagline from client to keep consistency
    const { name = "", size = "1-1", image, img, stickers = "", tagline = "", tag = "" } = req.query;

    // Basic HTML escape to avoid injection in server-rendered page
    const escapeHtml = (v) => String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

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

    // Tagline: use client-provided value if available; otherwise pick from allowed list
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
    const providedTag = (tagline || tag || "").toString().trim();
    const chosenTagRaw = providedTag || TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
    const chosenTag = escapeHtml(chosenTagRaw);

    const safeName = escapeHtml(name || "Bạn");

    // Share-screen fragments for 1:1 and 9:16 (match index.html structure)
    const shareOneOne = `
        <div class="mn-hinh-hin-ra-chia-se">
            <div class="div">
                <div class="overlap">
                    <img class="vector" src="/assets/img/Vector-2.png" />
                    <div class="group">
                        <div class="name-label text-wrapper">${safeName}</div>
                        <div class="text-wrapper-2">${chosenTag}</div>
                        ${toRender[0] ? `<img class="icon" src="${toRender[0]}" alt="Sticker 1" />` : ""}
                        ${toRender[1] ? `<img class="img" src="${toRender[1]}" alt="Sticker 2" />` : ""}
                        ${toRender[2] ? `<img class=\"icon-2\" src=\"${toRender[2]}\" alt=\"Sticker 3\" />` : ""}
                    </div>
                </div>
                <div class="chia-s-ngay-phi-n-b-wrapper">
                    <p class="chia-s-ngay-phi-n-b">Chia sẻ ngay<br/>phiên bản mới hook hồn của bạn</p>
                </div>
                <img class="group-2" src="/assets/icons/Group-23.png" />
                <div class="div-wrapper"><p class="p">Làm quen với ZaloPay mới nha</p></div>
            </div>
        </div>`;

    const shareNineSixteen = `
        <div class="mn-hinh-hin-ra-chia-se-9-16">
            <div class="div">
                <div class="overlap">
                    <div class="group-wrapper">
                        <img class="vector" src="/assets/img/Vector-2.png" />
                        <div class="group">
                            <div class="name-label text-wrapper">${safeName}</div>
                            <div class="text-wrapper-2">${chosenTag}</div>
                            ${toRender[0] ? `<img class="icon" src="${toRender[0]}" alt="Sticker 1" />` : ""}
                            ${toRender[1] ? `<img class="img" src="${toRender[1]}" alt="Sticker 2" />` : ""}
                            ${toRender[2] ? `<img class=\"icon-2\" src=\"${toRender[2]}\" alt=\"Sticker 3\" />` : ""}
                        </div>
                    </div>
                </div>
                <div class="chia-s-ngay-phi-n-b-wrapper">
                    <p class="chia-s-ngay-phi-n-b">Chia sẻ ngay<br/>phiên bản mới hook hồn của bạn</p>
                </div>
                <img class="group-2" src="/assets/icons/Group-23.png" />
                <div class="div-wrapper"><p class="p">Làm quen với ZaloPay mới nha</p></div>
            </div>
        </div>`;

    const shareBody = size === "9-16" ? shareNineSixteen : shareOneOne;

    // Build a canonical URL for og:url (helps Facebook cache/refresh correctly)
    const canonicalUrl = (() => {
        try {
            const proto = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers['x-forwarded-host'] || req.headers.host || 'zalo-pay-beta.vercel.app';
            return `${proto}://${host}${req.url}`;
        } catch {
            return 'https://zalo-pay-beta.vercel.app/api/generate';
        }
    })();

    const ogHtml = `
        <!DOCTYPE html>
        <html lang="vi">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Kết quả ZaloPay</title>
                <meta property="og:type" content="website" />
                <meta property="og:title" content="${safeName} - Phiên bản mới ZaloPay" />
                <meta property="og:description" content="Phiên bản này quá đã. Bạn đã đập hộp chưa?" />
                <meta property="og:image" content="${imageUrl}" />
                <meta property="og:image:secure_url" content="${imageUrl}" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content="${canonicalUrl}" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:image" content="${imageUrl}" />
                <link rel="preload" as="image" href="/assets/img/Vector-2.png" />
                <!-- Load site styles from /public/css so classes render correctly under /api/* -->
                <link rel="stylesheet" href="/css/styleguile.css" />
                <link rel="stylesheet" href="/css/style.css" />
                <link rel="stylesheet" href="/css/global.css" />
                <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
                <meta http-equiv="Pragma" content="no-cache" />
                <meta http-equiv="Expires" content="0" />
            </head>
            <body>
                <section>
                    ${shareBody}
                </section>
            </body>
        </html>`;

    res.setHeader("Content-Type", "text/html");
    // Prevent intermediate caches from serving stale OG content when sharing variations
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).send(ogHtml);
}
