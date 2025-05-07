import { createSidebar } from "../utils/sidebar";

// Define interface for friend object
interface Friend {
  id: number;
  username: string;
  status: string;
}

export function createFriendsPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement("div");
  container.className = "relative min-h-screen bg-gray-900 text-white overflow-hidden";

  const sidebar = createSidebar(navigate);
  sidebar.classList.add("z-40");
  container.appendChild(sidebar);

  const backgroundImage = document.createElement("div");
  backgroundImage.id = "backgroundImage";
  backgroundImage.className = "absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10";
  backgroundImage.style.backgroundImage = 'url(/assets/profile-themes/arabesque.png)';
  container.appendChild(backgroundImage);

  const mainSection = document.createElement("div");
  mainSection.className = "relative mt-24 flex flex-col items-center z-30";

  const title = document.createElement("h2");
  title.textContent = "Friends List";
  title.className = "text-4xl font-bold mb-10 text-white";
  mainSection.appendChild(title);

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "flex flex-col items-center gap-8";

  // Add friend form
  const addFriendForm = document.createElement("div");
  addFriendForm.className = "bg-gray-700/80 backdrop-blur-md p-6 rounded-lg shadow-lg w-[28rem] mb-6";
  
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add a Friend";
  formTitle.className = "text-xl font-semibold mb-4";
  addFriendForm.appendChild(formTitle);
  
  const formContent = document.createElement("div");
  formContent.className = "flex gap-4";
  
  const friendNameInput = document.createElement("input");
  friendNameInput.type = "text";
  friendNameInput.placeholder = "Enter friend name";
  friendNameInput.className = "bg-gray-800 border border-gray-600 rounded px-4 py-2 flex-grow text-white";
  formContent.appendChild(friendNameInput);
  
  const addButton = document.createElement("button");
  addButton.textContent = "Add Friend";
  addButton.className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded";
  formContent.appendChild(addButton);
  
  addFriendForm.appendChild(formContent);
  
  // Status message for add friend operation
  const statusMessage = document.createElement("div");
  statusMessage.className = "mt-2 text-sm hidden";
  addFriendForm.appendChild(statusMessage);
  
  contentWrapper.appendChild(addFriendForm);

  // Friends table container
  const tableContainer = document.createElement("div");
  tableContainer.className = "bg-gray-700/80 backdrop-blur-md p-6 rounded-lg shadow-lg w-[28rem]";

  const scrollWrapper = document.createElement("div");
  scrollWrapper.className = "max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800";

  const table = document.createElement("table");
  table.className = "text-white border-separate border-spacing-0 w-full";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.className = "bg-gray-600/90";

  const idHeader = document.createElement("th");
  idHeader.textContent = "ID";
  idHeader.className = "border border-gray-800 px-3 py-4 text-lg font-semibold";

  const nameHeader = document.createElement("th");
  nameHeader.textContent = "Friends";
  nameHeader.className = "border border-gray-800 px-6 py-4 text-lg font-semibold";

  const statusHeader = document.createElement("th");
  statusHeader.textContent = "Status";
  statusHeader.className = "border border-gray-800 px-4 py-4 text-lg font-semibold";
  
  const actionHeader = document.createElement("th");
  actionHeader.textContent = "Action";
  actionHeader.className = "border border-gray-800 px-4 py-4 text-lg font-semibold";

  headerRow.appendChild(idHeader);
  headerRow.appendChild(nameHeader);
  headerRow.appendChild(statusHeader);
  headerRow.appendChild(actionHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  scrollWrapper.appendChild(table);
  tableContainer.appendChild(scrollWrapper);
  contentWrapper.appendChild(tableContainer);
  mainSection.appendChild(contentWrapper);
  container.appendChild(mainSection);

  // MOCK
  let mockFriends: Friend[] = [
    { id: 1, username: "Alix", status: "online" },
    { id: 2, username: "Gnouma", status: "away" },
    { id: 3, username: "Rime", status: "away" },
    { id: 4, username: "Soye", status: "online" },
    { id: 5, username: "Shinhye", status: "online" }
  ];

  // Function to render friends list
  function renderFriendsList() {
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (mockFriends.length === 0) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.textContent = "No friends added yet";
      emptyCell.colSpan = 4;
      emptyCell.className = "border border-gray-800 px-4 py-6 text-center text-gray-400";
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      mockFriends.forEach((friend: Friend) => {
        const row = document.createElement("tr");
        row.className = "bg-gray-900 hover:bg-gray-800";
        
        const idCell = document.createElement("td");
        idCell.textContent = friend.id.toString();
        idCell.className = "border border-gray-800 px-3 py-4 text-center text-base";
        
        const nameCell = document.createElement("td");
        nameCell.textContent = friend.username;
        nameCell.className = "border border-gray-800 px-6 py-4 text-center text-base";
        
        const statusCell = document.createElement("td");
        statusCell.className = "border border-gray-800 px-4 py-4 text-center";
        
        const statusIndicator = document.createElement("div");
        statusIndicator.className = "inline-flex items-center";
        
        const statusDot = document.createElement("span");
        statusDot.className = `inline-block w-3 h-3 mr-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-orange-500'}`;
        
        const statusText = document.createElement("span");
        statusText.textContent = friend.status;
        statusText.className = "text-sm";
        
        statusIndicator.appendChild(statusDot);
        statusIndicator.appendChild(statusText);
        statusCell.appendChild(statusIndicator);
        
        const actionCell = document.createElement("td");
        actionCell.className = "border border-gray-800 px-4 py-4 text-center";
        
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm";
        removeButton.addEventListener("click", () => removeFriend(friend.id));
        
        actionCell.appendChild(removeButton);
        
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);
        tbody.appendChild(row);
      });
    }
  }

  // Function to add a mock friend
  function addMockFriend(name: string) {
    if (!name || name.trim() === "") {
      showStatusMessage("Please enter a friend name", "error");
      return;
    }

    // Check if we already have a friend with this name
    if (mockFriends.some(friend => friend.username.toLowerCase() === name.trim().toLowerCase())) {
      showStatusMessage("This friend is already in your list", "error");
      return;
    }

    // Generate a new ID (highest ID + 1)
    const newId = mockFriends.length > 0 
      ? Math.max(...mockFriends.map(friend => friend.id)) + 1 
      : 1;

    // Randomly assign online or away status
    const status = Math.random() > 0.5 ? "online" : "away";

    // Add the new friend
    mockFriends.push({
      id: newId,
      username: name.trim(),
      status: status
    });

    // Update the table
    renderFriendsList();
    
    // Clear input and show success message
    friendNameInput.value = "";
    showStatusMessage("Friend added successfully", "success");
  }

  // Function to remove a mock friend
  function removeFriend(id: number) {
    const friendToRemove = mockFriends.find(friend => friend.id === id);
    if (!friendToRemove) {
      showStatusMessage("Friend not found", "error");
      return;
    }

    // Remove the friend
    mockFriends = mockFriends.filter(friend => friend.id !== id);
    
    // Update the table
    renderFriendsList();
    
    // Show success message
    showStatusMessage(`${friendToRemove.username} has been removed from your friends list`, "success");
  }

  // Function to show status messages
  function showStatusMessage(message: string, type: 'success' | 'error') {
    statusMessage.textContent = message;
    statusMessage.className = `mt-2 text-sm ${type === 'success' ? 'text-green-400' : 'text-red-400'}`;
    statusMessage.classList.remove("hidden");
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      statusMessage.classList.add("hidden");
    }, 3000);
  }

  // Add event listener to the add button
  addButton.addEventListener("click", () => {
    addMockFriend(friendNameInput.value);
  });
  
  // Add event listener for pressing Enter in the input field
  friendNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addMockFriend(friendNameInput.value);
    }
  });

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

  // Initial render of friends list
  renderFriendsList();

  return container;
}