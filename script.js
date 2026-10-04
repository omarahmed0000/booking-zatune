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

searchInput.addEventListener("input", function () {

    const value = searchInput.value
        .trim()
        .toLowerCase();

    suggestions.innerHTML = "";

    selectedIndex = -1;

    if (value === "") {

        suggestions.style.display = "none";

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

        suggestions.style.display = "none";

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

            suggestions.style.display = "none";

            selectedIndex = -1;

            showOnlyBook(book.card);

        });

        suggestions.appendChild(item);

    });

    suggestions.style.display = "block";

});


// ============================================
// KEYBOARD NAVIGATION
// ============================================

searchInput.addEventListener("keydown", function (event) {

    const items =
        suggestions.querySelectorAll(".suggestion");

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

        suggestions.style.display = "none";

        selectedIndex = -1;

    }

});


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
// SHOW ONLY SELECTED BOOK
// ============================================

function showOnlyBook(selectedCard) {

    const cards = document.querySelectorAll(".card");

    cards.forEach(function (card) {

        if (card === selectedCard) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


// ============================================
// NORMAL SEARCH
// ============================================

function searchBooks() {

    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const cards = document.querySelectorAll(".card");

    if (searchText === "") {

        cards.forEach(function (card) {

            card.style.display = "";

        });

        suggestions.style.display = "none";

        selectedIndex = -1;

        return;
    }

    const words = searchText
        .split(/\s+/)
        .filter(function (word) {

            return word !== "";

        });

    cards.forEach(function (card) {

        const cardText = card.innerText
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

        const found = words.every(function (word) {

            return cardText.includes(word);

        });

        if (found) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

    suggestions.style.display = "none";

    selectedIndex = -1;

}


// ============================================
// SEARCH BUTTON
// ============================================

const searchButton =
    document.querySelector(".searchBtn");

if (searchButton) {

    searchButton.addEventListener("click", function () {

        searchBooks();

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
// SUPABASE SEARCH
// ============================================

function searchBooks() {

    const value =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();

    if (!value) {

        renderBooks(allBooks);

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

}


document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        searchBooks
    );


loadBooks();


// ==========================================
// LOGIN BUTTON
// ==========================================

async function setupLoginButton() {

    const loginButton =
        document.querySelector(".headerLinks .btn");

    if (!loginButton) return;


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (error || !user) {

        loginButton.textContent = "سجل دخولك";

        loginButton.onclick = function () {

            window.location.href = "login.html";

        };

        return;
    }


    // ==========================================
    // LOGGED IN
    // ==========================================

    const { data: profile } =
        await supabaseClient
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();


    // ==========================================
    // GET STUDENT NAME
    // ==========================================

    const userName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "حسابي";


    // ==========================================
    // SHOW STUDENT NAME
    // ==========================================

    loginButton.textContent = userName;


    // ==========================================
    // LOGOUT WHEN CLICKING NAME
    // ==========================================

    loginButton.onclick = async function () {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {

            console.error(error);

            alert("حدث خطأ أثناء تسجيل الخروج");

            return;
        }


        // تحديث الصفحة

        location.reload();

    };

}


// ==========================================
// RUN LOGIN CHECK
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    setupLoginButton
);