const sections = document.querySelectorAll('section');
// --- Tagline randomization (with optional override via ?tag= or ?phrase=) ---
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
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}
const overrideTag = (getQueryParam('tag') || getQueryParam('phrase') || '').trim();
// Freeze-able tagline: allow override via query, else pick once and freeze after step 2
window._taglineInitial = overrideTag || TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
window.chosenTagline = window._taglineInitial;

// ===== Share helpers (ensure Facebook always sees a public OG page) =====
// Use the live production domain (-fe) to avoid Vercel preview or missing deployment URLs
const PROD_BASE = 'https://zalo-pay-beta-fe.vercel.app';

// Force dùng domain production để Facebook không gặp preview/private
function getShareBase() {
  return PROD_BASE;
}

// Chuẩn hoá URL sticker về domain production để tránh link preview per-commit bị hỏng
function normalizeStickerUrl(u) {
    try {
        const url = new URL(u, window.location.href);
        const idx = url.pathname.indexOf('/assets/icons/');
        if (idx >= 0) {
            const rest = url.pathname.substring(idx + '/assets/icons/'.length);
            return `${getShareBase()}/assets/icons/${rest}`;
        }
        return u;
    } catch {
        // Nếu không parse được thì giữ nguyên
        return u;
    }
}

// Dựng URL /api/generate giống nhánh final-web-1 (thêm truyền tagline)
function buildGenerateLink({ name, stickers, img, size, tag }) {
    const base = getShareBase(); // Always use public prod domain to avoid preview auth
    const list = Array.isArray(stickers) ? stickers : (stickers ? [stickers] : []);
    const normalized = list.map(normalizeStickerUrl);
    const stickersParam = normalized.join(',');
    const v = Date.now().toString(36);
    const sizeParam = size ? `&size=${encodeURIComponent(size)}` : '';
    const tagParam = tag ? `&tag=${encodeURIComponent(tag)}` : '';
    return `${base}/api/generate?name=${encodeURIComponent(name || '')}&stickers=${encodeURIComponent(stickersParam)}&img=${encodeURIComponent(img || '')}${sizeParam}${tagParam}&v=${v}`;
}

// Helpers to optionally use Facebook Share Dialog (adds quote/hashtag) or fallback to sharer
function getMeta(name) {
    const el = document.querySelector(`meta[name="${name}"]`);
    return el?.content || '';
}
const FB_APP_ID = (window.APP_CONFIG?.FB_APP_ID) || getMeta('fb:app_id') || '';

function openFacebookShare(url, opts = {}) {
    const { quote = '', hashtag = '' } = opts;
    if (FB_APP_ID) {
        const redirect = `${getShareBase()}`;
        const dialog = new URL('https://www.facebook.com/dialog/share');
        dialog.searchParams.set('app_id', FB_APP_ID);
        dialog.searchParams.set('display', 'popup');
        dialog.searchParams.set('href', url);
        dialog.searchParams.set('redirect_uri', redirect);
        if (quote) dialog.searchParams.set('quote', quote);
        if (hashtag) dialog.searchParams.set('hashtag', hashtag.startsWith('#') ? hashtag : `#${hashtag}`);
        window.open(dialog.toString(), '_blank', 'noopener,noreferrer,width=720,height=640');
    } else {
        const sharer = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(sharer, '_blank', 'noopener,noreferrer,width=720,height=640');
    }
}

// Hàm tiện ích bạn gọi sau khi đã có URL ảnh Cloudinary (secure_url)
window.createAndOpenShareLink = function ({ canvas, cloudinaryUrl, name, size, selectedStickers }) {
  try {
        const link = buildGenerateLink({
            name,
            stickers: selectedStickers || window.selectedStickers || [],
            img: cloudinaryUrl,
            size,
            tag: window.chosenTagline || ''
        });
                openFacebookShare(link, { quote: `${name || 'Bạn'}`, hashtag: 'ZaloPay' });
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(link).catch(()=>{});
        }
    return link;
  } catch (e) {
    console.error('Create share link failed:', e);
  }
};

