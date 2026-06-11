let todosPosts = [];

fetch("data/repertorios.json")
  .then(response => response.json())
  .then(posts => {

    todosPosts = posts;
    renderizarPosts(posts);

    document
      .getElementById("searchInput")
      .addEventListener("input", pesquisar);

  });

function renderizarPosts(posts){

  const postsContainer = document.getElementById("posts");

  postsContainer.innerHTML = "";

  posts.forEach(post => {

    postsContainer.innerHTML += `
      <div class="card">

        <img
          src="${post.imagem}"
          class="card-img"
          alt="${post.titulo}"
        >

        <h3>${post.titulo}</h3>

        <p>${post.resumo}</p>

        <a
          class="btn"
          href="post.html?slug=${post.slug}"
        >
          Ler mais
        </a>

      </div>
    `;

  });

}

function pesquisar(){

  const texto = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  const filtrados = todosPosts.filter(post =>
      post.titulo.toLowerCase().includes(texto) ||
      post.tema.toLowerCase().includes(texto)
  );

  renderizarPosts(filtrados);

}