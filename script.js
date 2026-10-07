// ============================================
// SEARCH ELEMENTS
// ============================================

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

let selectedIndex = -1;


// ============================================
// GET BOOKS DATA FROM HTML AUTOMATICALLY
// ============================================

function getBooksData() {

    const cards = document.querySelectorAll(".card");

    let books = [];

    cards.forEach(function (card) {

        const category = card.querySelector(".cardName p");
        const title = card.querySelector(".cardName h3");

        if (!category || !title) {
            return;
        }

        const categoryText = category.textContent
            .replace(/\s+/g, " ")
            .trim();

        const titleText = title.textContent
            .replace(/\s+/g, " ")
            .trim();

        books.push({

            card: card,

            category: categoryText,

            title: titleText,

            fullText:
                (categoryText + " " + titleText)
                    .toLowerCase()

        });

    });

    return books;
}


// ============================================
// SHOW SUGGESTIONS WHILE TYPING
// ============================================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const value = searchInput.value
            .trim()
            .toLowerCase();

        if (suggestions) {
            suggestions.innerHTML = "";
        }

        selectedIndex = -1;

        if (value === "") {

            if (suggestions) {
                suggestions.style.display = "none";
            }

            const cards = document.querySelectorAll(".card");

            cards.forEach(function (card) {
                card.style.display = "";
            });

            return;
        }

        const books = getBooksData();

        const results = books.filter(function (book) {

            return book.fullText.includes(value);

        });

        if (results.length === 0) {

            if (suggestions) {
                suggestions.style.display = "none";
            }

            return;
        }

        results.forEach(function (book) {

            const item = document.createElement("div");

            item.classList.add("suggestion");

            item.innerHTML = `

                <span class="suggestionCategory">
                    ${book.category}
                </span>

                <span class="suggestionTitle">
                    ${book.title}
                </span>

            `;

            item.addEventListener("click", function () {

                searchInput.value =
                    book.category + " " + book.title;

                if (suggestions) {
                    suggestions.style.display = "none";
                }

                selectedIndex = -1;

                searchBooks();

            });

            if (suggestions) {
                suggestions.appendChild(item);
            }

        });

        if (suggestions) {
            suggestions.style.display = "block";
        }

    });

}


// ============================================
// KEYBOARD NAVIGATION
// ============================================

if (searchInput) {

    searchInput.addEventListener("keydown", function (event) {

        const items =
            suggestions
                ? suggestions.querySelectorAll(".suggestion")
                : [];

        if (event.key === "ArrowDown") {

            event.preventDefault();

            if (items.length === 0) {
                return;
            }

            selectedIndex++;

            if (selectedIndex >= items.length) {
                selectedIndex = 0;
            }

            updateSelection(items);

        }

        else if (event.key === "ArrowUp") {

            event.preventDefault();

            if (items.length === 0) {
                return;
            }

            selectedIndex--;

            if (selectedIndex < 0) {
                selectedIndex = items.length - 1;
            }

            updateSelection(items);

        }

        else if (event.key === "Enter") {

            event.preventDefault();

            if (
                selectedIndex >= 0 &&
                selectedIndex < items.length
            ) {

                items[selectedIndex].click();

            } else {

                searchBooks();

            }

        }

        else if (event.key === "Escape") {

            if (suggestions) {
                suggestions.style.display = "none";
            }

            selectedIndex = -1;

        }

    });

}


// ============================================
// UPDATE SELECTED SUGGESTION
// ============================================

function updateSelection(items) {

    items.forEach(function (item, index) {

        item.classList.remove("selected");

        if (index === selectedIndex) {

            item.classList.add("selected");

            item.scrollIntoView({
                block: "nearest"
            });

        }

    });

}


// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
    "https://ddqjdcurwlffsmrkcylo.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_OuHtmXoZZGqj46tD1Top6A_hmnz5f1o";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

let allBooks = [];


// ============================================
// LOAD BOOKS
// ============================================

