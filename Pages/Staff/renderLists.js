function renderList(listId) {
  const list = docLists[listId];
  if (!list) return;

  // Container ID convention
  const containerId = "fileList" + listId.replace(/\D/g, "");

  // Check if container exists, else create it and append to body or a specific parent
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("ul");
    container.id = containerId;

    // Append the container somewhere meaningful — example: append to body or a specific div
    document.body.appendChild(container);
  }

  list.forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.link;
    a.target = "_blank";
    a.textContent = item.name;
    li.appendChild(a);
    container.appendChild(li);
  });
}
