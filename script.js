document.addEventListener("DOMContentLoaded", () => {
  // set asset data using local storage or hard code data
  const STORAGE_KEY = "assetsList";
  const assetFields = [
    { label: "Name", id: "name" },
    { label: "Make", id: "make" },
    { label: "Model", id: "model" },
    { label: "Serial Number", id: "serialNumber" },
    { label: "Job/Quote", id: "jobQuote" },
  ];

  let assetData = loadFromStorage();
  if (assetData.length === 0) {
    assetData = [
      {
        name: "Uber car 1",
        make: "Kia",
        model: "Seltos",
        serialNumber: "12153252352",
        jobQuote: "J00041",
      },
      {
        name: "Uber car 2",
        make: "Toyota",
        model: "Rav4",
        serialNumber: "54367846542",
        jobQuote: "Q00021",
      },
      {
        name: "Uber car 3",
        make: "Dodge",
        model: "Caravan",
        serialNumber: "9014143234",
        jobQuote: "",
      },
    ];
    saveToStorage(assetData);
  }

  let editIndex = null;

  const dashboard = document.querySelector(".assetDashboardContainer");
  const details = document.querySelector(".assetsInfoContainer");
  const tileContainer = document.querySelector(".tileContainer");

  function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function populateAssetTable(data) {
    const table = document.getElementById("assetInfoTable");
    table.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Make</th>
        <th>Model</th>
        <th>Serial Number</th>
        <th>In Use</th>
      </tr>
    `;
    data.forEach((asset, index) => {
      const row = table.insertRow();
      row.insertCell().textContent = asset.name;
      row.insertCell().textContent = asset.make;
      row.insertCell().textContent = asset.model;
      row.insertCell().textContent = asset.serialNumber;
      row.insertCell().textContent = asset.jobQuote || "no";

      row.addEventListener("click", () => loadAssetForEdit(asset, index));
    });
  }

  function createInputFields(fields) {
    const container = document.getElementById("assetsInfoLabels");
    container.innerHTML = "";
    fields.forEach(({ label, id, type = "text" }) => {
      const labelElem = document.createElement("label");
      labelElem.setAttribute("for", id);
      labelElem.textContent = label;

      const input = document.createElement("input");
      input.setAttribute("type", type);
      input.setAttribute("id", id);
      input.setAttribute("name", id);

      container.appendChild(labelElem);
      container.appendChild(document.createElement("br"));
      container.appendChild(input);
      container.appendChild(document.createElement("br"));
    });
  }

  function loadAssetForEdit(asset, index) {
    assetFields.forEach(({ id }) => {
      const input = document.getElementById(id);
      if (input) input.value = asset[id] || "";
    });
    editIndex = index;
    dashboard.style.display = "none";
    details.style.display = "block";
    deleteAssetBtn.style.display = "inline-block";

    if (asset.image) {
      previewImg.src = asset.image;
      previewImg.style.display = "block";
      previewText.style.display = "none";
    } else {
      previewImg.src = "";
      previewImg.style.display = "none";
      previewText.style.display = "block";
    }
  }

  function resetForm() {
    assetFields.forEach(({ id }) => {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });
    previewImg.src = "";
    previewImg.style.display = "none";
    previewText.style.display = "block";
    editIndex = null;
  }

  // Image preview logic
  const imageUpload = document.getElementById("imageUpload");
  const previewImg = document.querySelector(".preview-img");
  const previewText = document.querySelector("#imagePreview span");

  if (imageUpload && previewImg && previewText) {
    imageUpload.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => (previewImg.src = reader.result);
        reader.readAsDataURL(file);
        previewText.style.display = "none";
        previewImg.style.display = "block";
      } else {
        previewImg.src = "";
        previewImg.style.display = "none";
        previewText.style.display = "block";
      }
    });
  }

  // Button: tile to dashboard
  document.getElementById("assets").addEventListener("click", () => {
    tileContainer.style.display = "none";
    dashboard.style.display = "block";
    details.style.display = "none";
  });

  // Button: add new asset
  document.getElementById("addAssetBtn").addEventListener("click", () => {
    resetForm();
    dashboard.style.display = "none";
    details.style.display = "block";
    deleteAssetBtn.style.display = "none";
  });

  // Button: back to dashboard
  document.querySelector(".back-to-dashboard").addEventListener("click", () => {
    dashboard.style.display = "block";
    details.style.display = "none";
  });

  // Button: back to tile view
  document
    .querySelectorAll(".back-btn:not(.back-to-dashboard)")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        tileContainer.style.display = "flex";
        dashboard.style.display = "none";
        details.style.display = "none";
      });
    });

  // Button: Save/Add
  document.getElementById("saveAssetBtn").addEventListener("click", () => {
    const newAsset = {};
    assetFields.forEach(({ id }) => {
      const input = document.getElementById(id);
      newAsset[id] = input ? input.value.trim() : "";
    });
    const imageData = previewImg?.src || "";
    newAsset.image = imageData;

    // Validate required fields
    const requiredFields = ["name", "make", "model", "serialNumber"];
    const empty = requiredFields.filter((id) => !newAsset[id]);
    if (empty.length) {
      alert(`Please fill out: ${empty.join(", ")}`);
      return;
    }

    if (editIndex !== null) {
      assetData[editIndex] = newAsset;
    } else {
      assetData.push(newAsset);
    }

    saveToStorage(assetData);
    populateAssetTable(assetData);
    resetForm();
    dashboard.style.display = "block";
    details.style.display = "none";
  });

  // Button: delete
  const deleteAssetBtn = document.getElementById("delete");
  deleteAssetBtn.addEventListener("click", () => {
    if (editIndex === null) {
      alert("Nothing to delete.");
      return;
    }

    if (confirm("Are you sure you want to delete this asset?")) {
      assetData.splice(editIndex, 1);
      saveToStorage(assetData);
      populateAssetTable(assetData);
      resetForm();
      dashboard.style.display = "block";
      details.style.display = "none";
    }
  });

  // Init
  createInputFields(assetFields);
  populateAssetTable(assetData);
});