async function loadBooks() {

    const container =
        document.getElementById("booksContainer");

    if (!container) return;

    const { data, error } =
        await supabaseClient
            .from("books")
            .select("*")
            .eq("active", true)
            .order("id", { ascending: true });

    if (error) {

        console.error(error);

        container.innerHTML = `
            <div style="width:100%;text-align:center;padding:40px;">
                حدث خطأ أثناء تحميل الكتب
            </div>
        `;

        return;
    }

    allBooks = data || [];

    renderBooks(allBooks);

}


// ============================================
// DISPLAY BOOKS
// ============================================

function renderBooks(books) {

    const container =
        document.getElementById("booksContainer");

    if (!container) return;

    if (!books.length) {

        container.innerHTML = `
            <div style="width:100%;text-align:center;padding:40px;">
                لا توجد كتب متاحة حاليًا
            </div>
        `;

        return;
    }

    container.innerHTML = books.map(book => {

        const available =
            Number(book.available_quantity || 0);

        return `
            <div
                class="card"
                onclick="openBook(${book.id})"
                style="cursor:pointer;"
            >

                <img
                    src="${book.image_url || "images1.jpg"}"
                    alt="${book.name}"
                    onerror="this.src='images1.jpg'"
                >

                <div class="cardInfo">

                    <div class="cardName">

                        <p>${book.name}</p>

                        <h3>
                            ${book.teacher || ""}
                        </h3>

                        <small style="
                            display:block;
                            margin-top:6px;
                            color:${available > 0 ? "#168044" : "#c62828"};
                        ">

                            ${
                                available > 0
                                ? `متاح ${available} نسخة`
                                : "الحجز مكتمل"
                            }

                        </small>

                    </div>

                    <a
                        href="#"
                        class="icon"
                        onclick="
                            event.stopPropagation();
                            openBook(${book.id});
                            return false;
                        "
                    >

                        <img
                            src="images/online-shopping.png"
                            alt=""
                        >

                    </a>

                </div>

            </div>
        `;

    }).join("");

}


// ============================================
// OPEN BOOK
// ============================================

function openBook(id) {

    const book =
        allBooks.find(b => b.id === id);

    if (!book) return;

    if (Number(book.available_quantity || 0) <= 0) {

        alert("عذرًا، الحجز اكتمل لهذا الكتاب.");

        return;
    }

    window.open(
        "booking.html?book_id=" +
        encodeURIComponent(book.id),
        "_blank"
    );

}


// ============================================
// SEARCH BOOKS
// ============================================

function searchBooks() {

    const searchInputElement =
        document.getElementById("searchInput");

    if (!searchInputElement) return;

    const value =
        searchInputElement.value
            .trim()
            .toLowerCase();

    if (!value) {

        renderBooks(allBooks);

        if (suggestions) {
            suggestions.style.display = "none";
        }

        return;
    }

    const words =
        value.split(/\s+/);

    const results =
        allBooks.filter(book => {

            const text =
                `${book.book_code || ""}
                 ${book.name || ""}
                 ${book.teacher || ""}`
                    .toLowerCase();

            return words.every(word =>
                text.includes(word)
            );

        });

    renderBooks(results);

    if (suggestions) {
        suggestions.style.display = "none";
    }

}


// ============================================
// SEARCH BUTTON
// ============================================

const searchButton =
    document.querySelector(".searchBtn");

if (searchButton) {

    searchButton.addEventListener(
        "click",
        function () {
            searchBooks();
        }
    );

}


// ============================================
// SEARCH INPUT
// ============================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {
            searchBooks();
        }
    );

}


// ==========================================
// LOGIN / ACCOUNT BUTTON
// ==========================================

