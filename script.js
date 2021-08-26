const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12

const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')



//////////以下為JS新增或修改//////////
const movieYearDropdown = document.querySelector('#movie-year-dropdown')
const listBtn = document.querySelector('#list-btn')
const cardBtn = document.querySelector('#card-btn')
let page = 1

//新增清單模式按鈕監聽器
listBtn.addEventListener('click', function clickListBtn() {
  dataPanel.dataset.type = 'list'
  cardBtn.classList.add('fa-2x')
  listBtn.classList.remove('fa-2x')
  renderMovie(getMoviesByPage(page))
})

//新增卡片模式按鈕監聽器
cardBtn.addEventListener('click', function clickCardBtn() {
  dataPanel.dataset.type = 'card'
  cardBtn.classList.remove('fa-2x')
  listBtn.classList.add('fa-2x')
  renderMovie(getMoviesByPage(page))
})

//新增下拉選單監聽器
movieYearDropdown.addEventListener('click', function clickDropdown(e) {
  const movieYearList = document.querySelector('#movie-year-list')
  const dropdownBtn = movieYearDropdown.firstElementChild
  const movieYears = getReleaseYear(movies)
  const selectYear = e.target.dataset.year
  let rawHTML = '<li class="dropdown-item" href="#">All Years</li>'
  
  movieYears.forEach(year => {
    rawHTML += `<li class="dropdown-item" href="#" data-year='${year}'>${year}</li>`
  })

  movieYearList.innerHTML = rawHTML
  dropdownBtn.innerText = `Movies of ${selectYear}`

  filteredMovies = movies.filter(movie => movie.release_date.includes(selectYear))

  if (filteredMovies.length === 0) {
    dropdownBtn.innerText = `Movies of All Years`
    filteredMovies = movies
  }

  renderPaginator(filteredMovies.length)
  renderMovie(getMoviesByPage(1))
})


//新增回傳所有電影年份陣列的函式
function getReleaseYear(arr) {
  const releaseTimeArr = arr.map(item => Object.values(item)[4])
  const years =releaseTimeArr.map(date => date.slice(0, 4))
  const filteredYears = [...new Set(years)].sort()
  console.log(filteredYears)
  return filteredYears
}

//新增渲染為清單的函式
function renderMoviesInList(data) {
  dataPanel.classList = ''
  let rawHTML = ''

  data.forEach(item => {
    rawHTML += `
    <li class="list-group-item">
      <div class="row">
        <div class="col-8">${item.title}</div>
        <div class="col-4">
          <button
            class="btn btn-primary btn-show-movie"
            data-toggle="modal"
            data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </li>
    `
  })
  dataPanel.innerHTML = `<ul class="list-group">${rawHTML}</ul>`
}

//新增渲染為卡片的函式
function renderMoviesInCard(data) {
  dataPanel.classList.add('row')
  let rawHTML = ''

  data.forEach(item => {

    rawHTML += `
    <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                class="card-img-top"
                src="${POSTER_URL + item.image}"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-toggle="modal"
                  data-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

//修改原本的renderMovieList成判斷函式
function renderMovie(data) {
  if (dataPanel.dataset.type === 'card') {          
    renderMoviesInCard(data)
  } else {                  
    renderMoviesInList(data)
  }
}

//////////以上為JS新增或修改//////////





function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''

  for(let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  //data 可以是movies 也可能是filteredMovies 看當時有沒有在搜尋
  //若filterMovies不是空陣列，data = filterMovies; 不然data = movies
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

function showMovieModal (id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  
  
  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImg.innerHTML = `<img
                  src="${POSTER_URL + data.image}"
                  alt="movie-poster"
                  class="img-fluid"
                />`
    
  })
}

function addToFavorite(id) { 
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  
  if (list.some((movie) => movie.id === id)) {
    return alert('This movie is already in the favorite list.')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if(event.target.tagName !== 'A') return
  page = event.target.dataset.page

  renderMovie(getMoviesByPage(page))

})

searchForm.addEventListener('submit', function onSearchFromSubmitted (event) {
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().trim()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}`)
  }

  renderPaginator(filteredMovies.length)
  renderMovie(getMoviesByPage(1))
  searchInput.value = ''     //++++++++++++++++++++++//
})

axios
  .get(INDEX_URL)
  .then(response => {
  //response.data.results 為 Array(80)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovie(getMoviesByPage(1))
})
  .catch(err => console.log(err))