// (Tuỳ chọn) tự gắn sự kiện cho các nút có data-share="facebook"
document.querySelectorAll('[data-share="facebook"], #shareFacebook, .share-facebook').forEach(btn => {
  btn.addEventListener('click', (ev) => {
    // Bạn cần truyền đúng các giá trị thực tế từ app của bạn:
    // window.lastCanvas, window.lastUploadedUrl, window.currentName, window.currentSize, window.selectedStickers
    if (!window.lastUploadedUrl) return;
        window.createAndOpenShareLink({
      canvas: window.lastCanvas,
      cloudinaryUrl: window.lastUploadedUrl,
      name: window.currentName || '',
            size: window.currentSize || '1-1',
            selectedStickers: window.selectedStickers || []
    });
    ev.preventDefault();
  });
});

function applyTaglineToContainers(tagline) {
    const containers = [
        document.querySelector('.kt-qu-phin-bn-mi'),
        document.querySelector('.size'),
        document.querySelector('.size-9-16'),
        document.querySelector('.mn-hinh-hin-ra-chia-se'),
        document.querySelector('.mn-hinh-hin-ra-chia-se-9-16'),
        document.querySelector('.giao-din-kt-qu-hin'),
    ];
    containers.forEach(container => {
        if (!container) return;
        const tagDiv = container.querySelector('.group .text-wrapper-2');
        if (tagDiv) tagDiv.innerText = tagline;
    });
}
const btnPlay = sections[0].querySelector('.x-c-nh-n-wrapper');
const btnNext = sections[1].querySelector('.x-c-nh-n-wrapper');
const btnLimit = sections[2].querySelector('.x-c-nh-n-wrapper-1');
const inputField = document.querySelector('.input-field');
const nameCount = document.getElementById('nameCount');

let isConfirmMode = false;
btnPlay.onclick = function() {
    sections[0].classList.add('slide-out');
    setTimeout(() => {
        sections[0].style.display = 'none';
        sections[1].style.display = 'block';
        sections[1].classList.add('fade-in-up');
    }, 500);
};

inputField.addEventListener('input', function() {
    const len = inputField.value.length;
    nameCount.textContent = `Tên của bạn (${len}/12)`;
});

// Xử lý chuyển sang bước chọn sticker
btnNext.onclick = function() {
    const name = inputField.value.trim();
    if (!name) {
        alert('Vui lòng nhập tên của bạn!');
        inputField.focus();
        return;
    }
    if (!isConfirmMode) {
        sections[1].classList.add('slide-out');
        setTimeout(() => {
            sections[1].style.display = 'none';
            sections[2].style.display = 'block';
            sections[2].classList.add('fade-in-up');
            // Freeze tagline as soon as chuyển qua chọn sticker
            if (!window.chosenTaglineFrozen) {
                window.chosenTagline = window._taglineInitial;
                window.chosenTaglineFrozen = true;
                applyTaglineToContainers(window.chosenTagline);
            }
        }, 500);
    }else {
        sections[1].classList.add('slide-out');
        setTimeout(() => {
            sections[1].style.display = 'none';
            sections[3].style.display = 'block';
            sections[3].classList.add('fade-in-up');

            const hammer = sections[3].querySelector(".artboard-2");
            const box = sections[3].querySelector(".rectangle-2");
            const nameDisplay = sections[3].querySelector(".text-wrapper-3");
            nameDisplay.textContent = name;

            setTimeout(() => {
                hammer.classList.add('shake-hammer');
                setTimeout(() => {
                    box.classList.add('opened');
                    nameDisplay.classList.add('show');

                    setTimeout(() => {
                        sections[3].classList.add('slide-out');
                        setTimeout(() => {
                            sections[3].style.display = 'none';
                            sections[4].style.display = 'block';
                            sections[4].classList.add('fade-in-up');

                            // Cập nhật tên và sticker đã chọn trong kết quả
                            renderResult(name, selectedStickers);
                        }, 500);
                    }, 2000);
                }, 300);
            }, 500);
        }, 500);
    }
};

//Giới hạn chọn tối đa 3 sticker + thêm dấu tích
/* ------------------ CHỌN STICKER TỐI ĐA 3 + DẤU TÍCH ------------------ */
// Giới hạn chọn tối đa 3 sticker + thêm dấu tích riêng
let selectedStickers = []; // Thêm biến lưu sticker đã chọn
window.selectedStickers = selectedStickers;

