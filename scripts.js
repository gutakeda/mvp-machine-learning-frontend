/* Cards elements */
const totalDepositsElement = document.getElementById("totalDepositsAmount");
const totalWithdrawalsElement = document.getElementById(
  "totalWithdrawalsAmount"
);
const netTotalElement = document.getElementById("netTotalAmount");

/* Table elements */
const categoriesTableBody = document.getElementById("categories-table-body");
const transactionsTableBody = document.getElementById(
  "transactions-table-body"
);

/* Modal elements */
const modal = document.getElementById("transactionModal");
const openTransactionModalButton = document.getElementById(
  "openTransactionModalButton"
);
const closeTransactionModal = document.getElementById("closeTransactionModal");
const categoryModal = document.getElementById("categoryModal");
const cancelTransactionButton = document.getElementById(
  "cancelTransactionButton"
);
const openCategoryModalButton = document.getElementById(
  "openCategoryModalButton"
);
const closeCategoryModal = document.getElementById("closeCategoryModal");
const cancelCategoryButton = document.getElementById("cancelCategoryButton");

/* Form elements */
const transactionForm = document.getElementById("transactionForm");
const categoryForm = document.getElementById("categoryForm");
const categorySelect = document.getElementById("category");

/* Listeners */
document.addEventListener("DOMContentLoaded", function () {
  fetchTransactions();
  fetchCategories();
  document.getElementById("defaultTab").click();

  modal.style.display = "none";
  categoryModal.style.display = "none";
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-icon")) {
    const transactionId = event.target.getAttribute("data-id");
    deleteTransaction(transactionId);
  }
});

/* Table functions */
function fetchTransactions() {
  fetch("http://localhost:5000/api/transactions?order_by=desc")
    .then((response) => response.json())
    .then((data) => {
      transactionsTableBody.innerHTML = "";
      let totalDeposits = 0;
      let totalWithdrawals = 0;

      data.forEach((transaction) => {
        const row = createTransactionRow(transaction);
        transactionsTableBody.appendChild(row);

        if (transaction.type === "deposit") {
          totalDeposits += transaction.amount;
        } else if (transaction.type === "withdraw") {
          totalWithdrawals += transaction.amount;
        }
      });

      updateTotals(totalDeposits, totalWithdrawals);
    })
    .catch((error) => console.error("Error fetching transactions:", error));
}

function fetchCategories() {
  fetch("http://localhost:5000/api/categories")
    .then((response) => response.json())
    .then((data) => {
      categorySelect.innerHTML = "";
      categoriesTableBody.innerHTML = "";
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);

        const row = createCategoryRow(category);
        categoriesTableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error fetching categories:", error));
}

function createTransactionRow(transaction) {
  const row = document.createElement("tr");
  const type = transaction.type === "deposit" ? "deposit" : "withdraw";

  row.innerHTML = `
    <td>${transaction.id}</td>
    <td>${transaction.title}</td>
    <td>${transaction.type}</td>
    <td class="${type}">$${transaction.amount.toFixed(2)}</td>
    <td>${transaction.category}</td>
    <td>${new Date(transaction.created_at).toLocaleString()}</td>
    <td><i class="fas fa-trash-alt delete-icon" data-id="${
      transaction.id
    }"></i></td>
  `;
  return row;
}

function createCategoryRow(category) {
  const row = document.createElement("tr");
  row.innerHTML = `
      <td>${category.id}</td>
      <td>${category.name}</td>
      <td>$${category.total_amount}</td>
  `;
  return row;
}

function deleteTransaction(transactionId) {
  fetch(`http://localhost:5000/api/transaction/${transactionId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to delete transaction with ID ${transactionId}`
        );
      }
      fetchTransactions();
      fetchCategories();
    })
    .catch((error) => {
      console.error(error);
      alert("Error deleting transaction");
    });
}

/* Cards functions */
function updateTotals(totalDeposits, totalWithdrawals) {
  totalDepositsElement.textContent = `$${totalDeposits.toFixed(2)}`;
  totalWithdrawalsElement.textContent = `$${totalWithdrawals.toFixed(2)}`;
  netTotalElement.textContent = `$${(totalDeposits - totalWithdrawals).toFixed(
    2
  )}`;
}

/* Modal functions */
openTransactionModalButton.onclick = function () {
  modal.style.display = "flex";
  fetchCategories();
};

closeTransactionModal.onclick = function () {
  modal.style.display = "none";
};

cancelTransactionButton.onclick = closeTransactionModal.onclick;

openCategoryModalButton.onclick = function () {
  categoryModal.style.display = "flex";
};

closeCategoryModal.onclick = function () {
  categoryModal.style.display = "none";
};

cancelCategoryButton.onclick = closeCategoryModal.onclick;

/* Form functions */
transactionForm.onsubmit = function (event) {
  event.preventDefault();
  const formData = new FormData(transactionForm);
  const payload = {
    title: formData.get("title"),
    type: formData.get("transactionType"),
    amount: parseFloat(formData.get("amount")),
    category_id: parseInt(formData.get("category")),
  };
  sendTransaction(payload);
  modal.style.display = "none";
};

categoryForm.onsubmit = function (event) {
  event.preventDefault();
  const formData = new FormData(categoryForm);
  const payload = {
    name: formData.get("categoryName"),
  };
  sendCategory(payload);
  categoryModal.style.display = "none";
};

function sendTransaction(payload) {
  fetch("http://localhost:5000/api/transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(() => {
      alert("Transaction added successfully");
      modal.style.display = "none";
      transactionForm.reset();
      fetchTransactions();
      fetchCategories();
    })
    .catch((error) => {
      console.error(error);
      alert("Error adding transaction: " + error.message);
    });
}

function sendCategory(payload) {
  fetch("http://localhost:5000/api/category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        debugger;
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(() => {
      alert("Category added successfully");
      categoryModal.style.display = "none";
      categoryForm.reset();
      fetchCategories();
    })
    .catch((error) => {
      console.error(error);
      alert("Error adding category: " + error);
    });
}

/* Tab functions */
function openTab(evt, tabName) {
  const tabcontent = document.querySelectorAll(".tabcontent");
  const tablinks = document.querySelectorAll(".tablinks");

  tabcontent.forEach((tab) => {
    tab.style.display = "none";
  });

  tablinks.forEach((link) => {
    link.classList.remove("active");
  });

  document.getElementById(tabName).style.display = "block";

  evt.currentTarget.classList.add("active");
}
