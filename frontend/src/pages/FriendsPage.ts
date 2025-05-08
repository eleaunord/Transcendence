import { createSidebar } from "../utils/sidebar"; 
import { applyUserTheme } from '../utils/theme';

export function createFriendsPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement("div");
  container.className = "relative min-h-screen bg-gray-900 text-white overflow-hidden";

  const sidebar = createSidebar(navigate);
  sidebar.classList.add("z-40");
  container.appendChild(sidebar);

      // Background Image
      const backgroundImage = document.createElement('div');
      backgroundImage.id = 'backgroundImage';
      backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
    
      container.appendChild(backgroundImage);
      applyUserTheme(backgroundImage);;
      
  //   // Friends Section
// Main content
  const main = document.createElement('div');
  main.className = 'relative z-10 ml-80 p-8 flex flex-col gap-8';

  const title = document.createElement("h2");
  title.textContent = "Friends List";
  title.className = "text-4xl font-bold mb-10 text-white";
  mainSection.appendChild(title);

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "flex items-start gap-12";

  // Enlarged table container
  const tableContainer = document.createElement("div");
  tableContainer.className = "bg-gray-700/80 backdrop-blur-md p-6 rounded-lg shadow-lg w-[28rem]";

  const scrollWrapper = document.createElement("div");
  scrollWrapper.className = "max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800";

  const table = document.createElement("table");
  table.className = "text-white border-separate border-spacing-0 w-full";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.className = "bg-gray-600/90";

  const nameHeader = document.createElement("th");
  nameHeader.textContent = "Friends";
  nameHeader.className = "border border-gray-800 px-10 py-4 text-lg font-semibold";

  const statusHeader = document.createElement("th");
  statusHeader.textContent = "Status";
  statusHeader.className = "border border-gray-800 px-10 py-4 text-lg font-semibold";

  headerRow.appendChild(nameHeader);
  headerRow.appendChild(statusHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  let friends = ["Alix", "Gnouma", "Rime", "Soye", "Shinhye"];

  function renderFriendsTable() {
    tbody.innerHTML = "";
    friends.forEach(name => {
      const row = document.createElement("tr");
      row.className = "bg-gray-900 hover:bg-gray-800";

      const nameCell = document.createElement("td");
      nameCell.textContent = name;
      nameCell.className = "border border-gray-800 px-10 py-4 text-center text-base";

      const statusCell = document.createElement("td");
      statusCell.className = "border border-gray-800 px-10 py-4 text-center";
      statusCell.innerHTML = `<span class="inline-block w-4 h-4 bg-orange-500 rounded-full"></span>`;

      row.appendChild(nameCell);
      row.appendChild(statusCell);
      tbody.appendChild(row);
    });
  }

  renderFriendsTable();
  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  tableContainer.appendChild(scrollWrapper);

  // Buttons
  const buttonGroup = document.createElement("div");
  buttonGroup.className = "flex flex-col gap-6 mt-4";

  const addButton = document.createElement("button");
  addButton.textContent = "Add a friend";
  addButton.className = "px-6 py-3 bg-green-600 hover:bg-green-500 transition-colors duration-300 text-white rounded-md font-semibold";

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove a friend";
  removeButton.className = "px-6 py-3 bg-red-600 hover:bg-red-500 transition-colors duration-300 text-white rounded-md font-semibold";

  addButton.addEventListener("click", () => {
    if (friends.length >= 15) {
      alert("You can only have a maximum of 15 friends.");
      return;
    }

    const name = prompt("Enter new friend's name:");
    if (name && name.trim() !== "") {
      friends.push(name.trim());
      renderFriendsTable();
    }
  });

  removeButton.addEventListener("click", () => {
    const name = prompt("Enter friend's name to remove:");
    if (name && friends.includes(name.trim())) {
      friends = friends.filter(f => f !== name.trim());
      renderFriendsTable();
    } else {
      alert("Friend not found.");
    }
  });

  buttonGroup.appendChild(addButton);
  buttonGroup.appendChild(removeButton);

  contentWrapper.appendChild(tableContainer);
  contentWrapper.appendChild(buttonGroup);
  mainSection.appendChild(contentWrapper);
  container.appendChild(mainSection);

  // Sidebar hover behavior
  sidebar.addEventListener("mouseenter", () => {
    document.querySelectorAll(".sidebar-label").forEach(label => {
      (label as HTMLElement).classList.remove("opacity-0");
      (label as HTMLElement).classList.add("opacity-100");
    });
    const bg = document.getElementById("backgroundImage");
    if (bg) bg.className = "absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10";
  });

  sidebar.addEventListener("mouseleave", () => {
    document.querySelectorAll(".sidebar-label").forEach(label => {
      (label as HTMLElement).classList.add("opacity-0");
      (label as HTMLElement).classList.remove("opacity-100");
    });
    const bg = document.getElementById("backgroundImage");
    if (bg) bg.className = "absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10";
  });

  return container;
}