(function () {
    const grid = document.querySelector(".group-5");
    const stickers = grid.querySelectorAll("img");
    const counter = document.querySelector(".x-c-nh-n-1");
    const backgroundColor = document.querySelector(".x-c-nh-n-wrapper-1");
    const MAX = 3;
    const selected = new Set();

    const defaultBg = window.getComputedStyle(backgroundColor).backgroundColor;
    const defaultBorder = window.getComputedStyle(backgroundColor).borderColor;

    function addTick(sticker) {
        const id = sticker.dataset.id;
        let tick = sticker.querySelector(`img.tick-icon[data-for="${id}"]`);
        if (!tick) {
            tick = document.createElement("img");
            tick.className = "tick-icon";
            tick.dataset.for = id;

            // Đường dẫn khoảng trắng -> encode
            const file = "Group18.png";
            tick.src = `assets/icons/${encodeURIComponent(file)}`;

            //fallback nếu png bị lỗi
            tick.onerror = () => {tick.src = "assets/icons/Group18.png";};

            
            sticker.parentElement.style.position = "relative";
            sticker.parentElement.appendChild(tick);

            // Tính vị trí tương đối bên trong wrapper
            tick.style.display = "block";
            tick.style.position = "absolute";
            tick.style.left = `${sticker.offsetLeft}px`;
            tick.style.top = `${sticker.offsetTop + sticker.offsetHeight - tick.offsetHeight}px`; // 20 = kích thước tick
        }
        
    }

    function removeTick(sticker) {
        const id = sticker.dataset.id;
        const tick = grid.querySelector(`img.tick-icon[data-for="${id}"]`);
        if(tick) tick.remove();
    }

    stickers.forEach((sticker, i) => {
        sticker.dataset.id = String(i);

        sticker.addEventListener("click", () => {
            const id = sticker.dataset.id;

            if (selected.has(id)) {
                selected.delete(id);
                removeTick(sticker);
            }else{
                if (selected.size >= MAX) return;//
                selected.add(id);
                addTick(sticker);
            }

            //Cập nhật đếm
            counter.textContent = `${selected.size}/3`;
            if (selected.size === MAX) {
                counter.style.color = "#fff";
                backgroundColor.style.backgroundColor = "#00d26a";
                backgroundColor.style.borderColor = "#00d26a";
            } else {
                counter.style.color = "";
                backgroundColor.style.backgroundColor = defaultBg;
                backgroundColor.style.borderColor = defaultBorder;
            }

            // KHóa/bỏ khóa các sticker chưa chọn
            stickers.forEach(s => {
                const shouldDisable = !selected.has(s.dataset.id) && selected.size >= MAX;
                s.classList.toggle("sticker-disabled", shouldDisable);
            });

            // Cập nhật biến selectedStickers mỗi lần chọn
            selectedStickers = Array.from(selected).map(idx => stickers[idx].src);
            window.selectedStickers = selectedStickers;
        });
    });
})();


btnLimit.onclick = function() {
    if (document.querySelectorAll(".tick-icon").length < 3) {
        alert('Vui lòng chọn đủ 3 sticker!');
        return;
    }

    // Cập nhật selectedStickers lần cuối (phòng trường hợp user chọn xong mới bấm)
    const grid = document.querySelector(".group-5");
    const stickers = grid.querySelectorAll("img");
    const selected = Array.from(document.querySelectorAll(".tick-icon")).map(tick => {
        // tick.dataset.for là index
        return stickers[tick.dataset.for].src;
    });
    selectedStickers = selected;
    window.selectedStickers = selectedStickers;

    // Quay lại slide nhập tên
    sections[2].classList.add('slide-out');
    setTimeout(() => {
        sections[2].style.display = 'none';
        sections[1].style.display = 'block';
        sections[1].classList.add('fade-in-up');

        // Đổi nút thành "XÁC NHẬN"
        btnNext.querySelector('.x-c-nh-n').textContent = "XÁC NHẬN";
        isConfirmMode = true;
    }, 500);
};


// --- Xử lý tải ảnh: chỉ chọn size và chia sẻ, không tải về máy ---