async function setupLoginButton() {

    const loginButton =
        document.getElementById("loginButton");

    if (!loginButton) return;

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    // NOT LOGGED IN

    if (error || !user) {

        loginButton.textContent =
            "سجل دخولك";

        loginButton.onclick = function () {

            window.location.href =
                "login.html";

        };

        return;
    }


    // LOGGED IN

    loginButton.textContent =
        "👤 حسابي";

    loginButton.onclick = function () {

        window.location.href =
            "my-account.html";

    };

}


// ==========================================
// DARK / LIGHT MODE
// ==========================================

function setupThemeToggle() {

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");

    if (!themeToggle) return;


    // منع الهاتف من التحكم في وضع الموقع

    document.documentElement.style.colorScheme =
        "light";


    // قراءة الوضع المحفوظ

    const savedTheme =
        localStorage.getItem("zatune-theme");


    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        document.documentElement.classList.add(
            "dark-mode"
        );

        document.documentElement.style.colorScheme =
            "dark";

        if (themeIcon) {
            themeIcon.textContent = "🌙";
        }

    } else {

        document.body.classList.remove("dark-mode");

        document.documentElement.classList.remove(
            "dark-mode"
        );

        document.documentElement.style.colorScheme =
            "light";

        if (themeIcon) {
            themeIcon.textContent = "☀️";
        }

    }


    // تغيير الوضع عند الضغط

    themeToggle.addEventListener(
        "click",
        function () {

            const isDark =
                document.body.classList.toggle(
                    "dark-mode"
                );

            document.documentElement.classList.toggle(
                "dark-mode",
                isDark
            );


            if (isDark) {

                localStorage.setItem(
                    "zatune-theme",
                    "dark"
                );

                document.documentElement.style.colorScheme =
                    "dark";

                if (themeIcon) {
                    themeIcon.textContent = "🌙";
                }

            } else {

                localStorage.setItem(
                    "zatune-theme",
                    "light"
                );

                document.documentElement.style.colorScheme =
                    "light";

                if (themeIcon) {
                    themeIcon.textContent = "☀️";
                }

            }

        }
    );

}


// ==========================================
// INTERNAL NOTIFICATIONS ONLY
// ==========================================
// الإشعارات داخل الموقع فقط
// لا Chrome Push
// لا Web Push
// لا Notifications خارج الموقع

let notificationItems = [];
let currentNotificationIndex = 0;
let notificationChannel = null;
let notificationUserId = null;


// ==========================================
// UPDATE NOTIFICATION COUNT
// ==========================================

function updateNotificationCount() {

    const countEl =
        document.getElementById("notificationCount");

    if (!countEl) return;

    const count =
        notificationItems.filter(
            notification => !notification.is_read
        ).length;

    countEl.textContent =
        count > 99 ? "99+" : String(count);

    countEl.style.display =
        count > 0 ? "flex" : "none";
}


// ==========================================
// SHOW POPUP
// ==========================================

function showNotificationPopup(notification) {

    if (!notification) return;

    const popup =
        document.getElementById("notificationPopup");

    const title =
        document.getElementById("notificationTitle");

    const message =
        document.getElementById("notificationMessage");

    if (!popup || !title || !message) {
        return;
    }

    title.textContent =
        notification.title || "إشعار جديد";

    message.textContent =
        notification.message || "";

    popup.style.display = "flex";
}


// ==========================================
// GET CURRENT USER
// ==========================================

async function getNotificationUser() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
        return null;
    }

    notificationUserId =
        session.user.id;

    return session.user;
}


// ==========================================
// LOAD ALL NOTIFICATIONS
// ==========================================

