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

        // لو الكارت مش فيه البيانات المطلوبة
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

    // تنظيف الاقتراحات القديمة
    suggestions.innerHTML = "";

    selectedIndex = -1;


    // ========================================
    // لو البحث فاضي
    // رجع كل الكتب
    // ========================================

    if (value === "") {

        suggestions.style.display = "none";

        const cards = document.querySelectorAll(".card");

        cards.forEach(function (card) {

            card.style.display = "";

        });

        return;
    }


    // ========================================
    // قراءة الكتب من HTML
    // ========================================

    const books = getBooksData();


    // ========================================
    // البحث في:
    // المادة
    // الصف
    // اسم الكتاب
    // اسم المدرس
    // ========================================

    const results = books.filter(function (book) {

        return book.fullText.includes(value);

    });


    // ========================================
    // مفيش نتائج
    // ========================================

    if (results.length === 0) {

        suggestions.style.display = "none";

        return;
    }


    // ========================================
    // إنشاء الاقتراحات
    // ========================================

    results.forEach(function (book) {

        const item = document.createElement("div");

        item.classList.add("suggestion");


        // الصف / المادة + اسم الكتاب والمدرس
        item.innerHTML = `

            <span class="suggestionCategory">
                ${book.category}
            </span>

            <span class="suggestionTitle">
                ${book.title}
            </span>

        `;


        // ====================================
        // اختيار بالماوس
        // ====================================

        item.addEventListener("click", function () {

            searchInput.value =
                book.category + " " + book.title;

            suggestions.style.display = "none";

            selectedIndex = -1;

            showOnlyBook(book.card);

        });


        suggestions.appendChild(item);

    });


    // إظهار القائمة
    suggestions.style.display = "block";

});


// ============================================
// KEYBOARD NAVIGATION
// ============================================

searchInput.addEventListener("keydown", function (event) {

    const items =
        suggestions.querySelectorAll(".suggestion");


    // ========================================
    // ARROW DOWN ↓
    // ========================================

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


    // ========================================
    // ARROW UP ↑
    // ========================================

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


    // ========================================
    // ENTER
    // ========================================

    else if (event.key === "Enter") {

        event.preventDefault();


        if (
            selectedIndex >= 0 &&
            selectedIndex < items.length
        ) {

            // اختيار الاقتراح المحدد
            items[selectedIndex].click();

        } else {

            // بحث عادي
            searchBooks();

        }

    }


    // ========================================
    // ESCAPE
    // ========================================

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


            // إبقاء العنصر ظاهر أثناء النزول
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


    // ========================================
    // لو البحث فاضي
    // ========================================

    if (searchText === "") {

        cards.forEach(function (card) {

            card.style.display = "";

        });

        suggestions.style.display = "none";

        selectedIndex = -1;

        return;
    }


    // ========================================
    // تقسيم البحث إلى كلمات
    // ========================================

    const words = searchText
        .split(/\s+/)
        .filter(function (word) {

            return word !== "";

        });


    // ========================================
    // البحث في جميع الكروت
    // ========================================

    cards.forEach(function (card) {

        const cardText = card.innerText
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();


        // كل الكلمات لازم تكون موجودة
        const found = words.every(function (word) {

            return cardText.includes(word);

        });


        if (found) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });


    // إخفاء الاقتراحات
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