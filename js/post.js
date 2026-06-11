const params = new URLSearchParams(window.location.search);

const slug = params.get("slug");

fetch("data/repertorios.json")
  .then(response => response.json())
  .then(posts => {

    const post = posts.find(p => p.slug === slug);

    if (!post) {
      document.body.innerHTML = "<h1>Post não encontrado</h1>";
      return;
    }

    document.getElementById("titulo").innerText = post.titulo;
    document.getElementById("tema").innerText = post.tema;
    document.getElementById("conteudo").innerHTML = post.conteudo;

    document.title = post.titulo;

  });