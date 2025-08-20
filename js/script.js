const sections = document.querySelectorAll('section');
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
        }, 500);
    }else {
        sections[1].classList.add('slide-out');
        setTimeout(() => {
            sections[1].style.display = 'none';
            sections[3].style.display = 'block';
            sections[3].classList.add('fade-in-up');

            const hammer = sections[3].querySelector(".artboard");
            const box = sections[3].querySelector(".rectangle-2");
            const nameDisplay = sections[3].querySelector(".text-wrapper-3");
            nameDisplay.textContent = name;

            setTimeout(() => {
                hammer.classList.add('vector');
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
        document.querySelector('.size-9-16')
    ];
    containers.forEach(container => {
        if (!container) return;
        const nameDiv = container.querySelector('.name-label');
        if (nameDiv) nameDiv.innerText = name;

        const stickerBox = container.querySelector('.sticker-box');
        if (stickerBox) {
            stickerBox.innerHTML = `
                ${stickers[0] ? `<img class="icon" src="${stickers[0]}" alt="sticker">` : ''}
                ${stickers[1] ? `<img class="img" src="${stickers[1]}" alt="sticker">` : ''}
                ${stickers[2] ? `<img class="icon-2" src="${stickers[2]}" alt="sticker">` : ''}
            `;
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
        img.setAttribute("Crossorigin", "anonymous");
    });
});
