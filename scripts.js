/* Cards elements */
const totalPredicted = document.getElementById("totalPredicted");
const percentageOfPositive = document.getElementById("percentageOfPositive");
const numberOfPositive = document.getElementById("numberOfPositive");
const transactionsTableBody = document.getElementById(
  "transactions-table-body"
);

/* Modal elements */
const modal = document.getElementById("transactionModal");
const openTransactionModalButton = document.getElementById(
  "openTransactionModalButton"
);
const closeTransactionModal = document.getElementById("closeTransactionModal");
const cancelTransactionButton = document.getElementById(
  "cancelTransactionButton"
);

/* Form elements */
const transactionForm = document.getElementById("transactionForm");
const chestPainTypeSelect = document.getElementById("chest_pain_type");
const restingEcgSelect = document.getElementById("resting_ecg");
const exerciseAnginaSelect = document.getElementById("exercise_angina");
const stSlopeSelect = document.getElementById("st_slope");
const sexRadioGroup = document.getElementById("sex");

/* Global variables */
let mappingDict = {};

/* Listeners */
document.addEventListener("DOMContentLoaded", async function () {
  await fetchMapping();
  await fetchTransactions();
  document.getElementById("defaultTab").click();

  modal.style.display = "none";
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-icon")) {
    const transactionId = event.target.getAttribute("data-id");
    deleteTransaction(transactionId);
  }
});

/* Table functions */
function fetchTransactions() {
  return fetch("http://localhost:5000/api/transactions?order_by=desc")
    .then((response) => response.json())
    .then((data) => {
      transactionsTableBody.innerHTML = "";
      data.forEach((transaction) => {
        const row = createTransactionRow(transaction);
        transactionsTableBody.appendChild(row);
      });
      updateTotals(data);
    })
    .catch((error) => console.error("Error fetching transactions:", error));
}

function fetchMapping() {
  return fetch("http://localhost:5000/api/mapping")
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched mapping data:", data); // Adicione este log
      mappingDict = data;
      chestPainTypeSelect.innerHTML = "";
      restingEcgSelect.innerHTML = "";
      exerciseAnginaSelect.innerHTML = "";
      stSlopeSelect.innerHTML = "";
      sexRadioGroup.innerHTML = "";

      for (const [key, value] of Object.entries(data.ChestPainType)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = key;
        chestPainTypeSelect.appendChild(option);
      }

      for (const [key, value] of Object.entries(data.RestingECG)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = key;
        restingEcgSelect.appendChild(option);
      }

      for (const [key, value] of Object.entries(data.ExerciseAngina)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = key;
        exerciseAnginaSelect.appendChild(option);
      }

      for (const [key, value] of Object.entries(data.ST_Slope)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = key;
        stSlopeSelect.appendChild(option);
      }

      for (const [key, value] of Object.entries(data.Sex)) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "sex";
        input.value = value;

        // Definir o botão como selecionado se for o valor padrão
        if (value === 1) {
          input.checked = true; // Exemplo: defina como true para o valor padrão
        }

        label.appendChild(input);
        label.appendChild(document.createTextNode(key));

        sexRadioGroup.appendChild(label);
      }
    })
    .catch((error) => console.error("Error fetching mapping:", error));
}

function createTransactionRow(transaction) {
  const row = document.createElement("tr");

  // Função auxiliar para obter o valor legível
  const getReadableValue = (mapping, value) => {
    console.log(mappingDict);
    return Object.keys(mapping).find((key) => mapping[key] === value) || value;
  };

  row.innerHTML = `
    <td>${transaction.id}</td>
    <td>${transaction.age}</td>
    <td>${getReadableValue(mappingDict.Sex, transaction.sex)}</td>
    <td>${getReadableValue(
      mappingDict.ChestPainType,
      transaction.chest_pain_type
    )}</td>
    <td>${transaction.resting_bp}</td>
    <td>${transaction.cholesterol}</td>
    <td>${transaction.fasting_bs}</td>
    <td>${getReadableValue(
      mappingDict.RestingECG,
      transaction.resting_ecg
    )}</td>
    <td>${transaction.max_hr}</td>
    <td>${getReadableValue(
      mappingDict.ExerciseAngina,
      transaction.exercise_angina
    )}</td>
    <td>${transaction.oldpeak}</td>
    <td>${getReadableValue(mappingDict.ST_Slope, transaction.st_slope)}</td>
    <td>${transaction.heart_disease ? "Yes" : "No"}</td>
    <td>${new Date(transaction.created_at).toLocaleString()}</td>
    <td><i class="fas fa-trash-alt delete-icon" data-id="${
      transaction.id
    }"></i></td>
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
    })
    .catch((error) => {
      console.error(error);
      alert("Error deleting transaction");
    });
}

/* Cards functions */
function updateTotals(data) {
  const positiveLength = data.filter((item) => item.heart_disease === 1).length;

  totalPredicted.textContent = data.length;
  numberOfPositive.textContent = positiveLength;
  console.log(positiveLength, data.length);
  if (positiveLength && data.length)
    percentageOfPositive.textContent = `${(
      (positiveLength * 100) /
      data.length
    ).toFixed(2)}%`;
  else percentageOfPositive.textContent = "0.00%";
}

/* Modal functions */
openTransactionModalButton.onclick = function () {
  modal.style.display = "flex";
};

closeTransactionModal.onclick = function () {
  modal.style.display = "none";
  transactionForm.reset();
};

cancelTransactionButton.onclick = closeTransactionModal.onclick;

/* Form functions */
transactionForm.onsubmit = function (event) {
  event.preventDefault();
  const formData = new FormData(transactionForm);
  const payload = {
    age: parseInt(formData.get("age")),
    sex: parseInt(formData.get("sex")),
    chest_pain_type: parseInt(formData.get("chest_pain_type")),
    resting_bp: parseInt(formData.get("resting_bp")),
    cholesterol: parseInt(formData.get("cholesterol")),
    fasting_bs: parseInt(formData.get("fasting_bs")),
    resting_ecg: parseInt(formData.get("resting_ecg")),
    max_hr: parseInt(formData.get("max_hr")),
    exercise_angina: parseInt(formData.get("exercise_angina")),
    oldpeak: parseFloat(formData.get("oldpeak")),
    st_slope: parseInt(formData.get("st_slope")),
  };
  sendTransaction(payload);
  modal.style.display = "none";
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
    })
    .catch((error) => {
      console.error(error);
      alert("Error adding transaction: " + error.message);
    });
}

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
