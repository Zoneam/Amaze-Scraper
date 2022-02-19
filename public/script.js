const searchButton = document.getElementById("searchButton");
let calls = 0;

searchButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("searchInput").value.trim();
  document.getElementById("searchInput").value = '';
  result = await axios(`/api/${searchInput}`)
  $(document).ready(async function () {
        drawCards(result.data);
      });
    });

const drawCards = async (result) => {
  let card = "";
  for (let i = 0; i < result.length; i++) {
      card += `<div class="col">
          <div class="card shadow-lg">
            <a href='${result[i].link}' target="_blank">
             <img class="bd-placeholder-img card-img-top" width="100%" src="${result[i].img}" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"></a>
             <a class="mt-4" href = '${result[i].link}' target="_blank"><rect width="100%" height="100%" fill="#55595c"/><text x="50%" y="50%" fill="#eceeef" dy=".3em" id='price' class='bg-warning bg-gradient text-dark p-2 bg-opacity-75'>Amazon Price: $${result[i].priceWhole + result[i].priceFraction}</text></rect></a>
             <a class="mt-4" id="${i}-walmart-link" href = '' target="_blank"><rect width="100%" height="100%" fill="#55595c"/><div id="${i}-loading-spinner" class="spinner-border spinner-border-sm ml-0" role="status">
           </div><text x="50%" y="50%" fill="#eceeef" dy=".3em" id='${i}-walmart-price' class='d-none bg-gradient text-dark p-2 bg-opacity-50'></text>
            </a>
            <div class="card-body">
            <a href='${result[i].link}' target="_blank">
              <p class="card-text" id="title_${i}">${result[i].title.length > 55 ? (result[i].title.substring(0, 55) + '...'):result[i].title}</p>
            </a>
              <div class="d-flex justify-content-between align-items-center flex-column mt-2">
                ${result[i].couponAmount ? `<large class="bg-success text-white p-2 bg-opacity-75 mt-2 rounded">${result[i].couponAmount}</large>` : ''}
              </div>

            </div>
          </div>
        </div>`;
  }

  $("#cards").html(card ? card : '<h2>No Search Results Yet!</h2>');
  await getWalmartPrice(result, ++calls); 
  localStorage.setItem('lastSearch', JSON.stringify(result));
}

 async function getWalmartPrice(data, callId) {  // need to terminate this function to stop previous search 
  let filteredTitle = '';
  let id = 0;
  for (singleResult of data) {
    if (callId !== calls) break;  // if call id changes brakes from previous for loop
    filteredTitle = singleResult.title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, ' ');
    await fetchWalmart(filteredTitle, id)
    id++;
  }
}

async function fetchWalmart(filteredTitle, id) {
  try {
    const response = await fetch(`/api/walmart/${filteredTitle}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
    })

    if (response.status === 204) {
      document.getElementById(`${id}-loading-spinner`).classList.add('d-none');
      document.getElementById(`${id}-walmart-price`).classList.replace('d-none','bg-danger');
      document.getElementById(`${id}-walmart-price`).innerHTML = "Detected as Bot!";
    } else {
      if (response.status === 200) {
        const result = await (response.json());
        if (result) {
          document.getElementById(`${id}-loading-spinner`).classList.add('d-none');
          document.getElementById(`${id}-walmart-price`).classList.replace('d-none', 'bg-success');
          document.getElementById(`${id}-walmart-price`).innerHTML = "Walmart Price: " + result.walmartPrice;
          document.getElementById(`${id}-walmart-link`).href = result.walmartLink;
        }
      } else
        if (response.status === 404) {
          document.getElementById(`${id}-loading-spinner`).classList.add('d-none');
          document.getElementById(`${id}-walmart-price`).classList.replace('d-none','bg-dark');
          document.getElementById(`${id}-walmart-price`).innerHTML = "Not Available At Walmart";
        }
    }
  } catch (err) {
    console.log("error", err);
  }
}

// gets last search
storedCards = JSON.parse(localStorage.getItem("lastSearch"));
if (storedCards) {
  drawCards(storedCards);
} else {
  $("#cards").html('<h2>No Search Results Yet!</h2>');
}


