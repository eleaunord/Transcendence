import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";
import { t } from "../utils/translator";

interface Friend {
  id: number;
  username: string;
  status: string;
  profile_picture?: string;
}

export function createFriendsPage(navigate: (path: string) => void): HTMLElement {
  if ((window as any).activePongCleanup) {
    (window as any).activePongCleanup();
    delete (window as any).activePongCleanup;
  }
      
  const container = document.createElement("div");
  container.className = "relative min-h-screen bg-gray-900 text-white overflow-hidden";

  const sidebar = createSidebar(navigate);
  sidebar.classList.add("z-40");
  container.appendChild(sidebar);

  const backgroundImage = document.createElement("div");
  backgroundImage.id = "backgroundImage";
  backgroundImage.className = "absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10";
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);

  const mainSection = document.createElement("div");
  mainSection.className = "relative mt-24 flex flex-col items-center z-30";

  const title = document.createElement("h2");
  title.textContent = t("friends.title");
  title.className = "text-4xl font-bold mb-10 text-white";
  mainSection.appendChild(title);

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "flex flex-col items-center gap-8";

  // === Status message ===
  const statusMessage = document.createElement("div");
  statusMessage.className = "text-sm hidden";
  contentWrapper.appendChild(statusMessage);

  // === Table container ===
  const tableContainer = document.createElement("div");
  tableContainer.className = "bg-gray-700/80 backdrop-blur-md p-6 rounded-lg shadow-lg w-[28rem]";
  const scrollWrapper = document.createElement("div");
  scrollWrapper.className = "max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800";

  const table = document.createElement("table");
  table.className = "text-white border-separate border-spacing-0 w-full";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.className = "bg-gray-600/90";

  [t("friends.table.friend"), t("friends.table.status"), t("friends.table.action")].forEach((text)  => {
    const th = document.createElement("th");
    th.textContent = text;
    th.className = "border border-gray-800 px-4 py-4 text-lg font-semibold";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  tableContainer.appendChild(scrollWrapper);
  contentWrapper.appendChild(tableContainer);

  // === Potential Friends dropdown ===
  const potentialContainer = document.createElement("div");
  potentialContainer.className = "bg-gray-700/80 backdrop-blur-md p-6 rounded-lg shadow-lg w-[28rem]";

  const select = document.createElement("select");
  select.className = "bg-gray-800 text-white px-4 py-2 rounded w-full mb-4";
  potentialContainer.appendChild(select);

  const addButton = document.createElement("button");
  addButton.textContent = t("friends.add");
  addButton.className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full";
  potentialContainer.appendChild(addButton);

  contentWrapper.appendChild(potentialContainer);
  mainSection.appendChild(contentWrapper);
  container.appendChild(mainSection);

  // === State ===
  let friends: Friend[] = [];
  let potentialFriends: Friend[] = [];

  // === Fetch & Render ===
  async function fetchUserData() {
    try {
      const res = await fetch("/api/me", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      friends = data.friends;
      potentialFriends = data.potentialFriends;
      renderFriendsList();
      renderPotentialList();
    } catch (err) {
      console.error("Error:", err);
      showStatusMessage(t("friends.error.fetch"), "error");
    }
  }

  function renderFriendsList() {
    tbody.innerHTML = "";
    if (friends.length === 0) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.textContent = emptyCell.textContent = t("friends.empty");
      emptyCell.colSpan = 3;
      emptyCell.className = "border border-gray-800 px-4 py-6 text-center text-gray-400";
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
      return;
    }

    friends.forEach((friend) => {
      const row = document.createElement("tr");
      row.className = "bg-gray-900 hover:bg-gray-800";

      // const idCell = document.createElement("td");
      // idCell.textContent = friend.id.toString();
      // idCell.className = "border border-gray-800 px-4 py-4 text-center";
      // row.appendChild(idCell);

      const nameCell = document.createElement("td");
      nameCell.textContent = friend.username;
      nameCell.className = "border border-gray-800 px-4 py-4 text-center";
      row.appendChild(nameCell);

      const statusCell = document.createElement("td");
      statusCell.className = "border border-gray-800 px-4 py-4 text-center";
      const dot = document.createElement("span");
      dot.className = `inline-block w-3 h-3 mr-2 rounded-full ${
        friend.status === "online" ? "bg-green-500" : "bg-orange-500"
      }`;
      const statusText = document.createElement("span");
      statusText.textContent = friend.status;
      statusCell.appendChild(dot);
      statusCell.appendChild(statusText);
      row.appendChild(statusCell);

      const actionCell = document.createElement("td");
      actionCell.className = "border border-gray-800 px-4 py-4 text-center";
      const removeBtn = document.createElement("button");
      removeBtn.textContent = t("friends.remove");
      removeBtn.className = "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm";
      removeBtn.onclick = () => removeFriend(friend.id);
      actionCell.appendChild(removeBtn);
      row.appendChild(actionCell);

      tbody.appendChild(row);
    });
  }

  function renderPotentialList() {
    select.innerHTML = "";
    if (potentialFriends.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = t("friends.noPotential");
      select.appendChild(opt);
      select.disabled = true;
      addButton.disabled = true;
      return;
    }

    potentialFriends.forEach((friend) => {
      const option = document.createElement("option");
      option.value = friend.id.toString();
      option.textContent = `${friend.username} (${friend.status})`;
      select.appendChild(option);
    });

    select.disabled = false;
    addButton.disabled = false;
  }

  async function addFriendById(id: number) {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: id }),
      });
      if (!res.ok) throw new Error("Failed to add friend");
      await fetchUserData();
      showStatusMessage(t("friends.added"), "success");
    } catch (err) {
      console.error(err);
      showStatusMessage(t("friends.error.add"), "error");
    }
  }

  async function removeFriend(id: number) {
    try {
      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: id }),
      });
      if (!res.ok) throw new Error("Failed to remove friend");
      await fetchUserData();
      showStatusMessage(t("friends.removed"), "success");
    } catch (err) {
      console.error(err);
      showStatusMessage(t("friends.error.remove"), "error");
    }
  }

  function showStatusMessage(msg: string, type: "success" | "error") {
    statusMessage.textContent = msg;
    statusMessage.className = `text-sm ${
      type === "success" ? "text-green-400" : "text-red-400"
    }`;
    statusMessage.classList.remove("hidden");
    setTimeout(() => {
      statusMessage.classList.add("hidden");
    }, 3000);
  }

  // Add friend button click
  addButton.onclick = () => {
    const selectedId = parseInt(select.value);
    if (!isNaN(selectedId)) {
      addFriendById(selectedId);
    }
  };

  // // Sidebar hover logic (unchanged)
  // sidebar.addEventListener("mouseenter", () => {
  //   document.querySelectorAll(".sidebar-label").forEach((label) => {
  //     (label as HTMLElement).classList.remove("opacity-0");
  //     (label as HTMLElement).classList.add("opacity-100");
  //   });
  //   const bg = document.getElementById("backgroundImage");
  //   if (bg) bg.className = "absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10";
  // });

  // sidebar.addEventListener("mouseleave", () => {
  //   document.querySelectorAll(".sidebar-label").forEach((label) => {
  //     (label as HTMLElement).classList.add("opacity-0");
  //     (label as HTMLElement).classList.remove("opacity-100");
  //   });
  //   const bg = document.getElementById("backgroundImage");
  //   if (bg) bg.className = "absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10";
  // });

  // Initial load
  fetchUserData();

  return container;
}
