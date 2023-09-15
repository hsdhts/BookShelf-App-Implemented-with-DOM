document.addEventListener("DOMContentLoaded", function () {
  const inputBookTitle = document.getElementById("inputBookTitle");
  const inputBookAuthor = document.getElementById("inputBookAuthor");
  const inputBookYear = document.getElementById("inputBookYear");
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  const searchBookForm = document.getElementById("searchBook");
  const searchBookTitleInput = document.getElementById("searchBookTitle");
  const submitButton = document.getElementById("bookSubmit");

  // Event listener untuk kotak centang "Selesai Dibaca"
  inputBookIsComplete.addEventListener("change", function () {
    if (this.checked) {
      submitButton.textContent = "Masukkan buku ke rak Selesai Dibaca";
    } else {
      submitButton.textContent = "Masukkan buku ke rak Belum selesai dibaca";
    }
  });

  // Fungsi untuk membuat elemen HTML
  function createElement(tag, attributes = {}, textContent = "") {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    element.textContent = textContent;
    return element;
  }

  // Fungsi untuk membuat buku baru
  function createBookElement(title, author, year, isComplete) {
    const bookTitle = createElement("h3", {}, title);
    const bookAuthor = createElement("p", {}, `Penulis: ${author}`);
    const bookYear = createElement("p", {}, `Tahun: ${year}`);

    const actionButton = createElement(
      "button",
      { classList: "toggle-button" },
      isComplete ? "Selesai dibaca" : "Belum selesai di Baca"
    );

    actionButton.style.backgroundColor = "green";

    const deleteButton = createElement("button", {}, "Hapus buku");
    deleteButton.classList.add("red");

    actionButton.addEventListener("click", toggleBookStatus);
    deleteButton.addEventListener("click", deleteBook);

    const actionContainer = createElement("div", { classList: "action" });
    actionContainer.appendChild(actionButton);
    actionContainer.appendChild(deleteButton);

    const book = createElement("article", { classList: "book_item" });
    book.appendChild(bookTitle);
    book.appendChild(bookAuthor);
    book.appendChild(bookYear);
    book.appendChild(actionContainer);

    book.setAttribute("data-isComplete", isComplete);

    return book;
  }

  // Fungsi untuk menambahkan buku ke rak yang sesuai dan menyimpan ke localStorage
  function addBookToShelf(title, author, year, isComplete) {
    const book = createBookElement(title, author, year, isComplete);

    const targetShelf = isComplete
      ? completeBookshelfList
      : incompleteBookshelfList;
    targetShelf.appendChild(book);

    saveBookToLocalStorage();
  }

  // Fungsi untuk menghapus buku dan data buku dari localStorage
  function deleteBook() {
    const book = this.closest(".book_item");
    const isComplete = book
      .querySelector(".toggle-button")
      .classList.contains("green");

    book.remove();

    removeBookFromLocalStorage(book.querySelector("h3").textContent);
  }

  // Fungsi untuk memindahkan buku antar rak dan menyimpan perubahan di localStorage
  function toggleBookStatus() {
    const book = this.closest(".book_item");
    const isComplete = book
      .querySelector(".toggle-button")
      .classList.contains("green");

    const targetShelf = isComplete
      ? incompleteBookshelfList
      : completeBookshelfList;

    // Hapus buku dari rak sebelumnya
    book.remove();

    // Perbarui status buku di localStorage
    const bookTitle = book.querySelector("h3").textContent;
    updateBookStatusInLocalStorage(bookTitle, !isComplete);

    // Perbarui status buku
    const actionButton = book.querySelector(".toggle-button");
    actionButton.textContent = isComplete
      ? "Selesai dibaca"
      : "Belum selesai di Baca";
    actionButton.classList.toggle("green");
    actionButton.classList.toggle("red");

    // Tambahkan buku ke rak yang sesuai
    targetShelf.appendChild(book);
  }

  // Fungsi untuk menyimpan semua data buku ke localStorage
  function saveBookToLocalStorage() {
    const allBooks = [
      ...incompleteBookshelfList.querySelectorAll(".book_item"),
      ...completeBookshelfList.querySelectorAll(".book_item"),
    ];

    const books = allBooks.map((book) => {
      const title = book.querySelector("h3").textContent;
      const author = book
        .querySelector("p")
        .textContent.replace("Penulis: ", "");
      const year = parseInt(
        book.querySelector("p:nth-child(3)").textContent.replace("Tahun: ", "")
      ); // Konversi ke tipe data number
      const isComplete = JSON.parse(book.getAttribute("data-isComplete"));

      return { id: generateId(), title, author, year, isComplete };
    });

    localStorage.setItem("books", JSON.stringify(books));
  }

  // Fungsi untuk menghapus buku dari localStorage berdasarkan judul
  function removeBookFromLocalStorage(title) {
    let books = JSON.parse(localStorage.getItem("books")) || [];
    books = books.filter((book) => book.title !== title);
    localStorage.setItem("books", JSON.stringify(books));
  }

  // Fungsi untuk memperbarui status buku di localStorage berdasarkan judul
  function updateBookStatusInLocalStorage(title, isComplete) {
    let books = JSON.parse(localStorage.getItem("books")) || [];
    const updatedBooks = books.map((book) => {
      if (book.title === title) {
        return { ...book, isComplete };
      }
      return book;
    });
    localStorage.setItem("books", JSON.stringify(updatedBooks));
  }

  // Fungsi untuk mencari buku berdasarkan judul
  function searchBookByTitle(title) {
    const allBooks = [
      ...incompleteBookshelfList.querySelectorAll(".book_item"),
      ...completeBookshelfList.querySelectorAll(".book_item"),
    ];
    for (const book of allBooks) {
      const bookTitle = book.querySelector("h3").textContent.toLowerCase();
      if (bookTitle.includes(title.toLowerCase())) {
        book.style.display = "";
      } else {
        book.style.display = "none";
      }
    }
  }

  // Event listener untuk form input buku
  document.getElementById("inputBook").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = inputBookTitle.value;
    const author = inputBookAuthor.value;
    const year = parseInt(inputBookYear.value);
    const isComplete = inputBookIsComplete.checked;

    // Validasi apakah year adalah angka
    if (isNaN(year)) {
      alert("Tahun harus berupa angka.");
      return;
    }

    addBookToShelf(title, author, year, isComplete);

    inputBookTitle.value = "";
    inputBookAuthor.value = "";
    inputBookYear.value = "";
    inputBookIsComplete.checked = false;

    // Reset teks tombol setelah submit
    submitButton.textContent = "Masukkan buku ke rak Belum selesai dibaca";
  });

  // Event listener untuk form pencarian buku
  searchBookForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const searchBookTitle = searchBookTitleInput.value.toLowerCase();
    searchBookByTitle(searchBookTitle);
  });

  // Muat data buku dari localStorage saat halaman dimuat
  function loadBooksFromLocalStorage() {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    for (const book of books) {
      addBookToShelf(book.title, book.author, book.year, book.isComplete);
    }
  }

  // Generate unique ID untuk buku
  function generateId() {
    return +new Date();
  }

  loadBooksFromLocalStorage();
});