// Hàm render tên và sticker đã chọn ra slide kết quả
function renderResult(name, stickers) {
    const containers = [
        document.querySelector('.kt-qu-phin-bn-mi'),
        document.querySelector('.size'),
        document.querySelector('.size-9-16'),
        document.querySelector('.mn-hinh-hin-ra-chia-se'),
        document.querySelector('.mn-hinh-hin-ra-chia-se-9-16'),
        document.querySelector('.giao-din-kt-qu-hin')
    ];
    containers.forEach(container => {
        if (!container) return;
        const nameDiv = container.querySelector('.name-label');
        if (nameDiv) nameDiv.innerText = name;
    // update tagline
    const tagDiv = container.querySelector('.group .text-wrapper-2');
    if (tagDiv && window.chosenTagline) tagDiv.innerText = window.chosenTagline;


        const group = container.querySelector('.group');
        if(!group) return;

        group.querySelectorAll('.icon, .img, .icon-2').forEach(el => el.remove());

        if (stickers[0]){
            group.insertAdjacentHTML('beforeend', `<img class="icon sticker-pop" src="${stickers[0]}" alt="Sticker 1">`);
        }
        if (stickers[1]) {
            group.insertAdjacentHTML('beforeend', `<img class="img sticker-pop" src="${stickers[1]}" alt="Sticker 2">`);
        }
        if (stickers[2]) {
            group.insertAdjacentHTML('beforeend', `<img class="icon-2 sticker-pop" src="${stickers[2]}" alt="Sticker 3">`);
        }
    })
}
//
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('download-btn');
    const sizeModal = document.getElementById('sizeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const chooseSizeBtns = document.querySelector('.choose-size-btns');

    //Chọn kích thước từ menu trong kt-qu-phin-bn-mi
    const sizeBtns = document.querySelectorAll('.choose-size-btns .size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            sections[4].style.display = 'none';
            if (size === "1-1") {
                sections[5].style.display = 'block';
                renderResult(document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText, selectedStickers);
            }else if (size === "9-16") {
                sections[6].style.display = 'block';
                renderResult(document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText, selectedStickers);
            }
        });
    });

    if (downloadBtn && sizeModal) {
        downloadBtn.addEventListener('click', function() {
            sizeModal.style.display = 'flex';
            if (chooseSizeBtns) chooseSizeBtns.style.display = "none";
        });
    }

    if (closeModalBtn && sizeModal) {
        closeModalBtn.addEventListener('click', function() {
            sizeModal.style.display = 'none';
            if (chooseSizeBtns) chooseSizeBtns.style.display = 'flex';
        });
    }
    // Gán tagline ban đầu vào các container hiển thị
    applyTaglineToContainers(window.chosenTagline);
    // Nút chuyển trong section 1:1 và 9:16
    const switchSizeBtns = document.querySelectorAll('.size .size-btn, .size-9-16 .size-btn');
    switchSizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            sections[5].style.display = 'none';
            sections[6].style.display = 'none';
            if (size === "1-1") {
                sections[5].style.display = 'block';
            } else if (size === "9-16") {
                sections[6].style.display = 'block';
            }
            renderResult(document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText, selectedStickers);
        });
    });

    const backBtns = document.querySelectorAll('.size .chvron-left, .size-9-16 .chvron-left');

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sections[5].style.display = 'none';
            sections[6].style.display= 'none';


            sections[4].style.display = 'block';

            renderResult(document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText, selectedStickers);
        })
    })

    function downloadSectionAsImage(section) {
        html2canvas(section, {useCORS: true, allowTaint: true, scale: 2}).then(canvas => {
            const link = document.createElement('a');
            link.download = 'zalopay-result.png'
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    document.querySelectorAll('.size #download-btn-1-1, .size-9-16 #download-btn-9-16').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('.size, .size-9-16');
            if (section) {
                const overlap = section.querySelector('.overlap')
                if (overlap) downloadSectionAsImage(overlap);
            }
        })
    });
    document.querySelectorAll("img").forEach(img => {
        img.setAttribute("crossorigin", "anonymous");
    });

    // Soft reset function and wire to "thử lại" menu items
    function softReset(goTo = 'intro') {
        // hide all
        sections.forEach(sec => sec.style.display = 'none');
        // reset flags
        isConfirmMode = false;
        // reset input
        if (inputField) {
            inputField.value = '';
            if (nameCount) nameCount.textContent = 'Tên của bạn (0/12)';
        }
        // reset stickers
        window.selectedStickers = [];
        selectedStickers = [];
        document.querySelectorAll('.tick-icon').forEach(el => el.remove());
        const counter = document.querySelector('.x-c-nh-n-1');
        if (counter) counter.textContent = '0/3';
        const bg = document.querySelector('.x-c-nh-n-wrapper-1');
        if (bg) { bg.style.backgroundColor = ''; bg.style.borderColor = ''; }
        // re-pick tagline for a fresh start
        window._taglineInitial = overrideTag || TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
        window.chosenTagline = window._taglineInitial;
        window.chosenTaglineFrozen = false;
        applyTaglineToContainers(window.chosenTagline);

        if (goTo === 'intro') {
            sections[0].style.display = 'block';
            sections[0].classList.add('fade-in-up');
        } else if (goTo === 'name') {
            sections[1].style.display = 'block';
            sections[1].classList.add('fade-in-up');
        }
    }

    // Wire retry menu items (2nd item in each menu)
    document.querySelectorAll('.kt-qu-phin-bn-mi .menu .menu-item:nth-child(2), .size .menu .menu-item:nth-child(2), .size-9-16 .menu .menu-item:nth-child(2)')
      .forEach(btn => btn.addEventListener('click', () => softReset('intro')));
});

