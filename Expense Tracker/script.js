document.addEventListener("DOMContentLoaded", () => {
  const sumbitButton = document.querySelector("#sumbit");
  const AmountInput = document.querySelector("#entry1");
  const CategoryInput = document.querySelector("#entry2");
  const PaymentMethodInput = document.querySelector("#p_method");
  const AddedNoteInput = document.querySelector("#Note");
  const tableBody = document.querySelector("tbody");
  const expensedate = document.querySelector("#expenseDate");

  let total = 0;
  const categoryData = {}; // Store expense by category
  let expenseChart; // To hold chart instance

  // Fix: Prepare high-DPI canvas
  const canvas = document.getElementById("expenseChart");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  const chartCtx = canvas.getContext("2d");
  chartCtx.scale(dpr, dpr);

  // Color generator for different categories
  const getColorPalette = (count) => {
    const palette = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#8B0000",
      "#228B22",
      "#2F4F4F",
      "#800080",
      "#00CED1",
      "#DC143C",
    ];
    return palette.slice(0, count);
  };

  function renderChart() {
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const backgroundColors = getColorPalette(labels.length);

    if (expenseChart) {
      expenseChart.destroy(); // Clear old chart before re-rendering
    }

    expenseChart = new Chart(chartCtx, {
      type: "polarArea",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Expenses by Category",
            data: data,
            backgroundColor: backgroundColors,
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }
  function updateTableData(Amount, Category, PaymentMethod, AddedNote) {
    if (!Amount || !Category || !PaymentMethod) {
      alert(
        "Please fill all required fields (Amount, Category, and Payment Method)."
      );
      return;
    }

    // Get current date
    const currentDate = expensedate.value || new Date().toLocaleDateString();

    // Create a new table row
    const newRow = document.createElement("tr");

    // Insert data into the row
    newRow.innerHTML = `
            <td>${currentDate}</td>
            <td>${Category}</td>
            <td>₹${Amount}</td>
            <td>${PaymentMethod}</td>
            <td>${AddedNote || "N/A"}</td>
            <td><button class="deletebtn">DELETE</button></td>
        `;

    newRow.querySelector(".deletebtn").addEventListener("click", () => {
      total -= parseFloat(Amount);
      document.getElementById("totalAmount").textContent = total.toFixed(2);
      // Update categoryData
      if (categoryData[Category]) {
        categoryData[Category] -= parseFloat(Amount);
        if (categoryData[Category] <= 0) {
          delete categoryData[Category]; // Remove category if total is 0
        }
      }

      newRow.remove();
      renderChart();
    });

    // Append the new row to the table
    tableBody.appendChild(newRow);

    // Clear input fields after adding data
    AmountInput.value = "";
    CategoryInput.value = "";
    PaymentMethodInput.value = "";
    AddedNoteInput.value = "";

    total += parseFloat(Amount);
    document.querySelector("#totalAmount").textContent = total.toFixed(2);
    //  Update categoryData for chart
    if (!categoryData[Category]) {
      categoryData[Category] = 0;
    }
    categoryData[Category] += parseFloat(Amount);

    // Re-render chart
    renderChart();
  }

  sumbitButton.addEventListener("click", (event) => {
    event.preventDefault();
    const Amount = AmountInput.value;
    const Category = CategoryInput.value;
    const PaymentMethod = PaymentMethodInput.value;
    const AddedNote = AddedNoteInput.value;
    console.log("your data is", Amount, Category, PaymentMethod, AddedNote);
    updateTableData(Amount, Category, PaymentMethod, AddedNote);
  });

  document.querySelector("#Changetheme").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
  const downloadBtn = document.querySelector("#CSVdownload");

  downloadBtn.addEventListener("click", () => {
    const rows = Array.from(document.querySelectorAll("table tr"));
    let csv = "";

    rows.forEach((row) => {
      const cols = row.querySelectorAll("td, th");
      const rowData = Array.from(cols).map(
        (col) => `"${col.textContent.replace(/"/g, '""')}"`
      );
      csv += rowData.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  });
});