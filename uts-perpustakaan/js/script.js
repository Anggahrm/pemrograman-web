const bookSearch = document.querySelector('#bookSearch');
const bookList = document.querySelector('#bookList');
const resultInfo = document.querySelector('#resultInfo');
const emptyState = document.querySelector('#emptyState');
const categoryFilters = Array.from(document.querySelectorAll('.category-filter'));
const sortBooks = document.querySelector('#sortBooks');
const catalogPagination = document.querySelector('#catalogPagination');
const booksPerPage = 6;
let currentPage = 1;

function getFilteredBooks() {
  if (!bookList) {
    return [];
  }

  const books = Array.from(bookList.querySelectorAll('.catalog-book'));
  const keyword = bookSearch ? bookSearch.value.trim().toLowerCase() : '';
  const selectedCategories = categoryFilters
    .filter(function (filter) {
      return filter.checked && filter.value !== 'all';
    })
    .map(function (filter) {
      return filter.value;
    });

  return books.filter(function (book) {
    const title = book.dataset.title.toLowerCase();
    const author = book.dataset.author.toLowerCase();
    const category = book.dataset.category;
    const matchKeyword = title.includes(keyword) || author.includes(keyword) || category.toLowerCase().includes(keyword);
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(category);

    return matchKeyword && matchCategory;
  });
}

function renderPagination(totalPages) {
  if (!catalogPagination) {
    return;
  }

  catalogPagination.innerHTML = '';

  const previousButton = document.createElement('button');
  previousButton.type = 'button';
  previousButton.dataset.pagination = 'prev';
  previousButton.setAttribute('aria-label', 'Halaman sebelumnya');
  previousButton.disabled = currentPage === 1;
  previousButton.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
  catalogPagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page += 1) {
    const pageButton = document.createElement('button');
    pageButton.type = 'button';
    pageButton.dataset.page = String(page);
    pageButton.textContent = String(page);

    if (page === currentPage) {
      pageButton.classList.add('current');
    }

    catalogPagination.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.dataset.pagination = 'next';
  nextButton.setAttribute('aria-label', 'Halaman berikutnya');
  nextButton.disabled = currentPage === totalPages;
  nextButton.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
  catalogPagination.appendChild(nextButton);
}

function updateCatalog(resetPage) {
  if (!bookList) {
    return;
  }

  const books = Array.from(bookList.querySelectorAll('.catalog-book'));
  const filteredBooks = getFilteredBooks();
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage));
  const keyword = bookSearch ? bookSearch.value.trim() : '';

  if (resetPage) {
    currentPage = 1;
  }

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * booksPerPage;
  const visibleBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  books.forEach(function (book) {
    book.hidden = true;
  });

  visibleBooks.forEach(function (book) {
    book.hidden = false;
  });

  if (resultInfo) {
    const firstItem = filteredBooks.length === 0 ? 0 : startIndex + 1;
    const lastItem = Math.min(startIndex + booksPerPage, filteredBooks.length);
    const prefix = keyword ? `Hasil untuk "${keyword}"` : 'Koleksi buku';

    resultInfo.textContent = `${prefix}: menampilkan ${firstItem}-${lastItem} dari ${filteredBooks.length} buku.`;
  }

  if (emptyState) {
    emptyState.hidden = filteredBooks.length !== 0;
  }

  renderPagination(totalPages);
}

if (bookSearch && bookList) {
  bookSearch.addEventListener('input', function () {
    updateCatalog(true);
  });
}

if (categoryFilters.length > 0) {
  categoryFilters.forEach(function (filter) {
    filter.addEventListener('change', function () {
      const allFilter = categoryFilters.find(function (item) {
        return item.value === 'all';
      });

      if (filter.value === 'all' && filter.checked) {
        categoryFilters.forEach(function (item) {
          if (item.value !== 'all') {
            item.checked = false;
          }
        });
      }

      if (filter.value !== 'all' && filter.checked && allFilter) {
        allFilter.checked = false;
      }

      const hasSelected = categoryFilters.some(function (item) {
        return item.checked;
      });

      if (!hasSelected && allFilter) {
        allFilter.checked = true;
      }

      updateCatalog(true);
    });
  });
}

if (sortBooks && bookList) {
  sortBooks.addEventListener('change', function () {
    const books = Array.from(bookList.querySelectorAll('.catalog-book'));
    const sortedBooks = books.sort(function (a, b) {
      if (sortBooks.value === 'az') {
        return a.dataset.title.localeCompare(b.dataset.title);
      }

      if (sortBooks.value === 'za') {
        return b.dataset.title.localeCompare(a.dataset.title);
      }

      return Number(b.dataset.year) - Number(a.dataset.year);
    });

    sortedBooks.forEach(function (book) {
      bookList.appendChild(book);
    });

    updateCatalog(true);
  });
}

if (catalogPagination) {
  catalogPagination.addEventListener('click', function (event) {
    const button = event.target.closest('button');

    if (!button || button.disabled) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(getFilteredBooks().length / booksPerPage));

    if (button.dataset.page) {
      currentPage = Number(button.dataset.page);
    }

    if (button.dataset.pagination === 'prev') {
      currentPage = Math.max(1, currentPage - 1);
    }

    if (button.dataset.pagination === 'next') {
      currentPage = Math.min(totalPages, currentPage + 1);
    }

    updateCatalog(false);
  });
}

updateCatalog(true);

const contactForm = document.querySelector('#contactForm');
const formSuccess = document.querySelector('#formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const fields = [
      {
        element: document.querySelector('#name'),
        message: 'Nama wajib diisi.'
      },
      {
        element: document.querySelector('#email'),
        message: 'Email wajib diisi.'
      },
      {
        element: document.querySelector('#category'),
        message: 'Kategori pesan wajib dipilih.'
      },
      {
        element: document.querySelector('#message'),
        message: 'Isi pesan wajib diisi.'
      }
    ];

    let isValid = true;

    fields.forEach(function (field) {
      const group = field.element.closest('.form-group');
      const error = group.querySelector('.error-message');
      const value = field.element.value.trim();

      group.classList.remove('invalid');
      error.textContent = '';

      if (!value) {
        group.classList.add('invalid');
        error.textContent = field.message;
        isValid = false;
      }
    });

    const emailField = document.querySelector('#email');
    const emailGroup = emailField.closest('.form-group');
    const emailError = emailGroup.querySelector('.error-message');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailField.value.trim() && !emailPattern.test(emailField.value.trim())) {
      emailGroup.classList.add('invalid');
      emailError.textContent = 'Format email tidak valid.';
      isValid = false;
    }

    if (formSuccess) {
      formSuccess.hidden = !isValid;
    }

    if (isValid) {
      contactForm.reset();
    }
  });
}
