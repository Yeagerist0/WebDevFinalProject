const imageWrapper = document.querySelector(".images");
const searchInput = document.querySelector(".search input");
const loadMoreBtn = document.querySelector(".gallery .load-more");
const lightbox = document.querySelector(".lightbox");
const downloadImgBtn = lightbox.querySelector(".uil-import");
const closeImgBtn = lightbox.querySelector(".close-icon");

// 🔑 Replace with your actual Unsplash Access Key
const apiKey = "TjueKda1yPU61LTxuCgP0GBUKoEo6TPaapz0geDPKVw";  // Get from https://unsplash.com/developers

const perPage = 15;
let currentPage = 1;
let searchTerm = null;

const downloadImg = (imgUrl) => {
    fetch(imgUrl)
        .then(res => res.blob())
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `image_${Date.now()}.jpg`;
            a.click();
        })
        .catch(() => alert("⚠️ Failed to download image!"));
};

const showLightbox = (name, img) => {
    lightbox.querySelector("img").src = img;
    lightbox.querySelector("span").innerText = name;
    downloadImgBtn.setAttribute("data-img", img);
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
};

const hideLightbox = () => {
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
};

const generateHTML = (images) => {
    imageWrapper.innerHTML += images.map(img => `
        <li class="card">
            <img onclick="showLightbox('${img.user.name}', '${img.urls.regular}')" 
                 src="${img.urls.small}" 
                 alt="${img.alt_description || 'Unsplash image'}">
            <div class="details">
                <div class="photographer">
                    <i class="uil uil-camera"></i>
                    <span>${img.user.name}</span>
                </div>
                <button onclick="downloadImg('${img.urls.full}')">
                    <i class="uil uil-import"></i>
                </button>
            </div>
        </li>
    `).join("");
};

const getImages = (apiURL) => {
    loadMoreBtn.innerText = "Loading...";
    loadMoreBtn.classList.add("disabled");

    fetch(apiURL, { 
        headers: { 
            Authorization: `Client-ID ${apiKey}`,
            "Content-Type": "application/json"
        } 
    })
    .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.errors ? data.errors.join(", ") : "Failed to fetch images");
        }
        return data;
    })
    .then(data => {
        if (!data.results?.length && !data.length) {
            alert("⚠️ No images found!");
            return;
        }
        generateHTML(data.results || data);  // "results" for search, array for curated
        loadMoreBtn.innerText = "Load More";
        loadMoreBtn.classList.remove("disabled");
    })
    .catch(err => {
        console.error("Error:", err);
        loadMoreBtn.innerText = "Load More";
        loadMoreBtn.classList.remove("disabled");
        alert(`⚠️ Error: ${err.message}`);
    });
};

const loadMoreImages = () => {
    currentPage++;
    let apiUrl = searchTerm 
        ? `https://api.unsplash.com/search/photos?page=${currentPage}&per_page=${perPage}&query=${searchTerm}`
        : `https://api.unsplash.com/photos?page=${currentPage}&per_page=${perPage}`;
    getImages(apiUrl);
};

const loadSearchImages = (e) => {
    if (e.key === "Enter") {
        searchTerm = e.target.value.trim();
        if (!searchTerm) return;
        currentPage = 1;
        imageWrapper.innerHTML = "";
        getImages(`https://api.unsplash.com/search/photos?page=1&per_page=${perPage}&query=${searchTerm}`);
    }
};

// Initial load
getImages(`https://api.unsplash.com/photos?page=1&per_page=${perPage}`);

// Event listeners
loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keyup", loadSearchImages);
closeImgBtn.addEventListener("click", hideLightbox);
downloadImgBtn.addEventListener("click", (e) => downloadImg(e.target.dataset.img));
