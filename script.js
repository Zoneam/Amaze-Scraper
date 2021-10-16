const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("searchInput").value.trim();

  fetch(`http://localhost:8000/${searchInput}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("parsed json", result);
    });
});

return fetch("/website/MyJsonFile.json")
  .then((response) => response.json())
  .then((responseJson) => {
    return responseJson;
  });