document.addEventListener("DOMContentLoaded", () => {
  // Lấy đúng 2 <section> kết quả
    const section1 = document.querySelector('section .size')?.closest('section');
    const section9 = document.querySelector('section .size-9-16')?.closest('section');

    if (!section1 || !section9) {
        console.warn('[toggle] Không tìm thấy section kết quả 1:1 hoặc 9:16');
        return;
    }

  // Helper: lấy tên đã render ở màn kết quả chung để sync qua 2 size
    const getName = () =>
        document.querySelector('.kt-qu-phin-bn-mi .name-label')?.innerText || '';

  // Tập hợp TẤT CẢ trigger chuyển sang 1:1
    const to1 = [
    // trong section 1:1 (nếu người dùng đang ở 9:16 nhưng click khu vực 1:1 vẫn xử lý)
        section1.querySelector('.group-7 .rectangle'),
        section1.querySelector('.text-wrapper-4'),
    // trong section 9:16
        section9.querySelector('.group-7 .rectangle'),
        section9.querySelector('.text-wrapper-4'),
    ].filter(Boolean);

  // Tập hợp TẤT CẢ trigger chuyển sang 9:16
    const to916 = [
        // trong section 1:1
        section1.querySelector('.overlap-wrapper .rectangle-2'),
        section1.querySelector('.text-wrapper-5'),
        // trong section 9:16
        section9.querySelector('.overlap-wrapper .rectangle-2'),
        section9.querySelector('.text-wrapper-5'),
    ].filter(Boolean);

    function show1() {
        section1.style.display = 'block';
        section9.style.display = 'none';
        renderResult(getName(), selectedStickers);
    }

    function show916() {
        section1.style.display = 'none';
        section9.style.display = 'block';
        renderResult(getName(), selectedStickers);
    }

  // Gắn listener
    to1.forEach(el => el.addEventListener('click', show1));
    to916.forEach(el => el.addEventListener('click', show916));
});

