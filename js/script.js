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

                            // Cập nhật tên hiển thị trong kết quả
                            sections[4].querySelector('.text-wrapper').textContent = name;
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
        });
    });
})();


btnLimit.onclick = function() {
    if (document.querySelectorAll(".tick-icon").length < 3) {
        alert('Vui lòng chọn đủ 3 sticker!');
        return;
    }

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


function buildHeader(title) {
    return `
    <div class="header">
        <button class="btn-close">←</button>
        <span class="header-title">${title}</span>
    </div>
    `;
}

function showNoticeModal(callback) {
    const modal = document.createElement("div");
    modal.className = "popup-size";
    modal.innerHTML = `
        <div class="popup-box">
            ${buildHeader("ZaloPay")}
            <div class="popup-box">
                <p>Chọn kích thước ảnh để đăng avatar/story và tải ảnh ngay</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".btn-close").onclick = () => {
        modal.remove();
        callback();
    };
}

function showSizePopup(callback) {
    const popup = document.createElement("div");
    popup.className = "popup-size";
    popup.innerHTML = `
        <div class="popup-box>
            ${buildHeader("ZaloPay")}
            <div class="popup-body">
                <div class="popup-buttons">
                    <button class="btn-size" data-ratio="1">1:1</button>
                    <button class="btn-size" data-ratio="916">9:16</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    popup.querySelectorAll(".btn-size").forEach(btn => {
        btn.onclick = () => {
            const ratio = btn.dataset.ratio;
            popup.remove();
            callback(ratio);
        };
    });

    popup.querySelector(".btn-close").onclick = () => {
        popup.remove();
    };
}

(function () {
    const resultsection = section[4];
    const menuItems = resultsection.querySelectorAll(".menu-item");

    const btnDownLoad = menuItems[0];
    //const btnRetry = menuItems[1];
    //const btnshare = menuItems[2];

    btnDownLoad.addEventListener("click", () =>  {
        showNoticalModal(() => {
            showSizePopup((ratio) => {
                const resultDiv = resultsection.queryselectior(".div");
                html2canvas(resultDiv, {scale: 2}).then((canvas) => {
                    const link = document.createElement("a");
                    link.download = ratio === "1" ? "avatar.png" : "story.png";
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                });
            });
        });
    });
});