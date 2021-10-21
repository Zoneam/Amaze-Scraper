const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("searchInput").value.trim();
  fetch(`/api/${searchInput}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      $(document).ready(function () {
        drawCards(result);
      });
    });
});

const drawCards = (result) => {
    let cards = "";
    for (i = 0; i < result.length; i++) {
      cards += `<div class="col">
          <div class="card shadow-lg">
            <a href='${result[i].link}'>
             <img class="bd-placeholder-img card-img-top" width="100%" src="${result[i].img}" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#55595c"/><text x="50%" y="50%" fill="#eceeef" dy=".3em" id='price' class='bg-warning bg-gradient text-dark p-2 bg-opacity-75'>Price: $${result[i].priceWhole + result[i].priceFraction}</text>
             <rect width="100%" height="100%" fill="#55595c"/><text x="50%" y="50%" fill="#eceeef" dy=".3em" id='${i}-walmart-price' class='bg-success bg-gradient text-dark p-2 bg-opacity-50'></text></img>
            </a>
            <div class="card-body">
            <a href='${result[i].link}'>
              <p class="card-text" id="title_${i}">${result[i].title}</p>
            </a>
              <div class="d-flex justify-content-between align-items-center flex-column mt-2">
                <div class="btn-group">
                  <button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.open('${result[i].link}','_blank')">Buy Now</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" id="${i}_card" onclick="getWalmartPrice(this.id, $(this).parents().eq(1).siblings().children('p').text())">WalMart Price</button>
                </div>
                ${result[i].couponAmount ? `<large class="bg-success text-white p-2 bg-opacity-75 mt-2 rounded">${result[i].couponAmount}</large>` : ''}
              </div>
            </div>
          </div>
        </div>`;
  }
  $("#cards").html(cards?cards:'<h2>No Search Results Yet!</h2>');
  localStorage.setItem('lastSearch', JSON.stringify(result));
}

storedCards = JSON.parse(localStorage.getItem("lastSearch"));
if (storedCards) {
  drawCards(storedCards);
} else {
  $("#cards").html('<h2>No Search Results Yet!</h2>');
}


async function getWalmartPrice(id, title) {
 id = id.split("_")[0], title
  
  let filteredTitle = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, '%20');
  await fetch(`/api/walmart/${filteredTitle}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(id, result);
        document.getElementById(`${id}-walmart-price`).innerHTML = result.price;
      });
}