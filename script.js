const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("searchInput").value.trim();

  fetch(`/:${searchInput}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      $(document).ready(function () {
        let cards = "";
        for (i = 0; i < result.length; i++)
          cards += `<div class="col">
          <div class="card shadow-lg">
            <a href='${result[i].link}'>
             <img class="bd-placeholder-img card-img-top" width="100%" src="${result[i].img}" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#55595c"/><text x="50%" y="50%" fill="#eceeef" dy=".3em" id='price' class='bg-warning bg-gradient text-dark p-2 bg-opacity-75'>${result[i].pricefrom}  ${result[i].price}</text></img>
            </a>
            <div class="card-body">
            <a href='${result[i].link}'>
              <p class="card-text">${result[i].title}</p>
            </a>
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.open('${result[i].link}','_blank')">Buy Now</button>
                </div>
                ${result[i].couponAmount?`<large class="bg-success text-white p-2 bg-opacity-75">${result[i].couponAmount} off</large>`:''}
              </div>
            </div>

          </div>
        </div>`;
        $("#cards").html(cards);
      });
    });
});
