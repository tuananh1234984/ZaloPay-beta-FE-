module.exports = function handler(req, res) {
    // Accept params from query string (match final-web-1 behavior)
    const { name = "", size = "1-1", image, img, stickers = "" } = req.query;

    // Default OG image
    const defaultImage =
        size === "9-16"
            ? "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-9-16.png"
            : "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-1-1.png";

    // Image used by Facebook/Twitter preview
    const imageUrl = image || img || defaultImage;

    // Stickers list (optional), fallback to local icons for body mock
    const stickerList = String(stickers)
        .split(",")
        .filter(Boolean);
    const fallbackStickers = [
        "/assets/icons/icon-5-2.png",
        "/assets/icons/icon-1-2.png",
        "/assets/icons/icon-3-3.png",
    ];
    const toRender = stickerList.length ? stickerList.slice(0, 3) : fallbackStickers;

    // Minimal HTML like final-web-1 (OG meta carries the image)
    // Canonical URL must always point to public prod domain to avoid preview auth
    // Force canonical to the live production domain (-fe variant)
    const PROD_BASE = 'https://zalo-pay-beta-fe.vercel.app';
    const canonicalUrl = (() => {
        try {
            const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
            return `${PROD_BASE}/api/generate${query}`;
        } catch {
            return `${PROD_BASE}/api/generate`;
        }
    })();

    const isNineSixteen = String(size) === '9-16';
    const sizeClass = isNineSixteen ? 'size-9-16' : 'size';
    const sizeStyle = isNineSixteen
        ? '<link rel="stylesheet" href="/css/style.css" />'
        : '<link rel="stylesheet" href="/css/style.css" />';

    const layout = (req.query.layout === 'clean') ? 'layout-clean' : 'layout-card';
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
                <meta property="og:image:secure_url" content="${imageUrl}" />
                <meta property="og:image:width" content="${isNineSixteen ? '1080' : '1200'}" />
                <meta property="og:image:height" content="${isNineSixteen ? '1920' : '1200'}" />
                <meta property="og:url" content="${canonicalUrl}" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:image" content="${imageUrl}" />
                <link rel="preload" as="image" href="/assets/img/Vector-2.png" />
                <link rel="stylesheet" href="/css/styleguile.css" />
                ${sizeStyle}
                <link rel="stylesheet" href="/css/global.css" />
            </head>
            <body class="page-generate ${layout}">
                <section>
                    <div class="giao-din-kt-qu-hin ${sizeClass}">
                        <div class="div">
                            ${isNineSixteen
                                ? `
                                <div class="overlap">
                                    <div class="group-wrapper">
                                        <img class="vector" src="/assets/img/Vector-2.png" />
                                        <div class="group">
                                            <div class="name-label text-wrapper">${name || 'Bạn'}</div>
                                            <div class="text-wrapper-2">ngoan xinh iu</div>
                                            ${toRender[0] ? `<img class="icon" src="${toRender[0]}" alt="Sticker 1" />` : ''}
                                            ${toRender[1] ? `<img class="img" src="${toRender[1]}" alt="Sticker 2" />` : ''}
                                            ${toRender[2] ? `<img class="icon-2" src="${toRender[2]}" alt="Sticker 3" />` : ''}
                                        </div>
                                    </div>
                                </div>
                                `
                                : `
                                <div class="overlap">
                                    <img class="vector" src="/assets/img/Vector-2.png" />
                                    <div class="group">
                                        <div class="name-label text-wrapper">${name || 'Bạn'}</div>
                                        <div class="text-wrapper-2">ngoan xinh iu</div>
                                        ${toRender[0] ? `<img class="icon" src="${toRender[0]}" alt="Sticker 1" />` : ''}
                                        ${toRender[1] ? `<img class="img" src="${toRender[1]}" alt="Sticker 2" />` : ''}
                                        ${toRender[2] ? `<img class="icon-2" src="${toRender[2]}" alt="Sticker 3" />` : ''}
                                    </div>
                                </div>
                                `
                            }
                            <p class="phi-n-b-n-n-y-qu-b-n">Phiên bản này quá đã<br/>Bạn đã đập hộp chưa?</p>
                            <div class="group-wrapper">
                                <a href="/" class="x-c-nh-n-wrapper" style="text-decoration: none;">
                                    <div class="x-c-nh-n">ĐẬP HỘP NGAY</div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </body>
        </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).send(ogHtml);
}
