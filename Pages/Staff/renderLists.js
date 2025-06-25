// renderLists.js
function renderList(listId, containerId) {
  const list = docLists[listId];
  if (!list) return;

  const container = document.getElementById(containerId);
  if (!container) return;

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