async function loadAllNotifications() {

    const user =
        await getNotificationUser();

    if (!user) {

        notificationItems = [];

        updateNotificationCount();

        return [];

    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("notifications")
            .select(
                "id,user_id,title,message,is_read,created_at"
            )
            .eq(
                "user_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(100);

    if (error) {

        console.error(
            "Notifications error:",
            error
        );

        return [];

    }

    notificationItems =
        data || [];

    updateNotificationCount();

    return notificationItems;
}


// ==========================================
// SHOW FIRST UNREAD NOTIFICATION
// WHEN SITE OPENS
// ==========================================

async function showFirstUnreadNotification() {

    const notifications =
        await loadAllNotifications();

    const unread =
        notifications.filter(
            notification =>
                !notification.is_read
        );

    if (!unread.length) {
        return;
    }

    currentNotificationIndex = 0;

    showNotificationPopup(
        unread[0]
    );
}


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

async function markNotificationAsRead(
    notificationId
) {

    if (!notificationId) return;

    const {
        error
    } =
        await supabaseClient
            .from("notifications")
            .update({
                is_read: true
            })
            .eq(
                "id",
                notificationId
            )
            .eq(
                "user_id",
                notificationUserId
            );

    if (error) {

        console.error(
            "Mark notification read error:",
            error
        );

        return;

    }

    const notification =
        notificationItems.find(
            item =>
                item.id === notificationId
        );

    if (notification) {
        notification.is_read = true;
    }

    updateNotificationCount();
}


// ==========================================
// CLOSE CURRENT POPUP
// ==========================================

async function closeNotification() {

    const title =
        document.getElementById(
            "notificationTitle"
        );

    const notification =
        notificationItems.find(
            item =>
                item.title ===
                title?.textContent
        );

    if (notification) {

        await markNotificationAsRead(
            notification.id
        );

    }

    const popup =
        document.getElementById(
            "notificationPopup"
        );

    if (popup) {
        popup.style.display = "none";
    }


    // نجيب إشعار تاني غير مقروء

    const unread =
        notificationItems.filter(
            item =>
                !item.is_read
        );

    if (unread.length > 0) {

        setTimeout(
            function () {

                showNotificationPopup(
                    unread[0]
                );

            },
            300
        );

    }

}


// ==========================================
// SHOW NOTIFICATIONS LIST
// WHEN CLICKING THE BELL
// ==========================================

async function showNotificationsList() {

    const user =
        await getNotificationUser();

    if (!user) {

        alert(
            "من فضلك سجل دخولك أولاً لرؤية الإشعارات."
        );

        return;
    }


    const notifications =
        await loadAllNotifications();


    // ==========================================
    // NO NOTIFICATIONS
    // ==========================================

    if (!notifications.length) {

        alert(
            "لا توجد إشعارات حاليًا."
        );

        return;
    }


    // ==========================================
    // CREATE LIST
    // ==========================================

    let html = `

        <div
            id="notificationsListPopup"
            style="
                position:fixed;
                inset:0;
                background:rgba(0,0,0,.55);
                z-index:999999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:20px;
            "
        >

            <div
                style="
                    background:#fff;
                    width:min(500px,100%);
                    max-height:80vh;
                    overflow:auto;
                    border-radius:20px;
                    padding:20px;
                    direction:rtl;
                    text-align:right;
                    box-shadow:0 20px 60px rgba(0,0,0,.25);
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:20px;
                    "
                >

                    <h2 style="margin:0;">
                        🔔 الإشعارات
                    </h2>

                    <button
                        id="closeNotificationsList"
                        type="button"
                        style="
                            border:0;
                            background:none;
                            font-size:28px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>

    `;


    notifications.forEach(
        function (notification) {

            const date =
                new Date(
                    notification.created_at
                ).toLocaleString(
                    "ar-EG"
                );


            html += `

                <div
                    class="siteNotificationItem"
                    data-id="${notification.id}"
                    style="
                        padding:15px;
                        margin-bottom:12px;
                        border-radius:15px;

                        background:${
                            notification.is_read
                            ? "#f5f5f5"
                            : "#e8f2ff"
                        };

                        border-right:
                            4px solid #0171F9;

                        cursor:pointer;
                    "
                >

                    <div
                        style="
                            font-weight:700;
                            margin-bottom:8px;
                            color:#222;
                        "
                    >
                        ${escapeNotificationHTML(
                            notification.title ||
                            "إشعار جديد"
                        )}
                    </div>

                    <div
                        style="
                            line-height:1.8;
                            color:#555;
                        "
                    >
                        ${escapeNotificationHTML(
                            notification.message ||
                            ""
                        )}
                    </div>

                    <small
                        style="
                            display:block;
                            margin-top:8px;
                            color:#888;
                        "
                    >
                        ${date}
                    </small>

                </div>

            `;

        }
    );


    html += `

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    // ==========================================
    // CLOSE LIST
    // ==========================================

    const closeButton =
        document.getElementById(
            "closeNotificationsList"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                const popup =
                    document.getElementById(
                        "notificationsListPopup"
                    );

                if (popup) {
                    popup.remove();
                }

            }
        );

    }


    // ==========================================
    // CLICK NOTIFICATION
    // ==========================================

    document
        .querySelectorAll(
            ".siteNotificationItem"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    async function () {

                        const id =
                            Number(
                                item.dataset.id
                            );

                        await markNotificationAsRead(
                            id
                        );

                        item.style.background =
                            "#f5f5f5";

                    }
                );

            }
        );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeNotificationHTML(
    value
) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// SETUP BELL
// ==========================================

function setupInternalNotificationButton() {

    // ده الجرس الموجود أصلًا في index.html
    const bell =
        document.getElementById(
            "notificationBell"
        );

    if (!bell) {

        console.error(
            "notificationBell not found"
        );

        return;
    }


    // عند الضغط على الجرس
    bell.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            await showNotificationsList();

        }
    );


    // زر OK داخل الـPopup
    const okButton =
        document.getElementById(
            "notificationOk"
        );

    if (okButton) {

        okButton.addEventListener(
            "click",
            closeNotification
        );

    }


    // زر X داخل الـPopup
    const closeButton =
        document.getElementById(
            "closeNotification"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeNotification
        );

    }

}


// ==========================================
// REALTIME
// ==========================================

async function setupInternalNotificationRealtime() {

    try {

        const user =
            await getNotificationUser();

        if (!user) return;


        if (notificationChannel) {

            await supabaseClient
                .removeChannel(
                    notificationChannel
                );

        }


        notificationChannel =
            supabaseClient
                .channel(
                    "zatune-notifications-" +
                    user.id
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter:
                            `user_id=eq.${user.id}`
                    },
                    function (payload) {

                        const notification =
                            payload.new;

                        if (!notification) {
                            return;
                        }


                        // نضيف الإشعار
                        notificationItems.unshift(
                            notification
                        );


                        updateNotificationCount();


                        // يظهر فورًا داخل الموقع
                        if (
                            !notification.is_read
                        ) {

                            showNotificationPopup(
                                notification
                            );

                        }

                    }
                )
                .subscribe(
                    function (status) {

                        console.log(
                            "Notification realtime:",
                            status
                        );

                    }
                );

    } catch (error) {

        console.error(
            "Realtime notification error:",
            error
        );

    }

}


// ==========================================
// INITIALIZE NOTIFICATIONS
// ==========================================

async function setupInternalNotifications() {

    // الجرس الموجود بالفعل
    setupInternalNotificationButton();


    // تحميل الإشعارات
    await loadAllNotifications();


    // أول ما يفتح الموقع
    await showFirstUnreadNotification();


    // Realtime
    await setupInternalNotificationRealtime();


    // احتياطي كل 10 ثواني
    setInterval(
        async function () {

            const beforeCount =
                notificationItems.length;


            await loadAllNotifications();


            const unread =
                notificationItems.filter(
                    notification =>
                        !notification.is_read
                );


            // لو ظهر إشعار جديد
            if (
                unread.length > 0 &&
                unread.length > beforeCount
            ) {

                showNotificationPopup(
                    unread[0]
                );

            }

        },
        10000
    );

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupLoginButton();

        setupThemeToggle();

        setupInternalNotifications();

        loadBooks();

    }
);