// --- XỬ LÝ CHIA SẺ ---
document.querySelectorAll('.size .menu-item:nth-child(3), .size-9-16 .menu-item:nth-child(3)')
.forEach(btn => {
    btn.addEventListener('click', () => {
        const currentSection = btn.closest('.size, .size-9-16');
        const isOneOne = currentSection.classList.contains('size');
        const isNineSixteen = currentSection.classList.contains('size-9-16');

        // Ẩn 2 màn kết quả gốc
        sections[5].style.display = 'none';
        sections[6].style.display = 'none';

        if (isOneOne) {
            // hiện màn chia sẻ 1:1 (giả sử nằm ở sections[7])
            sections[7].style.display = 'block';
            sections[7].classList.add('fade-in-up');

            renderResult(
                document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText,
                selectedStickers
            );
        } 
        else if (isNineSixteen) {
            // hiện màn chia sẻ 9:16 (giả sử nằm ở sections[8])
            sections[8].style.display = 'block';
            sections[8].classList.add('fade-in-up');

            renderResult(
                document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText,
                selectedStickers
            );
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const firstSection = sections[0];

    // --- Xử lý khi bấm chia sẻ (ở màn 1:1 hoặc 9:16) ---
    document.querySelectorAll(
        ".size .group-2, .size-9-16 .group-2, .mn-hinh-hin-ra-chia-se .group-2, .mn-hinh-hin-ra-chia-se-9-16 .group-2"
    ).forEach(icon => {
        icon.addEventListener("click", async () => {
            try {
                const currentSection = icon.closest(".size, .size-9-16, .mn-hinh-hin-ra-chia-se, .mn-hinh-hin-ra-chia-se-9-16");
                const captureTarget = currentSection?.querySelector(".overlap") || currentSection.querySelector(".div");

                if (!captureTarget) {
                    alert("không tìm thấy nội dung để chụp ảnh");
                    showErrorSlide();
                    return;
                }

                // Chụp canvas
                const canvas = await html2canvas(captureTarget, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 2,
                    backgroundColor: "#ffffff"
                });

                const dataURL = canvas.toDataURL("image/png");
                if (dataURL === "data:,") throw new Error("canvas trống!");

                // Upload thông qua API server (ẩn Cloudinary API)
                const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataUrl: dataURL, folder: 'zalopay-shares', tags: 'zalopay,share' })
                });
                const data = await res.json();

                if (res.ok && data.secure_url) {
                    const name = document.querySelector('.input-field')?.value || 'Bạn';
                    window.createAndOpenShareLink({
                        canvas,
                        cloudinaryUrl: data.secure_url,
                        name,
                        size: currentSection?.classList.contains('size-9-16') || currentSection?.classList.contains('mn-hinh-hin-ra-chia-se-9-16') ? '9-16' : '1-1',
                        selectedStickers: window.selectedStickers || []
                    });
                } else {
                    console.error("Upload fail: ", data);
                    showErrorSlide();
                }
            } catch (err) {
                console.error("lỗi chia sẻ: ", err);
                showErrorSlide();
            }
        });
    });

    // --- Khi bấm "Đập hộp ngay" quay lại màn đầu ---
    const finalBtn = document.querySelector(".giao-din-kt-qu-hin .x-c-nh-n-wrapper");
    if (finalBtn) {
        finalBtn.addEventListener("click", () => {
            sections.forEach(sec => sec.style.display = "none");
            firstSection.style.display = "block";
            firstSection.classList.add("fade-in-up");
        });
    }
    // (Removed) "ĐẬP HỘP NGAY" in result section per requirement; lives only in generate.js page
});


document.addEventListener("DOMContentLoaded", () => {
    const backBtnsShare = document.querySelectorAll(
        '.mn-hinh-hin-ra-chia-se .chevron-left, .mn-hinh-hin-ra-chia-se-9-16 .chvron-left'
    );

    backBtnsShare.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = btn.closest('section');
            if (!current) return;

            current.style.display = 'none';

            sections[4].style.display = 'block';
            sections[4].classList.add('fade-in-up');

            renderResult(
                document.querySelector('.kt-qu-phin-bn-mi .name-label').innerText,
                selectedStickers
            );
        });
    });
});

//---- HÀM HIỂN THỊ SLIDE LỖI ---//
function showErrorSlide(message) {
    // Ẩn tất cả section đang hiển thị
    document.querySelectorAll("section").forEach(sec => {
        sec.style.display = "none";
    });

    const errorSlide = document.querySelector(".empty")?.closest("section");
    if (errorSlide) {
        errorSlide.style.display = "block";
        errorSlide.classList.add("fade-in-up");

        //Gắn sự kiện cho nút "Thử lại"
        const retryBtn = errorSlide.querySelector(".x-c-nh-wrapper");
        if (retryBtn) {
            retryBtn.onclick = () => {
                // Soft reset flow về bước nhập tên, giữ tagline đã freeze
                document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
                // reset selections
                window.selectedStickers = [];
                selectedStickers = [];
                document.querySelectorAll('.tick-icon').forEach(el => el.remove());
                const counter = document.querySelector('.x-c-nh-n-1');
                if (counter) counter.textContent = '0/3';
                const bg = document.querySelector('.x-c-nh-n-wrapper-1');
                if (bg) {
                    bg.style.backgroundColor = '';
                    bg.style.borderColor = '';
                }
                // giữ tên nhập
                const step2 = sections[1];
                step2.style.display = 'block';
                step2.classList.add('fade-in-up');
            }
        }
    }
}



