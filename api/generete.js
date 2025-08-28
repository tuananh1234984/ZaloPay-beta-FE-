export default function handler(req, res) {
    const { name, size, image } = req.query;

  // Ảnh mặc định fallback
    const defaultImage =
        size === "9-16"
            ? "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-9-16.png"
            : "https://res.cloudinary.com/den7ju8t4/image/upload/v123456789/og-1-1.png";

  // Nếu có truyền image từ client (ảnh chụp dán sticker xong upload Cloudinary)
    const imageUrl = image || defaultImage;

  // Open Graph tags
    const ogHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kết quả ZaloPay</title>
            <link rel="stylesheet" href="./css/style.css" />
        </head>
        <body>
        <section>
            <div class="giao-din-kt-qu-hin">
                <div class="div">
                    <div class="overlap">
                    <img class="vector" src="./assets/img/Vector-2.png" />
                        <div class="group">
                            <div class="name-label text-wrapper">${name || "Bạn"}</div>
                            <div class="text-wrapper-2">Phiên bản mới</div>
                        </div>
                    </div>
                    <p class="phi-n-b-n-n-y-qu-b-n">Phiên bản này quá đã<br/>Bạn đã đập hộp chưa?</p>
                    <div class="stickers">
                        ${ (stickers || "").split(",").map(s => `<img src="${s}" class="sticker" />`).join("") }
                    </div>
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
